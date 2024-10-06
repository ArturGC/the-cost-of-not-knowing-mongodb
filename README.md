# The cost of not knowing MongoDB

## How to recreate the experiment

1. EC2 Instances
   - In the `cloud` folder there are bash scripts to launch and configure the necessary EC2 instances.
   - The scripts with `...app...` are related to the instance that will execute the application code and store its execution metrics.
   - The scripts with `...mdb...` are related to the instance that will execute the MongoDB server, which we'll use to store the application data and execute the load tests.
   - The files ending with `...launch.sh` should be executed first to create the instances on AWS.
   - The files ending with `...dns.sh` should be executed second to configure the public and private DNS.
   - The files ending with `...config.sh` should be executed last and when already logged to the instance through SSH to apply MongoDB recommended production notes.
   - Obs: You need to change some script variables to use it on your AWS account and region.
1. MongoDB
   - MongoDB has to be installed in both instances, `...app...` and `...mdb...`.
   - In the instance `...mdb...` MongoDB will be used to store the application's data.
   - In the instance `...app...` MongoDB will be used to store the application's execution metrics.
1. Application configuration
   - The reference values used to configure the data generation and distribution of the application can be found in `./src/references.ts`. The current values in it were used during the article tests.
   - The MongoDB connection string and configuration used in the application execution and tests can be found in `./src/config.ts`
1. Initial Scenario
   - To execute the initial scenario code you need to have `Node.JS` installed and have executed `npm i` on the project folder to install dependencies.
   - Most of the code related to the initial scenario is in the `./src/scenario` folder.
   - In the file `./src/scenario/index.ts` you can change which application version you want to load the initial scenario.
   - To run the load of the initial scenario, use the command `npm run scenario`.
1. Load Test
   - To execute the load test code you need to have `Node.JS` installed and have executed `npm i` on the project folder to install dependencies.
   - Most of the code related to the initial scenario is in `./src/load-test` folder.
   - In the file `./src/load-test/index.ts` you can change to which application version you want to load test.
   - To run the load of the initial scenario, use the command `npm run scenario`.
