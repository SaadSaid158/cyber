const owner = "SaadSaid158";
const repo = "cyber";
const branch = "main";

const articlesListEl = document.getElementById("articles-list");
const searchInput = document.getElementById("search");

async function fetchArticlesList() {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/articles?ref=${branch}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    articlesListEl.innerHTML = `<p>Failed to load articles list.</p>`;
    return [];
  }
  const files = await res.json();
  return files.filter((f) => f.name.endsWith(".md"));
}

function parseFrontmatter(md) {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  let meta = { title: "", date: "", summary: "" };
  if (fmMatch) {
    const fmLines = fmMatch[1].split("\n");
    for (const line of fmLines) {
      const [k, ...v] = line.split(":");
      if (k && v) meta[k.trim().toLowerCase()] = v.join(":").trim();
    }
  }
  if (!meta.title) {
    const h1 = md.match(/^# (.+)$/m);
    meta.title = h1 ? h1[1].trim() : "Untitled";
  }
  if (!meta.date) meta.date = new Date().toISOString().split("T")[0];
  if (!meta.summary) {
    const noFm = md.replace(/^---[\s\S]*?---/, "").trim();
    meta.summary = noFm.slice(0, 150).replace(/\n/g, " ");
  }
  return meta;
}

async function loadArticles() {
  const mdFiles = await fetchArticlesList();
  const articles = [];
  for (const file of mdFiles) {
    try {
      const rawMdRes = await fetch(file.download_url);
      if (!rawMdRes.ok) continue;
      const mdText = await rawMdRes.text();
      const meta = parseFrontmatter(mdText);
      meta.slug = file.name.replace(/\.md$/, "");
      articles.push(meta);
    } catch {
      continue;
    }
  }

  // Sort newest first
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderArticles(articles);
}

function renderArticles(articles) {
  const filter = searchInput.value.toLowerCase();
  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(filter) ||
      a.summary.toLowerCase().includes(filter)
  );
  if (!filtered.length) {
    articlesListEl.innerHTML = "<p>No articles found.</p>";
    return;
  }
  articlesListEl.innerHTML = filtered
    .map(
      (a) => `
    <article class="preview">
      <h2><a href="article.html?slug=${encodeURIComponent(a.slug)}">${a.title}</a></h2>
      <time datetime="${a.date}">${a.date}</time>
      <p>${a.summary}</p>
    </article>
  `
    )
    .join("");
}

searchInput.addEventListener("input", () => {
  loadArticles();
});

loadArticles();
