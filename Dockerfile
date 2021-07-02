##
## digiserve/ab-user-manager:master
##
## This is our microservice for the users in an AB managed site.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-user-manager:master .
## $ docker push digiserve/ab-user-manager:master
##

FROM digiserve/service-cli:master

RUN git clone --recursive https://github.com/appdevdesigns/ab_service_user_manager.git app && cd app && git submodule update --recursive && npm install

WORKDIR /app

CMD [ "node", "--inspect=0.0.0.0:9229", "app.js" ]
