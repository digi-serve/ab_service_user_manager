/**
 * find
 * our Request handler.
 */
const utils = require("../utils/utils.js");

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.find.password",

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
    *    "required" : {bool},  // default = false
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
    *        the request object sent by the api_sails/api/controllers/user_manager/find.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      //

      req.log("userManager.find.password()");

      // access your config settings if you need them:
      var config = req.config();

      // Get the passed in parameters
      var email = req.param("email");
      var password = req.param("password"); // this is unencrypted

      // access any Models you need
      var User = req.model("User");
      User.find({ email }).then((list) => {
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
                     var pwError = new Error("invalid username/password");
                     pwError.code = "EINVALIDLOGIN";
                     cb(pwError);
                     if (user) {
                        // Increment failed login count
                        user.failedLogins++;
                        User.update(
                           { uuid: user.uuid },
                           { failedLogins: user.failedLogins }
                        );
                     }
                  }
               })
               .catch(cb);
         }
      });
   },
};
