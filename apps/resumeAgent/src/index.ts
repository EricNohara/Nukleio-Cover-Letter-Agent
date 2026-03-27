import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import fs from "fs";
import path from "path";

function safeListDir(dir: string) {
  try {
    return fs.readdirSync(dir);
  } catch (error) {
    return [`<error: ${(error as Error).message}>`];
  }
}

function safeStat(filePath: string) {
  try {
    const stat = fs.statSync(filePath);
    return {
      exists: true,
      isFile: stat.isFile(),
      isDir: stat.isDirectory(),
      size: stat.size,
    };
  } catch {
    return { exists: false };
  }
}

function tryRequire(name: string) {
  try {
    const mod = require(name);
    return {
      found: true,
      keys: Object.keys(mod || {}),
    };
  } catch (e) {
    return {
      found: false,
      error: (e as Error).message,
    };
  }
}

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const result: any = {};

  // 🔹 Basic environment info
  result.env = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    lambdaTaskRoot: process.env.LAMBDA_TASK_ROOT,
    awsExecEnv: process.env.AWS_EXECUTION_ENV,
  };

  // 🔹 Directory structure
  result.directories = {
    "/opt": safeListDir("/opt"),
    "/opt/bin": safeListDir("/opt/bin"),
    "/opt/nodejs": safeListDir("/opt/nodejs"),
    "/opt/nodejs/node_modules": safeListDir("/opt/nodejs/node_modules"),
  };

  // 🔹 Look for common Chromium paths
  const possibleChromiumPaths = [
    "/opt/bin/chromium",
    "/opt/bin/chromium-browser",
    "/opt/chromium",
    "/opt/headless-chromium",
    "/opt/nodejs/node_modules/@sparticuz/chromium/bin/chromium",
  ];

  result.chromiumCandidates = possibleChromiumPaths.map((p) => ({
    path: p,
    stat: safeStat(p),
  }));

  // 🔹 Try requiring common packages
  result.packages = {
    puppeteer: tryRequire("puppeteer"),
    "puppeteer-core": tryRequire("puppeteer-core"),
    "@sparticuz/chromium": tryRequire("@sparticuz/chromium"),
    playwright: tryRequire("playwright"),
    "playwright-core": tryRequire("playwright-core"),
  };

  // 🔹 NODE_PATH (important for layers)
  result.nodePath = process.env.NODE_PATH;

  // 🔹 Try resolving modules manually
  const resolveCheck = (name: string) => {
    try {
      return require.resolve(name);
    } catch (e) {
      return `<not found: ${(e as Error).message}>`;
    }
  };

  result.resolvedPaths = {
    puppeteer: resolveCheck("puppeteer"),
    "puppeteer-core": resolveCheck("puppeteer-core"),
    "@sparticuz/chromium": resolveCheck("@sparticuz/chromium"),
  };

  return {
    statusCode: 200,
    body: JSON.stringify(result, null, 2),
  };
};
