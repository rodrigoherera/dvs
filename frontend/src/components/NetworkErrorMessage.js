const React = require('react');

const NetworkErrorMessage = (props) => {

  return (
    <div className="alert alert-danger" role="alert">
      {props.message}
      <button
        type="button"
        className="btn-close"
        data-disabled="alert"
        aria-label="Close"
        onClick={props.dismiss}
      >
      </button>
    </div>
  )
};

export default NetworkErrorMessage;