import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { AppStackProps } from '../config';
import { DataStack } from './data-stack';

export interface ApiStackProps extends AppStackProps {
  dataStack: DataStack;
  userPool: cognito.IUserPool;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigw.RestApi;

  constructor(scope: cdk.App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const twelveDataParamName =
      this.node.tryGetContext('twelveDataParamName') ||
      `/stock-pick-game/${props.config.stage}/twelvedata/api-key`;

    const apiHandler = new lambda.Function(this, 'ApiHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/api')),
      environment: {
        STAGE: props.config.stage,
        USERS_TABLE: props.dataStack.tables.users.tableName,
        ACCOUNTS_TABLE: props.dataStack.tables.accounts.tableName,
        SEASONS_TABLE: props.dataStack.tables.seasons.tableName,
        HOLDINGS_TABLE: props.dataStack.tables.holdings.tableName,
        ORDERS_TABLE: props.dataStack.tables.orders.tableName,
        TRANSACTIONS_TABLE: props.dataStack.tables.transactions.tableName,
        SYMBOLS_TABLE: props.dataStack.tables.symbols.tableName,
        PRICECACHE_TABLE: props.dataStack.tables.priceCache.tableName,
        TWELVE_DATA_API_KEY_PARAM: twelveDataParamName,
        USER_POOL_ID: props.userPool.userPoolId,
      },
    });

    apiHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          cdk.Stack.of(this).formatArn({
            service: 'ssm',
            resource: 'parameter',
            resourceName: twelveDataParamName.replace(/^\//, ''),
          }),
        ],
      })
    );
    apiHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:AdminListGroupsForUser'],
        resources: [props.userPool.userPoolArn],
      })
    );

    Object.values(props.dataStack.tables).forEach((table) => {
      table.grantReadWriteData(apiHandler);
    });

    this.api = new apigw.RestApi(this, 'RestApi', {
      restApiName: `${props.config.appName}-${props.config.stage}-api`,
      deployOptions: {
        stageName: props.config.stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Authorization', 'Content-Type'],
      },
    });

    this.api.addGatewayResponse('Default4xx', {
      type: apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });
    this.api.addGatewayResponse('Default5xx', {
      type: apigw.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    const addRoute = (pathPart: string, methods: string[] = ['GET']) => {
      const resource = this.api.root.addResource(pathPart);
      methods.forEach((method) => {
        resource.addMethod(method, new apigw.LambdaIntegration(apiHandler), {
          authorizer,
          authorizationType: apigw.AuthorizationType.COGNITO,
        });
      });
    };

    addRoute('profile');
    const preferences = this.api.root.addResource('preferences');
    preferences.addMethod('POST', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    addRoute('portfolio');
    const orders = this.api.root.addResource('orders');
    ['GET', 'POST'].forEach((method) => {
      orders.addMethod(method, new apigw.LambdaIntegration(apiHandler), {
        authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO,
      });
    });
    const ordersCancel = orders.addResource('cancel');
    ordersCancel.addMethod('POST', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    addRoute('leaderboard');
    addRoute('quotes');
    addRoute('symbols');

    const admin = this.api.root.addResource('admin');
    admin.addResource('fund').addMethod('POST', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    const adminUsers = admin.addResource('users');
    adminUsers.addMethod('GET', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    const adminUser = adminUsers.addResource('{userId}');
    adminUser.addResource('orders').addMethod('GET', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    adminUser
      .addResource('transactions')
      .addMethod('GET', new apigw.LambdaIntegration(apiHandler), {
        authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO,
      });
    const adminSymbols = admin.addResource('symbols');
    adminSymbols.addMethod('GET', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    adminSymbols.addMethod('POST', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    admin.addResource('reset').addMethod('POST', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    admin.addResource('audit').addMethod('GET', new apigw.LambdaIntegration(apiHandler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
    });

    cdk.Tags.of(this).add('App', props.config.appName);
    cdk.Tags.of(this).add('Stage', props.config.stage);
  }
}
