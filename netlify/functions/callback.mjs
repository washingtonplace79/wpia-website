export default async (request) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response("OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET is not set", { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  const cookieHeader = request.headers.get("cookie") || "";
  const expectedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("oauth_state="))
    ?.slice("oauth_state=".length);

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return renderResult({ error: "invalid_state" }, 400);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return renderResult({ error: "token_exchange_failed" }, 502);
  }

  const data = await tokenRes.json();
  if (!data.access_token) {
    return renderResult({ error: data.error || "no_token" }, 502);
  }

  return renderResult({ token: data.access_token, provider: "github" }, 200);
};

function renderResult(payload, status) {
  const success = !payload.error;
  const message = success
    ? `authorization:github:success:${JSON.stringify(payload)}`
    : `authorization:github:error:${JSON.stringify(payload)}`;

  const html = `<!doctype html>
<html><body>
<script>
  (function () {
    function receiveMessage(e) {
      if (e.data !== "authorizing:github") return;
      window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    }
    window.addEventListener("message", receiveMessage, false);
    if (window.opener) window.opener.postMessage("authorizing:github", "*");
  })();
</script>
<p>${success ? "Login complete. You can close this window." : "Login failed."}</p>
</body></html>`;

  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": "oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}
