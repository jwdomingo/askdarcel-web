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
import { daysOfTheWeek } from '../../utils/index';

function getDiffObject(curr, orig) {
  return Object.entries(curr).reduce((acc, [key, value]) => {
    if (!_.isEqual(orig[key], value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function updateCollectionObject(object, id, path, promises) {
  promises.push(
    dataService.post(
      `/api/${path}/${id}/change_requests`,
      { change_request: object },
    ),
  );
}

/**
 * Create a change request for a new object.
 */
function createCollectionObject(object, path, promises, resourceID) {
  promises.push(
    dataService.post(
      '/api/change_requests',
      { change_request: object, type: path, parent_resource_id: resourceID },
    ),
  );
}

function postCollection(collection, originalCollection, path, promises, resourceID) {
  for (let i = 0; i < collection.length; i += 1) {
    const item = collection[i];

    if (i < originalCollection.length && item.dirty) {
      const diffObj = getDiffObject(item, originalCollection[i]);
      if (!_.isEmpty(diffObj)) {
        delete diffObj.dirty;
        updateCollectionObject(diffObj, item.id, path, promises);
      }
    } else if (item.dirty) {
      delete item.dirty;
      createCollectionObject(item, path, promises, resourceID);
    }
  }
}

function postObject(object, path, promises) {
  Object.entries(object).forEach(([key, value]) => {
    promises.push(dataService.post(`/api/${path}/${key}/change_requests`, { change_request: value }));
  });
}

function postSchedule(scheduleObj, promises) {
  if (scheduleObj) {
    postObject(scheduleObj, 'schedule_days', promises);
  }
}

function postNotes(notesObj, promises, uriObj) {
  if (notesObj && notesObj.notes) {
    const notes = notesObj.notes;
    Object.entries(notes).forEach(([key, currentNote]) => {
      if (key < 0) {
        const uri = `/api/${uriObj.path}/${uriObj.id}/notes`;
        promises.push(dataService.post(uri, { note: currentNote }));
      } else {
        const uri = `/api/notes/${key}/change_requests`;
        promises.push(dataService.post(uri, { change_request: currentNote }));
      }
    });
  }
}

function createFullSchedule(scheduleObj) {
  const daysTemplate = {};
  for (let i = 0; i < daysOfTheWeek().length; i += 1) {
    const day = daysOfTheWeek()[i];
    daysTemplate[day] = {
      day,
      opens_at: null,
      closes_at: null,
    };
  }

  if (scheduleObj) {
    Object.values(scheduleObj).forEach((scheduleDay) => {
      Object.entries(scheduleDay).forEach(([dayKey, schedule]) => {
        daysTemplate[scheduleDay.day][dayKey] = schedule;
      });
    });
  }

  return { schedule_days: Object.values(daysTemplate) };
}

class EditSections extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      scheduleObj: {},
      schedule_days: {},
      resourceFields: {},
      serviceFields: {},
      addressFields: {},
      services: {},
      notes: {},
      phones: [],
      submitting: false,
    };

    this.handleResourceFieldChange = this.handleResourceFieldChange.bind(this);
    this.handleScheduleChange = this.handleScheduleChange.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleServiceChange = this.handleServiceChange.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.postServices = this.postServices.bind(this);
  }

  componentDidMount() {
    const resourceID = this.props.location.query.resourceid;
    const url = `/api/resources/${resourceID}`;
    fetch(url).then(r => r.json())
      .then((data) => {
        this.setState({
          resource: data.resource,
          originalResource: data.resource,
        });

        const scheduleMap = {};
        data.resource.schedule.schedule_days.forEach((day) => {
          scheduleMap[day.day] = day;
        });
        this.setState({ scheduleMap });
      });
  }

  handleSubmit() {
    this.setState({ submitting: true });
    const resource = this.state.resource;
    const promises = [];

    // Resource
    const resourceChangeRequest = {};
    let resourceModified = false;
    if (this.state.name && this.state.name !== resource.name) {
      resourceChangeRequest.name = this.state.name;
      resourceModified = true;
    }
    if (this.state.long_description && this.state.long_description !== resource.long_description) {
      resourceChangeRequest.long_description = this.state.long_description;
      resourceModified = true;
    }
    if (this.state.short_description &&
      this.state.short_description !== resource.short_description) {
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
    // fire off resource request
    if (resourceModified) {
      promises.push(dataService.post(`/api/resources/${resource.id}/change_requests`, { change_request: resourceChangeRequest }));
    }

    // Fire off phone requests
    postCollection(this.state.phones, this.state.resource.phones, 'phones', promises, resource.id);

    // schedule
    postObject(this.state.scheduleObj, 'schedule_days', promises);

    // address
    if (!_.isEmpty(this.state.address) && this.state.resource.address) {
      promises.push(dataService.post(`/api/addresses/${this.state.resource.address.id}/change_requests`, {
        change_request: this.state.address,
      }));
    }

    // Services
    this.postServices(this.state.services.services, promises);

    // Notes
    postNotes(this.state.notes, promises, { path: 'resources', id: this.state.resource.id });

    // TODO: Handle errors
    Promise.all(promises).then(() => {
      this.props.router.push({ pathname: '/resource', query: { id: this.state.resource.id } });
    });
  }

  postServices(servicesObj, promises) {
    if (!servicesObj) return;
    const newServices = [];
    Object.entries(servicesObj).forEach(([key, value]) => {
      const currentService = value;
      if (key < 0) {
        if (currentService.notesObj) {
          const notes = Object.values(currentService.notesObj.notes);
          delete currentService.notesObj;
          currentService.notes = notes;
        }

        currentService.schedule = createFullSchedule(currentService.scheduleObj);
        delete currentService.scheduleObj;

        if (!_.isEmpty(currentService)) {
          newServices.push(currentService);
        }
      } else {
        const uri = `/api/services/${key}/change_requests`;
        postNotes(currentService.notesObj, promises, { path: 'services', id: key });
        delete currentService.notesObj;
        postSchedule(currentService.scheduleObj, promises);
        delete currentService.scheduleObj;
        if (!_.isEmpty(currentService)) {
          promises.push(dataService.post(uri, { change_request: currentService }));
        }
      }
    });

    if (newServices.length > 0) {
      const uri = `/api/resources/${this.state.resource.id}/services`;
      promises.push(dataService.post(uri, { services: newServices }));
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
    return (
      <section id="services" className="edit--section">
        <header className="edit--section--header">
          <h4>Services</h4>
        </header>
        <ul className="edit--section--list">
          <EditServices
            services={this.state.resource.services}
            handleServiceChange={this.handleServiceChange}
          />
        </ul>
      </section>
    );
  }

  render() {
    return (
      !this.state.resource ? <Loader /> :
      <div className="edit">
        <div className="edit--main">
          <header className="edit--main--header">
            <h1 className="edit--main--header--title">{this.state.resource.name}</h1>
          </header>
          <div className="edit--sections">
            {this.renderSectionFields()}
            {this.renderServices()}
          </div>
        </div>
        <div className="edit--aside">
          <div className="edit--aside--content">
            <button
              className="edit--aside--content--submit"
              disabled={this.state.submitting}
              onClick={this.handleSubmit}
            >
              Save changes
            </button>
            <nav className="edit--aside--content--nav">
              <ul>
                <li><a href="#info">Info</a></li>
                <li><a href="#services">Services</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}

EditSections.propTypes = {
  // TODO: location is only ever used to get the resourceid; we should just pass
  // in the resourceid directly as a prop
  location: PropTypes.shape({
    query: PropTypes.shape({
      resourceid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  // TODO: Figure out what type router actually is
  router: PropTypes.instanceOf(Object).isRequired,
};

export default withRouter(EditSections);
