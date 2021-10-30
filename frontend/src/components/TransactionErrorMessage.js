import React from 'react'

const TransactionErrorMessage = (props) => {
  return (
    <div className="alert alert-danger" role="alert">
      Error sending transaction: {props.message}
      <button
        type="button"
        className="btn-close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={props.dismiss}
      >
      </button>
    </div>
  )
}

export default TransactionErrorMessage;