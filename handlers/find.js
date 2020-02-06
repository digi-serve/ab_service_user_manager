/**
 * find
 * our Request handler.
 */
const path = require("path");
const utils = require(path.join(__dirname, "..", "utils", "utils.js"));

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.find",

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

      req.log("userManager.find()");

      // access your config settings if you need them:
      var config = req.config();

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
         var error = new Error("Must include either uuid, or email parameters");
         cb(error);
         return;
      }

      // get User model
      var User = req.model("User");
      User.find(cond).then((list) => {
         if (!list || !list[0]) {
            cb(null, null);
         } else {
            cb(null, utils.safeUser(list[0]));
         }
      });
   },

   /**
    * inputValidation
    * define the expected inputs to this service handler:
    * Format:
    * "parameterName" : {
    *    "required" : {bool},  // default = false
    *    "validation" : {fn|obj},
    *                   {fn} a function(value) that returns true/false if
    *                        the value if valid.
    *                   {obj}: .type: {string} the data type
    *                                 [ "string", "uuid", "email", "number", ... ]
    * }
    */
   inputValidation: {
      // uuid: {
      //    required: true,
      //    validation: { type: "uuid" }
      // }
   }
};
