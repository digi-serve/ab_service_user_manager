##
## digiserve/ab-user-manager
##
## This is our microservice for the users in an AB managed site.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-user-manager:develop .
## $ docker push digiserve/ab-user-manager:develop
##

ARG BRANCH=master

FROM digiserve/service-cli:${BRANCH}

COPY . /app

WORKDIR /app

RUN npm i -f

WORKDIR /app/AppBuilder

RUN npm i -f

WORKDIR /app

CMD [ "node", "--inspect=0.0.0.0:9229", "app.js" ]
