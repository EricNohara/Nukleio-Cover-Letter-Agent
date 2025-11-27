import getUserData from "../utils/nukleio/getUserData";

async function runTest() {
  const data = await getUserData("d206d86e-88d3-4f9d-986c-40352f4e952f");
  console.log(data);
}

runTest();
