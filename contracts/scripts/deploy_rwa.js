const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("Network:", networkName, "(chainId:", chainId, ")");
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "native\n");

  const GOV_SUPPLY = hre.ethers.parseEther("1000000");
  const CHAINLINK_POL_USD = "0x001382149eBa3441043c1c66972b4772963f5D43";

  // Deploy MockUSDC (whitelist token)
  console.log("[1/2] Deploying MockUSDC...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6, hre.ethers.parseUnits("1000000", 6));
  await mockUSDC.waitForDeployment();
  const mockUSDCAddr = await mockUSDC.getAddress();
  console.log("  ->", mockUSDCAddr);

  // Deploy DigitalRWA (Chainlink + token-gated whitelist via MockUSDC)
  console.log("[2/2] Deploying DigitalRWA...");
  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");
  const MIN_WHITELIST_BALANCE = hre.ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, deployer.address,
    mockUSDCAddr, MIN_WHITELIST_BALANCE,
    CHAINLINK_POL_USD
  );
  await digitalRWA.waitForDeployment();
  const addr = await digitalRWA.getAddress();
  console.log("  ->", addr);

  console.log("\n============================================");
  console.log("Deployment Summary —", networkName);
  console.log("============================================");
  console.log(`  mockUSDC: ${mockUSDCAddr}`);
  console.log(`  digitalRWA: ${addr}`);
  console.log("============================================");

  if (networkName !== "hardhat") {
    console.log("\nVerifying...");
    try {
      await hre.run("verify:verify", {
        address: mockUSDCAddr,
        constructorArguments: ["Mock USDC", "USDC", 6, hre.ethers.parseUnits("1000000", 6)]
      });
      console.log("  MockUSDC: Verified");
    } catch (e) {
      console.log(`  MockUSDC: ${e.message.slice(0, 120)}`);
    }

    try {
      await hre.run("verify:verify", {
        address: addr,
        constructorArguments: [
          "Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address,
          mockUSDCAddr, MIN_WHITELIST_BALANCE, CHAINLINK_POL_USD
        ]
      });
      console.log("  DigitalRWA: Verified");
    } catch (e) {
      console.log(`  DigitalRWA: ${e.message.slice(0, 120)}`);
    }
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
