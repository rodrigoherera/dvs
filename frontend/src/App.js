import React from "react";

import { ethers } from "ethers";

import VoteSystemArtifact from "./contracts/VoteSystem.json";
import contractAddress from "./contracts/voteSystem-address.json";

import ConnectWallet from "./components/ConnectWallet";
import WalletConnected from "./components/WalletConnected";
import Loading from "./components/Loading";
import TransactionErrorMessage from "./components/TransactionErrorMessage";
import Candidates from "./components/Candidates";
import Proposals from "./components/Proposals";
import Ranking from "./components/Ranking";
import AddProposal from "./components/AddProposal";

const HARDHAT_NETWORK_ID = "3";
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const App = () => {
  const [voteSystem, setVoteSystem] = React.useState({});
  const [selectedAddress, setSelectedAddress] = React.useState("");

  const [networkError, setNetworkError] = React.useState("");
  const [transactionError, setTransactionError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [candidates, setCandidates] = React.useState([]);
  
  const [proposals, setProposals] = React.useState([]);
  const [proposalSelected, setProposalSelected] = React.useState(0);
  const [proposalsWithVotes, setProposalsWithVotes] = React.useState([]);
  const [proposalName, setProposalName] = React.useState("");
  const [proposalDescription, setProposalDescription] = React.useState("");
  
  const [showCandidates, setShowCandidates] = React.useState(false);
  const [showProposals, setShowProposals] = React.useState(false);
  const [showAddProposal, setShowAddProposal] = React.useState(false);
  const [showRanking, setShowRanking] = React.useState(false);

  //TODO - Add balance
  
  const _connectWallet = async () => {
    const [address] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!_checkNetwork()) {
      return;
    }

    _initialize(address);

    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return _resetState();
      }

      _initialize(newAddress);
    });

    window.ethereum.on("chainChanged", ([networkId]) => {
      _resetState();
    });
  };

  const _addCandidate = async () => {
    
    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);


    try {
      _dismissTransaction();

      const tx = await voteSystem.createCandidate();

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);

      setTransactionError(error.message);
    } finally {
      setIsLoading(false);

      _listCandidates();
    }
  };

  const _addProposal = async () => {

    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);


    try {
      _dismissTransaction();
      
      const tx = await voteSystem.createProposal(proposalName, proposalDescription);

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);

      setTransactionError(error.message);
    } finally {
      setIsLoading(false);
      setShowAddProposal(false);

      setProposalName("");
      setProposalDescription("");
      _listProposals();
    }
  };

  const _vote = async () => {
    
    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);
    
    try {
      _dismissTransaction();

      const tx = await voteSystem.vote(proposalSelected);

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);

      setTransactionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const _listCandidates = async () => {
    
    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);

    let listOfCandidates = [];

    const candidates = await voteSystem.numberOfCandidates();

    for (let index = 0; index < parseInt(candidates); index++) {
      const _candidate = await voteSystem.candidates(index);

      listOfCandidates.push(_candidate);
    }

    setIsLoading(false);
    
    setCandidates(listOfCandidates);
    setShowCandidates(true);
    setShowRanking(false);
    setShowProposals(false);
  };

  const _listVotesPerProposals = async () => {
    
    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);
    
    let proposalsVotes = [];

    const _proposals = await voteSystem.numberOfProposals();

    for (let index = 0; index < parseInt(_proposals); index++) {
      const _vote = await voteSystem.votesPerProposal(index);

      proposalsVotes.push({
        proposal: proposals[index],
        votes: parseInt(_vote),
      });
    }

    setIsLoading(false);

    setProposalsWithVotes(proposalsVotes);
    setShowRanking(true);
    setShowProposals(false);
    setShowCandidates(false);
  };

  const _listProposals = async () => {
    
    if (!_walletConnected()) {
      return;
    }

    setIsLoading(true);

    const listOfProposals = [];

    const proposals = await voteSystem.numberOfProposals();

    for (let index = 0; index < parseInt(proposals); index++) {
      const _proposal = await voteSystem.proposals(index);

      listOfProposals.push(_proposal);
    }

    setIsLoading(false);

    setProposals(listOfProposals);
    setShowProposals(true);
    setShowRanking(false);
    setShowCandidates(false);
  };

  const _dismissTransaction = () => {
    setTransactionError("");
  };

  const _dismissError = () => {
    setNetworkError("");
  };

  const _closeModal = () => {
    setShowAddProposal(false);
    setShowProposals(true);
  };

  const _showAddProposal = () => {
    setShowProposals(false);
    setShowAddProposal(true);
  };

  const _logout = () => {
    _resetState();
  };

  const _resetState = () => {
    setSelectedAddress("");
    setNetworkError("");
  };

  const _initialize = (userAddress) => {
    setSelectedAddress(userAddress);
    _initializeEthers();
  };

  const _initializeEthers = () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);

    const voteSystem = new ethers.Contract(
      contractAddress.VoteSystem,
      VoteSystemArtifact.abi,
      _provider.getSigner(0)
    );

    setVoteSystem(voteSystem);
  };

  const _checkNetwork = () => {

    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    setNetworkError("Please connect Metamask to Localhost:8545");
    return false;
  };

  const _walletConnected = () => {
    if (selectedAddress === "") {

      setTransactionError("Please connect your wallet.");
      return false;
    }

    return true;
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="container-xxl">
          <div className="navbar-brand" href="#">
            <span className="fw-bold text-secondary">
              Decentralize Vote System
            </span>
          </div>
          {selectedAddress === "" ? (
            <ConnectWallet
              connectWallet={() => _connectWallet()}
              networkError={networkError}
              dismiss={() => _dismissError()}
            />
          ) : (
            <WalletConnected
              address={selectedAddress}
              logout={() => _logout()}
            />
          )}
        </div>
      </nav>
      <div className="container-lg my-5">
        <div className="row justify-content-center">
          {transactionError !== "" && (
            <TransactionErrorMessage
              message={transactionError}
              dismiss={() => _dismissTransaction()}
            />
          )}
          {isLoading && (
            <Loading />
          )}
          <div className="col-md-3">
            <button
              className={`btn ${showCandidates ? " btn-primary " : " btn-outline-primary "} btn-sm`}
              aria-disabled="true"
              onClick={() => _listCandidates()}
            >
              Candidates
            </button>
          </div>
          <div className="col-md-3">
            <button
              className={`btn ${showProposals ? " btn-primary " : " btn-outline-primary "} btn-sm`}
              aria-disabled="true"
              onClick={() => _listProposals()}
            >
              {" "}
              Proposals
            </button>
          </div>
          <div className="col-md-3">
            <button
              className={`btn ${showRanking ? " btn-primary " : " btn-outline-primary "} btn-sm`}
              aria-disabled="true"
              onClick={() => _listVotesPerProposals()}
            >
              {" "}
              Ranking
            </button>
          </div>
          <div>
            {showCandidates && (
              <Candidates
                addCandidate={() => _addCandidate()}
                candidates={candidates}
              />
            )}
          </div>
          <div>
            {showProposals && (
              <Proposals
                vote={() => _vote()}
                showAddProposal={() => _showAddProposal()}
                proposals={proposals}
                setProposal={setProposalSelected}
              />
            )}
          </div>
          <div>
            {showRanking && (
              <Ranking
                ranking={proposalsWithVotes}
              />
            )}
          </div>
          <div>
            {showAddProposal && (
              <AddProposal
                addProposal={() => _addProposal()}
                close={() => _closeModal()}
                setDescription={setProposalDescription}
                setName={setProposalName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
