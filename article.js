const owner = "SaadSaid158";
const repo = "cyber";
const branch = "main";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const titleEl = document.getElementById("article-title");
const dateEl = document.getElementById("article-date");
const contentEl = document.getElementById("article-content");

if (!slug) {
  titleEl.textContent = "No article specified.";
  throw new Error("No slug in URL");
}

async function fetchMarkdown(slug) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/articles/${slug}.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Article not found");
  return await res.text();
}

function parseFrontmatter(md) {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  let meta = { title: "", date: "" };
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
  return meta;
}

async function loadArticle(slug) {
  try {
    const md = await fetchMarkdown(slug);
    const meta = parseFrontmatter(md);
    titleEl.textContent = meta.title;
    dateEl.textContent = meta.date;

    // Remove frontmatter for markdown rendering
    const contentMd = md.replace(/^---[\s\S]*?---\n/, "");
    contentEl.innerHTML = marked.parse(contentMd);
  } catch (e) {
    titleEl.textContent = "Article not found";
    dateEl.textContent = "";
    contentEl.textContent = "";
  }
}

loadArticle(slug);
