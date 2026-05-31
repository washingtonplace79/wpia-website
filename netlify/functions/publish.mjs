const REPO_OWNER = "washingtonplace79";
const REPO_NAME = "wpia-website";
const WORKFLOW_ID = "release.yml";
const DEFAULT_REF = "main";

export default async (request) => {
  if (request.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const githubToken = process.env.GITHUB_WORKFLOW_TOKEN;
  const publishSecret = process.env.PUBLISH_SECRET;

  if (!githubToken || !publishSecret) {
    return json({ error: "publish_not_configured" }, 500);
  }

  const providedSecret = readSecret(request);
  if (!providedSecret || providedSecret !== publishSecret) {
    return json({ error: "unauthorized" }, 401);
  }

  const ref = process.env.PUBLISH_WORKFLOW_REF || DEFAULT_REF;
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
        "User-Agent": "wpia-website-publisher",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref }),
    },
  );

  if (response.status === 204) {
    return json({
      status: "started",
      message: "Release workflow started. Production will deploy if staging has changes to release.",
      workflowUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}`,
    });
  }

  const details = await readGitHubError(response);

  return json(
    {
      status: "failed",
      error: "workflow_dispatch_failed",
      message: `GitHub rejected the release workflow request (${response.status}).`,
      details,
    },
    response.status >= 400 && response.status < 500 ? response.status : 502,
  );
};

function readSecret(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice("bearer ".length).trim();
  }

  return request.headers.get("x-publish-secret");
}

async function readGitHubError(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
