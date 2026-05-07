import { randomBytes } from "node:crypto";

export default async (request) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response("OAUTH_CLIENT_ID is not set", { status: 500 });
  }

  const url = new URL(request.url);
  const state = randomBytes(16).toString("hex");
  const redirectUri = `${url.origin}/auth/callback`;

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "repo,user");
  authorize.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
};
