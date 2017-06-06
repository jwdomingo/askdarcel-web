import React, { Component } from 'react';
import { timeToString, sortScheduleDays } from '../../utils/index';

export default class DetailedHours extends Component {
  render() {
    let { schedule } = this.props;
    schedule = sortScheduleDays(schedule);
    let hoursList = schedule.map((item,i) =>
      item.opens_at == 0 && item.closes_at >= 2359 ?
      <div key={i} className="weekly-hours-list--item">
      	<span className="weekly-hours-list--item--day">{`${item.day}`}</span>
      	<span className="weekly-hours-list--item--hours">24 Hours</span>
      </div> :
      <div key={i} className="weekly-hours-list--item">
     		<span className="weekly-hours-list--item--day">{`${item.day}`}</span>
     		<span className="weekly-hours-list--item--hours">{`${timeToString(item.opens_at)} - ${timeToString(item.closes_at)}`}
     		</span>
     	</div>

    );
    return (
      <span className="weekly-hours-list">
        {hoursList}
      </span>
    );
  }
}
