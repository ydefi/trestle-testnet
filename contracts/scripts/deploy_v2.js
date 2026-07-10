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
  const GOV_SUPPLY = hre.ethers.parseEther("1000000");

  const deployed = {};
  const toVerify = [];

  // 1. DigitalGoods (paymentToken, auto-delivery, category)
  console.log("[1/5] Deploying DigitalGoods...");
  const DigitalGoods = await hre.ethers.getContractFactory("DigitalGoods");
  const digitalGoods = await DigitalGoods.deploy();
  await digitalGoods.waitForDeployment();
  deployed.digitalGoods = await digitalGoods.getAddress();
  toVerify.push({ name: "DigitalGoods", addr: deployed.digitalGoods, args: [] });
  console.log("  ->", deployed.digitalGoods);

  // 2. FreelancerEscrow (fixed: no over-funding, approveMilestone only InProgress, autoApprove completes project)
  console.log("[2/5] Deploying FreelancerEscrow...");
  const FreelancerEscrow = await hre.ethers.getContractFactory("FreelancerEscrow");
  const freelancerEscrow = await FreelancerEscrow.deploy();
  await freelancerEscrow.waitForDeployment();
  deployed.freelancerEscrow = await freelancerEscrow.getAddress();
  toVerify.push({ name: "FreelancerEscrow", addr: deployed.freelancerEscrow, args: [] });
  console.log("  ->", deployed.freelancerEscrow);

  // 3. UserProfile
  console.log("[3/5] Deploying UserProfile...");
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  deployed.userProfile = await userProfile.getAddress();
  toVerify.push({ name: "UserProfile", addr: deployed.userProfile, args: [] });
  console.log("  ->", deployed.userProfile);

  // 4. FeeDistributor (fixed: <= BPS check)
  console.log("[4/5] Deploying FeeDistributor...");
  const FeeDistributor = await hre.ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributor.deploy(TREASURY, BUYBACK_BURN);
  await feeDistributor.waitForDeployment();
  deployed.feeDistributor = await feeDistributor.getAddress();
  toVerify.push({ name: "FeeDistributor", addr: deployed.feeDistributor, args: [TREASURY, BUYBACK_BURN] });
  console.log("  ->", deployed.feeDistributor);

  // 5. DigitalRWA (fixed: mint requires whitelisted recipient)
  console.log("[5/5] Deploying DigitalRWA...");
  const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");
  const DigitalRWA = await hre.ethers.getContractFactory("DigitalRWA");
  const digitalRWA = await DigitalRWA.deploy("Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address);
  await digitalRWA.waitForDeployment();
  deployed.digitalRWA = await digitalRWA.getAddress();
  toVerify.push({ name: "DigitalRWA", addr: deployed.digitalRWA, args: ["Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address] });
  console.log("  ->", deployed.digitalRWA);

  console.log("\n============================================");
  console.log("Deployment Summary —", networkName);
  console.log("============================================");
  for (const [name, addr] of Object.entries(deployed)) {
    console.log(`  ${name}: ${addr}`);
  }
  console.log("============================================");

  if (networkName !== "hardhat") {
    console.log("\nVerifying...");
    for (const { name, addr, args } of toVerify) {
      try {
        await hre.run("verify:verify", { address: addr, constructorArguments: args });
        console.log(`  ${name}: Verified`);
      } catch (e) {
        console.log(`  ${name}: ${e.message.slice(0, 120)}`);
      }
    }
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
