const { ethers } = require("hardhat");

async function main() {
  const MAX_PROPOSALS = 1;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const VoteSystem = await ethers.getContractFactory("VoteSystem");
  const voteSystem = await VoteSystem.deploy(MAX_PROPOSALS);

  console.log("Vote system address:", voteSystem.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
