const SITE_NAME = "Kris 讲明白了";

// ===== 主题 & 字号（读取上次的选择）=====
(function () {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.dataset.theme = saved;
    const fs = localStorage.getItem("fs");
    if (fs) document.documentElement.style.setProperty("--fs", fs + "px");
  } catch (e) {}
})();

const FONT_SIZES = [["小", 16], ["中", 18], ["大", 20]];
function fontSizeControl() {
  let cur = 0;
  try { cur = Number(localStorage.getItem("fs")) || 0; } catch (e) {}
  return `<span class="fs-ctrl" role="group" aria-label="正文字号">${FONT_SIZES.map(
    ([label, px]) => `<button type="button" data-fs="${px}" class="${px === cur ? "on" : ""}" aria-label="字号${label}">${label}</button>`
  ).join("")}</span>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-fs]");
  if (!b) return;
  document.documentElement.style.setProperty("--fs", b.dataset.fs + "px");
  try { localStorage.setItem("fs", b.dataset.fs); } catch (e) {}
  b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
});

// ===== 开场动画 =====
// 每次打开网站（同一个标签页会话内）只播一次；网址加 ?intro 可强制重播
(function () {
  let play = false;
  try {
    const force = new URLSearchParams(location.search).has("intro");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    play = !reduce && (force || !sessionStorage.getItem("introSeen"));
  } catch (e) {}
  if (!play) document.documentElement.classList.add("no-intro");
})();

function runIntro() {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const reveal = () => root.classList.add("ready");
  if (!intro || root.classList.contains("no-intro")) { reveal(); return; }
  try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}

  const typeEl = document.getElementById("intro-type");
  const lineBox = document.getElementById("intro-lines");
  const cmd = "kris --explain tech";
  const lines = ["加载 AI 模块", "编译 编程笔记", "拆解 数码硬件", "翻译成人话"];
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    intro.classList.add("leave");
    setTimeout(reveal, 250);
    setTimeout(() => intro.remove(), 900);
  }

  [...cmd].forEach((ch, i) => at(300 + i * 45, () => (typeEl.textContent += ch)));
  const t0 = 300 + cmd.length * 45 + 200;
  lines.forEach((l, i) =>
    at(t0 + i * 170, () => {
      const d = document.createElement("div");
      d.innerHTML = `<span class="ok">✓</span>${l}`;
      lineBox.appendChild(d);
    })
  );
  const t1 = t0 + lines.length * 170 + 250;
  at(t1, () => intro.classList.add("show-title"));
  at(t1 + 1100, finish);

  intro.addEventListener("click", finish);
  addEventListener("keydown", finish, { once: true });
}

function toggleTheme() {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
}
document.addEventListener("click", (e) => {
  if (e.target.closest(".theme-btn")) toggleTheme();
});

// ===== 工具函数 =====
async function loadPosts() {
  const res = await fetch("posts/posts.json", { cache: "no-cache" });
  const posts = await res.json();
  return posts.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function readingTime(text) {
  const cjk = (text.match(/[一-龥]/g) || []).length;
  const words = (text.replace(/[一-龥]/g, " ").match(/\b\w+\b/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}
const pad = (n) => String(n).padStart(2, "0");

// ===== 首页 =====
async function renderHome() {
  const list = document.getElementById("post-list");
  const tagBox = document.getElementById("tags");
  const search = document.getElementById("search");
  const stats = document.getElementById("stats");
  let posts;
  try { posts = await loadPosts(); }
  catch (e) {
    list.innerHTML = `<li class="empty">// 读取文章失败。请用本地服务器打开（见 README），不要直接双击 HTML 文件。</li>`;
    return;
  }

  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))];
  let activeTag = new URLSearchParams(location.search).get("tag") || "";

  if (stats) {
    const days = posts.length ? Math.max(1, Math.round((Date.now() - new Date(posts[posts.length - 1].date)) / 864e5)) : 0;
    stats.innerHTML = `
      <div><b>${pad(posts.length)}</b><span>Posts</span></div>
      <div><b>${pad(allTags.length)}</b><span>Topics</span></div>
      <div><b>${days}</b><span>Days</span></div>`;
  }

  tagBox.innerHTML = ["", ...allTags]
    .map((t) => `<button class="tag" data-tag="${esc(t)}">${t ? "#" + esc(t) : "全部"}</button>`)
    .join("");

  function draw() {
    const q = search.value.trim().toLowerCase();
    tagBox.querySelectorAll(".tag").forEach((b) => b.classList.toggle("active", b.dataset.tag === activeTag));
    const shown = posts.filter((p) =>
      (!activeTag || (p.tags || []).includes(activeTag)) &&
      (!q || (p.title + p.summary).toLowerCase().includes(q))
    );
    list.innerHTML = shown.length
      ? shown.map((p, i) => `
        <li class="post-item" style="--i:${i}">
          <div class="post-num">${pad(posts.indexOf(p) + 1)}</div>
          <div>
            <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
            <p>${esc(p.summary || "")}</p>
            <div class="meta"><time>${esc(p.date)}</time>${(p.tags || []).map((t) => `<span class="t">#${esc(t)}</span>`).join("")}</div>
          </div>
        </li>`).join("")
      : `<li class="empty">// 没有找到相关文章</li>`;
  }

  tagBox.addEventListener("click", (e) => {
    const b = e.target.closest(".tag");
    if (!b) return;
    activeTag = b.dataset.tag;
    draw();
  });
  search.addEventListener("input", draw);
  draw();
}

// ===== 文章页 =====
async function renderPost() {
  const slug = new URLSearchParams(location.search).get("slug");
  const box = document.getElementById("article");
  try {
    const posts = await loadPosts();
    const post = posts.find((p) => p.slug === slug);
    if (!post) throw new Error("not found");
    const md = await (await fetch(`posts/${encodeURIComponent(slug)}.md`, { cache: "no-cache" })).text();
    document.title = `${post.title} · ${SITE_NAME}`;
    box.innerHTML = `
      <h1>${esc(post.title)}</h1>
      <div class="meta"><time>${esc(post.date)}</time><span>${readingTime(md)} min read</span>
        ${(post.tags || []).map((t) => `<a class="t" href="index.html?tag=${encodeURIComponent(t)}">#${esc(t)}</a>`).join("")}
        ${fontSizeControl()}
      </div>
      <div class="content">${marked.parse(md)}</div>
      <a class="back" href="index.html">← cd ..</a>`;
  } catch (e) {
    box.innerHTML = `<h1>404</h1><p class="empty">// 这篇文章不存在</p><a class="back" href="index.html">← 回到首页</a>`;
  }

  // 阅读进度条
  const bar = document.getElementById("progress");
  if (bar) {
    const update = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }
}
