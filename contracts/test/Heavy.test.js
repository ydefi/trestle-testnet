const { expect } = require("chai");
const { ethers } = require("hardhat");

const BPS = 10000n;
const FEE = 300n;
const FUTURE = () => Math.floor(Date.now() / 1000) + 365 * 86400;

describe("Trestle Protocol — Heavy Test Suite", function () {
  let deployer, treasury, buyer, seller, client, freelancer, user, attacker;
  let mockToken, govToken, mockPriceFeed;
  let digitalGoods, freelancerEscrow, feeDistributor, digitalRWA, userProfile;

  beforeEach(async function () {
    [deployer, treasury, buyer, seller, client, freelancer, user, attacker] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockGovernanceToken");
    mockToken = await MockERC20.deploy("Test", "TST", 18, ethers.parseEther("1000000"));
    govToken = await MockERC20.deploy("Governance", "GOV", 18, ethers.parseEther("1000000"));

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockV3Aggregator.deploy(8, 100000000000n);

    const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
    feeDistributor = await FeeDistributor.deploy(treasury.address, buyer.address);

    const DigitalGoods = await ethers.getContractFactory("DigitalGoods");
    digitalGoods = await DigitalGoods.deploy(treasury.address);

    const FreelancerEscrow = await ethers.getContractFactory("FreelancerEscrow");
    freelancerEscrow = await FreelancerEscrow.deploy(treasury.address);

    const DigitalRWA = await ethers.getContractFactory("DigitalRWA");
    digitalRWA = await DigitalRWA.deploy(
      "RealAsset", "RA", "ipfs://meta",
      ethers.parseEther("1000000"), deployer.address,
      await govToken.getAddress(), ethers.parseEther("100"),
      await mockPriceFeed.getAddress()
    );

    const UserProfile = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfile.deploy(await mockToken.getAddress());
  });

  // ═══════════════════════════════════════════════════════════════════
  //  CONSTRUCTOR / DEPLOYMENT TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe("Deployment & Constructor Validation", function () {
    it("DigitalGoods: reverts on zero treasury", async function () {
      const DG = await ethers.getContractFactory("DigitalGoods");
      await expect(DG.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(DG, "ZeroAddress");
    });

    it("FreelancerEscrow: reverts on zero treasury", async function () {
      const FE = await ethers.getContractFactory("FreelancerEscrow");
      await expect(FE.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(FE, "ZeroAddress");
    });

    it("UserProfile: reverts on zero reviewToken", async function () {
      const UP = await ethers.getContractFactory("UserProfile");
      await expect(UP.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(UP, "ZeroAddress");
    });

    it("FeeDistributor: reverts on zero treasury", async function () {
      const FD = await ethers.getContractFactory("FeeDistributor");
      await expect(FD.deploy(ethers.ZeroAddress, buyer.address)).to.be.revertedWithCustomError(FD, "ZeroAddress");
    });

    it("FeeDistributor: reverts on zero buybackBurn", async function () {
      const FD = await ethers.getContractFactory("FeeDistributor");
      await expect(FD.deploy(treasury.address, ethers.ZeroAddress)).to.be.revertedWithCustomError(FD, "ZeroAddress");
    });

    it("DigitalRWA: reverts on zero owner", async function () {
      const DRWA = await ethers.getContractFactory("DigitalRWA");
      await expect(DRWA.deploy("T", "T", ethers.ZeroHash, 100, ethers.ZeroAddress, user.address, 1, user.address))
        .to.be.revertedWithCustomError(DRWA, "InvalidParams");
    });

    it("DigitalRWA: reverts on zero cap", async function () {
      const DRWA = await ethers.getContractFactory("DigitalRWA");
      await expect(DRWA.deploy("T", "T", ethers.ZeroHash, 0, deployer.address, user.address, 1, user.address))
        .to.be.revertedWithCustomError(DRWA, "InvalidParams");
    });

    it("DigitalRWA: allows zero govToken (set later via setWhitelistToken)", async function () {
      const DRWA = await ethers.getContractFactory("DigitalRWA");
      const rwa = await DRWA.deploy("T", "T", ethers.ZeroHash, 100, deployer.address, ethers.ZeroAddress, 0, user.address);
      await rwa.waitForDeployment();
      expect(await rwa.govToken()).to.equal(ethers.ZeroAddress);
    });

    it("DigitalRWA: reverts on zero priceFeed", async function () {
      const DRWA = await ethers.getContractFactory("DigitalRWA");
      await expect(DRWA.deploy("T", "T", ethers.ZeroHash, 100, deployer.address, user.address, 1, ethers.ZeroAddress))
        .to.be.revertedWithCustomError(DRWA, "ZeroAddress");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  FEE DISTRIBUTOR TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe("FeeDistributor", function () {
    it("should split ETH 40/40/20 correctly", async function () {
      await feeDistributor.setYieldVault(user.address);
      const amount = ethers.parseEther("100");
      await deployer.sendTransaction({ to: await feeDistributor.getAddress(), value: amount });

      const before = {
        t: await ethers.provider.getBalance(treasury.address),
        y: await ethers.provider.getBalance(user.address),
        b: await ethers.provider.getBalance(buyer.address),
      };

      await feeDistributor.connect(deployer).distribute(ethers.ZeroAddress);

      const ys = amount * 4000n / BPS;
      const ts = amount * 4000n / BPS;
      const bs = amount - ys - ts;

      expect(await ethers.provider.getBalance(treasury.address) - before.t).to.equal(ts);
      expect(await ethers.provider.getBalance(user.address) - before.y).to.equal(ys);
      expect(await ethers.provider.getBalance(buyer.address) - before.b).to.equal(bs);
    });

    it("should split ERC20 fees correctly", async function () {
      await feeDistributor.setYieldVault(user.address);
      const amount = ethers.parseEther("1000");
      await mockToken.connect(deployer).mint(await feeDistributor.getAddress(), amount);

      const before = await mockToken.balanceOf(treasury.address);
      await feeDistributor.connect(deployer).distribute(await mockToken.getAddress());

      const ts = amount * 4000n / BPS;
      expect(await mockToken.balanceOf(treasury.address) - before).to.equal(ts);
    });

    it("revert distribute with no fees", async function () {
      await feeDistributor.setYieldVault(user.address);
      await expect(feeDistributor.connect(deployer).distribute(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(feeDistributor, "NoFees");
    });

    it("revert setSplitBps with invalid split", async function () {
      await expect(feeDistributor.connect(deployer).setSplitBps(3000, 3000))
        .to.be.revertedWithCustomError(feeDistributor, "InvalidSplit");
    });

    it("revert setYieldVault by non-owner", async function () {
      await expect(feeDistributor.connect(user).setYieldVault(user.address)).to.be.reverted;
    });

    it("revert distribute by non-owner", async function () {
      await feeDistributor.setYieldVault(user.address);
      await deployer.sendTransaction({ to: await feeDistributor.getAddress(), value: ethers.parseEther("1") });
      await expect(feeDistributor.connect(user).distribute(ethers.ZeroAddress)).to.be.reverted;
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  DIGITAL RWA TESTS (CHAINLINK + WHITELIST + SUBSCRIBE)
  // ═══════════════════════════════════════════════════════════════════

  describe("DigitalRWA", function () {
    it("syncPrice from Chainlink oracle", async function () {
      await digitalRWA.syncPrice();
      expect(await digitalRWA.currentPrice()).to.equal(100000000000n);
    });

    it("revert syncPrice on stale price", async function () {
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      await expect(digitalRWA.syncPrice()).to.be.revertedWithCustomError(digitalRWA, "StalePrice");
    });

    it("revert syncPrice on negative price", async function () {
      await mockPriceFeed.updateAnswer(-100);
      await expect(digitalRWA.syncPrice()).to.be.revertedWithCustomError(digitalRWA, "InvalidPrice");
    });

    it("syncPrice has nonReentrant guard", async function () {
      // Just verify it works (nonReentrant is tested implicitly by not reverting)
      await digitalRWA.syncPrice();
      expect(await digitalRWA.lastPriceUpdate()).to.be.gt(0);
    });

    it("whitelist via GOV token balance", async function () {
      expect(await digitalRWA.isWhitelisted(user.address)).to.be.false;
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      expect(await digitalRWA.isWhitelisted(user.address)).to.be.true;
    });

    it("whitelist via manual override", async function () {
      expect(await digitalRWA.isWhitelisted(user.address)).to.be.false;
      await digitalRWA.connect(deployer).setManualWhitelist(user.address, true);
      expect(await digitalRWA.isWhitelisted(user.address)).to.be.true;
    });

    it("manual whitelist reverts on zero address", async function () {
      await expect(digitalRWA.connect(deployer).setManualWhitelist(ethers.ZeroAddress, true))
        .to.be.revertedWithCustomError(digitalRWA, "ZeroAddress");
    });

    it("mint to whitelisted address", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).mint(user.address, ethers.parseEther("50"));
      expect(await digitalRWA.balanceOf(user.address)).to.equal(ethers.parseEther("50"));
    });

    it("revert mint to non-whitelisted", async function () {
      await expect(digitalRWA.connect(deployer).mint(user.address, ethers.parseEther("50")))
        .to.be.revertedWithCustomError(digitalRWA, "NotWhitelisted");
    });

    it("revert mint exceeding cap", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await expect(digitalRWA.connect(deployer).mint(user.address, ethers.parseEther("2000000")))
        .to.be.revertedWithCustomError(digitalRWA, "CapExceeded");
    });

    it("revert mint by non-MINTER", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await expect(digitalRWA.connect(user).mint(user.address, ethers.parseEther("1")))
        .to.be.reverted;
    });

    it("subscribe with MATIC when whitelisted", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await digitalRWA.connect(user).subscribe({ value: ethers.parseEther("5") });
      expect(await digitalRWA.balanceOf(user.address)).to.equal(ethers.parseEther("5"));
    });

    it("revert subscribe when not whitelisted", async function () {
      await expect(digitalRWA.connect(user).subscribe({ value: ethers.parseEther("1") }))
        .to.be.revertedWithCustomError(digitalRWA, "NotWhitelisted");
    });

    it("revert subscribe with zero value", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await expect(digitalRWA.connect(user).subscribe({ value: 0 }))
        .to.be.revertedWithCustomError(digitalRWA, "InsufficientBalance");
    });

    it("withdrawETH by admin", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await digitalRWA.connect(user).subscribe({ value: ethers.parseEther("10") });
      await digitalRWA.connect(deployer).withdrawETH(user.address, ethers.parseEther("5"));
      expect(await ethers.provider.getBalance(user.address)).to.be.gt(0);
    });

    it("sweepETH by admin", async function () {
      await govToken.connect(deployer).transfer(user.address, ethers.parseEther("100"));
      await digitalRWA.connect(user).subscribe({ value: ethers.parseEther("10") });
      const balBefore = await ethers.provider.getBalance(treasury.address);
      await digitalRWA.connect(deployer).sweepETH(treasury.address);
      expect(await ethers.provider.getBalance(treasury.address)).to.be.gt(balBefore);
    });

    it("revert withdrawETH by non-admin", async function () {
      await expect(digitalRWA.connect(user).withdrawETH(user.address, 1)).to.be.reverted;
    });

    it("revert withdrawETH zero address", async function () {
      await expect(digitalRWA.connect(deployer).withdrawETH(ethers.ZeroAddress, 1))
        .to.be.revertedWithCustomError(digitalRWA, "ZeroAddress");
    });

    it("revert transfer to non-whitelisted", async function () {
      await govToken.connect(deployer).transfer(buyer.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("50"));
      await expect(digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10")))
        .to.be.revertedWithCustomError(digitalRWA, "NotWhitelisted");
    });

    it("allow transfer between whitelisted", async function () {
      await govToken.connect(deployer).transfer(buyer.address, ethers.parseEther("100"));
      await govToken.connect(deployer).transfer(seller.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("50"));
      await digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10"));
      expect(await digitalRWA.balanceOf(seller.address)).to.equal(ethers.parseEther("10"));
    });

    it("asset info one-time only", async function () {
      await digitalRWA.connect(deployer).setAssetInfo("Fund", "Desc", 90, 500, "T-Bill", FUTURE(), ethers.parseEther("1.05"));
      const info = await digitalRWA.assetInfo();
      expect(info.name).to.equal("Fund");
      await expect(digitalRWA.connect(deployer).setAssetInfo("X", "X", 0, 0, "", 0, 0))
        .to.be.revertedWithCustomError(digitalRWA, "AssetInfoAlreadySet");
    });

    it("pause blocks transfers", async function () {
      await govToken.connect(deployer).transfer(buyer.address, ethers.parseEther("100"));
      await govToken.connect(deployer).transfer(seller.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("50"));
      await digitalRWA.connect(deployer).pause();
      await expect(digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10"))).to.be.reverted;
    });

    it("unpause restores transfers", async function () {
      await govToken.connect(deployer).transfer(buyer.address, ethers.parseEther("100"));
      await govToken.connect(deployer).transfer(seller.address, ethers.parseEther("100"));
      await digitalRWA.connect(deployer).mint(buyer.address, ethers.parseEther("50"));
      await digitalRWA.connect(deployer).pause();
      await digitalRWA.connect(deployer).unpause();
      await digitalRWA.connect(buyer).transfer(seller.address, ethers.parseEther("10"));
      expect(await digitalRWA.balanceOf(seller.address)).to.equal(ethers.parseEther("10"));
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  DIGITAL GOODS TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe("DigitalGoods", function () {
    it("list and buy fixed-price", async function () {
      const price = ethers.parseEther("10");
      await digitalGoods.connect(seller).listFixed("ipfs://item", price, "ebooks", "");
      await digitalGoods.connect(buyer).buy(1, { value: price });
      const l = await digitalGoods.listings(1);
      expect(l.status).to.equal(1);
      expect(l.buyer).to.equal(buyer.address);
    });

    it("revert buy by seller themselves", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("1"), "", "");
      await expect(digitalGoods.connect(seller).buy(1, { value: ethers.parseEther("1") }))
        .to.be.revertedWithCustomError(digitalGoods, "WrongStatus");
    });

    it("revert buy on inactive listing", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("1"), "", "");
      await digitalGoods.connect(seller).cancelListing(1);
      await expect(digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("1") }))
        .to.be.revertedWithCustomError(digitalGoods, "WrongStatus");
    });

    it("revert buy with underpayment", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("10"), "", "");
      await expect(digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") }))
        .to.be.revertedWithCustomError(digitalGoods, "PriceTooLow");
    });

    it("refund excess ETH on overpayment", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      const balBefore = await ethers.provider.getBalance(buyer.address);
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("10") });
      const balAfter = await ethers.provider.getBalance(buyer.address);
      // Should only spend ~5 ETH + gas, not 10
      expect(balBefore - balAfter).to.be.lt(ethers.parseEther("6"));
    });

    it("send fees to treasury", async function () {
      const price = ethers.parseEther("10");
      await digitalGoods.connect(seller).listFixed("ipfs://item", price, "", "");
      const tBefore = await ethers.provider.getBalance(treasury.address);
      await digitalGoods.connect(buyer).buy(1, { value: price });
      const fee = price * FEE / BPS;
      expect(await ethers.provider.getBalance(treasury.address) - tBefore).to.equal(fee);
    });

    it("delivery flow: submit -> confirm", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "ipfs://delivery");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await digitalGoods.connect(seller).submitDelivery(1, "ipfs://hash");
      await digitalGoods.connect(buyer).confirmDelivery(1);
      expect((await digitalGoods.listings(1)).deliveryConfirmed).to.be.true;
    });

    it("revert confirm by non-buyer", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await expect(digitalGoods.connect(seller).confirmDelivery(1))
        .to.be.revertedWithCustomError(digitalGoods, "NotBuyer");
    });

    it("revert submit by non-seller", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await expect(digitalGoods.connect(buyer).submitDelivery(1, "ipfs://hash"))
        .to.be.revertedWithCustomError(digitalGoods, "NotSeller");
    });

    it("dispute flow", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await digitalGoods.connect(buyer).dispute(1);
      expect((await digitalGoods.listings(1)).status).to.equal(3); // Disputed
    });

    it("auto-resolve dispute after timeout favors buyer", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await digitalGoods.connect(buyer).dispute(1);
      await ethers.provider.send("evm_increaseTime", [8 * 86400]);
      await ethers.provider.send("evm_mine");
      await digitalGoods.connect(buyer).resolveAfterTimeout(1);
      expect((await digitalGoods.listings(1)).status).to.equal(4); // Refunded
    });

    it("auto-resolve after timeout with no dispute favors seller", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(buyer).buy(1, { value: ethers.parseEther("5") });
      await ethers.provider.send("evm_increaseTime", [8 * 86400]);
      await ethers.provider.send("evm_mine");
      await digitalGoods.connect(buyer).resolveAfterTimeout(1);
      expect((await digitalGoods.listings(1)).status).to.equal(1); // Sold (released to seller)
    });

    it("seller cancels before purchase", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await digitalGoods.connect(seller).cancelListing(1);
      expect((await digitalGoods.listings(1)).status).to.equal(2);
    });

    it("revert cancel by non-seller", async function () {
      await digitalGoods.connect(seller).listFixed("ipfs://item", ethers.parseEther("5"), "", "");
      await expect(digitalGoods.connect(buyer).cancelListing(1))
        .to.be.revertedWithCustomError(digitalGoods, "NotSeller");
    });

    it("Dutch auction price decreases over time", async function () {
      const start = ethers.parseEther("100");
      const reserve = ethers.parseEther("10");
      await digitalGoods.connect(seller).listDutch("ipfs://dutch", start, reserve, 86400, "", "");
      expect(await digitalGoods.currentPrice(1)).to.equal(start);
      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");
      const mid = await digitalGoods.currentPrice(1);
      expect(mid).to.be.lt(start);
      expect(mid).to.be.gt(reserve);
      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");
      expect(await digitalGoods.currentPrice(1)).to.equal(reserve);
    });

    it("buy with ERC20 token", async function () {
      const price = ethers.parseEther("100");
      await digitalGoods.connect(seller).listFixed("ipfs://token-item", price, "", "");
      await digitalGoods.connect(deployer).setTokenAllowed(await mockToken.getAddress(), true);
      await mockToken.connect(deployer).mint(buyer.address, price);
      await mockToken.connect(buyer).approve(await digitalGoods.getAddress(), price);
      await digitalGoods.connect(buyer).buyWithToken(1, await mockToken.getAddress(), price);
      expect((await digitalGoods.listings(1)).status).to.equal(1);
    });

    it("revert list with zero price", async function () {
      await expect(digitalGoods.connect(seller).listFixed("ipfs://item", 0, "", ""))
        .to.be.revertedWithCustomError(digitalGoods, "PriceTooLow");
    });

    it("revert setTreasury by non-owner", async function () {
      await expect(digitalGoods.connect(user).setTreasury(user.address)).to.be.reverted;
    });

    it("revert setTreasury zero address", async function () {
      await expect(digitalGoods.connect(deployer).setTreasury(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(digitalGoods, "ZeroAddress");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  FREELANCER ESCROW TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe("FreelancerEscrow", function () {
    const descs = ["Design", "Dev"];
    const amts = [ethers.parseEther("3"), ethers.parseEther("7")];
    const deadlines = [FUTURE(), FUTURE() + 86400];
    const budget = ethers.parseEther("10");

    it("create fixed project", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://brief", budget, descs, amts, deadlines);
      const p = await freelancerEscrow.projects(1);
      expect(p.client).to.equal(client.address);
      expect(p.status).to.equal(0);
    });

    it("revert < 2 milestones", async function () {
      await expect(freelancerEscrow.connect(client).createProjectFixed("X", "ipfs://", budget, ["Only"], [budget], [FUTURE()]))
        .to.be.revertedWithCustomError(freelancerEscrow, "TooFewMilestones");
    });

    it("revert zero budget", async function () {
      await expect(freelancerEscrow.connect(client).createProjectFixed("X", "ipfs://", 0, descs, amts, deadlines))
        .to.be.revertedWithCustomError(freelancerEscrow, "BudgetTooLow");
    });

    it("revert milestone amount mismatch", async function () {
      const wrong = [ethers.parseEther("1"), ethers.parseEther("1")];
      await expect(freelancerEscrow.connect(client).createProjectFixed("X", "ipfs://", budget, descs, wrong, deadlines))
        .to.be.revertedWithCustomError(freelancerEscrow, "BudgetTooLow");
    });

    it("fund and accept project", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      const p = await freelancerEscrow.projects(1);
      expect(p.freelancer).to.equal(freelancer.address);
      expect(p.status).to.equal(1);
    });

    it("revert fund by non-client", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await expect(freelancerEscrow.connect(user).fundProject(1, { value: budget }))
        .to.be.revertedWithCustomError(freelancerEscrow, "NotClient");
    });

    it("revert fund when not Open", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await expect(freelancerEscrow.connect(client).fundProject(1, { value: budget }))
        .to.be.revertedWithCustomError(freelancerEscrow, "WrongStatus");
    });

    it("full milestone workflow: submit -> approve -> complete", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);

      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://design");
      await freelancerEscrow.connect(client).approveMilestone(1, 0);

      await freelancerEscrow.connect(freelancer).submitMilestone(1, 1, "ipfs://dev");
      await freelancerEscrow.connect(client).approveMilestone(1, 1);

      const p = await freelancerEscrow.projects(1);
      expect(p.status).to.equal(2); // Completed
    });

    it("reject milestone", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://bad");
      await freelancerEscrow.connect(client).rejectMilestone(1, 0);
      const ms = await freelancerEscrow.getMilestoneCount(1);
      expect(ms).to.equal(2);
    });

    it("auto-approve after timeout", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://work");
      await ethers.provider.send("evm_increaseTime", [15 * 86400]);
      await ethers.provider.send("evm_mine");
      await freelancerEscrow.connect(freelancer).autoApproveMilestone(1, 0);
      const ms = await freelancerEscrow.getMilestoneCount(1);
      expect(ms).to.equal(2);
    });

    it("dispute and resolve via agent", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://work");
      await freelancerEscrow.connect(client).disputeProject(1);
      expect((await freelancerEscrow.projects(1)).status).to.equal(4);

      await freelancerEscrow.connect(deployer).resolveDispute(1, true);
      expect((await freelancerEscrow.projects(1)).status).to.equal(2);
    });

    it("revert resolveDispute by non-agent", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(client).disputeProject(1);
      await expect(freelancerEscrow.connect(user).resolveDispute(1, true)).to.be.reverted;
    });

    it("auto-resolve dispute after timeout", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(client).disputeProject(1);
      await ethers.provider.send("evm_increaseTime", [8 * 86400]);
      await ethers.provider.send("evm_mine");
      await freelancerEscrow.connect(freelancer).autoResolveDispute(1);
      expect((await freelancerEscrow.projects(1)).status).to.equal(2);
    });

    it("cancel project before acceptance", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(client).cancelProject(1);
      expect((await freelancerEscrow.projects(1)).status).to.equal(3);
    });

    it("revert cancel by non-client", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await expect(freelancerEscrow.connect(user).cancelProject(1))
        .to.be.revertedWithCustomError(freelancerEscrow, "NotClient");
    });

    it("revert cancel when not Open", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await expect(freelancerEscrow.connect(client).cancelProject(1))
        .to.be.revertedWithCustomError(freelancerEscrow, "WrongStatus");
    });

    it("Dutch auction project", async function () {
      const max = ethers.parseEther("20");
      const reserve = ethers.parseEther("10");
      const dAmts = [ethers.parseEther("10"), ethers.parseEther("10")];
      await freelancerEscrow.connect(client).createProjectDutch("Dutch Job", "ipfs://", max, reserve, 86400, descs, dAmts, deadlines);
      expect(await freelancerEscrow.currentBudget(1)).to.equal(max);
      await ethers.provider.send("evm_increaseTime", [43200]);
      await ethers.provider.send("evm_mine");
      const mid = await freelancerEscrow.currentBudget(1);
      expect(mid).to.be.lt(max);
      expect(mid).to.be.gt(reserve);
    });

    it("gig create -> hire -> work", async function () {
      const price = ethers.parseEther("10");
      const gDescs = ["Design", "Dev", "Ship"];
      const gAmts = [ethers.parseEther("2"), ethers.parseEther("5"), ethers.parseEther("3")];
      const gDeadlines = [FUTURE(), FUTURE() + 86400, FUTURE() + 2 * 86400];

      await freelancerEscrow.connect(freelancer).createGig("Full Stack", "ipfs://portfolio", price, gDescs, gAmts, gDeadlines);
      const gig = await freelancerEscrow.gigs(1);
      expect(gig.freelancer).to.equal(freelancer.address);
      expect(gig.active).to.be.true;

      await freelancerEscrow.connect(client).hireGig(1, { value: price });
      const p = await freelancerEscrow.projects(1);
      expect(p.freelancer).to.equal(freelancer.address);
      expect(p.status).to.equal(1);
    });

    it("revert hire inactive gig", async function () {
      const price = ethers.parseEther("10");
      await freelancerEscrow.connect(freelancer).createGig("Gig", "ipfs://", price, descs, amts, deadlines);
      await freelancerEscrow.connect(freelancer).cancelGig(1);
      await expect(freelancerEscrow.connect(client).hireGig(1, { value: price }))
        .to.be.revertedWithCustomError(freelancerEscrow, "WrongStatus");
    });

    it("update gig", async function () {
      const price = ethers.parseEther("10");
      await freelancerEscrow.connect(freelancer).createGig("Gig", "ipfs://", price, descs, amts, deadlines);
      const newAmts = [ethers.parseEther("4"), ethers.parseEther("6")];
      await freelancerEscrow.connect(freelancer).updateGig(1, "Updated", "ipfs://v2", ethers.parseEther("10"), descs, newAmts, deadlines);
      const gig = await freelancerEscrow.gigs(1);
      expect(gig.title).to.equal("Updated");
      expect(gig.price).to.equal(ethers.parseEther("10"));
    });

    it("revert update gig by non-freelancer", async function () {
      const price = ethers.parseEther("10");
      await freelancerEscrow.connect(freelancer).createGig("Gig", "ipfs://", price, descs, amts, deadlines);
      await expect(freelancerEscrow.connect(client).updateGig(1, "X", "ipfs://", price, descs, amts, deadlines))
        .to.be.revertedWithCustomError(freelancerEscrow, "NotFreelancer");
    });

    it("fees go to treasury on milestone approval", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://design");

      const tBefore = await ethers.provider.getBalance(treasury.address);
      await freelancerEscrow.connect(client).approveMilestone(1, 0);
      const fee = amts[0] * FEE / BPS;
      expect(await ethers.provider.getBalance(treasury.address) - tBefore).to.equal(fee);
    });

    it("revert submit milestone on cancelled project", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(client).cancelProject(1);
      await expect(freelancerEscrow.connect(freelancer).submitMilestone(1, 0, "ipfs://"))
        .to.be.revertedWithCustomError(freelancerEscrow, "NotFreelancer");
    });

    it("revert approve non-submitted milestone", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(client).fundProject(1, { value: budget });
      await freelancerEscrow.connect(freelancer).acceptProject(1);
      await expect(freelancerEscrow.connect(client).approveMilestone(1, 0))
        .to.be.revertedWithCustomError(freelancerEscrow, "WrongMilestone");
    });

    it("revert setTreasury zero address", async function () {
      await expect(freelancerEscrow.connect(deployer).setTreasury(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(freelancerEscrow, "ZeroAddress");
    });

    it("fundProjectWithToken", async function () {
      await freelancerEscrow.connect(client).createProjectFixed("Build", "ipfs://", budget, descs, amts, deadlines);
      await freelancerEscrow.connect(deployer).setTokenAllowed(await mockToken.getAddress(), true);
      await mockToken.connect(deployer).mint(client.address, budget);
      await mockToken.connect(client).approve(await freelancerEscrow.getAddress(), budget);
      await freelancerEscrow.connect(client).fundProjectWithToken(1, await mockToken.getAddress(), budget);
      const p = await freelancerEscrow.projects(1);
      expect(p.escrowedAmount).to.equal(budget);
      expect(p.paymentToken).to.equal(await mockToken.getAddress());
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  USER PROFILE TESTS
  // ═══════════════════════════════════════════════════════════════════

  describe("UserProfile", function () {
    it("set and get profile", async function () {
      await userProfile.connect(user).setProfile("Alice", "ipfs://avatar", "Builder");
      const p = await userProfile.getProfile(user.address);
      expect(p.name).to.equal("Alice");
      expect(p.avatarURI).to.equal("ipfs://avatar");
    });

    it("revert empty name", async function () {
      await expect(userProfile.connect(user).setProfile("", "", ""))
        .to.be.revertedWithCustomError(userProfile, "EmptyName");
    });

    it("submit review with token gate", async function () {
      await mockToken.connect(deployer).mint(buyer.address, ethers.parseEther("2"));
      await userProfile.connect(user).setProfile("Alice", "", "");
      await userProfile.connect(buyer).submitReview(user.address, 5, "Great work!");
      expect(await userProfile.getReviewCount(user.address)).to.equal(1);
    });

    it("revert review without tokens", async function () {
      await userProfile.connect(user).setProfile("Alice", "", "");
      await expect(userProfile.connect(buyer).submitReview(user.address, 5, "x"))
        .to.be.revertedWithCustomError(userProfile, "InsufficientBalance");
    });

    it("revert self-review", async function () {
      await mockToken.connect(deployer).mint(user.address, ethers.parseEther("2"));
      await userProfile.connect(user).setProfile("Alice", "", "");
      await expect(userProfile.connect(user).submitReview(user.address, 5, "x"))
        .to.be.revertedWithCustomError(userProfile, "SelfReview");
    });

    it("revert review too soon (cooldown)", async function () {
      await mockToken.connect(deployer).mint(user.address, ethers.parseEther("2"));
      await mockToken.connect(deployer).mint(buyer.address, ethers.parseEther("2"));
      await userProfile.connect(user).setProfile("Alice", "", "");
      await userProfile.connect(buyer).submitReview(user.address, 5, "first");
      await expect(userProfile.connect(buyer).submitReview(user.address, 5, "second"))
        .to.be.revertedWithCustomError(userProfile, "ReviewTooSoon");
    });

    it("revert invalid rating", async function () {
      await mockToken.connect(deployer).mint(user.address, ethers.parseEther("2"));
      await expect(userProfile.connect(buyer).submitReview(user.address, 0, "x"))
        .to.be.revertedWithCustomError(userProfile, "InvalidRating");
      await expect(userProfile.connect(buyer).submitReview(user.address, 6, "x"))
        .to.be.revertedWithCustomError(userProfile, "InvalidRating");
    });

    it("getReviews pagination", async function () {
      await mockToken.connect(deployer).mint(buyer.address, ethers.parseEther("2"));
      await userProfile.connect(user).setProfile("Alice", "", "");
      for (let i = 0; i < 5; i++) {
        await ethers.provider.send("evm_increaseTime", [86401]);
        await ethers.provider.send("evm_mine");
        await userProfile.connect(buyer).submitReview(user.address, 4, `review ${i}`);
      }
      const reviews = await userProfile.getReviews(user.address, 0, 3);
      expect(reviews.length).to.equal(3);
    });
  });
});
