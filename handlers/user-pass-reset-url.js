/**
 * user-password-reset-request
 * our Request handler.
 */

const ABBootstrap = require("../AppBuilder/ABBootstrap");
// {ABBootstrap}
// responsible for initializing and returning an {ABFactory} that will work
// with the current tenant for the incoming request.

const { nanoid } = require("nanoid/async");

module.exports = {
   /**
    * Key: the cote message key we respond to.
    */
   key: "user_manager.user-password-reset-url",

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
      email: { string: { email: { allowUnicode: true } }, required: true },
      url: { string: true, required: true },
   },

   /**
    * fn
    * our Request handler.
    * @param {obj} req
    *        the request object sent by the
    *        api_sails/api/controllers/user_manager/user-password-reset-request.
    * @param {fn} cb
    *        a node style callback(err, results) to send data when job is finished
    */
   fn: function handler(req, cb) {
      req.log("user_manager.user-password-reset-url:");

      // get the AB for the current tenant
      ABBootstrap.init(req)
          .then(async (AB) => { // eslint-disable-line

            req.log(req.param("email"));
            req.log(req.param("url"));

            // 1) get User
            const cond = { email: req.param("email") };
            const User = AB.objectUser();
            const list = await req.retry(() =>
               User.model().find({ where: cond, populate: false })
            );
            if (!list || !list[0]) {
               // Q: is there any additional management in this case?
               // eg: do we mark how many failed attempts and then block that browser?
               req.log("User not found: ", JSON.stringify(cond));
               cb(null, { status: "success" });
               return;
            }
            const user = list[0];
            req.log(`User Requesting Password Reset Link: ${user.username}`);

            // 2) create new authToken
            //   - authToken table needs to have authToken, user, metadata (for storing route/app specific info)

            // https://security.stackexchange.com/questions/94630/token-based-authentication-whats-a-good-token-length
            const token = await nanoid(16);

            // store our current request context:
            const context = {
               username: user.username,
               email: user.email,
               tenantID: req.tenantID(),
            };

            // expires in 10 minutes
            // const expires = new Date(Date.now() + numMinutes*60000);
            const expires = new Date(Date.now() + 600000); // <- 10 min

            const SiteToken = AB.objectToken();
            await req.retry(() =>
               SiteToken.model().create({ token, context, expires })
            );
            req.log("newToken:", token);

            // 3) generate email with Auth Link
            let url = req.param("url");
            if (url[url.length - 1] != "/") url += "/";

            const responseURL = `${url}auth/password/reset?a=${token}&t=${req.tenantID()}`;

            cb(null, { status: "success", data: responseURL });
         })
         .catch((err) => {
            req.notify.developer(err, {
               context:
                  "Service:user_manager.user-password-reset-link: Error initializing ABFactory",
            });
            cb(err);
         });
   },
};
