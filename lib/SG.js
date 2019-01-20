const { waterfall } = require('async');
const _ = require('lodash');
class SG {
    constructor() {
        // Load the AWS SDK for Node.js
        const AWS = require('aws-sdk');
        // Create EC2 service object
        this.ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: 'ap-southeast-2' });
    }
    defaults() {
        return {
            DEFAULT_SG_NAME: 'SG_DEVELOPER_TEST'
        }
    }
    /**
     * @returns Promise
     */
    getDefaultVPC() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.ec2.describeVpcs(function (err, data) {
                if (err) {
                    console.log('Cannot retrieve a VPC', err);
                    reject(`Could not find VPC`);
                } else {
                    resolve(data.Vpcs[0].VpcId);
                }
            })
        });
    }
    /**
     * 
     * @param {*} sgID 
     * @param {*} sgName 
     * @param {*} defaultVPC 
     * @return {Promise}    Will return SG as array
     */
    findSG({sgID = null, sgName = null, vpcID = null, returnSingle = true}) {
        var self = this;
        return new Promise((resolve, reject) => {
            var filter = { Filters: [] };
            if (sgID) {
                filter.Filters.push({ Name: 'group-id', Values: [sgID] });
            } else if (sgName) {
                filter.Filters.push({ Name: 'group-name', Values: [sgName] });
            } else {
                reject(`Must pass in either valid sgID as first argument or sgName as second argument`);
                return;
            }
            self.ec2.describeSecurityGroups(filter, (err, data) => {
                err ? reject(err) : resolve(returnSingle && data.SecurityGroups.hasOwnProperty('length') ? data.SecurityGroups[0] : data);
            });
        });
    }
    createSG(sgName = 'SG_DEVELOPER_TEST', vpcID = null) {
        var self = this;
        return new Promise((resolve, reject) => {
            if (typeof vpcID !== 'string') {
                reject(`Must pass in valid string value for vpc argument`);
                return;
            }
            let paramsSecurityGroup = {
                Description: 'Developer Security Group',
                GroupName: sgName,
                VpcId: vpcID
            };
            // Create the instance
            self.ec2.createSecurityGroup(paramsSecurityGroup, (err, data) => {
                if (err) {
                    console.log("Error", err);
                    reject(`Error in creating SG`);
                } else {
                    resolve(data);
                }
            });
        });
    }
    /**
     * Formulate ingress rule from raw rule specification
     * @param {*} rules 
     */
    constructSGIngressRule (rules = [ { port: null, IP: null } ]) {
        const mandatoryKeys = ['port', 'IP'];
        var constructedSGIngressRules = [];
        if (_.isArray(rules)) {
            //make sure each has properties called port and IP
            _.each(rules, (rule) => {
                if (_.isEqual(_.intersection(_.keys(rule), mandatoryKeys).sort(),[ 'port', 'IP' ].sort())) {
                    constructedSGIngressRules.push({
                        IpProtocol: rule.protocol || 'tcp',
                        FromPort: rule.port,
                        ToPort: rule.port,
                        IpRanges: [{ 
                            CidrIp: rule.IP.match(/.*\/\d{1,2}/) ?  rule.IP :`${rule.IP}/32`,
                            Description: rule.description || `Port ${rule.port} access from IP ${rule.IP}`
                        }],
                    });
                }
            });
        }
        return constructedSGIngressRules;
    }
    createOrupdateSGRule(sgName = null, rules = []) {
        var self = this;
        sgName = sgName || self.defaults().DEFAULT_SG_NAME;
        return new Promise((resolve, reject) => {
            waterfall(
                [
                    (cb) => {
                        self.getDefaultVPC()
                            .then((vpcID) => cb(null, vpcID))
                            .catch(cb)
                    },
                    (vpcID, cb) => {
                        self.findSG({ sgName, vpcID })
                            .then((sg) => {
                                cb(null, sg, vpcID);
                            })
                            .catch(() => cb(null, null, vpcID) )
                    },
                    (sg, vpcID, cb) => {
                        //create the SG
                        if (!sg) {
                            self.createSG(sgName, vpcID)
                                .then((sg) => cb(null, sg, vpcID))
                                .catch(cb)
                        } else {
                            cb(null, sg, vpcID);
                        }
                    },
                    (sg, vpcID, cb) => {
                        var paramsIngress = {
                            GroupId: sg.GroupId,
                            IpPermissions: self.constructSGIngressRule(rules)
                        };
                        self.ec2.authorizeSecurityGroupIngress(paramsIngress, (err, data) => {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, data);
                            }
                        });
                    },
                    //retrieve the update SG
                    (updateResponse, cb) => {
                        self.findSG({ sgName })
                            .then((sg) => cb(null, sg))
                            .catch(cb)
                    }
                ],
                (finalErr, finalRes) => {
                    finalErr ? reject(finalErr) : resolve(finalRes);
                }
            );
        });
    }
}
//export the singleton
module.exports = new SG();