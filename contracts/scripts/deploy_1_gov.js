const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);

  const GOV_SUPPLY = hre.ethers.parseEther("1000000");

  console.log("\n[1/1] Deploying MockGovernanceToken...");
  const GovToken = await hre.ethers.getContractFactory("MockGovernanceToken");
  const govToken = await GovToken.deploy("Trestle Governance", "tGOV", 18, GOV_SUPPLY);
  await govToken.waitForDeployment();
  const addr = await govToken.getAddress();
  console.log("  Deployed:", addr);

  console.log("\nVerifying...");
  try {
    await hre.run("verify:verify", {
      address: addr,
      constructorArguments: ["Trestle Governance", "tGOV", 18, GOV_SUPPLY]
    });
    console.log("  Verified!");
  } catch (e) {
    console.log("  Verify failed:", e.message.slice(0, 120));
  }
}
main().catch(e => { console.error("Fatal:", e); process.exit(1); });
