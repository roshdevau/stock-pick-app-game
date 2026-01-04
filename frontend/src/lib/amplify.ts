import { Amplify } from "aws-amplify";

export function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const redirectSignIn = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN;
  const redirectSignOut = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT;

  const normalizeRedirects = (value?: string) =>
    value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

  if (!userPoolId || !userPoolClientId || !region) {
    return false;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith:
          domain && redirectSignIn && redirectSignOut
            ? {
                oauth: {
                  domain,
                  scopes: ["openid", "email", "profile"],
                  redirectSignIn: normalizeRedirects(redirectSignIn),
                  redirectSignOut: normalizeRedirects(redirectSignOut),
                  responseType: "code",
                },
              }
            : undefined,
      },
    },
  });

  return true;
}
