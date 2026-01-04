# Stock Pick Game

Multi-user paper trading game built on AWS.

## Repo structure
- `frontend/`: Next.js app (Amplify-compatible)
- `infra/`: AWS CDK stacks (Cognito, API Gateway, Lambda, DynamoDB)
- `STEERING.md`: design/architecture document

## Local setup
1) Frontend
```bash
cd frontend
npm install
npm run dev
```

2) Infra (CDK)
```bash
cd infra
npm install
npm run cdk -- deploy <stack-name>
```

## Auth + Google OAuth
See `infra/README.md` for Google OAuth setup, secret handling, and deployment notes.

## Notes
- Environment values are in `.env.local` (not committed).
- Backend uses AWS resources created via CDK.
