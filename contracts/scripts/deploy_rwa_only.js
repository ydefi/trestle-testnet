const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "ETH");

  const CHAINLINK_ETH_USD = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
  const WHITELIST_TOKEN = "0x27fcAdD5142ECB1b6FC13314a2bDfB71dC92CeF3"; // Mock USDC (Base Sepolia)
  const GOV_SUPPLY = hre.ethers.parseEther("1000000");
  const MIN_WHITELIST = hre.ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");

  console.log("Deploying DigitalRWA...");
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, deployer.address,
    WHITELIST_TOKEN, MIN_WHITELIST, CHAINLINK_ETH_USD
  );
  await digitalRWA.waitForDeployment();
  const addr = await digitalRWA.getAddress();
  console.log("DigitalRWA ->", addr);

  const finalBal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Remaining:", hre.ethers.formatEther(finalBal), "ETH");

  // Verify
  if (hre.network.name !== "hardhat") {
    console.log("Verifying...");
    try {
      await hre.run("verify:verify", {
        address: addr,
        constructorArguments: [
          "Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address,
          WHITELIST_TOKEN, MIN_WHITELIST, CHAINLINK_ETH_USD
        ]
      });
      console.log("Verified!");
    } catch (e) {
      console.log("Verify:", e.message.slice(0, 120));
    }
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
