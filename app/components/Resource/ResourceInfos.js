import React, { Component } from 'react';
import Hours from './Hours';
import classNames from 'classnames/bind';
import { timeToString, stringToTime, daysOfTheWeek, buildHoursText} from '../../utils/index';

class Cat extends Component {
  render() {
    return <p>{this.props.category}</p>;
  }
}

class ResourceCategories extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(this.props.categories.length) {
      let categoryMap = {};
      this.props.categories.forEach(category => {
        categoryMap[category.name] = true;
      });

      let cats = Object.keys(categoryMap).map((cat, i) =>{
        return <Cat category={cat} key={i} />
      });
      return <span className="categories">{cats}</span>;
    } else {
      return null;
    }
  }
}

class AddressInfo extends Component {
  render() {
    return (
      <span className="address">
        {buildLocation(this.props.address)}
      </span>
    );
  }
}

class TodaysHours extends Component {
  render() {
    return (
      <Hours schedule={this.props.schedule_days} />
    );
  }
}

class PhoneNumber extends Component {
  render() {
    return (
      <span className="phone">
        {buildPhoneNumber(this.props.phones)}
      </span>
    );
  }
}

class Languages extends Component {
  render() {
    return (
      <span className="lang">
        <p>English, Spanish</p>
      </span>
    );
  }
}

class Website extends Component {
  render() {
    return (
      <span className="website">
        <a href={this.props.website} target="_blank">{this.props.website}</a>
      </span>
    );
  }
}

class StreetView extends Component {
  render() {
    return (
      <div className="org-streetview">
        <img className="org-streetview--img" src={buildImgURL(this.props.address)} />
      </div>
    );
  }
}

function buildLocation(address) {
  let line1 = "";
  let line2 = "";

  if(address) {
    if(address.address_1) {
      line1 += address.address_1;
    }

    if(address.address_2) {
      line1 += ", " + address.address_2;
    }

    if(address.city) {
      line2 += address.city;
    }

    if(address.state_province) {
      line2 += ", " + address.state_province;
    }

    if(address.postal_code) {
      line2 += ", " + address.postal_code;
    }
  }

  return (
    <span>
    {line1}<br />{line2}
    </span>
  );
}

function buildPhoneNumber(phones) {
  if(!phones) {
    return;
  }

  let phone = {};

  if(phones.length && phones.length > 0) {
    phone = phones[0];
  }

  return (
    <p>{phone.number}</p>
  );
}

function buildImgURL(address) {
  if(address) {
     let url = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
      address.latitude + "," + address.longitude +
      "&fov=90&heading=235&pitch=10";
      if(CONFIG.GOOGLE_API_KEY) {
        url += '&key=' + CONFIG.GOOGLE_API_KEY;
      }
      return url;
  } else {
    return "http://lorempixel.com/200/200/city/";
  }
}

export {Cat, AddressInfo, TodaysHours, PhoneNumber, ResourceCategories, Website, Languages, StreetView};
