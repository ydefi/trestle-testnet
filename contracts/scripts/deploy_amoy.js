const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const TREASURY = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
const BUYBACK_BURN = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";
const GOV_SUPPLY = hre.ethers.parseEther("1000000");
const WHITELIST_TOKEN = "0xb0a742a2302B043718b60053b135dC432C892852"; // Mock USDC
const MIN_WHITELIST_BALANCE = hre.ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
const CHAINLINK_ETH_USD = "0x001382149eBa3441043c1c66972b4772963f5D43";

const CHECKPOINT_FILE = path.join(__dirname, ".amoy-checkpoint.json");

function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
    }
  } catch {}
  return { deployed: {}, current: null };
}

function saveCheckpoint(cp) {
  const replacer = (k, v) => typeof v === "bigint" ? v.toString() : v;
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, replacer, 2));
}

const CONTRACT_ORDER = [
  "feeDistributor",
  "digitalGoods",
  "freelancerEscrow",
  "userProfile",
  "mockUSDC",
  "mockUSDT",
  "mockXNOBT",
  "mockXBRT",
  "digitalRWA",
];

const DEPLOYERS = {
  feeDistributor: async () => {
    const Factory = await hre.ethers.getContractFactory("FeeDistributor");
    const c = await Factory.deploy(TREASURY, BUYBACK_BURN);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: [TREASURY, BUYBACK_BURN] };
  },
  digitalGoods: async () => {
    const Factory = await hre.ethers.getContractFactory("DigitalGoods");
    const c = await Factory.deploy(TREASURY);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: [TREASURY] };
  },
  freelancerEscrow: async () => {
    const Factory = await hre.ethers.getContractFactory("FreelancerEscrow");
    const c = await Factory.deploy(TREASURY);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: [TREASURY] };
  },
  userProfile: async () => {
    const [deployer] = await hre.ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory("UserProfile");
    const c = await Factory.deploy(deployer.address);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: [deployer.address] };
  },
  mockUSDC: async () => {
    const Factory = await hre.ethers.getContractFactory("MockERC20");
    const c = await Factory.deploy("Mock USDC", "USDC", 6, hre.ethers.parseUnits("1000000", 6));
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: ["Mock USDC", "USDC", 6, hre.ethers.parseUnits("1000000", 6)] };
  },
  mockUSDT: async () => {
    const Factory = await hre.ethers.getContractFactory("MockERC20");
    const c = await Factory.deploy("Mock USDT", "USDT", 6, hre.ethers.parseUnits("1000000", 6));
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: ["Mock USDT", "USDT", 6, hre.ethers.parseUnits("1000000", 6)] };
  },
  mockXNOBT: async () => {
    const Factory = await hre.ethers.getContractFactory("MockERC20");
    const c = await Factory.deploy("Mock xNOBT", "xNOBT", 18, GOV_SUPPLY);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: ["Mock xNOBT", "xNOBT", 18, GOV_SUPPLY] };
  },
  mockXBRT: async () => {
    const Factory = await hre.ethers.getContractFactory("MockERC20");
    const c = await Factory.deploy("Mock xBRT", "xBRT", 18, GOV_SUPPLY);
    await c.waitForDeployment();
    return { addr: await c.getAddress(), args: ["Mock xBRT", "xBRT", 18, GOV_SUPPLY] };
  },
  digitalRWA: async () => {
    const [deployer] = await hre.ethers.getSigners();
    const RWA_META = hre.ethers.encodeBytes32String("ipfs://QmPlaceholder");
    const Factory = await hre.ethers.getContractFactory("DigitalRWA");
    const c = await Factory.deploy(
      "Trestle Real Asset 1", "TRA1",
      RWA_META, GOV_SUPPLY, deployer.address,
      WHITELIST_TOKEN, MIN_WHITELIST_BALANCE,
      CHAINLINK_ETH_USD
    );
    await c.waitForDeployment();
    return {
      addr: await c.getAddress(),
      args: ["Trestle Real Asset 1", "TRA1", RWA_META, GOV_SUPPLY, deployer.address, WHITELIST_TOKEN, MIN_WHITELIST_BALANCE, CHAINLINK_ETH_USD],
    };
  },
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "POL\n");

  const cp = loadCheckpoint();

  for (const key of CONTRACT_ORDER) {
    if (cp.deployed[key]) {
      console.log(`[SKIP] ${key} already deployed at ${cp.deployed[key].addr}`);
      continue;
    }

    console.log(`[DEPLOY] ${key}...`);
    cp.current = key;
    saveCheckpoint(cp);

    const { addr, args } = await DEPLOYERS[key]();
    cp.deployed[key] = { addr, args };
    saveCheckpoint(cp);

    console.log(`  -> ${addr}\n`);
  }

  console.log("============================================");
  console.log("Deployment Complete — Polygon Amoy (80002)");
  console.log("============================================");
  for (const [name, info] of Object.entries(cp.deployed)) {
    console.log(`  ${name}: ${info.addr}`);
  }
  console.log("============================================");

  console.log("\nVerifying...");
  for (const [name, info] of Object.entries(cp.deployed)) {
    try {
      await hre.run("verify:verify", { address: info.addr, constructorArguments: info.args });
      console.log(`  ${name}: Verified`);
    } catch (e) {
      console.log(`  ${name}: ${e.message.slice(0, 150)}`);
    }
  }

  const remaining = await hre.ethers.provider.getBalance(deployer.address);
  console.log("\nRemaining:", hre.ethers.formatEther(remaining), "POL");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
