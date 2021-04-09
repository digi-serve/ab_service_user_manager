/**
 * user-find-password
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
   key: "user_manager.user-find-password",

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
      email: { string: { email: true }, required: true },
      password: { string: true, required: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the
    *        api_sails/api/controllers/user_manager/user-find-password.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      req.log("user_manager.user-find-password:");

      // get the AB for the current tenant
      ABBootstrap.init(req)
         .then((AB) => { // eslint-disable-line

            // Get the passed in parameters
            var email = req.param("email");
            var password = req.param("password"); // this is unencrypted

            var config = req.config();

            var User = AB.objectUser();

            req.retry(() => User.model().find({ email }))
               .then((list) => {
                  var user, salt, hashedPassword;

                  if (!list || !list[0]) {
                     // No username match. But keep going so attackers can't
                     // tell the difference by watching the response time.
                     user = null;
                     salt = "";
                     hashedPassword = "";
                  } else {
                     user = list[0];
                     salt = user.salt;
                     hashedPassword = user.password;
                  }

                  // prevent too many failed login attempts
                  if (user && user.failedLogins > config.maxFailedLogins) {
                     req.log("Too many failed attempts");
                     var errorFailedAttempts = new Error(
                        "Too many failed attempts. Please contact an admin."
                     );
                     errorFailedAttempts.code = "EFAILEDATTEMPTS";
                     cb(errorFailedAttempts);
                  } else {
                     utils
                        .hash(password, salt)
                        .then(function (hashResult) {
                           if (user && hashResult == hashedPassword) {
                              req.log("passwords match");
                              cb(null, utils.safeUser(user));
                           } else {
                              req.log("invalid password.");
                              var pwError = new Error(
                                 "invalid username/password"
                              );
                              pwError.code = "EINVALIDLOGIN";
                              cb(pwError);
                              if (user) {
                                 // Increment failed login count
                                 user.failedLogins++;
                                 User.model().update(
                                    { uuid: user.uuid },
                                    { failedLogins: user.failedLogins }
                                 );
                              }
                           }
                        })
                        .catch((err) => {
                           AB.notify.developer(err, {
                              context: "user_manager.user-find-password",
                              email,
                           });
                           cb(err);
                        });
                  }
               })
               .catch((err) => {
                  req.notify.developer(err, {
                     context:
                        "Service:user_manager.user-find-password: could not find User",
                     uuid,
                     req,
                  });
                  cb(err);
               });
         })
         .catch((err) => {
            req.notify.developer(err, {
               context:
                  "Service:user_manager.user-find-password: Error initializing ABFactory",
               req,
            });
            cb(err);
         });
   },
};
