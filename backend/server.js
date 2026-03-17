const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 8080);
const ADMIN_PASSWORD = process.env.FORUM_ADMIN_PASSWORD || "admin123";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Use /home for persistence on Azure, fallback to local for dev
const DATA_DIR = process.env.DATA_DIR ||
  (process.env.WEBSITE_SITE_NAME ? "/home/site/wwwroot/data" : path.join(__dirname, "data"));
const DATA_FILE = path.join(DATA_DIR, "forum.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".ico":  "image/x-icon",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".woff2":"font/woff2",
  ".woff": "font/woff",
  ".ttf":  "font/ttf",
};
const ALLOWED_ZONES = new Set(["main", "chill"]);

const DEFAULT_STORE = {
  threads: [
    {
      id: "seed-main-1",
      zone: "main",
      title: "Nên bắt đầu từ đâu nếu muốn theo AI?",
      category: "Hỏi đáp chuyên ngành",
      content: "Mình đang học năm 1 và muốn theo AI. Nên tập trung Python, Toán hay project trước?",
      createdAt: new Date().toISOString(),
      likes: 2,
      comments: [
        {
          id: "seed-comment-1",
          text: "Bắt đầu Python + xác suất thống kê cơ bản trước nhé.",
          author: "MentorA",
          anonymous: false,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ],
  reports: []
};

let writeQueue = Promise.resolve();

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
  });
  res.end();
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(Object.assign(new Error("Payload too large"), { statusCode: 413 }));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }));
      }
    });

    req.on("error", () => {
      reject(Object.assign(new Error("Failed to read request body"), { statusCode: 400 }));
    });
  });
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

function normalizeComment(comment, fallbackTime) {
  return {
    id: typeof comment.id === "string" && comment.id ? comment.id : makeId("comment"),
    text: String(comment.text || ""),
    author: String(comment.author || "Khách"),
    anonymous: Boolean(comment.anonymous),
    createdAt: comment.createdAt || fallbackTime
  };
}

function normalizeThread(thread) {
  const createdAt = thread.createdAt || new Date().toISOString();
  return {
    id: String(thread.id || makeId("thread")),
    zone: ALLOWED_ZONES.has(thread.zone) ? thread.zone : "main",
    title: String(thread.title || "").trim(),
    category: String(thread.category || "").trim(),
    content: String(thread.content || "").trim(),
    createdAt,
    likes: Number.isFinite(thread.likes) ? thread.likes : 0,
    comments: Array.isArray(thread.comments)
      ? thread.comments.map((comment) => normalizeComment(comment, createdAt))
      : []
  };
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  const threads = Array.isArray(parsed.threads) ? parsed.threads.map(normalizeThread) : [];
  const reports = Array.isArray(parsed.reports) ? parsed.reports : [];
  return { threads, reports };
}

function writeStore(store) {
  writeQueue = writeQueue.then(async () => {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
  });
  return writeQueue;
}

function isAdmin(req) {
  return req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

function sortThreads(threads) {
  return [...threads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function validateThreadPayload(payload) {
  const zone = String(payload.zone || "main");
  const title = String(payload.title || "").trim();
  const category = String(payload.category || "").trim();
  const content = String(payload.content || "").trim();

  if (!ALLOWED_ZONES.has(zone)) throw Object.assign(new Error("Invalid zone"), { statusCode: 400 });
  if (!title) throw Object.assign(new Error("Title is required"), { statusCode: 400 });
  if (!category) throw Object.assign(new Error("Category is required"), { statusCode: 400 });
  if (!content) throw Object.assign(new Error("Content is required"), { statusCode: 400 });

  return { zone, title, category, content };
}

function validateCommentPayload(payload) {
  const text = String(payload.text || "").trim();
  const author = String(payload.author || "Khách").trim() || "Khách";
  const anonymous = Boolean(payload.anonymous);

  if (!text) throw Object.assign(new Error("Comment text is required"), { statusCode: 400 });

  return { text, author, anonymous };
}

function parsePath(pathname) {
  const threadMatch = pathname.match(/^\/forum\/threads\/([^/]+)$/);
  const commentMatch = pathname.match(/^\/forum\/threads\/([^/]+)\/comments\/([^/]+)$/);
  const commentsRouteMatch = pathname.match(/^\/forum\/threads\/([^/]+)\/comments$/);
  const likeMatch = pathname.match(/^\/forum\/threads\/([^/]+)\/like$/);

  return {
    threadId: threadMatch ? decodeURIComponent(threadMatch[1]) : null,
    deleteComment: commentMatch
      ? { threadId: decodeURIComponent(commentMatch[1]), commentId: decodeURIComponent(commentMatch[2]) }
      : null,
    threadComments: commentsRouteMatch ? decodeURIComponent(commentsRouteMatch[1]) : null,
    threadLike: likeMatch ? decodeURIComponent(likeMatch[1]) : null
  };
}

async function handle(req, res) {
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname;
  const method = req.method || "GET";
  const parsedPath = parsePath(pathname);

  // Serve static files from the project root (one level up from /backend)
  if (method === "GET" && !pathname.startsWith("/forum") && pathname !== "/health") {
    const ROOT = path.join(__dirname, "..");
    const decodedPathname = decodeURIComponent(pathname);
    let filePath = path.join(ROOT, decodedPathname === "/" ? "index.html" : decodedPathname);
    filePath = filePath.split("?")[0];
    try {
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
      return;
    } catch {
      // file not found, fall through to API routes
    }
  }

  if (method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "forum-backend" });
    return;
  }

  if (method === "GET" && pathname === "/forum/threads") {
    const store = await readStore();
    const zone = reqUrl.searchParams.get("zone");
    const category = reqUrl.searchParams.get("category");

    const filtered = store.threads.filter((thread) => {
      if (zone && thread.zone !== zone) return false;
      if (category && category !== "all" && thread.category !== category) return false;
      return true;
    });

    sendJson(res, 200, { threads: sortThreads(filtered) });
    return;
  }

  if (method === "GET" && parsedPath.threadId) {
    const store = await readStore();
    const target = store.threads.find((thread) => thread.id === parsedPath.threadId);
    if (!target) throw Object.assign(new Error("Thread not found"), { statusCode: 404 });
    sendJson(res, 200, { thread: target });
    return;
  }

  if (method === "POST" && pathname === "/forum/threads") {
    const payload = await parseJsonBody(req);
    const next = validateThreadPayload(payload);
    const store = await readStore();

    store.threads.push({
      id: makeId("thread"),
      ...next,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    });

    await writeStore(store);
    sendJson(res, 201, { ok: true });
    return;
  }

  if (method === "POST" && parsedPath.threadComments) {
    const payload = await parseJsonBody(req);
    const nextComment = validateCommentPayload(payload);
    const store = await readStore();
    const target = store.threads.find((thread) => thread.id === parsedPath.threadComments);
    if (!target) throw Object.assign(new Error("Thread not found"), { statusCode: 404 });

    target.comments.push({
      id: makeId("comment"),
      ...nextComment,
      createdAt: new Date().toISOString()
    });

    await writeStore(store);
    sendJson(res, 201, { ok: true });
    return;
  }

  if (method === "POST" && parsedPath.threadLike) {
    const store = await readStore();
    const target = store.threads.find((thread) => thread.id === parsedPath.threadLike);
    if (!target) throw Object.assign(new Error("Thread not found"), { statusCode: 404 });
    target.likes += 1;
    await writeStore(store);
    sendJson(res, 200, { ok: true, likes: target.likes });
    return;
  }

  if (method === "DELETE" && parsedPath.threadId) {
    if (!isAdmin(req)) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
    const store = await readStore();
    const before = store.threads.length;
    store.threads = store.threads.filter((thread) => thread.id !== parsedPath.threadId);
    if (store.threads.length === before) throw Object.assign(new Error("Thread not found"), { statusCode: 404 });
    await writeStore(store);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "DELETE" && parsedPath.deleteComment) {
    if (!isAdmin(req)) throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
    const store = await readStore();
    const target = store.threads.find((thread) => thread.id === parsedPath.deleteComment.threadId);
    if (!target) throw Object.assign(new Error("Thread not found"), { statusCode: 404 });

    const before = target.comments.length;
    target.comments = target.comments.filter((comment) => comment.id !== parsedPath.deleteComment.commentId);
    if (target.comments.length === before) throw Object.assign(new Error("Comment not found"), { statusCode: 404 });

    await writeStore(store);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "POST" && pathname === "/forum/report") {
    const payload = await parseJsonBody(req);
    const threadId = String(payload.threadId || "").trim();
    const reason = String(payload.reason || "").trim();
    const detail = String(payload.detail || "").trim();

    if (!threadId) throw Object.assign(new Error("threadId is required"), { statusCode: 400 });
    if (!reason) throw Object.assign(new Error("reason is required"), { statusCode: 400 });

    const store = await readStore();
    store.reports.push({
      id: makeId("report"),
      threadId,
      reason,
      detail,
      createdAt: new Date().toISOString()
    });
    await writeStore(store);
    sendJson(res, 201, { ok: true });
    return;
  }

  throw Object.assign(new Error("Route not found"), { statusCode: 404 });
}

const server = http.createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (error) {
    const statusCode = Number(error.statusCode || 500);
    sendJson(res, statusCode, {
      ok: false,
      error: error.message || "Internal Server Error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`SSA server running on port ${PORT}`);
  ensureStore().catch((err) => {
    console.error("Warning: failed to initialize data store:", err.message);
  });
});
