const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("Network:", networkName, "(chainId:", chainId, ")");
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "native\n");

  const GOV_SUPPLY = hre.ethers.parseEther("1000000");
  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");

  console.log("[1/1] Deploying DigitalRWA (with subscribe)...");
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy("Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address);
  await digitalRWA.waitForDeployment();
  const addr = await digitalRWA.getAddress();
  console.log("  ->", addr);

  if (networkName !== "hardhat") {
    console.log("\nVerifying...");
    try {
      await hre.run("verify:verify", { address: addr, constructorArguments: ["Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address] });
      console.log("  Verified");
    } catch (e) {
      console.log("  Fail:", e.message.slice(0, 120));
    }
  }

  console.log("\nDigitalRWA:", addr);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
