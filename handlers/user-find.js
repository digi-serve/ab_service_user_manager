/**
 * user-find
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
   key: "user_manager.user-find",

   /**
    * inputValidation
    * define the expected inputs to this service handler:
    * Format:
    * "parameterName" : {
    *    {joi.fn}   : {bool},  // performs: joi.{fn}();
    *    {joi.fn}   : {
    *       {joi.fn1} : true,   // performs: joi.{fn}().{fn1}();
    *       {joi.fn2} : { options } // performs: joi.{fn}().{fn2}({options})
    *    }
    *    // examples:
    *    "required" : {bool},
    *    "optional" : {bool},
    *
    *    // custom:
    *        "validation" : {fn} a function(value, {allValues hash}) that
    *                       returns { error:{null || {new Error("Error Message")} }, value: {normalize(value)}}
    * }
    */
   inputValidation: {
      uuid: { string: true, optional: true },
      email: { string: { email: true }, optional: true },
      username: { string: true, optional: true },
      authname: { string: true, optional: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the
    *        api_sails/api/controllers/user_manager/user-find.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      req.log("user_manager.user-find:");

      // get the AB for the current tenant
      ABBootstrap.init(req)
         .then(async (AB) => { // eslint-disable-line
            // access your config settings if you need them:
            /*
            var config = req.config();
             */

            // Get the passed in parameters
            // Get the passed in parameters
            const uuid = req.param("uuid");
            const email = req.param("email");
            const username = req.param("username");
            const authname = req.param("authname");

            const cond = {};
            if (uuid) {
               cond.uuid = uuid;
            }
            if (email) {
               cond.email = email;
            }
            if (username) {
               cond.username = username;
            }
            if (authname) {
               cond.authname = authname;
            }

            if (Object.keys(cond).length == 0) {
               const error = new Error(
                  "Must include either uuid, username, authname, or email parameters"
               );
               cb(error);
               return;
            }

            // get User model
            // NOTE: Users need to contain their Roles now:
            const User = AB.objectUser();

            try {
               const list = await req.retry(() =>
                  User.model().find({ where: cond, populate: false })
               );
               if (!list || !list[0]) {
                  cb(null, null);
               } else {
                  const user = list[0];
                  const Role = AB.objectRole();
                  const roles = await req.retry(() =>
                     Role.model().find({
                        where: { users: [user.username] },
                        // populate: true,
                     })
                  );
                  user.SITE_ROLE = roles.map((r) => {
                     return { uuid: r.uuid };
                  });

                  cb(null, utils.safeUser(user));
               }
            } catch (error) {
               req.notify.developer(error, {
                  context: "user_manager.user-find",
                  cond,
               });
               cb(error);
            }
         })
         .catch((err) => {
            req.notify.developer(err, {
               context:
                  "Service:user_manager.user-find: Error initializing ABFactory",
            });
            cb(err);
         });
   },
};
