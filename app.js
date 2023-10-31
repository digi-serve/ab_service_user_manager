//
// user_manager
// (AppBuilder) A microservice for managing Users
//
const AB = require("@digiserve/ab-utils");
const { version } = require("./package");
// Use sentry by default, but can override with env.TELEMETRY_PROVIDER
if (AB.defaults.env("TELEMETRY_PROVIDER", "sentry") == "sentry") {
   AB.telemetry.init("sentry", {
      dsn: AB.defaults.env(
         "SENTRY_DSN",
         "https://74d87e0653ba19e70a16e38945dc847d@o144358.ingest.sentry.io/4506143933202432"
      ),
      release: version,
   });
}
var controller = AB.controller("user_manager");
// controller.afterStartup((cb)=>{ return cb(/* err */) });
// controller.beforeShutdown((cb)=>{ return cb(/* err */) });
controller.init();
