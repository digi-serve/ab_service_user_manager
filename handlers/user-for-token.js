/**
 * user-for-token
 * our Request handler.
 */
const utils = require("../utils/utils");

const ABBootstrap = require("../AppBuilder/ABBootstrap");
// {ABBootstrap}
// responsible for initializing and returning an {ABFactory} that will work
// with the current tenant for the incoming request.

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.user-for-token",

   /**
    * inputValidation
    * define the expected inputs to this service handler:
    */
   inputValidation: {
      token: { string: true, required: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the
    *        api_sails/api/controllers/user_manager/user-for-token.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: async function handler(req, cb) {
      req.log("user_manager.user-for-token:");

      // get the AB for the current tenant
      try {
         const AB = await ABBootstrap.init(req);

         let token = req.param("token");
         req.log(`token: ${token}`);

         const SiteToken = AB.objectToken();
         const list = await req.retry(() =>
            SiteToken.model().find({ token, expires: { ">": Date.now() } })
         );
         const row = list[0];
         if (!row) {
            req.log("unknown token entry.");
            let error = new Error("unknown token");
            error.code = "EUNKNOWNTOKEN";
            cb(error);
            return;
         }

         req.log("foundToken:", row);

         const User = AB.objectUser();
         const uList = await req.retry(() =>
            User.model().find({
               where: { username: row.context.username },
               populate: ["SITE_ROLE", "SITE_USER"],
            })
         );
         const user = utils.safeUser(uList[0]);
         req.log("foundUser:", user);

         cb(null, user);
      } catch (err) {
         req.notify.developer(err, {
            context:
               "Service:user_manager.user-for-token: Error initializing ABFactory",
         });
         cb(err);
      }
   },
};
