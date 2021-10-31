//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract VoteSystem {
    address public admin;
    
    uint public numberOfVoters;
    uint public numberOfVotes;
    uint public numberOfProposals;
    uint public numberOfCandidates;
    
    uint public initialVote;
    uint public endingVote;
    uint public maxProposals;
    uint public targetBlock = 500;
    
    enum State {Started, Running, Ended, Paused, Canceled}
    State public voteState;
    
    struct VoteP {
       Proposal[] proposal;
       mapping(address => mapping(uint => bool)) voters; // mantaing a map of voters with proposal id.
    }

    struct Proposal {
        address candidate;
        string name;
        string description;
    }

    
    mapping(uint => VoteP) internal votes;
    mapping(uint => Proposal) public proposals;
    mapping(uint => address) public candidates;
    mapping(address => bool) internal candidatesCreated;
    mapping(uint => uint) public votesPerProposal;
    
    constructor(uint _maxProposals) {
        maxProposals = _maxProposals;
        admin = msg.sender;
        voteState = State.Started;
    }
    
    event CancelVote();
    event PauseVote();
    event ResumeVote();
    event EndVote();
    event StartVote(uint _nroOfVote);
    event CreateProposal(string _name, string _description);
    event CreateCandidate();
    event Vote(uint _proposal);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }
    
    modifier notAdmin() {
        require(msg.sender != admin, "Admin could not participate");
        _;
    }
    
    modifier voteEnded() {
        require(voteState != State.Ended, "Vote has ended");
        _;
    }

    //TODO - Keep testing this, isn't working.
    modifier voteExpired() {
        require(endingVote < block.number, "Vote expired");
        _;
    } 
    
    function cancelVote() public onlyAdmin {
        voteState = State.Canceled;
        emit CancelVote();
    }
    
    function pauseVote() public onlyAdmin {
        voteState = State.Paused;
        emit PauseVote();
    }
    
    function resumeVote() public onlyAdmin {
        voteState = State.Running;
        emit ResumeVote();
    }

    function endVote() public onlyAdmin {
        voteState = State.Ended;
        emit EndVote();
    }
    
    function startVote(uint _nroOfVote) public onlyAdmin {
        require(voteState == State.Started, "Different state of vote");
        
        initialVote = block.number;
        endingVote = initialVote + targetBlock;
        
        VoteP storage newVote = votes[_nroOfVote];
        
        for (uint i=0; i<numberOfProposals; i++) {
         newVote.proposal.push(proposals[i]);   
        }
        
        voteState = State.Running;
        
        emit StartVote(_nroOfVote);
    }
    
    function createProposal(string memory _name, string memory _description) public returns (uint proposalID) {
        require(numberOfProposals < maxProposals, "Max proposal created");
        require(voteState == State.Started, "Different state of vote");

        uint _candidateIndex;

        Proposal storage newProposal = proposals[numberOfProposals];
        proposalID = numberOfProposals++;
        
        for (uint256 index = 0; index < numberOfCandidates; index++) {
            if (candidates[index] == msg.sender) {
                _candidateIndex = index;
            }
        }

        newProposal.name = _name;
        newProposal.description = _description;
        
        newProposal.candidate = candidates[_candidateIndex];
        
        emit CreateProposal(_name, _description);
    }
    
    function createCandidate() public notAdmin returns (uint candidateID) {
        require(voteState == State.Started, "Different state of vote");
        require(candidatesCreated[msg.sender] == false, "Candidate already exists");
        
        candidateID = numberOfCandidates++;
        candidates[candidateID] = msg.sender;
        
        candidatesCreated[msg.sender] = true;
        
        emit CreateCandidate();
    }
    
    function vote(uint _proposal) external voteEnded {
        require(votes[numberOfVotes].voters[msg.sender][_proposal] == false, "You already emit your vote");
        
        votes[numberOfVotes].voters[msg.sender][_proposal] = true;
        
        votesPerProposal[_proposal]++;
        numberOfVoters++;
        
        emit Vote(_proposal);
    }

    function candidatesOf() external view returns (bool) {
        return candidatesCreated[msg.sender];
    }
    
    function votesPerCandidatesOf(uint _proposal) external view returns (uint) {
        return votesPerProposal[_proposal];
    }

    function votesOf(address addr, uint _proposal) external view returns (bool){
        return votes[numberOfVotes].voters[addr][_proposal];
    }
    
    function getBlock() external view returns (uint) {
        return block.number;
    }
}