import React from 'react';
import * as ChangeRequestTypes from './ChangeRequestTypes';

var Actions = (props) => {
    let id = props.id;
    let approveAction = props.approveAction;
    let rejectAction = props.rejectAction;
    let changeRequestFields = props.changeRequestFields;
    return (
      <div className="actions request-cell">
        <i className="material-icons" onClick={() => props.actionHandler(id, approveAction, changeRequestFields)}>done</i>
        <i className="material-icons" onClick={() => props.actionHandler(id, rejectAction)}>delete</i>
      </div>
    );
};

export default Actions;
