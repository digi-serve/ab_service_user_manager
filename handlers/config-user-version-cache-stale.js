/**
 * user-version-cache-stale
 * remove stale user versions from our cache
 */
const ABBootstrap = require("../AppBuilder/ABBootstrap");

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.user-version-cache-stale",

   inputValidation: {
      userUUID: { string: true, required: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the api_sails/api/controllers/tenant_manager/config.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: async function handler(req, cb) {
      req.log("user_manager.user-version-cache-stale");
      try {
         const AB = await ABBootstrap.init(req);
         const user = req.param("userUUID");
         if (user === "all") {
            AB.cacheClear("user-version");
            return cb();
         }

         const userVersionCache = AB.cache("user-version");
         delete userVersionCache[user];
         AB.cache("user-version", userVersionCache);
         cb();
      } catch (err) {
         cb(err);
      }
   },
};
