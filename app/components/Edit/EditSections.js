import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import _ from 'lodash';

import Loader from '../Loader';
import EditAddress from './EditAddress';
import EditServices from './EditServices';
import EditNotes from './EditNotes';
import EditSchedule from './EditSchedule';
import EditPhones from './EditPhones';
import * as dataService from '../../utils/DataService';
import { getAuthRequestHeaders } from '../../utils/index';
import { daysOfTheWeek } from '../../utils/index';

class EditSections extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      scheduleObj: {},
      schedule_days: {},
      resourceFields: {},
      serviceFields: {},
      address: {},
      services: {},
      notes: {},
      phones: [],
      submitting: false,
      newResource: false,
    };

    this.handleResourceFieldChange = this.handleResourceFieldChange.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleServiceChange = this.handleServiceChange.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.postServices = this.postServices.bind(this);
    this.postObject = this.postObject.bind(this);
    this.postNotes = this.postNotes.bind(this);
    this.postSchedule = this.postSchedule.bind(this);
    this.createResource = this.createResource.bind(this);
    this.prepServicesData = this.prepServicesData.bind(this);
  }

  componentDidMount() {
    let { query, pathname } = this.props.location;
    let splitPath = pathname.split('/');
    if (splitPath[splitPath.length - 1] === 'new') {
      this.setState({ newResource: true, resource: {}, originalResource: {}, scheduleMap: {} });
    }
    let resourceID = query.resourceid;
    if (resourceID) {
      let url = '/api/resources/' + resourceID;
      fetch(url).then(r => r.json())
        .then(data => {
          this.setState({
            resource: data.resource,
            originalResource: data.resource,
          });

          let scheduleMap = {};
          data.resource && data.resource.schedule && data.resource.schedule.schedule_days.forEach(function(day) {
            scheduleMap[day.day] = day;
          });
          this.setState({ scheduleMap: scheduleMap });
        });
    }
  }

  createResource() {
    let {
      scheduleObj,
      notes,
      phones,
      services,
      resourceFields,
      name,
      long_description,
      short_description,
      website,
      email,
      address
    } = this.state;

    let schedule = this.prepSchedule(scheduleObj);

    // let newServices = this.prepServicesData(services.services);
    let newResource = {
      name,
      address,
      long_description,
      email,
      website,
      notes: notes.notes ? this.prepNotesData(notes.notes) : [],
      schedule: { schedule_days: schedule },
    };

    let requestString = '/api/resources';
    dataService.post(requestString, { resources: [newResource] }, getAuthRequestHeaders())
      .then((response) => {
        if (response.ok) {
          alert('Resource successfuly created. Thanks!');
          browserHistory.push('/');
        } else {
          alert('Issue creating resource, please try again.');
          console.log(logMessage);
        }
      })
  }


  hasKeys(object) {
    let size = 0;
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        return true;
      }
      return false;
    }
  }
  prepSchedule(schedule) {
    let newSchedule = [];
    for (var day in schedule) {
      newSchedule.push(schedule[day]);
    }
    return newSchedule;
  }

  handleSubmit() {
    this.setState({ submitting: true });
    let resource = this.state.resource;
    let promises = [];

    //Resource
    let resourceChangeRequest = {};
    let resourceModified = false;
    if (this.state.name && this.state.name !== resource.name) {
      resourceChangeRequest.name = this.state.name;
      resourceModified = true;
    }
    if (this.state.long_description && this.state.long_description !== resource.long_description) {
      resourceChangeRequest.long_description = this.state.long_description;
      resourceModified = true;
    }
    if (this.state.short_description && this.state.short_description !== resource.short_description) {
      resourceChangeRequest.short_description = this.state.short_description;
      resourceModified = true;
    }
    if (this.state.website && this.state.website !== resource.website) {
      resourceChangeRequest.website = this.state.website;
      resourceModified = true;
    }
    if (this.state.name && this.state.name !== resource.name) {
      resourceChangeRequest.name = this.state.name;
      resourceModified = true;
    }
    if (this.state.email && this.state.email !== resource.email) {
      resourceChangeRequest.email = this.state.email;
      resourceModified = true;
    }
    //fire off resource request
    if (resourceModified) {
      promises.push(dataService.post('/api/resources/' + resource.id + '/change_requests', { change_request: resourceChangeRequest }));
    }

    //Fire off phone requests
    this.postCollection(this.state.phones, this.state.resource.phones, 'phones', promises);

    //schedule
    this.postObject(this.state.scheduleObj, 'schedule_days', promises);

    //address
    if (this.hasKeys(this.state.address) && this.state.resource.address) {
      promises.push(dataService.post('/api/addresses/' + this.state.resource.address.id + '/change_requests', {
        change_request: this.state.address
      }));
    }

    //Services
    this.postServices(this.state.services.services, promises);

    //Notes
    this.postNotes(this.state.notes, promises, { path: "resources", id: this.state.resource.id });

    var that = this;
    Promise.all(promises).then(function(resp) {
      that.props.router.push({ pathname: "/resource", query: { id: that.state.resource.id } });
    }).catch(function(err) {
      console.log(err);
    });

  }

  postCollection(collection, originalCollection, path, promises) {
    for (let i = 0; i < collection.length; i++) {
      let item = collection[i];

      if (i < originalCollection.length && item.dirty) {
        let diffObj = this.getDiffObject(item, originalCollection[i]);
        if (diffObj.numKeys > 0) {
          delete diffObj.obj.dirty;
          this.updateCollectionObject(diffObj.obj, item.id, path, promises);
        }
      } else if (item.dirty) {
        //post a new object
      }
    }
  }

  getDiffObject(curr, orig) {
    let diffObj = {
      obj: {},
      numKeys: 0
    };

    for (let key in curr) {
      if (!_.isEqual(curr[key], orig[key])) {
        diffObj.obj[key] = curr[key];
        diffObj.numKeys++;
      }
    }

    return diffObj;
  }

  updateCollectionObject(object, id, path, promises) {
    promises.push(
      dataService.post(
        '/api/' + path + '/' + id + '/change_requests', { change_request: object }
      )
    );
  }

  postObject(object, path, promises) {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        promises.push(dataService.post('/api/' + path + '/' + key + '/change_requests', { change_request: object[key] }));
      }
    }
  }

  postServices(servicesObj, promises) {
    let newServices = [];
    for (let key in servicesObj) {
      if (servicesObj.hasOwnProperty(key)) {
        let currentService = servicesObj[key];

        if (key < 0) {
          if (currentService.notesObj) {
            let notes = this.objToArray(currentService.notesObj.notes);
            delete currentService.notesObj;
            currentService.notes = notes;
          }

          currentService.schedule = this.createFullSchedule(currentService.scheduleObj);
          delete currentService.scheduleObj;

          if (!isEmpty(currentService)) {
            newServices.push(currentService);
          }
        } else {
          let uri = '/api/services/' + key + '/change_requests';
          this.postNotes(currentService.notesObj, promises, { path: "services", id: key });
          delete currentService.notesObj;
          this.postSchedule(currentService.scheduleObj, promises);
          delete currentService.scheduleObj;
          if (!isEmpty(currentService)) {
            promises.push(dataService.post(uri, { change_request: currentService }));
          }

        }
      }
    }

    if (newServices.length > 0) {
      let uri = '/api/resources/' + this.state.resource.id + '/services';
      promises.push(dataService.post(uri, { services: newServices }));
    }
  }

  prepServicesData(servicesObj) {
    let newServices = [];
    for (let key in servicesObj) {
      if (servicesObj.hasOwnProperty(key)) {
        let currentService = servicesObj[key];

        if (key < 0) {
          if (currentService.notesObj) {
            let notes = this.objToArray(currentService.notesObj.notes);
            delete currentService.notesObj;
            currentService.notes = notes;
          }
          currentService.schedule = this.createFullSchedule(currentService.scheduleObj);
          delete currentService.scheduleObj;

          if (!isEmpty(currentService)) {
            newServices.push(currentService);
          }
        }
      }
    }
    return newServices;
  }

  prepNotesData(notes) {
    let newNotes = [];
    for (let key in notes) {
      if (notes.hasOwnProperty(key)) {
        newNotes.push({ note: notes[key].note });
      }
    }
    return newNotes;
  }

  createFullSchedule(scheduleObj) {
    let daysTemplate = {};
    for (let i = 0; i < daysOfTheWeek().length; i++) {
      let day = daysOfTheWeek()[i];
      daysTemplate[day] = {
        day: day,
        opens_at: null,
        closes_at: null
      }
    }

    if (scheduleObj) {
      for (let key in scheduleObj) {
        if (scheduleObj.hasOwnProperty(key)) {
          let scheduleDay = scheduleObj[key];
          for (let dayKey in scheduleDay) {
            daysTemplate[scheduleDay.day][dayKey] = scheduleDay[dayKey];
          }
        }
      }
    }

    let scheduleDays = [];
    for (let day in daysTemplate) {
      if (daysTemplate.hasOwnProperty(day)) {
        scheduleDays.push(daysTemplate[day]);
      }
    }

    return { schedule_days: scheduleDays };
  }

  objToArray(obj) {
    let arr = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(obj[key]);
      }
    }

    return arr;
  }

  postSchedule(scheduleObj, promises, uriObj) {
    if (scheduleObj) {
      this.postObject(scheduleObj, 'schedule_days', promises);
    }
  }

  postNotes(notesObj, promises, uriObj) {
    if (notesObj) {
      let notes = notesObj.notes;
      let newNotes = [];
      for (let key in notes) {
        if (notes.hasOwnProperty(key)) {
          let currentNote = notes[key];
          if (key < 0) {
            let uri = '/api/' + uriObj.path + '/' + uriObj.id + '/notes';
            promises.push(dataService.post(uri, { note: currentNote }));
          } else {
            let uri = '/api/notes/' + key + '/change_requests';
            promises.push(dataService.post(uri, { change_request: currentNote }));
          }
        }
      }
    }
  }
  handlePhoneChange(phoneCollection) {
    this.setState({ phones: phoneCollection });
  }

  handleResourceFieldChange(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    const object = {};
    object[field] = value;
    this.setState(object);
  }

  handleScheduleChange(scheduleObj) {
    this.setState({ scheduleObj });
  }

  handleAddressChange(addressObj) {
    this.setState({ address: addressObj });
  }

  handleServiceChange(servicesObj) {
    this.setState({ services: servicesObj });
  }

  handleNotesChange(notesObj) {
    this.setState({ notes: notesObj });
  }

  handleServiceNotesChange(notesObj) {
    this.setState({ serviceNotes: notesObj });
  }

  formatTime(time) {
    //FIXME: Use full times once db holds such values.
    return time.substring(0, 2);
  }
  renderSectionFields() {
    const resource = this.state.resource;
    return (
      <section id="info" className="edit--section">
        <header className="edit--section--header">
          <h4>Info</h4>
        </header>
        <ul className="edit--section--list">

          <li key="name" className="edit--section--list--item">
            <label htmlFor="edit-name-input">Name</label>
            <input
              id="edit-name-input"
              type="text"
              placeholder="Name"
              data-field="name"
              defaultValue={resource.name}
              onChange={this.handleResourceFieldChange}
            />
          </li>

          <EditAddress
            address={this.state.resource.address}
            updateAddress={this.handleAddressChange}
          />

          <EditPhones
            collection={this.state.resource.phones}
            handleChange={this.handlePhoneChange}
          />

          <li key="website" className="edit--section--list--item email">
            <label htmlFor="edit-website-input">Website</label>
            <input
              id="edit-website-input"
              type="url"
              defaultValue={resource.website}
              data-field="website"
              onChange={this.handleResourceFieldChange}
            />
          </li>

          <li key="email" className="edit--section--list--item email">
            <label htmlFor="edit-email-input">E-Mail</label>
            <input
              id="edit-email-input"
              type="email"
              defaultValue={resource.email}
              data-field="email"
              onChange={this.handleResourceFieldChange}
            />
          </li>

          <li key="long_description" className="edit--section--list--item">
            <label htmlFor="edit-description-input">Description</label>
            <textarea
              id="edit-description-input"
              className=""
              defaultValue={resource.long_description}
              data-field="long_description"
              onChange={this.handleResourceFieldChange}
            />
          </li>

          <EditSchedule
            schedule={this.state.resource.schedule}
            handleScheduleChange={this.handleScheduleChange}
          />

          <EditNotes
            notes={this.state.resource.notes}
            handleNotesChange={this.handleNotesChange}
          />

        </ul>
      </section>
    );
  }

  renderServices() {
    let fields = [];
    let resource = this.state.resource;
    return (
      <section id="services" className="edit--section">
                <header className="edit--section--header">
                    <h4>Services</h4>
                </header>
                <ul className="edit--section--list">
                    <EditServices services={this.state.resource.services} handleServiceChange={this.handleServiceChange} />
                </ul>
            </section>
    )
  }

  render() {
    let actionButton = <button className="edit--aside--content--submit" disabled={this.state.submitting} onClick={this.handleSubmit}>Save changes</button>;
    if (this.state.newResource) {
      actionButton = <button className="edit--aside--content--submit" disabled={this.state.submitting} onClick={this.createResource}>Submit Resource</button>;
    }
    return (!this.state.resource && !this.state.newResource ? <Loader /> :
      <div className="edit">
            <div className="edit--main">
            <header className="edit--main--header">
              <h1 className="edit--main--header--title">{this.state.resource.name}</h1>
            </header>
            <div className="edit--sections">
                {this.renderSectionFields()}
                {this.state.newResource ? null : this.renderServices()}
            </div>
          </div>
          <div className="edit--aside">
            <div className="edit--aside--content">
                {actionButton}
                <nav className="edit--aside--content--nav">
                    <ul>
                        <li><a href="#info">Info</a></li>
                        {this.state.newResource ? null : <li><a href="#services">Services</a></li>}
                    </ul>
                </nav>
              </div>
          </div>
        </div>
    )
  }
}

function isEmpty(map) {
  for (var key in map) {
    return !map.hasOwnProperty(key);
  }
  return true;
}

function getDiffObject(curr, orig) {
  return Object.entries(curr).reduce((acc, [key, value]) => {
    if (!_.isEqual(orig[key], value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

EditSections.propTypes = {
  // TODO: location is only ever used to get the resourceid; we should just pass
  // in the resourceid directly as a prop
  location: PropTypes.shape({
    query: PropTypes.shape({
      resourceid: PropTypes.string,
    }).isRequired,
  }).isRequired,
  // TODO: Figure out what type router actually is
  router: PropTypes.instanceOf(Object).isRequired,
};

export default withRouter(EditSections);
