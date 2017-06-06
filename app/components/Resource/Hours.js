import React, { Component } from 'react';
import { timeToString, daysOfTheWeek, buildHoursText} from '../../utils/index';

export default class Hours extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { schedule } = this.props;
    return (
      <span className="hours">
        <p>{buildHoursText(schedule)}</p>
      </span>
    );
  }
}
