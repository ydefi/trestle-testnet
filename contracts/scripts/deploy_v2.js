const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("Network:", networkName, "(chainId:", chainId, ")");
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "native\n");

  const deployed = {};
  const toVerify = [];

  // 1. DigitalGoods (updated: paymentToken, auto-delivery, category)
  console.log("[1/3] Deploying DigitalGoods...");
  const DigitalGoods = await hre.ethers.getContractFactory("DigitalGoods");
  const digitalGoods = await DigitalGoods.deploy();
  await digitalGoods.waitForDeployment();
  deployed.digitalGoods = await digitalGoods.getAddress();
  toVerify.push({ name: "DigitalGoods", addr: deployed.digitalGoods, args: [] });
  console.log("  ->", deployed.digitalGoods);

  // 2. FreelancerEscrow (updated: paymentToken fix)
  console.log("[2/3] Deploying FreelancerEscrow...");
  const FreelancerEscrow = await hre.ethers.getContractFactory("FreelancerEscrow");
  const freelancerEscrow = await FreelancerEscrow.deploy();
  await freelancerEscrow.waitForDeployment();
  deployed.freelancerEscrow = await freelancerEscrow.getAddress();
  toVerify.push({ name: "FreelancerEscrow", addr: deployed.freelancerEscrow, args: [] });
  console.log("  ->", deployed.freelancerEscrow);

  // 3. UserProfile
  console.log("[3/3] Deploying UserProfile...");
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  deployed.userProfile = await userProfile.getAddress();
  toVerify.push({ name: "UserProfile", addr: deployed.userProfile, args: [] });
  console.log("  ->", deployed.userProfile);

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
