import React from 'react';

const Ranking = (props) => {
  return (
    <div className="container">
      <div className="row">
        {(props.ranking) 
          && props.ranking.map((ranking, i) => (
          <div
            className="m-2 card"
            style={{width: "18rem"}}
            key={i}
          >
            <div className="card-body" key={i}>
              <h5 className="card-title">
                Name: {ranking["proposal"][1]}
              </h5>
              <p className="card-text">
                Description: {ranking["proposal"][2]}
              </p>
              <p className="card-text">
                Votes: {ranking["votes"]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Ranking;