const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "ETH");

  const CHAINLINK_ETH_USD = "0x26dA680D98e805D54f0934f46b4669149c14d1cA";
  const WHITELIST_TOKEN = "0x7928BE357160d31B6ab378D0566Ce360BE0228B0";
  const GOV_SUPPLY = hre.ethers.parseEther("1000000");
  const MIN_WHITELIST = hre.ethers.parseUnits("1000", 6);
  const RWA_META = "ipfs://QmPlaceholder";

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
