import React from 'react';

const AddProposal = (props) => {
  
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    props.setName(name);
    props.setDescription(description);
  }, [name, description])

  return (
    <div>
      <h4>Add Proposal</h4>
      <form
        onSubmit={(event) => {
          
          event.preventDefault();

          const formData = new FormData(event.target);
          const name = formData.get("name");
          const description = formData.get("description");

          if (name && description) {
            setName(name);
            setDescription(description);
            props.addProposal();
          }
        }}
      >
        <div className="form-group">
          <div className="form-group">
            <label>Name: </label>
            <input 
              className="form-control" 
              type="text" 
              onChange={e => props.setName(e.target.value)} 
              name="name" 
              required />
          </div>
          <div className="form-group">
            <label>Description: </label>
            <input 
              className="form-control" 
              type="text"
              onChange={e => props.setDescription(e.target.value)}
              name="description" 
              required />
          </div>
          <div className="form-group mt-2">
            <input className="btn btn-primary" type="submit" value="Add" />
            <input className="btn btn-secondary ms-2" type="submit" onClick={props.close} value="Cancel" />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProposal;
