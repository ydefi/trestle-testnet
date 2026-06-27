const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const isTestnet = networkName === "amoy" || networkName === "hardhat";
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  if (!deployer.address) {
    console.error("No deployer address — did you set PRIVATE_KEY in the environment?");
    process.exit(1);
  }

  console.log("Network:", networkName, "(chainId:", chainId, ")");
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "native\n");

  const TREASURY = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
  const BUYBACK_BURN = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
  const GOV_SUPPLY = hre.ethers.parseEther("1000000");

  const deployed = {};

  // 1. Mock Governance Token
  console.log("[1/5] Deploying MockGovernanceToken...");
  const GovToken = await hre.ethers.getContractFactory("MockGovernanceToken");
  const govToken = await GovToken.deploy("Trestle Governance", "tGOV", 18, GOV_SUPPLY);
  await govToken.waitForDeployment();
  deployed.govToken = await govToken.getAddress();
  console.log("  ->", deployed.govToken);

  // 2. Fee Distributor
  console.log("[2/5] Deploying FeeDistributor...");
  const FeeDistributor = await hre.ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributor.deploy(TREASURY, BUYBACK_BURN);
  await feeDistributor.waitForDeployment();
  deployed.feeDistributor = await feeDistributor.getAddress();
  console.log("  ->", deployed.feeDistributor);

  // 3. Digital Goods (DutchAuctionLib is internal — inlined, no linking needed)
  console.log("[3/5] Deploying DigitalGoods...");
  const DigitalGoods = await hre.ethers.getContractFactory("DigitalGoods");
  const digitalGoods = await DigitalGoods.deploy();
  await digitalGoods.waitForDeployment();
  deployed.digitalGoods = await digitalGoods.getAddress();
  console.log("  ->", deployed.digitalGoods);

  // 4. Freelancer Escrow (DutchAuctionLib is internal — inlined, no linking needed)
  console.log("[4/5] Deploying FreelancerEscrow...");
  const FreelancerEscrow = await hre.ethers.getContractFactory("FreelancerEscrow");
  const freelancerEscrow = await FreelancerEscrow.deploy();
  await freelancerEscrow.waitForDeployment();
  deployed.freelancerEscrow = await freelancerEscrow.getAddress();
  console.log("  ->", deployed.freelancerEscrow);

  // 5. Digital RWA
  console.log("[5/5] Deploying DigitalRWA...");
  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, deployer.address
  );
  await digitalRWA.waitForDeployment();
  deployed.digitalRWA = await digitalRWA.getAddress();
  console.log("  ->", deployed.digitalRWA);

  // Summary
  console.log("\n============================================");
  console.log("Deployment Summary —", networkName);
  console.log("============================================");
  for (const [name, addr] of Object.entries(deployed)) {
    console.log(`  ${name}: ${addr}`);
  }
  console.log("============================================");

  // Verify on non-hardhat networks
  if (networkName !== "hardhat") {
    console.log("\nVerifying contracts...");
    await verify("MockGovernanceToken", deployed.govToken, ["Trestle Governance", "tGOV", 18, GOV_SUPPLY]);
    await verify("FeeDistributor", deployed.feeDistributor, [TREASURY, BUYBACK_BURN]);
    await verify("DigitalGoods", deployed.digitalGoods, []);
    await verify("FreelancerEscrow", deployed.freelancerEscrow, []);
    await verify("DigitalRWA", deployed.digitalRWA, [
      "Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address
    ]);
  }
}

async function verify(name, address, args) {
  console.log(`  ${name}...`);
  try {
    await hre.run("verify:verify", { address, constructorArguments: args });
    console.log(`  \u2713 Verified`);
  } catch (e) {
    console.log(`  \u2717 ${e.message.slice(0, 120)}`);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
