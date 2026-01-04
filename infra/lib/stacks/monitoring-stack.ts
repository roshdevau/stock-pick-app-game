import * as cdk from 'aws-cdk-lib';
import { AppStackProps } from '../config';

export class MonitoringStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: AppStackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('App', props.config.appName);
    cdk.Tags.of(this).add('Stage', props.config.stage);
  }
}
