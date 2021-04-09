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
         .then((AB) => { // eslint-disable-line
            // access your config settings if you need them:
            /*
            var config = req.config();
             */

            // Get the passed in parameters
            // Get the passed in parameters
            var uuid = req.param("uuid");
            var email = req.param("email");

            var cond = {};
            if (uuid) {
               cond.uuid = uuid;
            }
            if (email) {
               cond.email = email;
            }

            if (Object.keys(cond).length == 0) {
               var error = new Error(
                  "Must include either uuid, or email parameters"
               );
               cb(error);
               return;
            }

            // get User model
            var object = AB.objectUser();
            req.retry(() => object.model().find(cond))
               .then((list) => {
                  if (!list || !list[0]) {
                     cb(null, null);
                  } else {
                     cb(null, utils.safeUser(list[0]));
                  }
               })
               .catch((error) => {
                  req.notify.developer(error, {
                     context: "user_manager.user-find",
                     cond,
                  });
                  cb(error);
               });
         })
         .catch((err) => {
            req.notify.developer(err, {
               context:
                  "Service:user_manager.user-find: Error initializing ABFactory",
               req,
            });
            cb(err);
         });
   },
};
