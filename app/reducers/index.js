import { combineReducers } from 'redux';
import { combineForms } from 'react-redux-form';
import { routerReducer } from 'react-router-redux';
import resource from './resourceReducer';
import auth from './authReducer';
import changeRequest from './changeRequestReducer';
import forms from '../reducers/formConfig';

const rootReducer = combineReducers({
  resource,
  auth,
  forms: combineForms(forms, 'forms'),
  changeRequest,
  routing: routerReducer,
});

export default rootReducer;
