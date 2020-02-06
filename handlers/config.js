/**
 * config
 * add the necessary UI config information for the provided user
 */

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.config",

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

      // Get the passed in parameters
      var user = req.param("user");

      // access any Models you need
      var Role = req.model("Role");
      Role.find({ users: user.uuid })
         .then((list) => {
            user.roles = list;
            req.log("user with roles:", user);
            cb(null, user);
         })
         .catch(cb);
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
      user: {
         required: true,
         validation: { type: "object" }
      }
   }
};
