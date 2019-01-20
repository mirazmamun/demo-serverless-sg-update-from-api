const _ = require('lodash');
const Utils = require('./lib/Utils');
const SG = require('./lib/SG');
module.exports.run = (event, context) => {
  var sgName = process.env.SG_NAME || `SG_GITHUB_UPDATE`;
  var apiURLGithub = process.env.API_URL_GITHUB || 'https://api.github.com/meta';
  try {
    //get the IPs from Github
    Utils.getIPFromGithubAPI(apiURLGithub)
      .then((githubIPs) => {
        //call the SG object to update the values
        let sgRules = _.map(githubIPs, (gIP) => {
          return [{ IP: gIP, port: 443 }, { IP: gIP, port: 80 }]
        });
        SG.createOrupdateSGRule(sgName, _.flatten(sgRules))
          .then((res) => {
            console.log(`SG updated from API ran at ${new Date()}`);
          })
          .catch((err) => {
            console.error(`Your cron function has come across error ${err.message} ran at ${new Date()}`);
          })
      })
      .catch((err) => {
        console.error(`Your cron function has come across error ${err.message} ran at ${new Date()}`);
      })
  } catch (err) {
    console.error(`Your cron function has come across error ${err.message} ran at ${new Date()}`);
  }
};