const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC = "https://sepolia.base.org";
const PK = process.env.PRIVATE_KEY;

const CHAINLINK_ETH_USD = "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1";
const WHITELIST_TOKEN = "0x27fcAdD5142ECB1b6FC13314a2bDfB71dC92CeF3"; // Mock USDC (Base Sepolia)
const TREASURY = "0x64A7ef92229D2D97d1C4fd3DB15Db2d94d3D66F6";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PK, provider);
  console.log("Deployer:", wallet.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH\n");

  const GOV_SUPPLY = ethers.parseEther("1000000");
  const MIN_WHITELIST = ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
  const RWA_META = ethers.encodeBytes32String("ipfs://QmPlaceholder");

  // Load artifact
  const artifactPath = path.join(__dirname, "../artifacts/src/DigitalRWA.sol/DigitalRWA.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("Deploying DigitalRWA...");
  const contract = await factory.deploy(
    "Trestle Real Asset 1", "TRA1",
    RWA_META, GOV_SUPPLY, wallet.address,
    WHITELIST_TOKEN, MIN_WHITELIST, CHAINLINK_ETH_USD
  );
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("DigitalRWA ->", addr);

  const finalBal = await provider.getBalance(wallet.address);
  console.log("Remaining:", ethers.formatEther(finalBal), "ETH");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
