export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
        return new Response("Missing path", { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
        return new Response("Missing environment variables", { status: 500 });
    }

    try {
        const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(path)}`;

        const githubRes = await fetch(githubUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.raw",
        },
        cache: "no-store",
        });

        if (!githubRes.ok) {
        const errorText = await githubRes.text();
        return new Response(
            `GitHub error: ${githubRes.status}\n${errorText}`,
            { status: githubRes.status }
        );
        }

        const text = await githubRes.text();

        return new Response(text, {
        headers: {
            "Content-Type": "text/plain",
        },
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error("Unknown error:", err);
        }

        return new Response("Server error", { status: 500 });
    }
}