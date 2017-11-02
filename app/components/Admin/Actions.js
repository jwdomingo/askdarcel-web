import React from 'react';
// import * as ChangeRequestTypes from './ChangeRequestTypes';

let Actions = (props) => {
  let id = props.id;
  let approveAction = props.approveAction;
  let rejectAction = props.rejectAction;
  let changeRequestFields = props.changeRequestFields;
  return (
    <div className="actions request-cell btn-group">
      <button onClick={() => props.actionHandler(id, approveAction, changeRequestFields)}>
        <i className="material-icons">done</i>
        Approve
      </button>

      <button onClick={() => props.actionHandler(id, rejectAction)} className="danger">
        <i className="material-icons">delete</i>
        Reject
      </button>
    </div>
  );
};

export default Actions;
