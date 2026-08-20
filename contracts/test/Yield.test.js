const { expect } = require("chai");
const { ethers } = require("hardhat");

const FEE = 300n;
const BPS = 10000n;

describe("Auto-Yield Escrow Expansion (ERC-4626)", function () {
  let deployer, treasury, client, freelancer, user;
  let usdc, feeDistributor, escrow, vault;

  const descs = ["Design", "Dev"];
  const amts = () => [ethers.parseUnits("300", 6), ethers.parseUnits("700", 6)];
  const deadlines = () => {
    const base = Math.floor(Date.now() / 1000) + 365 * 86400;
    return [base, base + 30 * 86400];
  };
  const budget = ethers.parseUnits("1000", 6);

  beforeEach(async function () {
    [deployer, treasury, client, freelancer, user] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));

    const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
    feeDistributor = await FeeDistributor.deploy(treasury.address, user.address);
    await feeDistributor.setYieldVault(user.address);

    const MockYieldVault = await ethers.getContractFactory("MockYieldVault");
    vault = await MockYieldVault.deploy(await usdc.getAddress(), "Trestle Yield Vault", "tYV");

    const FreelancerEscrow = await ethers.getContractFactory("FreelancerEscrow");
    escrow = await FreelancerEscrow.deploy(treasury.address);
    await escrow.setYieldVault(await vault.getAddress());
    await escrow.setFeeDistributor(await feeDistributor.getAddress());
    await escrow.setTokenAllowed(await usdc.getAddress(), true);
  });

  async function fundedProject() {
    await escrow.connect(client).createProjectFixed("Build", "ipfs://", "", "", 0, budget, descs, amts(), deadlines());
    await usdc.connect(deployer).mint(client.address, budget);
    await usdc.connect(client).approve(await escrow.getAddress(), budget);
    await escrow.connect(client).fundProjectWithToken(1, await usdc.getAddress(), budget);
    await escrow.connect(freelancer).acceptProject(1);
  }

  it("deposits funded escrow into the ERC-4626 vault", async function () {
    await fundedProject();
    expect(await escrow.projectShares(1)).to.be.gt(0);
    expect(await vault.totalAssets()).to.equal(budget);
    expect(await vault.balanceOf(await escrow.getAddress())).to.equal(budget);
  });

  it("does not deposit when yield is disabled", async function () {
    await escrow.setYieldEnabled(false);
    await fundedProject();
    expect(await escrow.projectShares(1)).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
  });

  it("distributes accrued yield on milestone approval: principal to freelancer, fee to treasury, yield to feeDistributor", async function () {
    await fundedProject();

    // Simulate organic yield: deployer supplies 100 USDC of extra assets into the vault
    const yieldAmount = ethers.parseUnits("100", 6);
    await usdc.connect(deployer).approve(await vault.getAddress(), yieldAmount);
    await vault.harvest(yieldAmount);

    const freelancerBefore = await usdc.balanceOf(freelancer.address);
    const treasuryBefore = await usdc.balanceOf(treasury.address);
    const fdBefore = await usdc.balanceOf(await feeDistributor.getAddress());

    // Milestone 0 (300 principal) -> assets out includes ~30 yield (rounded down by 1 wei via OZ virtual shares)
    await escrow.connect(freelancer).submitMilestone(1, 0, "ipfs://design");
    await escrow.connect(client).approveMilestone(1, 0);

    const m0Fee = ethers.parseUnits("300", 6) * FEE / BPS; // 9 USDC
    expect(await usdc.balanceOf(freelancer.address) - freelancerBefore).to.equal(ethers.parseUnits("291", 6));
    expect(await usdc.balanceOf(treasury.address) - treasuryBefore).to.equal(m0Fee);

    // Milestone 1 (700 principal) -> remaining assets + remaining yield
    await escrow.connect(freelancer).submitMilestone(1, 1, "ipfs://dev");
    await escrow.connect(client).approveMilestone(1, 1);

    const m1Fee = ethers.parseUnits("700", 6) * FEE / BPS; // 21 USDC
    expect(await usdc.balanceOf(freelancer.address) - freelancerBefore).to.equal(ethers.parseUnits("970", 6)); // 291 + 679
    expect(await usdc.balanceOf(treasury.address) - treasuryBefore).to.equal(m0Fee + m1Fee); // 30
    // Total yield (100 USDC) is routed to the fee distributor — OZ's virtual assets/shares
    // leave 1 wei of dust inside the vault, so the distributed amount is 99,999,999.
    expect(await usdc.balanceOf(await feeDistributor.getAddress()) - fdBefore).to.equal(99999999n);

    // All shares redeemed, project completed
    expect(await escrow.projectShares(1)).to.equal(0);
    expect(await vault.balanceOf(await escrow.getAddress())).to.equal(0);
    expect((await escrow.projects(1)).status).to.equal(2); // Completed
  });

  it("routes yield to feeDistributor on project cancellation (before acceptance)", async function () {
    // Create + fund only — do NOT accept, so the client can cancel an Open project
    await escrow.connect(client).createProjectFixed("Build", "ipfs://", "", "", 0, budget, descs, amts(), deadlines());
    await usdc.connect(deployer).mint(client.address, budget);
    await usdc.connect(client).approve(await escrow.getAddress(), budget);
    await escrow.connect(client).fundProjectWithToken(1, await usdc.getAddress(), budget);

    const yieldAmount = ethers.parseUnits("50", 6);
    await usdc.connect(deployer).approve(await vault.getAddress(), yieldAmount);
    await vault.harvest(yieldAmount);

    const clientBefore = await usdc.balanceOf(client.address);
    const fdBefore = await usdc.balanceOf(await feeDistributor.getAddress());

    await escrow.connect(client).cancelProject(1);

    // Client gets full principal back (1000), yield (50 - 1 wei dust) goes to feeDistributor
    expect(await usdc.balanceOf(client.address) - clientBefore).to.equal(budget);
    expect(await usdc.balanceOf(await feeDistributor.getAddress()) - fdBefore).to.equal(49999999n);
    expect(await escrow.projectShares(1)).to.equal(0);
  });

  it("only deposits when vault asset matches the payment token (native funded projects stay in escrow)", async function () {
    const nativeBudget = ethers.parseEther("10");
    await escrow.connect(client).createProjectFixed("Native", "ipfs://", "", "", 0, nativeBudget, descs, [ethers.parseEther("3"), ethers.parseEther("7")], deadlines());
    await escrow.connect(client).fundProject(1, { value: nativeBudget });
    await escrow.connect(freelancer).acceptProject(1);

    // Vault asset is USDC != address(0) so no deposit happened
    expect(await escrow.projectShares(1)).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
    // Escrow still holds the native funds
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(nativeBudget);
  });
});