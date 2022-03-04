/**
 * config
 * add the necessary UI config information for the provided user
 */
const sqlFindRolesByUser = require("../queries/findRolesByUser.js");

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.config",

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
      user: { object: true, required: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the api_sails/api/controllers/user_manager/config.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      //

      // access your config settings if you need them:
      /*
      var config = req.config();
       */

      req.log("userManager.config()");

      // Get the passed in parameters
      var user = req.param("user");
      // {obj} user
      // user is an object with all the current User information.
      // our job is to insert .roles into this data structure.

      sqlFindRolesByUser(req, user.username)
         .then((list) => {
            user.roles = list;
            req.log(
               `user[${user.username}] with roles:[${list
                  .map((l) => l.uuid)
                  .join(", ")}]`
            );
            cb(null, user);
         })
         .catch(cb);
   },
};
