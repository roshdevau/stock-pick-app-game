# Infra deployment notes

This stack uses AWS CDK to provision Cognito, API Gateway, and DynamoDB. For social sign-in, Cognito needs a Google OAuth client ID + client secret.

## Google OAuth setup (new account)

1) Create a Google OAuth client in Google Cloud Console.
2) Add this redirect URI in Google:
```
https://<COGNITO_DOMAIN_PREFIX>.auth.<AWS_REGION>.amazoncognito.com/oauth2/idpresponse
```

3) Decide how to provide the Google client secret:

Option A (recommended): **Provide an existing secret name**
- Create a secret in AWS Secrets Manager with JSON:
```
{"clientSecret":"YOUR_GOOGLE_CLIENT_SECRET"}
```
- Deploy with CDK context:
```
cdk deploy <stack> -c googleClientId=<CLIENT_ID> -c googleSecretName=/stock-pick-game/<stage>/google-oauth \
  -c cognitoDomainPrefix=<prefix> -c authCallbackUrls=http://localhost:3000/login -c authLogoutUrls=http://localhost:3000/
```

Option B: **Let CDK create a placeholder secret**
- Deploy with:
```
cdk deploy <stack> -c googleClientId=<CLIENT_ID> -c cognitoDomainPrefix=<prefix> \
  -c authCallbackUrls=http://localhost:3000/login -c authLogoutUrls=http://localhost:3000/
```
- CDK will create a secret named:
```
/stock-pick-game/<stage>/google-oauth
```
with value `REPLACE_ME`. Update it in Secrets Manager after deploy.

## Hosted UI callback URLs

When you deploy to Amplify, add both localhost and your Amplify domain as callback/logout URLs:
- Callback URLs: `http://localhost:3000/login`, `https://<amplify-domain>/login`
- Logout URLs: `http://localhost:3000/`, `https://<amplify-domain>/`

These are configured via CDK context:
```
-c authCallbackUrls=http://localhost:3000/login,https://<amplify-domain>/login
-c authLogoutUrls=http://localhost:3000/,https://<amplify-domain>/
```

