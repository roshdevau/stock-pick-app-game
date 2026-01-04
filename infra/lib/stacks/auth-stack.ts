import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { AppStackProps } from '../config';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.App, id: string, props: AppStackProps) {
    super(scope, id, props);

    const callbackUrls = (this.node.tryGetContext('authCallbackUrls') || 'http://localhost:3000/login')
      .split(',')
      .map((url: string) => url.trim())
      .filter(Boolean);
    const logoutUrls = (this.node.tryGetContext('authLogoutUrls') || 'http://localhost:3000/')
      .split(',')
      .map((url: string) => url.trim())
      .filter(Boolean);
    const domainPrefix =
      this.node.tryGetContext('cognitoDomainPrefix') || `${props.config.appName}-${props.config.stage}`;
    const googleClientId = this.node.tryGetContext('googleClientId');
    const googleSecretName = this.node.tryGetContext('googleSecretName');
    const facebookAppId = this.node.tryGetContext('facebookAppId');
    const facebookSecretName = this.node.tryGetContext('facebookSecretName');

    const googleSecret =
      googleClientId && !googleSecretName
        ? new secretsmanager.Secret(this, 'GoogleOAuthSecret', {
            secretName: `/stock-pick-game/${props.config.stage}/google-oauth`,
            description: 'Google OAuth client secret for Cognito Hosted UI.',
            secretStringValue: cdk.SecretValue.unsafePlainText('REPLACE_ME'),
          })
        : undefined;

    const facebookSecret =
      facebookAppId && !facebookSecretName
        ? new secretsmanager.Secret(this, 'FacebookOAuthSecret', {
            secretName: `/stock-pick-game/${props.config.stage}/facebook-oauth`,
            description: 'Facebook OAuth app secret for Cognito Hosted UI.',
            secretStringValue: cdk.SecretValue.unsafePlainText('REPLACE_ME'),
          })
        : undefined;

    const preSignUpFn = new lambda.Function(this, 'PreSignUpLinker', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/auth-pre-signup')),
    });

    preSignUpFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cognito-idp:ListUsers', 'cognito-idp:AdminLinkProviderForUser'],
        resources: [cdk.Stack.of(this).formatArn({
          service: 'cognito-idp',
          resource: 'userpool',
          resourceName: '*',
        })],
      })
    );

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${props.config.appName}-${props.config.stage}-users`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      lambdaTriggers: {
        preSignUp: preSignUpFn,
      },
    });

    let googleProvider: cognito.UserPoolIdentityProviderGoogle | undefined;
    if (googleClientId && (googleSecretName || googleSecret)) {
      googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
        userPool: this.userPool,
        clientId: googleClientId,
        clientSecretValue: googleSecretName
          ? cdk.SecretValue.secretsManager(googleSecretName, {
              jsonField: 'clientSecret',
            })
          : googleSecret!.secretValue,
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        },
      });
    }

    let facebookProvider: cognito.UserPoolIdentityProviderFacebook | undefined;
    if (facebookAppId && (facebookSecretName || facebookSecret)) {
      facebookProvider = new cognito.UserPoolIdentityProviderFacebook(this, 'FacebookProvider', {
        userPool: this.userPool,
        clientId: facebookAppId,
        clientSecret: facebookSecretName
          ? cdk.SecretValue.secretsManager(facebookSecretName, {
              jsonField: 'clientSecret',
            }).unsafeUnwrap()
          : facebookSecret!.secretValue.unsafeUnwrap(),
        scopes: ['email', 'public_profile'],
        attributeMapping: {
          email: cognito.ProviderAttribute.FACEBOOK_EMAIL,
        },
      });
    }

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      oAuth: {
        callbackUrls,
        logoutUrls,
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN,
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        ...(googleProvider ? [cognito.UserPoolClientIdentityProvider.GOOGLE] : []),
        ...(facebookProvider ? [cognito.UserPoolClientIdentityProvider.FACEBOOK] : []),
      ],
    });

    if (googleProvider) {
      this.userPoolClient.node.addDependency(googleProvider);
    }
    if (facebookProvider) {
      this.userPoolClient.node.addDependency(facebookProvider);
    }

    const domain = this.userPool.addDomain('UserPoolDomain', {
      cognitoDomain: { domainPrefix },
    });

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Admin',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'HostedUiDomain', {
      value: `https://${domain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
    if (googleSecret) {
      new cdk.CfnOutput(this, 'GoogleSecretName', {
        value: googleSecret.secretName,
      });
    }
    if (facebookSecret) {
      new cdk.CfnOutput(this, 'FacebookSecretName', {
        value: facebookSecret.secretName,
      });
    }

    cdk.Tags.of(this).add('App', props.config.appName);
    cdk.Tags.of(this).add('Stage', props.config.stage);
  }
}
