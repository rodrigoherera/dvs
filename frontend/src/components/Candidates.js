import React from 'react';

const Candidates = (props) => {
  return (
    <div className="container">
      <button
        className="btn btn-secondary btn-sm" 
        aria-disabled="true"
        onClick={() => props.addCandidate()}
      >
        Add
      </button>
      <div className="row">
        {(props.candidates) 
          && props.candidates.map((candidate, i) => (
          <div
            className="m-2 card"
            style={{width: "18rem"}}
            key={i}
          >
            <div
              className="card-body"
              key={i}
            >
              <p 
                className="card-title" 
                key={i}>{candidate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Candidates;