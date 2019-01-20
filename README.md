# Serverless Service for Security Group (SG) Update from API source like Github
This microservice allows automatic update of SG rules using the IP addresses from a specified API endpiont.

## How to Deploy

* If you just want to try out built version(not preferred), use the files under `samples` folder and do the following:
1. Create the stack using CF Template
2. Use the package 

* You need `nodejs > 8.0.0` and `npm > 5.0.0` installed. Follow these steps to do it using build tools:

1. Run ```npm install```
2. Make sure you have setup your AWS credentials that will have privilege to create the resources required by CF Template. Checkout the docs [here](https://serverless.com/framework/docs/providers/aws/guide/credentials#using-aws-access-keys)
3. The default setup will take care of linking executable in POSIX environment. Alternatively you can install `serverless` globally. `npm install -g serverless` or checkout [this link](https://serverless.com/framework/docs/providers/aws/guide/quick-start#pre-requisites)
4. Run ```./node_modules/.bin/serverless deploy``` or is `serverless` is globally available in you environment, run ```serverless deploy```. This command will create the CF template locally and will create the CF stack in the target region. If you want to take the CF template yourself then modify and run it try ```serverless package --package <target folder to create packages to>```. Try the [docs](https://serverless.com/framework/docs/providers/aws/guide/packaging/) to learn more.