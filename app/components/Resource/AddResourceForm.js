import React from 'react';
import { connect } from 'react-redux';
import { Control, Form } from 'react-redux-form';

import resourceActions from '../../actions/resourceActions';

class AddResourceForm extends React.Component {
  render() {
    return (
      <Form model="forms.resource" onSubmit={val => this.props.addResource(val)}>
        <label>Resource name:</label>
        <Control.text model="forms.resource.name" />

        <h4>Address</h4>
        <label>Address 1</label>
        <Control.text model="forms.resource.address.address_1" />
        <label>Address 2</label>
        <Control.text model="forms.resource.address.address_2" />
        <label>Address 3</label>
        <Control.text model="forms.resource.address.address_3" />
        <label>Address 4</label>
        <Control.text model="forms.resource.address.address_4" />
        <label>City</label>
        <Control.text model="forms.resource.address.city" />
        <label>State</label>
        <Control.text model="forms.resource.address.state_province" />
        <label>Postal Code</label>
        <Control.text model="forms.resource.address.postal_code" />
        <label>Country</label>
        <Control.text model="forms.resource.address.country" />
        <button type="submit">
          Finish registration!
        </button>
      </Form>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addResource: resource => dispatch(resourceActions.addResource(resource)),
  };
}

export default connect(null, mapDispatchToProps)(AddResourceForm);
