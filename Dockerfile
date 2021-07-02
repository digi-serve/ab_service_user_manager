##
## digiserve/ab-user-manager:develop
##
## This is our microservice for the users in an AB managed site.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-user-manager:develop .
## $ docker push digiserve/ab-user-manager:develop
##

FROM digiserve/service-cli:develop

RUN git clone --recursive https://github.com/appdevdesigns/ab_service_user_manager.git app && cd app && git checkout develop && git submodule update --recursive && npm install

WORKDIR /app

CMD [ "node", "--inspect=0.0.0.0:9229", "app.js" ]
