/**
 * new-user-password
 * generate a password for a user entry.
 */
const utils = require("../utils/utils");

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.new-user-password",

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
      password: { string: true, required: true },
      // email: { string: { email: true }, optional: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the
    *        api_sails/api/controllers/site_user/new-user-password.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      var password = req.param("password"); // this is unencrypted
      var salt = utils.generateSalt();

      utils.hash(password, salt).then((passwordHash) => {
         cb(null, { password: passwordHash, salt });
      });
   },
};
