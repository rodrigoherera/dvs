const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoteSystem contract", () => {
  const MAX_PROPOSALS = 1;
  const VOTE_START_STATE = 0;
  const VOTE_RUNNING_STATE = 1;
  const VOTE_ENDED_STATE = 2;
  const VOTE_PAUSED_STATE = 3;
  const VOTE_CANCELED_STATE = 4;
  const PROFESSION = "Test";
  const NAME_PROPOSAL = "Test";
  const DESCRIPTION_PROPOSAL = "This is a test description";

  let VoteSystem;
  let hardhatVoteSystem;
  let admin;
  let addr1;
  let addr2;

  beforeEach(async () => {
    VoteSystem = await ethers.getContractFactory("VoteSystem");
    [admin, addr1, addr2] = await ethers.getSigners();

    hardhatVoteSystem = await VoteSystem.deploy(MAX_PROPOSALS);
  });

  describe("Deployment", () => {
    it("Should set the right admin", async () => {
      expect(await hardhatVoteSystem.admin()).to.equal(admin.address);
    });
    
    it("Should set the maximum proposal", async () => {
      expect(await hardhatVoteSystem.maxProposals()).to.equal(MAX_PROPOSALS);
    });

    it("Should start the Vote state", async () => {
      expect(await hardhatVoteSystem.voteState()).to.equal(VOTE_START_STATE)
    });
  });

  describe("Candidate", () => {

    beforeEach(async () => {
      await hardhatVoteSystem.connect(addr1);
    });

    it("Should create a candidate", async () => {
      const candidateID = await hardhatVoteSystem.connect(addr1).createCandidate();
      const candidatesCreated = await hardhatVoteSystem.connect(addr1).candidatesOf();

      expect(candidateID.value).to.equal(0);
      expect(candidatesCreated).to.equal(true);
    });

    it("Shouldn't create a candidate, candidate duplicated", async () => {
      await hardhatVoteSystem.connect(addr1).createCandidate();
      await expect(hardhatVoteSystem.connect(addr1).createCandidate()).to.be.revertedWith("Candidate already exists");
    });

    it("Shouldn't create a candidate, state of vote different to Start", async () => {
      await hardhatVoteSystem.pauseVote();
      await expect(hardhatVoteSystem.connect(addr1).createCandidate()).to.be.revertedWith("Different state of vote");
    });

    it("Shouldn't create a candidate, admin not allowed", async () => {
      await expect(hardhatVoteSystem.connect(admin).createCandidate()).to.be.revertedWith("Admin could not participate");
    });

  });

  describe("Proposal", () => {
    beforeEach(async () => {
      await hardhatVoteSystem.connect(addr1).createCandidate();
    });

    it("Should create a proposal", async () => {
      const proposalID = await hardhatVoteSystem.createProposal(NAME_PROPOSAL, DESCRIPTION_PROPOSAL);
      
      expect(proposalID.value).to.equal(0);
      expect(await hardhatVoteSystem.numberOfProposals()).to.equal(1);
    });

    it("Shouldn't create a proposal, maximum of proposals exceeded", async () => {
      await hardhatVoteSystem.createProposal(NAME_PROPOSAL, DESCRIPTION_PROPOSAL);
      await expect(hardhatVoteSystem.createProposal(NAME_PROPOSAL, DESCRIPTION_PROPOSAL)).to.be.revertedWith("Max proposal created");
    });

    it("Shouldn't create a proposal, state of vote different to Start", async () => {
      await hardhatVoteSystem.pauseVote();
      await expect(hardhatVoteSystem.createProposal(NAME_PROPOSAL, DESCRIPTION_PROPOSAL)).to.be.revertedWith("Different state of vote");
    });
  });

  describe("Vote", () => {
    let proposalId;

    beforeEach(async () => {
      await hardhatVoteSystem.connect(addr1).createCandidate();
      proposalId = await hardhatVoteSystem.createProposal(NAME_PROPOSAL, DESCRIPTION_PROPOSAL);
    });

    it("Should start vote", async () => {
      await hardhatVoteSystem.startVote(0);

      const endingVote = BigInt(await hardhatVoteSystem.initialVote());
      const targetBlock = BigInt(await hardhatVoteSystem.targetBlock());

      expect(await hardhatVoteSystem.voteState()).to.equal(VOTE_RUNNING_STATE);
      expect(await hardhatVoteSystem.initialVote()).to.equal(await ethers.provider.getBlockNumber());
      expect(await hardhatVoteSystem.endingVote()).to.equal(endingVote+targetBlock);
    });

    it("Shouldn't start vote, state of vote different to Start", async () => {
      await hardhatVoteSystem.cancelVote();
      await expect(hardhatVoteSystem.startVote(0)).to.be.revertedWith("Different state of vote");
    });

    it("Should change state of vote to Cancel", async () => {
      await hardhatVoteSystem.cancelVote();
      expect(await hardhatVoteSystem.voteState()).to.be.equal(VOTE_CANCELED_STATE);
    });

    it("Should change state of vote to Pause", async () => {
      await hardhatVoteSystem.pauseVote();
      expect(await hardhatVoteSystem.voteState()).to.be.equal(VOTE_PAUSED_STATE);
    });

    it("Should change state of vote to Resume", async () => {
      await hardhatVoteSystem.resumeVote();
      expect(await hardhatVoteSystem.voteState()).to.be.equal(VOTE_RUNNING_STATE);
    });

    describe("Emit vote", () => {
      beforeEach(async () => {
        await hardhatVoteSystem.startVote(0);
      });

      it("Should emit vote", async () => {
        await hardhatVoteSystem.vote(proposalId.value);

        expect(await hardhatVoteSystem.numberOfVoters()).to.equal(1);
        expect(await hardhatVoteSystem.votesPerCandidatesOf(proposalId.value)).to.equal(1);
        expect(await hardhatVoteSystem.votesOf(admin.address, proposalId.value)).to.equal(true);
      });
      
      it("Shouldn't emit vote, vote duplicated", async () => {
        await hardhatVoteSystem.vote(proposalId.value);

        await expect(hardhatVoteSystem.vote(proposalId.value)).to.be.revertedWith("You already emit your vote");
      });

      it("Shouldn't emit vote, vote ended", async () => {
        await hardhatVoteSystem.endVote();

        await expect(hardhatVoteSystem.vote(proposalId.value)).to.be.revertedWith("Vote has ended");
      });

      it("Shouldn't emit vote, vote expired", async () => {
        // implements when this goes live 
        // https://github.com/nomiclabs/hardhat/issues/1112
        expect(true).to.equal(true);
      });

    });
  });
});