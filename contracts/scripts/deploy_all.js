const hre = require("hardhat");

const CHAIN_CONFIG = {
  80002: {
    name: "Polygon Amoy",
    nativeSymbol: "POL",
    chainlinkETHUSD: "0x001382149eBa3441043c1c66972b4772963f5D43",
  },
  137: {
    name: "Polygon PoS",
    nativeSymbol: "POL",
    chainlinkETHUSD: "0xAb550441a7744cDa2363c984ea79aD0137c8Ea85",
  },
  42161: {
    name: "Arbitrum One",
    nativeSymbol: "ETH",
    chainlinkETHUSD: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  },
  421614: {
    name: "Arbitrum Sepolia",
    nativeSymbol: "ETH",
    chainlinkETHUSD: "0x26dA680D98e805D54f0934f46b4669149c14d1cA",
  },
  84532: {
    name: "Base Sepolia",
    nativeSymbol: "ETH",
    chainlinkETHUSD: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
  },
  8453: {
    name: "Base Mainnet",
    nativeSymbol: "ETH",
    chainlinkETHUSD: "0x71041dddcd33129D58Ed70eD42F29bD502dCbE63",
  },
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const chain = CHAIN_CONFIG[chainId];

  if (!chain) {
    throw new Error(`Unsupported chain ID ${chainId}. Add it to CHAIN_CONFIG in deploy_all.js`);
  }

  console.log("Network:", chain.name, `(chainId: ${chainId})`);
  console.log("Deployer:", deployer.address);
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), chain.nativeSymbol, "\n");

  const TREASURY = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
  const GOV_SUPPLY = hre.ethers.parseEther("1000000");
  const CHAINLINK_ETH_USD = chain.chainlinkETHUSD;
  const deployed = {};

  // 1. MockGovernanceToken (tGOV)
  console.log("[1/6] MockGovernanceToken...");
  const GovToken = await hre.ethers.getContractFactory("MockGovernanceToken");
  const govToken = await GovToken.deploy("Trestle Governance", "tGOV", 18, GOV_SUPPLY);
  await govToken.waitForDeployment();
  deployed.govToken = await govToken.getAddress();
  console.log("  ->", deployed.govToken);

  // 2. Mock USDC (whitelist token)
  console.log("[2/6] MockUSDC...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6, hre.ethers.parseUnits("1000000", 6));
  await mockUSDC.waitForDeployment();
  deployed.mockUSDC = await mockUSDC.getAddress();
  console.log("  ->", deployed.mockUSDC);

  // 2. DigitalGoods
  console.log("[2/5] DigitalGoods...");
  const DigitalGoods = await hre.ethers.getContractFactory("DigitalGoods");
  const digitalGoods = await DigitalGoods.deploy(TREASURY);
  await digitalGoods.waitForDeployment();
  deployed.digitalGoods = await digitalGoods.getAddress();
  console.log("  ->", deployed.digitalGoods);

  // 3. FreelancerEscrow
  console.log("[3/5] FreelancerEscrow...");
  const FreelancerEscrow = await hre.ethers.getContractFactory("FreelancerEscrow");
  const freelancerEscrow = await FreelancerEscrow.deploy(TREASURY);
  await freelancerEscrow.waitForDeployment();
  deployed.freelancerEscrow = await freelancerEscrow.getAddress();
  console.log("  ->", deployed.freelancerEscrow);

  // 4. DigitalRWA (whitelist gated via MockUSDC)
  console.log("[4/6] DigitalRWA...");
  const RWA_META = "ipfs://QmPlaceholder";
  const MIN_WHITELIST_BALANCE = hre.ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, deployer.address,
    deployed.mockUSDC, MIN_WHITELIST_BALANCE, CHAINLINK_ETH_USD
  );
  await digitalRWA.waitForDeployment();
  deployed.digitalRWA = await digitalRWA.getAddress();
  console.log("  ->", deployed.digitalRWA);

  // 5. UserProfile
  console.log("[5/6] UserProfile...");
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy(deployer.address);
  await userProfile.waitForDeployment();
  deployed.userProfile = await userProfile.getAddress();
  console.log("  ->", deployed.userProfile);

  // 6. FeeDistributor
  console.log("[6/6] FeeDistributor...");
  const BUYBACK_BURN = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
  const FeeDistributor = await hre.ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributor.deploy(TREASURY, BUYBACK_BURN);
  await feeDistributor.waitForDeployment();
  deployed.feeDistributor = await feeDistributor.getAddress();
  console.log("  ->", deployed.feeDistributor);

  console.log("\n============================================");
  console.log("DEPLOYED —", chain.name);
  console.log("============================================");
  for (const [name, addr] of Object.entries(deployed)) {
    console.log(`  ${name}: ${addr}`);
  }
  console.log("============================================");

  const finalBal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("\nRemaining balance:", hre.ethers.formatEther(finalBal), chain.nativeSymbol);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
