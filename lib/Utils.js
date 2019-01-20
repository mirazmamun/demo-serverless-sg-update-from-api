module.exports = {
    validateIP(ip) {
        if (typeof (ip) !== 'string')
            return false;
        if (!ip.match(/(\d{1,3}\.?){4,4}/)) {
            return false;
        }
        return ip.split('.').filter(octect => octect >= 0 && octect <= 255).length === 4;
    },
    validateSGName(sgName) {
        return sgName.match(/[\w\d_]{1,255}/) && !sgName.match(/^sg\-.*/i);
    },
    getResponseFromAPI(apiURL = 'https://api.github.com/meta') {
        const request = require('request');
        return new Promise((resolve, reject) => {
            let requestOptions = {
                url: apiURL,
                method: 'GET',
                headers: {
                    'User-Agent': 'request'
                }
            };
            request(requestOptions, (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    reject(error || new Error(`Invalid response from API ${body}`))
                } else {
                    //we are expecting the response to be applocation ATM
                    //TODO: validation of response type
                    resolve(body);
                }
            });
        });
    },
    getIPFromGithubAPI(apiURL = 'https://api.github.com/meta') {
        const request = require('request');
        const _  = require('lodash');
        const self = this;
        return new Promise((resolve, reject) => {
            self.getResponseFromAPI(apiURL)
                .then((apiRes) => {
                    //decode the content
                    let decodedAPIRes = JSON.parse(apiRes);
                    //faltten the ips, the keys will be
                    let ips = _.union(decodedAPIRes.hooks, decodedAPIRes.git, decodedAPIRes.pages, decodedAPIRes.importer);
                    //convert any IP to cidr compatible IP
                    ips = _.map(ips, (ip) => { if (!ip.match(/.*\/\d{1,2}/)) { return `${ip}/32` }  else { return ip } })
                    resolve(ips);
                })
                .catch(reject)
        });
    }
}