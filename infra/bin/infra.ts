#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { loadConfig } from '../lib/config';
import { ApiStack } from '../lib/stacks/api-stack';
import { AsyncStack } from '../lib/stacks/async-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DataStack } from '../lib/stacks/data-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { RealtimeStack } from '../lib/stacks/realtime-stack';

const app = new cdk.App();
const config = loadConfig(app);
const env = { account: config.account, region: config.region };

const authStack = new AuthStack(app, `${config.appName}-${config.stage}-auth`, { env, config });
const dataStack = new DataStack(app, `${config.appName}-${config.stage}-data`, { env, config });
const apiStack = new ApiStack(app, `${config.appName}-${config.stage}-api`, {
  env,
  config,
  dataStack,
  userPool: authStack.userPool,
});
const asyncStack = new AsyncStack(app, `${config.appName}-${config.stage}-async`, { env, config });
const realtimeStack = new RealtimeStack(app, `${config.appName}-${config.stage}-realtime`, { env, config });
const monitoringStack = new MonitoringStack(app, `${config.appName}-${config.stage}-monitoring`, { env, config });
const frontendStack = new FrontendStack(app, `${config.appName}-${config.stage}-frontend`, { env, config });

apiStack.addDependency(authStack);
apiStack.addDependency(dataStack);
asyncStack.addDependency(dataStack);
realtimeStack.addDependency(dataStack);
monitoringStack.addDependency(apiStack);
frontendStack.addDependency(authStack);
