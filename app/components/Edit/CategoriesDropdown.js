import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import * as dataService from '../../utils/DataService';

class CategoriesDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: [],
      options: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    dataService.get('/api/categories').then((json) => {
      this.setState({
        options: json.categories.map(category => ({
          label: category.name,
          value: category,
        })),
      });
    });
  }

  handleChange(newValues) {
    this.setState({ selectedValues: newValues }, () => {
      this.props.handleCategoryChange(newValues.map(val => val.value));
    });
  }

  render() {
    return (
      <Select
        multi
        value={this.state.selectedValues}
        options={this.state.options}
        onChange={this.handleChange}
      />
    );
  }
}

CategoriesDropdown.propTypes = {
  handleCategoryChange: PropTypes.func.isRequired,
};

export default CategoriesDropdown;
