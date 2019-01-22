const _ = require('lodash');
const Utils = require('./lib/Utils');
const SG = require('./lib/SG');
const { waterfall } = require('async');
module.exports.run = (event, context) => {
  var sgName = process.env.SG_NAME || `SG_GITHUB_UPDATE`;
  var apiURLGithub = process.env.API_URL_GITHUB || 'https://api.github.com/meta';
  waterfall(
    [
      //delete the SG if exists
      (cb) => {
        SG.removeSG(sgName)
          .then((res) => {
            cb(null);
          })
          .catch((err) => {
            cb(err);
          })
      },
      //retrieve the IPs from API
      (cb) => {
        //get the IPs from Github
        Utils.getIPFromGithubAPI(apiURLGithub)
          .then((githubIPs) => {
            //call the SG object to update the values
            let sgRules = _.map(githubIPs, (gIP) => {
              return [{ IP: gIP, port: 443 }, { IP: gIP, port: 80 }]
            });
            cb(null, sgRules);
          })
          .catch((err) => {
            cb(new Error(`Your cron function has come across error ${err.message} ran at ${new Date()}`));
          })
      },
      //update the SG with IPs
      (sgRules, cb) => {
        SG.createOrupdateSGRule(sgName, _.flatten(sgRules))
          .then((res) => {
            console.log(`SG updated from API ran at ${new Date()}`);
            cb(null);
          })
          .catch((err) => {
            cb(new Error(`Your cron function has come across error ${err.message} ran at ${new Date()}`));
          })
      }
    ],
    (finalErr, finalRes) => {
      finalErr ? console.error(finalErr) : console.log(finalRes);
    }
  );
};