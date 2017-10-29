// import * as ChangeRequestTypes from './ChangeRequestTypes';
// import Actions from './Actions';
import React from 'react';
import PropTypes from 'prop-types';
import * as DataService from '../../utils/DataService';
import { browserHistory } from 'react-router';
import Loader from '../Loader';
import { Link } from 'react-router';
// import * as _ from 'lodash/fp/object';
import ChangeRequest from './ChangeRequest';
// import * as ChangeRequestTypes from './ChangeRequestTypes';
import ProposedService from './ProposedService';
import { getAuthRequestHeaders } from '../../utils/index';

class ChangeRequestsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeResource: undefined,
      changeRequests: {},
      loaded: false,
      resources: {},
    };
    this.loadAllChanges();
  }

  /**
   * Loads and parses all the change requests and pending services
   * @return {[type]} [description]
   */
  loadAllChanges() {
    const d = [];

    // Done seperately to avoid race conditions since auth invalidates tokens upon request
    DataService.get('/api/change_requests', getAuthRequestHeaders())
      .then(changes => {
        d.push(changes);
        return DataService.get('/api/services/pending', getAuthRequestHeaders());
      })
      .then((pendingServices) => {
        d.push(pendingServices);
        const parsedChanges = Object.assign(
          { loaded: true, resources: {} },
          { changeRequests: d[0].change_requests },
          { count: d[0].change_requests.length },
          d[1],
        );

        // Track invidivual Resources
        const ensureResourceExists = (resource) => {
          if (parsedChanges.resources[resource.id] === undefined) {
            // console.log('attaching resource', resource);
            resource._changeRequests = [];
            resource._proposedServices = [];
            resource._collapsed = true;
            parsedChanges.resources[resource.id] = resource;
          }
        };

        // Attach change requests to this resource
        parsedChanges.changeRequests.forEach((cr) => {
          ensureResourceExists(cr.resource);
          parsedChanges.resources[cr.resource.id]._changeRequests.push(cr);
        });

        // Attach proposed services
        parsedChanges.services.forEach((s) => {
          ensureResourceExists(s.resource);
          parsedChanges.resources[s.resource.id]._proposedServices.push(s);
        });

        this.setState(parsedChanges);
        console.log(parsedChanges);
      })
      .catch(err => {
        browserHistory.push('/login?next=/admin/changes');
      });
  }

  /**
   * Choose a given resource to render individual changes for
   * @param {Object} resource    The resource object
   */
  setActiveResource(resource) {
    this.setState({ activeResource: resource });
  }

  /**
   * Renders the list of resources on the left, that can be clicked to open
   * the relevant list of changeRequests and proposedServices
   * @param  {Object} resource    A passed in resource
   * @return {JSX}                A full accordian with all the relevant changes
   */
  renderResourceSummaryList() {
    console.log(this.state);
    if (this.state.resources) {
      return Object.keys(this.state.resources).map((resourceID) => {
        const resource = this.state.resources[resourceID];
        return (
          <div
            key={resource.id}
            className="results-table-entry resource-title"
            onClick={() => this.setActiveResource(resource)}
            role="link"
            tabIndex="-1"
          >
            <header>
              <h4>{ resource.name }</h4>
            </header>
          </div>
        );
      });
    } else {
      return (
        <p className="message">
          Hurrah, it looks like you&#39;ve handled all the outstanding change requests!
        </p>
      );
    }
  }

  /**
   * Renders the complete array of changes for a resource, including
   * changeRequests and proposed services, in the appropriate order
   * @param  {Object} resource    A single resource already parsed with
   *                              relevant changeRequests etc attached
   * @return {JSX}                All changeRequests, serviceChanges and
   *                              proposedServices in order.
   */
  renderResourceChangeRequests(resource) {
    const services = {};
    const resourceChanges = [];
    const serviceChanges = [];
    const proposedServices = [];

    resource._changeRequests.forEach((changeRequest) => {
      switch (changeRequest.type) {
        case 'ServiceChangeRequest':
          serviceChanges.push(
            <ChangeRequest
              key={changeRequest.id}
              changeRequest={changeRequest}
            />,
          );

          // if (services[changeRequest.object_id] === undefined) {
          //   services[changeRequest.object_id] = [];
          // }
          // services[changeRequest.object_id].push(changeRequest);
          // console.log(changeRequest)
          break;

        // case 'AddressChangeRequest':
        // case 'NoteChangeRequest':
        // case 'PhoneChangeRequest':
        // case 'ResourceChangeRequest':
        // case 'ScheduleDayChangeRequest':
        //   sections.resourceChanges.push(
        //     <div key={`change-request-${changeRequest.id}`} className="request-container resource-change-wrapper">
        //       <ChangeRequest changeRequest={changeRequest} actionHandler={this.props.actionHandler} />
        //     </div>
        //   );
        //   break;

        default:
          resourceChanges.push(
            <ChangeRequest
              key={changeRequest.id}
              changeRequest={changeRequest}
            />,
          );
      }
    });

    resource._proposedServices.forEach(service => {
      proposedServices.push(
        <ProposedService
          key={service.id}
          service={service}
          actionHandler={this.props.actionHandler}
        />,
      );
    });

    return (
      <div>
        <div className="titlebox">
          <h2>
            <Link htmlStyle="float: right" to={{ pathname: '/resource', query: { id: resource.id } }} target="_blank">
              <i className="material-icons">link</i>
            </Link>
            {resource.name}
          </h2>
        </div>
        <div>
          { resourceChanges}
        </div>
        <div>
          <h3>Services</h3>
          { serviceChanges }
          { proposedServices }
        </div>
      </div>
    );
  }

  //   <ul className="bubbles">
  //   <li><i className="material-icons">edit</i>Changes: ({ resourceChanges.length })</li>
  //   <li><i className="material-icons">edit</i>Service Changes: ({ serviceChanges.length })</li>
  //   <li><i className="material-icons">edit</i>Proposed Services: ({ proposedServices.length })</li>
  // </ul>

  /**
   * render a full list of changeRequests
   * @return {JSX} A full list of changeRequests seperated by resource
   */
  render() {
    return (
      <div className="admin">
        <h1 className="page-title">
          Change Requests ({ this.state.count })
        </h1>
        <div className="change-requests results">
          <div className="results-table">
            { this.state.loaded ? this.renderResourceSummaryList() : (<Loader />) }
          </div>
          {
            !this.state.activeResource
              ? (<h2 className="inactive">Choose a resource</h2>)
              : (
                  <div className="results-table details">
                    { this.renderResourceChangeRequests(this.state.activeResource) }
                  </div>
                )
          }
        </div>
      </div>
    );
  }
}

export default ChangeRequestsPage;
