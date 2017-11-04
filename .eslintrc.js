module.exports = {
  "extends": "airbnb",
  "plugins": [
    "react",
    "jsx-a11y",
    "import",
  ],
  "env": {
    "browser": true,
  },
  "rules": {
    "react/jsx-filename-extension": 0,
    "react/forbid-prop-types": 0,
    "no-underscore-dangle": 0,
    "camelcase": 0,
  },
  "settings": {
    "import/resolver": "webpack",
  },
};
