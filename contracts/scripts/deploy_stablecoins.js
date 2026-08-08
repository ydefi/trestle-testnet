const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  console.log("Network:", networkName);
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MATIC\n");

  const SUPPLY = hre.ethers.parseEther("1000000");
  const deployed = {};

  // Mock USDC — 18 decimals to match contract price format
  console.log("[1/2] Deploying MockUSDC...");
  const factory = await hre.ethers.getContractFactory("MockERC20");
  const usdc = await factory.deploy("Mock USD Coin", "USDC", 18, SUPPLY);
  await usdc.waitForDeployment();
  deployed.usdc = await usdc.getAddress();
  console.log("  ->", deployed.usdc);

  // Mock USDT — 18 decimals to match contract price format
  console.log("[2/2] Deploying MockUSDT...");
  const usdt = await factory.deploy("Mock Tether USD", "USDT", 18, SUPPLY);
  await usdt.waitForDeployment();
  deployed.usdt = await usdt.getAddress();
  console.log("  ->", deployed.usdt);

  console.log("\n============================================");
  console.log("Mock Stablecoins Deployed —", networkName);
  console.log("============================================");
  for (const [name, addr] of Object.entries(deployed)) {
    console.log(`  ${name}: ${addr}`);
  }
  console.log("============================================\n");

  if (networkName !== "hardhat") {
    console.log("Verifying...");
    for (const [name, addr] of Object.entries(deployed)) {
      const label = name === "usdc" ? "Mock USD Coin" : "Mock Tether USD";
      const symbol = name.toUpperCase();
      try {
        await hre.run("verify:verify", { address: addr, constructorArguments: [label, symbol, 18, SUPPLY] });
        console.log(`  ${name}: Verified`);
      } catch (e) {
        console.log(`  ${name}: ${e.message.slice(0, 120)}`);
      }
    }
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
