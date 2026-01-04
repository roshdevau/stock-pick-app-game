# Stock Pick Game

Multi-user paper trading game built on AWS. This repo contains a Next.js frontend, an AWS CDK backend (API Gateway + Lambda + DynamoDB), and a Cognito-based auth system with social sign-in support.

## Features
- Cognito auth with optional Google/Facebook login.
- Admin dashboard to view users, allocate funds, and manage access.
- Participant dashboard with portfolio, orders, and trading.
- Market pricing via Twelve Data with caching.
- AWS-native infra via CDK (TypeScript).

## Architecture
- Frontend: Next.js (App Router), designed for Amplify Hosting.
- Auth: Cognito User Pool + Hosted UI.
- API: API Gateway (REST) + Lambda.
- Data: DynamoDB tables for users, accounts, holdings, orders, transactions, symbols, price cache.

See `STEERING.md` for the full design doc.

## Repo structure
- `frontend/`: Next.js app
- `infra/`: AWS CDK stacks + Lambda handlers
- `STEERING.md`: product + architecture document

## Prerequisites
- Node.js 18+ (frontend + infra)
- AWS CLI v2 configured with credentials
- AWS CDK v2 (`npm i -g aws-cdk`)
- Python 3 (for CDK dependencies that require Python)

## Quick start (local dev)
### 1) Backend (CDK)
```bash
cd infra
npm install

# Deploy required stacks (dev)
npx cdk deploy stock-pick-game-dev-auth -c stage=dev
npx cdk deploy stock-pick-game-dev-data -c stage=dev
npx cdk deploy stock-pick-game-dev-api -c stage=dev
```

### 2) Frontend
```bash
cd frontend
npm install

# Create a local env file
cp .env.example .env.local

# Fill in values (see "Environment variables" below)
npm run dev
```

## Environment variables
Create `frontend/.env.local` with:
```
NEXT_PUBLIC_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/dev
NEXT_PUBLIC_AUTH_MODE=enabled
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<pool-id>
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=<app-client-id>
NEXT_PUBLIC_COGNITO_DOMAIN=<domain-prefix>.auth.<region>.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN=http://localhost:3000/login
NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT=http://localhost:3000/
```

These values are output from the CDK stacks. You can get them with:
```bash
aws cloudformation describe-stacks \
  --stack-name stock-pick-game-dev-auth \
  --query "Stacks[0].Outputs"
```

## Social sign-in (Google / Facebook)
See `infra/README.md` for the full walkthrough.

Required redirect URI for each provider:
```
https://<COGNITO_DOMAIN_PREFIX>.auth.<AWS_REGION>.amazoncognito.com/oauth2/idpresponse
```

Deploy with provider context:
```bash
npx cdk deploy stock-pick-game-dev-auth \
  -c stage=dev \
  -c googleClientId=<GOOGLE_CLIENT_ID> \
  -c googleSecretName=/stock-pick-game/dev/google-oauth \
  -c facebookAppId=<FACEBOOK_APP_ID> \
  -c facebookSecretName=/stock-pick-game/dev/facebook-oauth \
  -c cognitoDomainPrefix=stock-pick-game-dev \
  -c authCallbackUrls=http://localhost:3000/login \
  -c authLogoutUrls=http://localhost:3000/
```

## Admin users
Admins are users in the Cognito `Admin` group. Add a user to the group with:
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <pool-id> \
  --username <username-or-email> \
  --group-name Admin
```

## Trading notes
- Market orders fill at the latest cached quote; limit orders fill when the cached quote crosses the limit.
- No short selling (default).
- Cash and holdings are enforced server-side.

## Deployment guide (production)
1) Create an AWS account and configure AWS CLI credentials.
2) Deploy CDK stacks with a prod stage:
```bash
npx cdk deploy stock-pick-game-prod-auth -c stage=prod
npx cdk deploy stock-pick-game-prod-data -c stage=prod
npx cdk deploy stock-pick-game-prod-api -c stage=prod
```
3) Deploy frontend to Amplify Hosting and set the same env vars in Amplify.
4) Update Cognito callback/logout URLs to include the Amplify domain.

## Testing
Frontend:
```bash
cd frontend
npm test
```

Backend (lambda):
```bash
cd infra
npm test
```

## Security notes
- Never commit OAuth secrets or API keys.
- Use Secrets Manager for social provider secrets.
- Use SSM Parameter Store for market data keys.

## Troubleshooting
- If login redirects to `/login` after sign-in, clear site data and retry.
- If you see `Access Token does not have required scopes`, redeploy the auth stack and sign in again.
- If CORS errors occur, ensure API Gateway includes `Access-Control-Allow-Origin` and that your frontend uses the correct API base URL.

## License
MIT (add your preferred license here).
