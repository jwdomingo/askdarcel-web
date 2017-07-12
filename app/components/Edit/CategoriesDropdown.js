import React, { Component } from 'react';
import Select from 'react-select';
import * as dataService from '../../utils/DataService';

class CategoriesDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedValue: '',
            options: []
        }

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        dataService.get('/api/categories').then((json) => {
            this.setState({
                options: json.categories.map((category) => {
                    return {
                        label: category.name,
                        value: category
                    }
                })
            });
        });
    }
    
    handleChange(newValues) {
        this.setState({selectedValue: newValues}, () => {
            this.props.handleCategoryChange(newValues.map(val => val.value));
        });
    }

    render() {
        return (
            <Select
                multi={true}
                value={this.state.selectedValue}
                options={this.state.options}
                onChange={this.handleChange}
            />
        );
    }
}

export default CategoriesDropdown;