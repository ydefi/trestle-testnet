const hre = require("hardhat");

const WHITELIST_TOKEN = "0xb0a742a2302B043718b60053b135dC432C892852"; // Mock USDC (Amoy)
const MIN_WHITELIST_BALANCE = hre.ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
const GOV_SUPPLY = hre.ethers.parseEther("1000000");
const CHAINLINK_ETH_USD = "0x001382149eBa3441043c1c66972b4772963f5D43";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "POL\n");

  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, deployer.address,
    WHITELIST_TOKEN, MIN_WHITELIST_BALANCE,
    CHAINLINK_ETH_USD
  );
  await digitalRWA.waitForDeployment();
  const addr = await digitalRWA.getAddress();
  console.log("DigitalRWA ->", addr);

  // Verify
  if (hre.network.name !== "hardhat") {
    console.log("\nVerifying...");
    try {
      await hre.run("verify:verify", {
        address: addr,
        constructorArguments: [
          "Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address,
          WHITELIST_TOKEN, MIN_WHITELIST_BALANCE, CHAINLINK_ETH_USD
        ]
      });
      console.log("  DigitalRWA: Verified");
    } catch (e) {
      console.log(`  DigitalRWA: ${e.message.slice(0, 150)}`);
    }
  }

  const remaining = await hre.ethers.provider.getBalance(deployer.address);
  console.log("\nRemaining:", hre.ethers.formatEther(remaining), "POL");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
