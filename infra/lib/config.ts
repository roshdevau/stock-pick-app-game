import * as cdk from 'aws-cdk-lib';

export interface AppConfig {
  appName: string;
  stage: string;
  account?: string;
  region?: string;
}

export function loadConfig(app: cdk.App): AppConfig {
  const stage = (app.node.tryGetContext('stage') as string) || process.env.STAGE || 'dev';
  const appName = (app.node.tryGetContext('appName') as string) || 'stock-pick-game';

  return {
    appName,
    stage,
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  };
}

export interface AppStackProps extends cdk.StackProps {
  config: AppConfig;
}
