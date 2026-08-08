const hre = require("hardhat");
const { ethers } = hre;

// Deployed contract addresses (Amoy, 2026-06-29 — audit fix deploy)
const DIGITAL_GOODS = "0xfe50dA41BfC13e99E9276149D0b534609C39633E";
const DIGITAL_RWA = "0x18dF08d96F303c6149a7f8CC4800BCa7fcAEB0Fd";
const USER_PROFILE = "0x4cEaa30839E3E463484c2D66900fdD6484022054";

const TEST_FUND = ethers.parseEther("0.06");   // MATIC sent to test user for gas + subscribe
const SUBSCRIBE_AMOUNT = ethers.parseEther("0.02"); // MATIC to subscribe (buys 0.02 DA1)
const LISTING_PRICE = ethers.parseEther("0.002");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const networkName = hre.network.name;
  if (networkName === "hardhat") {
    console.log("This script runs on Amoy only. Use --network amoy");
    process.exit(1);
  }

  // Accounts
  const [deployer] = await ethers.getSigners();
  const testUser = ethers.Wallet.createRandom().connect(ethers.provider);
  console.log("Deployer:", deployer.address);
  console.log("Test user:", testUser.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // --- Fund test user ---
  console.log("=== [1] Fund test user ===");
  let tx = await deployer.sendTransaction({ to: testUser.address, value: TEST_FUND });
  await tx.wait();
  console.log("Sent", ethers.formatEther(TEST_FUND), "MATIC to test user");
  console.log("Test user balance:", ethers.formatEther(await ethers.provider.getBalance(testUser.address)), "MATIC\n");

  // --- Deployer admin + balance checks ---
  console.log("=== [2] Deployer admin + balances ===");
  const rwa = await ethers.getContractAt("DigitalRWA", DIGITAL_RWA);
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  console.log("  Is admin:", await rwa.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("  RWA cap:", ethers.formatEther(await rwa.cap()));
  console.log("  Deployer DA1 balance:", ethers.formatEther(await rwa.balanceOf(deployer.address)));
  console.log("  Test user DA1 balance:", ethers.formatEther(await rwa.balanceOf(testUser.address)), "\n");

  // --- RWA: Whitelist test user ---
  console.log("=== [3] RWA: Whitelist deployer + test user ===");
  tx = await rwa.connect(deployer).setWhitelist(deployer.address, true);
  await tx.wait();
  tx = await rwa.connect(deployer).setWhitelist(testUser.address, true);
  await tx.wait();
  const wl = await rwa.whitelisted(testUser.address);
  console.log("  Whitelisted:", wl, "\n");

  // --- RWA: Subscribe (test user buys DA1) ---
  console.log("=== [4] RWA: Test user subscribes ===");
  tx = await rwa.connect(testUser).subscribe({ value: SUBSCRIBE_AMOUNT });
  await tx.wait();
  const da1Bal = await rwa.balanceOf(testUser.address);
  console.log("  Test user DA1 balance:", ethers.formatEther(da1Bal));
  console.log("  Test user MATIC balance:", ethers.formatEther(await ethers.provider.getBalance(testUser.address)), "\n");

  // --- RWA: Transfer some DA1 back to deployer ---
  console.log("=== [5] RWA: Transfer DA1 to deployer ===");
  tx = await rwa.connect(testUser).transfer(deployer.address, ethers.parseEther("0.02"));
  await tx.wait();
  console.log("  Deployer DA1 balance:", ethers.formatEther(await rwa.balanceOf(deployer.address)));
  console.log("  Test user DA1 balance:", ethers.formatEther(await rwa.balanceOf(testUser.address)), "\n");

  // --- Marketplace: List item with auto-delivery ---
  console.log("=== [6] Marketplace: List item (auto-delivery) ===");
  const dg = await ethers.getContractAt("DigitalGoods", DIGITAL_GOODS);
  const metaURI = "ipfs://QmTest123 -- End-to-End Test Item";
  const category = "art";
  const deliveryURI = "ipfs://QmDeliveryFile";
  tx = await dg.connect(deployer).listFixed(metaURI, LISTING_PRICE, category, deliveryURI);
  const receipt = await tx.wait();
  const listingIdTopic = receipt.logs.find(l => l.fragment?.name === "Listed") || receipt.logs[0];
  // Get listingId by reading listingCount-1
  const count = await dg.listingCount();
  const listingId = count;
  console.log("  Listed as ID:", listingId.toString());
  console.log("  Seller:", deployer.address);
  console.log("  Price:", ethers.formatEther(LISTING_PRICE), "MATIC\n");

  // --- Marketplace: Buy the listing (test user buys from deployer) ---
  console.log("=== [7] Marketplace: Test user buys listing ===");
  tx = await dg.connect(testUser).buy(listingId, { value: LISTING_PRICE });
  await tx.wait();
  console.log("  Purchase tx sent");

  // Check listing status
  const listing = await dg.listings(listingId);
  const statusText = ["Active", "Sold", "Cancelled", "Disputed"][Number(listing.status)];
  console.log("  Listing status:", statusText);
  console.log("  Buyer:", listing.buyer);
  console.log("  Delivery confirmed:", listing.deliveryConfirmed);
  console.log("  Escrowed:", ethers.formatEther(listing.escrowedAmount), "MATIC");

  // Check deployer received MATIC
  console.log("  Deployer MATIC balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  console.log("  Test user MATIC balance:", ethers.formatEther(await ethers.provider.getBalance(testUser.address)), "\n");

  // --- UserProfile: Set deployer profile ---
  console.log("=== [8] UserProfile: Set profile ===");
  const up = await ethers.getContractAt("UserProfile", USER_PROFILE);
  tx = await up.connect(deployer).setProfile("Trestle Deployer", "ipfs://avatar", "Building the decentralized marketplace");
  await tx.wait();
  const profile = await up.getProfile(deployer.address);
  console.log("  Name:", profile.name);
  console.log("  Bio:", profile.bio, "\n");

  // --- UserProfile: Submit review ---
  console.log("=== [9] UserProfile: Submit review ===");
  tx = await up.connect(testUser).submitReview(deployer.address, 5, "Great deployer, fast and reliable");
  await tx.wait();
  const count_ = await up.getReviewCount(deployer.address);
  const reviews = await up.getReviews(deployer.address, 0, 10);
  console.log("  Review count:", count_.toString());
  console.log("  Rating:", reviews[0].rating, "/ 5");
  console.log("  Comment:", reviews[0].comment, "\n");

  // --- Summary ---
  console.log("============================================");
  console.log("  END-TO-END TEST COMPLETE");
  console.log("============================================");
  console.log("  RWA: subscribe() + transfer  ✓");
  console.log("  Marketplace: listFixed + buy   ✓");
  console.log("  UserProfile: set + review      ✓");
  console.log("============================================");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
