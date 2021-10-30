import React from 'react';

const Proposals = (props) => {

  const _voteProposal = (proposalIndex) => {
    props.setProposal(proposalIndex)
    props.vote()
  }

  return (
    <div className="container">
      <button
        className="btn btn-secondary btn-sm" 
        aria-disabled="true"
        onClick={() => props.showAddProposal()}
      >
        Add
      </button>
      <div className="row">
        {(props.proposals) 
          && props.proposals.map((proposal, i) => (
          <div
            className="m-2 card"
            style={{width: "18rem"}}
            key={i}
          >
            <div className="card-body"key={i}>
              <h5 className="card-title">
                {proposal[1]}
              </h5>
              <p className="card-text">
                {proposal[2]}
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => _voteProposal(i)}>Vote</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Proposals;