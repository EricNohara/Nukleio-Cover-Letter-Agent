import "dotenv/config";
import { IUserInfo, IUserInfoResponse } from "../interfaces/IUserInfoResponse";
import { cleanUserInfo } from "./cleanUserInfo";

// env vars
const NUKLEIO_API_KEY = process.env.NUKLEIO_API_KEY!;
const NUKLEIO_BASE_URL = process.env.NUKLEIO_BASE_URL!;

export default async function getUserData(
  userId: string,
): Promise<IUserInfo | null> {
  const res = await fetch(NUKLEIO_BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NUKLEIO_API_KEY}`,
      "X-Target-User-Id": userId,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(
      `Failed to fetch nukleio user data: ${res.status} - ${err.message}`,
    );
  }

  const raw = (await res.json()) as IUserInfoResponse;

  if (!raw || !raw.userInfo) return null;

  const u = raw.userInfo;

  return cleanUserInfo(u);
}
