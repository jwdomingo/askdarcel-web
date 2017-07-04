import React, { Component } from 'react';
import editCollectionHOC from './EditCollection';
import _ from 'lodash';

class EditPhone extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: _.clone(this.props.item)
        };

        this.handleFieldChange = this.handleFieldChange.bind(this);
    }

    handleFieldChange(e) {
        let value = e.target.value;
        let field = e.target.dataset.field;
        let phone = this.state.phone;

        if(phone[field] || value != this.props.item[field]) {
            phone[field] = value;
            this.setState({phone: phone});
            this.props.handleChange(this.props.index, phone);
        }		
    }

    render() {
        let phone = this.props.item;
        return (
            <li key="tel" className="edit--section--list--item tel">
                <label>Telephone</label>
                <input 
                    type="tel" 
                    placeholder="Phone number" 
                    data-field="number" 
                    defaultValue={phone.number} 
                    onChange={this.handleFieldChange} 
                />
            </li>
        );
    }
}

const EditPhones = editCollectionHOC(EditPhone, "Phones", {}, false);
export default EditPhones;
