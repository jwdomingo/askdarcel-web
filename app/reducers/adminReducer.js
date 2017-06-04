import * as types from '../actions/actionTypes';

const initialState = {
  changeRequests: {},
  services: {},
  isFetching: false,
  isSubmitting: false,
  errorFetching: false,
  errorSubmitting: false,
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case types.GET_CHANGE_REQUESTS: 
      return Object.assign({}, state, { isFetching: true });
    case types.GET_CHANGE_REQUESTS_SUCCESS:
      return Object.assign({}, state, { isFetching: false });
    case types.GET_CHANGE_REQUESTS_FAILURE:
      return Object.assign({}, state, { isFetching: false, errorFetching: true });
    case types.GET_PENDING_SERVICES: 
      return Object.assign({}, state, { isFetching: true });
    case types.GET_PENDING_SERVICES_SUCCESS:
      return Object.assign({}, state, { isFetching: false });
    case types.GET_PENDING_SERVICES_FAILURE:
      return Object.assign({}, state, { isFetching: false, errorFetching: true });
    case types.APPROVE_CHANGE_REQUEST:
      return Object.assign({}, state, { isSubmitting: true });
    case types.APPROVE_CHANGE_REQUEST_SUCCESS:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.APPROVE_CHANGE_REQUEST_FAILURE:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.DENY_CHANGE_REQUEST:
      return Object.assign({}, state, { isSubmitting: true });
    case types.DENY_CHANGE_REQUEST_SUCCESS:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.DENY_CHANGE_REQUEST_FAILURE:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.APPROVE_PENDING_SERVICE:
      return Object.assign({}, state, { isSubmitting: true });
    case types.APPROVE_PENDING_SERVICE_SUCCESS:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.APPROVE_PENDING_SERVICE_FAILURE:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.DENY_PENDING_SERVICE:
      return Object.assign({}, state, { isSubmitting: true });
    case types.DENY_PENDING_SERVICE_SUCCESS:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    case types.DENY_PENDING_SERVICE_FAILURE:
      return Object.assign({}, state, { isSubmitting: false, errorSubmitting: true });
    default:
      return state;
  }
}
