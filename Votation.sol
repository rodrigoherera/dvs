//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract VotationSystyem {
    address public admin;
    uint public numberOfVoters; // total of voters.
    uint public startVote;
    uint public endVote;
    uint public numberOfVotations;
    uint public numberOfProposals;
    uint public maxProposals;
    
    struct Votation {
       Proposal[] proposal;
       mapping(address => bool) voters; // mantaing a map of voters and if already vote.
    }

    struct Proposal {
        Candidate candidate;
        string name;
        string description;
    }

    struct Candidate {
        address candidateAddress;
        string name;
        string surname;
        string profession;
    }
    
    mapping(uint => Votation) votations;
    mapping(uint => Proposal) proposals;
    mapping(uint => Candidate) candidates;
    
    constructor(uint _deadline, uint _maxProposals) {
        maxProposals = _maxProposals;
        startVote = block.timestamp;
        endVote = block.timestamp + _deadline;
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can create a proposal");
        _;
    }
    
    function createProposal(string memory _name, string memory _description, uint _candidate) public {
        require(numberOfProposals > maxProposals, "There's no more room for another proposal.");
        
        Votation storage newVotation = votations[numberOfVotations];
        Proposal storage newProposal = proposals[numberOfProposals];
        numberOfProposals++;
        
        newProposal.name = _name;
        newProposal.description = _description;
        newProposal.candidate = candidates[_candidate];
        
        newVotation.proposal.push(newProposal);
    }
    
    function createCandidate(string memory _name, string memory _surname, string memory _profession, address _address) public {
        
    }
}