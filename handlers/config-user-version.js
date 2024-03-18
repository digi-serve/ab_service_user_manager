/**
 * config-user-version
 * return the bootstrap version information needed for the given user.
 */

const ABBootstrap = require("../AppBuilder/ABBootstrap.js");
const UMConfig = require("./config.js");

/**
 * @function hashCode()
 * generates a hash of a given string.
 * taken from: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 * @param {string} str
 *        the input string we are generating a hash for.
 * @return {number}
 */
function hashCode(str) {
   return str
      .split("")
      .reduce(
         (prevHash, currVal) =>
            ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
         0
      );
}

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.config-user-version",

   inputValidation: {
      user: { object: true, required: true },
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
      req.log("user_manager.config-user-version()");
      try {
         const AB = await ABBootstrap.init(req);
         const CacheVersion = AB.cache("user-version");
         let user = req.param("user");
         let version = CacheVersion[user.uuid];
         if (!version) {
            await new Promise((resolve, reject) => {
               UMConfig.fn(req, (err, result) => {
                  if (err) return reject(err);
                  if (typeof result != "string") {
                     result = JSON.stringify(result);
                  }
                  version = new String(hashCode(result)).toString();
                  CacheVersion[user.uuid] = version;
                  AB.cache("user-version", CacheVersion);
                  resolve();
               });
            });
         }

         cb(null, version);
      } catch (e) {
         cb(e);
      }
   },
};
