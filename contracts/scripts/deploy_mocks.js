const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;

  if (!deployer.address) {
    console.error("No deployer address — did you set PRIVATE_KEY?");
    process.exit(1);
  }

  console.log("Network:", networkName);
  console.log("Deploying from:", deployer.address);

  const SUPPLY = hre.ethers.parseEther("1000000");
  const deployed = {};

  // xNOBT — 18 decimals like real hNOBT
  console.log("\n[1/2] Deploying xNOBT...");
  const xNOBT = await hre.ethers.getContractFactory("MockERC20");
  const xNOBTc = await xNOBT.deploy("Testnet NOBT", "xNOBT", 18, SUPPLY);
  await xNOBTc.waitForDeployment();
  deployed.xNOBT = await xNOBTc.getAddress();
  console.log("  ->", deployed.xNOBT);

  // xBRT — 18 decimals like real BRT
  console.log("[2/2] Deploying xBRT...");
  const xBRT = await hre.ethers.getContractFactory("MockERC20");
  const xBRTc = await xBRT.deploy("Testnet Broiler", "xBRT", 18, SUPPLY);
  await xBRTc.waitForDeployment();
  deployed.xBRT = await xBRTc.getAddress();
  console.log("  ->", deployed.xBRT);

  console.log("\n============================================");
  console.log("Mock Tokens Deployed —", networkName);
  console.log("============================================");
  for (const [name, addr] of Object.entries(deployed)) {
    console.log(`  ${name}: ${addr}`);
  }
  console.log("============================================\n");

  // Verify
  if (networkName !== "hardhat") {
    console.log("Verifying...");
    await verify("MockERC20", deployed.xNOBT, ["Testnet NOBT", "xNOBT", 18, SUPPLY]);
    await verify("MockERC20", deployed.xBRT, ["Testnet Broiler", "xBRT", 18, SUPPLY]);
  }
}

async function verify(name, address, args) {
  console.log(`  ${name} at ${address.slice(0, 10)}...`);
  try {
    await hre.run("verify:verify", { address, constructorArguments: args });
    console.log("  Verified");
  } catch (e) {
    console.log("  Skip:", e.message.slice(0, 120));
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
