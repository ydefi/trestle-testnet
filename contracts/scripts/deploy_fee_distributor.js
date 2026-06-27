const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("Network:", networkName, "(chainId:", chainId, ")");
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "native\n");

  const TREASURY = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
  const BUYBACK_BURN = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";

  console.log("Deploying FeeDistributor...");
  const FeeDistributor = await hre.ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributor.deploy(TREASURY, BUYBACK_BURN);
  await feeDistributor.waitForDeployment();
  const addr = await feeDistributor.getAddress();
  console.log("  ->", addr);

  if (networkName !== "hardhat") {
    console.log("\nVerifying...");
    try {
      await hre.run("verify:verify", { address: addr, constructorArguments: [TREASURY, BUYBACK_BURN] });
      console.log("  Verified");
    } catch (e) {
      console.log("  Verify skip:", e.message.slice(0, 120));
    }
  }

  console.log("\nDone. FeeDistributor at:", addr);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
