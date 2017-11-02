FROM nginx:stable

COPY build /app/askdarcel
COPY version.json /app/askdarcel/_version.json

RUN apt-get update && apt-get -y install ruby && gem install tiller

RUN rm /etc/nginx/conf.d/*

ADD docker/tiller /etc/tiller

CMD ["tiller", "-v"]
