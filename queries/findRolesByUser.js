module.exports = function (req, username) {
   return new Promise((resolve, reject) => {
      let tenantDB = req.tenantDB();
      if (tenantDB != "") {
         tenantDB += ".";
      } else {
         let errorNoTenant = new Error(
            `Unable to find tenant information for tenantID[${req.tenantID()}]`
         );
         reject(errorNoTenant);
         return;
      }

      let sql = `
SELECT * FROM ${tenantDB}\`SITE_ROLE\`
WHERE \`uuid\` IN (
	SELECT \`ROLE\` 
	FROM ${tenantDB}\`AB_JOINMN_ROLE_USER_users\` 
	WHERE \`USER\` = ?
)`;

      req.query(sql, [username], (error, results, fields) => {
         if (error) {
            req.log(sql);
            reject(error);
         } else {
            resolve(results);
         }
      });
   });
};
