#!/bin/bash

set -ex

cleanup() {
  docker stop $(docker ps -a -q)
  if [[ $WEB_PID != "" ]]; then
    kill $WEB_PID
  fi
}

#trap cleanup EXIT

docker network create --driver bridge askdarcel
docker run -d --network=askdarcel --name=db postgres:9.5
# 1) rake db:populate refuses to run in the production environment, so we
#    override RAILS_ENV to development.
# 2) rake will fail to run on the development environment unless if the
#    development gems are installed, so we install the development gems into the
#    production image.
docker run -d \
  -e DATABASE_URL=postgres://postgres@db/askdarcel_development \
  -e TEST_DATABASE_URL=postgres://postgres@db/askdarcel_test \
  -e SECRET_KEY_BASE=notasecret \
  -e RAILS_ENV=development \
  --network=askdarcel \
  --name=api \
  -p 3000:3000 \
  sheltertechsf/askdarcel-api:latest bash -c 'bundle install --with=development && bundle exec rake db:setup db:populate && bundle exec rails server --binding=0.0.0.0'
npm run build
npm run dev &
WEB_PID=$!

# Wait long enough for npm run dev to finish compiling and for Rails to start
# running.
sleep 60

# Print out container logs in case if an error occurs
docker logs api

npm run testcafe -- chromium:headless \
  --skip-js-errors \
  --assertion-timeout 50000 \
  --page-load-timeout 30000 \
  --selector-timeout 30000 \
  --screenshots screenshots/ \
  --screenshots-on-fails \
  testcafe/*.js
