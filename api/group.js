import fetch from "node-fetch";

// Using https://www.npmjs.com/package/node-fetch API documentation to create a github repo grouping display

export default async function handler(req, res) {
    const { title = "Repo Group", repos = "" } = req.query;

    if (!repos) {
        return res.status(400).send("Missing repo query parameter");
    }

    const repoList = repos.split(","); // user/repo1,user/repo2, so split by comma

    // Now we fetch the repo data from Github
    const repoData = await Promise.all(
        repoList.map(async (full) => {
            const [owner, repo] = full.split("/"); // get the owner for the http request
            const response = await fetch('https://api.github.com/repos/${owner}/${repo}');
            const data = await response.json();
            return {
                name: data.name,
                stars: data.stargazers_count,
                lang: data.language,
                url: data.html_url,
            };
        })
    );

    const items = repoData
        .map(
            (r,i) =>
                `<text x="20" y="${60 + i * 30}" font-size="16" fill="#333">
                    • ${r.name} ⭐${r.stars} (${r.lang})
                </text>`
        )
        .join("");

    const svg = `
    <svg width="500" height="${100 + repoData.length * 40}" xmlns="http://www.3.org/2000/svg">
        <style>
            .title { font: bold 20px sans-serif; fill: #0366d6; }
            text { font-family: sans-serif; }
        </style>
        <rect x="0" y="0" width="100%" height="100%" fill="#f6f8fa" stroke="#e1e4e8" rx="10"/>
        <text x="20" y="35" class="title">${title}</text>
        ${items}
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
}
