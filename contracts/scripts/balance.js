const hre = require("hardhat");
async function main() {
  const [s] = await hre.ethers.getSigners();
  console.log("Address:", s.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(s.address)), "POL");
}
main();
