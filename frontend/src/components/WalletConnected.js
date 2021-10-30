import React from 'react';

const WalletConnected = (props) => {
  return (
    <div>
      <button
        className="btn btn-primary"
        type="button"
        
      >
        {props.address.substring(0,2) + "..." + props.address.substring(38,42)}
      </button>
      <button
        className="btn btn-outline-danger"
        type="button"
        onClick={props.logout}
      >
        x
      </button>
    </div>
  )
};

export default WalletConnected;