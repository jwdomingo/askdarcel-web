 import { combineReducers } from 'redux';
import resource from './resourceReducer';
import auth from './authReducer';
import changeRequest from './changeRequestReducer';
import admin from './adminReducer';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
  resource,
  auth,
  changeRequest,
  admin,
  routing: routerReducer,
});

export default rootReducer;
