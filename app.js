//
// user_manager
// (AppBuilder) A microservice for managing Users
//
const AB = require("@digiserve/ab-utils");

var controller = AB.controller("user_manager");
// controller.afterStartup((cb)=>{ return cb(/* err */) });
// controller.beforeShutdown((cb)=>{ return cb(/* err */) });
controller.init();
