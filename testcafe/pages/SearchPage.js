import ReactSelector from 'testcafe-react-selectors';

export default class SearchPage {
  constructor() {
    this.resultsCount = ReactSelector('ResourcesTable').find('.results-count');
    this.resultEntry = ReactSelector('ResourcesTable ResourcesRow');
  }
}
