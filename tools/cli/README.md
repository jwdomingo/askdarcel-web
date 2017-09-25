# AskDarcelClient

A simple class to save a login session and make it easy to interact with the API

## Commands

`node ./tools/cli/{commandName.js}`

e.g. `node ./tools/cli/approveChangeRequest.js`

- **approveChangeRequest**: Bulk loops over all change requests, checking for duplicate/conflicting changes and otherwise blanket approving everything

## Config

config is stored in config.yml, currently only 3 parameters:

- **api.endpoint**: point to the askDarcel API
- **admin.username**: admin email address to authenticate with
- **admin.password**: admin password to authenticate with