import React from 'react';

import NetworkErrorMessage from './NetworkErrorMessage';

const ConnectWallet = (props) => {
  return (
    <div>
      {props.networkError && (
        <NetworkErrorMessage
          message={props.networkError}
          dismiss={props.dismiss}
        />
      )}
      <button
        className="btn btn-outline-primary"
        type="button"
        onClick={props.connectWallet}
      >
        Connect Wallet
      </button>
    </div>
  )
};

export default ConnectWallet;