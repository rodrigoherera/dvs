const { ethers, artifacts } = require("hardhat");

async function main() {
  const MAX_PROPOSALS = 6;

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const VoteSystem = await ethers.getContractFactory("VoteSystem");
  const voteSystem = await VoteSystem.deploy(MAX_PROPOSALS);

  console.log("Vote system address:", voteSystem.address);

  saveFrontendFiles(voteSystem);
}


function saveFrontendFiles(voteSystem) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/voteSystem-address.json",
    JSON.stringify({ VoteSystem: voteSystem.address}, undefined, 2)
  );

  const VoteSystemArtifact = artifacts.readArtifactSync("VoteSystem");

  fs.writeFileSync(
    contractsDir + "/VoteSystem.json",
    JSON.stringify(VoteSystemArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
