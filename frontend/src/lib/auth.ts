import { fetchAuthSession } from "aws-amplify/auth";

function decodeJwtPayload(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

export async function getUserGroups(): Promise<string[]> {
  try {
    const session = await fetchAuthSession();
    const idPayload = decodeJwtPayload(session.tokens?.idToken?.toString());
    const accessPayload = decodeJwtPayload(session.tokens?.accessToken?.toString());
    const groups = idPayload?.["cognito:groups"] || accessPayload?.["cognito:groups"] || [];
    return Array.isArray(groups) ? groups : String(groups).split(",").filter(Boolean);
  } catch (err) {
    return [];
  }
}
