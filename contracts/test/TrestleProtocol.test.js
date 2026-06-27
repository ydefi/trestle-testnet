const { expect } = require("chai");
const { ethers } = require("hardhat");

const BPS_DENOM = 10000n;
const FEE = 250n;

describe("Testnet Contracts", function () {
  let deployer, treasury, buyer, seller, client, freelancer, user;
  let mockToken, digitalGoods, freelancerEscrow, feeDistributor, govToken, digitalRWA;

  beforeEach(async function () {
    [deployer, treasury, buyer, seller, client, freelancer, user] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockGovernanceToken");
    mockToken = await MockERC20.deploy("Test", "TST", 18, ethers.parseEther("1000000"));

    const GovToken = await ethers.getContractFactory("MockGovernanceToken");
    govToken = await GovToken.deploy("Governance", "GOV", 18, ethers.parseEther("1000000"));
    await govToken.waitForDeployment();

    const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
    feeDistributor = await FeeDistributor.deploy(treasury.address);
    await feeDistributor.waitForDeployment();

    const DigitalGoods = await ethers.getContractFactory("DigitalGoods");
    digitalGoods = await DigitalGoods.deploy();
    await digitalGoods.waitForDeployment();

    const FreelancerEscrow = await ethers.getContractFactory("FreelancerEscrow");
    freelancerEscrow = await FreelancerEscrow.deploy();
    await freelancerEscrow.waitForDeployment();

    const DigitalRWA = await ethers.getContractFactory("DigitalRWA");
    digitalRWA = await DigitalRWA.deploy(
      "RealAsset 1", "RA1",
      ethers.encodeBytes32String("ipfs://QmMeta"),
      ethers.parseEther("1000000"),
      deployer.address
    );
    await digitalRWA.waitForDeployment();
  });

  // ─── FeeDistributor ───────────────────────────────────────────────

  describe("FeeDistributor", function () {
    it("should split fees 40/40/20", async function () {
      await feeDistributor.setYieldVault(user.address);
      const amount = ethers.parseEther("100");
      await deployer.sendTransaction({ to: await feeDistributor.getAddress(), value: amount });

      const balBefore = {
        treasury: await ethers.provider.getBalance(treasury.address),
        feeDist: await ethers.provider.getBalance(await feeDistributor.getAddress()),
      };

      await feeDistributor.connect(deployer).distribute(ethers.ZeroAddress);

      const yieldShare = amount * 4000n / BPS_DENOM;
      const treasuryShare = amount * 4000n / BPS_DENOM;
      const buybackShare = amount - yieldShare - treasuryShare;

      const balAfter = {
        treasury: await ethers.provider.getBalance(treasury.address),
        feeDist: await ethers.provider.getBalance(await feeDistributor.getAddress()),
      };

      expect(balAfter.treasury - balBefore.treasury).to.equal(treasuryShare);
      expect(balAfter.feeDist).to.equal(buybackShare);
    });
  });

  // ─── DigitalRWA ───────────────────────────────────────────────────

  describe("DigitalRWA", function () {
    it("should mint tokens and enforce whitelist", async function () {
      await digitalRWA.connect(deployer).mint(user.address, ethers.parseEther("100"));
      expect(await digitalRWA.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
    });

    it("should block non-whitelisted transfers", async function () {
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("100"));
      await expect(
        digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10"))
      ).to.be.revertedWith("Sender not whitelisted");
    });

    it("should allow whitelisted transfers", async function () {
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).setWhitelist(buyer.address, true);
      await digitalRWA.connect(deployer).setWhitelist(seller.address, true);
      await digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10"));
      expect(await digitalRWA.balanceOf(seller.address)).to.equal(ethers.parseEther("10"));
    });

    it("should store and update asset info", async function () {
      await digitalRWA.connect(deployer).setAssetInfo(
        "T-Bill Fund", "Short-term US Treasury bills",
        90 * 86400, 500, "US T-Bill Series X",
        Math.floor(Date.now() / 1000) + 365 * 86400,
        ethers.parseEther("1.05")
      );
      const info = await digitalRWA.assetInfo();
      expect(info.name).to.equal("T-Bill Fund");
      expect(info.lockupDuration).to.equal(90 * 86400);
      expect(info.expectedReturnBps).to.equal(500);
    });
  });

  // ─── DigitalGoods ─────────────────────────────────────────────────

  describe("DigitalGoods", function () {
    it("should list and buy a fixed-price item", async function () {
      const price = ethers.parseEther("10");
      await digitalGoods.connect(seller).listFixed("ipfs://test", price);

      const fee = price * FEE / BPS_DENOM;
      const sellerReceives = price - fee;

      await digitalGoods.connect(buyer).buy(1, { value: price });

      const listing = await digitalGoods.listings(1);
      expect(listing.status).to.equal(1); // Sold
      expect(listing.buyer).to.equal(buyer.address);
    });

    it("should complete delivery flow", async function () {
      const price = ethers.parseEther("5");
      await digitalGoods.connect(seller).listFixed("ipfs://item", price);
      await digitalGoods.connect(buyer).buy(1, { value: price });

      await digitalGoods.connect(seller).submitDelivery(1, "ipfs://delivery-hash");
      await digitalGoods.connect(buyer).confirmDelivery(1);

      const listing = await digitalGoods.listings(1);
      expect(listing.deliveryConfirmed).to.be.true;
    });

    it("should revert if buyer underpays", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("10"));
      await expect(
        digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") })
      ).to.be.revertedWithCustomError(digitalGoods, "PriceTooLow");
    });

    it("should run Dutch auction with decreasing price", async function () {
      const startPrice = ethers.parseEther("100");
      const reservePrice = ethers.parseEther("10");
      const duration = 86400;

      await digitalGoods.connect(seller).listDutch("ipfs://dutch-item", startPrice, reservePrice, duration);

      expect(await digitalGoods.currentPrice(1)).to.equal(startPrice);

      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");

      const midPrice = await digitalGoods.currentPrice(1);
      expect(midPrice).to.be.lt(startPrice);
      expect(midPrice).to.be.gt(reservePrice);

      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");

      expect(await digitalGoods.currentPrice(1)).to.equal(reservePrice);

      await digitalGoods.connect(buyer).buy(1, { value: reservePrice });
      const listing = await digitalGoods.listings(1);
      expect(listing.status).to.equal(1);
    });

    it("should allow seller to cancel unpurchased listing", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://test", ethers.parseEther("10"));
      await digitalGoods.connect(seller).cancelListing(1);
      const listing = await digitalGoods.listings(1);
      expect(listing.status).to.equal(2); // Cancelled
    });

    it("should auto-resolve after dispute timeout", async function () {
      const price = ethers.parseEther("10");
      await digitalGoods.connect(seller).listFixed("ipfs://item", price);
      await digitalGoods.connect(buyer).buy(1, { value: price });
      await digitalGoods.connect(seller).submitDelivery(1, "ipfs://delivery");

      await digitalGoods.connect(buyer).dispute(1);

      await ethers.provider.send("evm_increaseTime", [8 * 86400]);
      await ethers.provider.send("evm_mine");

      await digitalGoods.connect(user).resolveAfterTimeout(1);
      const listing = await digitalGoods.listings(1);
      expect(listing.status).to.equal(4); // Refunded
    });

    it("should allow buy with ERC20 token", async function () {
      const price = ethers.parseEther("100");
      await digitalGoods.connect(seller).listFixed("ipfs://token-item", price);
      await mockToken.connect(deployer).mint(buyer.address, price);
      await mockToken.connect(buyer).approve(await digitalGoods.getAddress(), price);

      await digitalGoods.connect(buyer).buyWithToken(1, await mockToken.getAddress(), price);
      const listing = await digitalGoods.listings(1);
      expect(listing.status).to.equal(1);
    });
  });

  // ─── FreelancerEscrow ─────────────────────────────────────────────

  describe("FreelancerEscrow", function () {
    const milestoneDescs = ["Design", "Development", "Testing"];
    const milestoneAmounts = [ethers.parseEther("2"), ethers.parseEther("5"), ethers.parseEther("3")];
    const futureDeadline = Math.floor(Date.now() / 1000) + 365 * 86400;
    const milestoneDeadlines = [futureDeadline, futureDeadline, futureDeadline];
    const totalBudget = ethers.parseEther("10");

    it("should create a fixed-budget project", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      const project = await freelancerEscrow.projects(1);
      expect(project.client).to.equal(client.address);
      expect(project.status).to.equal(0); // Open
    });

    it("should fund and accept a project", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);

      const project = await freelancerEscrow.projects(1);
      expect(project.freelancer).to.equal(freelancer.address);
    });

    it("should complete full milestone workflow", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);

      // Milestone 0: submit → approve
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://design");
      await freelancerEscrow.connect(client).approveMilestone(1, 0);

      let m = await freelancerEscrow.projects(1);
      expect(m.status).to.equal(1); // InProgress

      // Milestone 1: submit → approve
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 1, "ipfs://dev");
      await freelancerEscrow.connect(client).approveMilestone(1, 1);

      // Milestone 2: submit → approve → completed
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 2, "ipfs://testing");
      await freelancerEscrow.connect(client).approveMilestone(1, 2);

      m = await freelancerEscrow.projects(1);
      expect(m.status).to.equal(2); // Completed
    });

    it("should reject a milestone", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);

      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://bad-work");
      await freelancerEscrow.connect(client).rejectMilestone(1, 0);

      const milestone = (await freelancerEscrow.projects(1)).milestones;
    });

    it("should create Dutch auction project", async function () {
      const maxBudget = ethers.parseEther("20");
      const reserveBudget = ethers.parseEther("10");
      const duration = 86400;
      const amts = [ethers.parseEther("20")];
      const descs = ["Full project"];
      const deadlines = [futureDeadline];

      await freelancerEscrow.connect(client).createProjectDutch(
        "Dutch Freelance Job", "ipfs://dutch-brief",
        maxBudget, reserveBudget, duration,
        descs, amts, deadlines
      );

      expect(await freelancerEscrow.currentBudget(1)).to.equal(maxBudget);

      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");

      const mid = await freelancerEscrow.currentBudget(1);
      expect(mid).to.be.lt(maxBudget);
      expect(mid).to.be.gt(reserveBudget);
    });

    it("should handle dispute", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://work");

      await freelancerEscrow.connect(client).disputeProject(1);
      let p = await freelancerEscrow.projects(1);
      expect(p.status).to.equal(4); // Disputed
    });

    it("should allow client to cancel before acceptance", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(client).cancelProject(1);
      const p = await freelancerEscrow.projects(1);
      expect(p.status).to.equal(3); // Cancelled
    });

    it("should revert if milestone amounts don't sum to budget", async function () {
      const wrongAmounts = [ethers.parseEther("1"), ethers.parseEther("1"), ethers.parseEther("1")];
      await expect(
        freelancerEscrow.connect(client).createProjectFixed(
          "Bad Budget", "ipfs://brief",
          totalBudget, milestoneDescs, wrongAmounts, milestoneDeadlines
        )
      ).to.be.revertedWithCustomError(freelancerEscrow, "BudgetTooLow");
    });

    it("should auto-approve milestone after timeout", async function () {
      await freelancerEscrow.connect(client).createProjectFixed(
        "Build Website", "ipfs://brief",
        totalBudget, milestoneDescs, milestoneAmounts, milestoneDeadlines
      );
      await freelancerEscrow.connect(client).fundProject(1, { value: totalBudget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://work");

      await ethers.provider.send("evm_increaseTime", [15 * 86400]);
      await ethers.provider.send("evm_mine");

      await freelancerEscrow.connect(user).autoApproveMilestone(1, 0);

      const p = await freelancerEscrow.projects(1);
    });

    it("should create gig and hire freelancer", async function () {
      const descs = ["Design", "Dev", "Ship"];
      const amts = [ethers.parseEther("2"), ethers.parseEther("5"), ethers.parseEther("3")];
      const deadlines = [futureDeadline, futureDeadline, futureDeadline];
      const price = ethers.parseEther("10");

      await freelancerEscrow.connect(freelancer).createGig(
        "Full Stack Dev", "ipfs://portfolio",
        price, descs, amts, deadlines
      );

      const gig = await freelancerEscrow.gigs(1);
      expect(gig.freelancer).to.equal(freelancer.address);
      expect(gig.active).to.be.true;

      await freelancerEscrow.connect(client).hireGig(1, { value: price });

      const project = await freelancerEscrow.projects(1);
      expect(project.freelancer).to.equal(freelancer.address);
      expect(project.client).to.equal(client.address);
      expect(project.status).to.equal(1); // InProgress
    });
  });
});
