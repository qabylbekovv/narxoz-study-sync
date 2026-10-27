// work/narxoz-independent/lib/canvas.mjs
var ORIGIN = "https://canvas.narxoz.kz";
var CanvasError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
function nextPage(header) {
  return header?.split(",").map((s) => s.match(/<([^>]+)>;\s*rel="next"/)).find(Boolean)?.[1] || null;
}
async function canvasList(path, token, request = fetch) {
  let url = new URL(path, ORIGIN), items = [], visited = /* @__PURE__ */ new Set();
  for (let page = 0; url; page++) {
    if (url.origin !== ORIGIN || !url.pathname.startsWith("/api/v1/") || url.username || url.password) throw new CanvasError("unsafe_url", "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B Canvas.");
    if (visited.has(url.href) || page >= 250) throw new CanvasError("pagination", "Canvas \u0432\u0435\u0440\u043D\u0443\u043B \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446. \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430.");
    visited.add(url.href);
    let response;
    try {
      response = await request(url.href, { method: "GET", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, redirect: "manual", signal: AbortSignal.timeout(25e3) });
    } catch {
      throw new CanvasError("network", "Canvas \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u043C \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0443 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.");
    }
    if (response.status >= 300 && response.status < 400) throw new CanvasError("redirect", "Canvas \u043F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441. \u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443.");
    if (response.status === 401) throw new CanvasError("invalid_token", "Canvas \u043E\u0442\u043A\u043B\u043E\u043D\u0438\u043B \u043A\u043B\u044E\u0447 \u0434\u043E\u0441\u0442\u0443\u043F\u0430. \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u0441\u0440\u043E\u043A \u043A\u043B\u044E\u0447\u0430 \u0438\u0441\u0442\u0451\u043A.");
    if (response.status === 403) throw new CanvasError("forbidden", "Canvas \u043D\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 \u0447\u0438\u0442\u0430\u0442\u044C \u044D\u0442\u0438 \u0434\u0430\u043D\u043D\u044B\u0435.");
    if (response.status === 429) throw new CanvasError("rate_limit", "Canvas \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441\u044B. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u043D\u0443\u0442.");
    if (!response.ok) throw new CanvasError("upstream", `Canvas \u0432\u0435\u0440\u043D\u0443\u043B \u043E\u0448\u0438\u0431\u043A\u0443 ${response.status}. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u043C \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0443 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.`);
    let value;
    try {
      value = await response.json();
    } catch {
      throw new CanvasError("format", "Canvas \u0432\u0435\u0440\u043D\u0443\u043B \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442.");
    }
    if (!Array.isArray(value)) throw new CanvasError("format", "Canvas \u0432\u0435\u0440\u043D\u0443\u043B \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A \u0434\u0430\u043D\u043D\u044B\u0445.");
    items.push(...value);
    const next = nextPage(response.headers.get("link"));
    url = next ? new URL(next, ORIGIN) : null;
  }
  return items;
}
var number = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
function normalizeAssignment(a, courseId) {
  const s = a.submission || {}, graded = s.workflow_state === "graded" && s.grade != null, submitted = !!s.submitted_at || ["submitted", "pending_review", "graded"].includes(s.workflow_state);
  let status = s.excused ? "excused" : s.missing ? "missing" : graded ? "graded" : submitted ? "submitted" : "unsubmitted";
  return { id: `canvas-${courseId}-${a.id}`, canvasId: String(a.id), courseId: String(courseId), title: a.name || "\u0417\u0430\u0434\u0430\u043D\u0438\u0435", dueAt: s.cached_due_date || a.due_at || null, unlockAt: a.unlock_at || null, lockAt: a.lock_at || null, locked: !!a.locked_for_user, status, late: !!s.late, submittedAt: s.submitted_at || null, score: s.grade == null ? null : number(s.score), grade: s.grade == null ? null : String(s.grade), pointsPossible: number(a.points_possible), gradingType: a.grading_type, omitFromFinal: !!a.omit_from_final_grade, url: `${ORIGIN}/courses/${courseId}/assignments/${a.id}` };
}
async function loadCanvas(token, request = fetch) {
  const common = "/api/v1/courses?enrollment_type=student&include[]=total_scores&include[]=term&include[]=concluded&per_page=100";
  const [current, past] = await Promise.all([canvasList(common + "&enrollment_state=active", token, request), canvasList(common + "&enrollment_state=completed", token, request)]);
  const map = new Map([...current, ...past].filter((c) => c.id && c.name).map((c) => [String(c.id), c]));
  const courses = [...map.values()].map((c) => {
    const e = (c.enrollments || []).find((e2) => ["student", "StudentEnrollment"].includes(e2.type)) || {};
    return { id: String(c.id), name: c.name, code: c.course_code || "", term: c.term?.name || "", archived: !!c.concluded || c.workflow_state === "completed" || !current.some((x) => x.id === c.id), currentScore: number(e.computed_current_score ?? e.grades?.current_score), finalScore: number(e.computed_final_score ?? e.grades?.final_score), currentGrade: e.computed_current_grade ?? e.grades?.current_grade ?? null, url: `${ORIGIN}/courses/${c.id}/grades` };
  });
  const assignments = [], warnings = [];
  let cursor = 0;
  async function worker() {
    while (cursor < courses.length) {
      const c = courses[cursor++];
      try {
        const rows = await canvasList(`/api/v1/courses/${c.id}/assignments?include[]=submission&per_page=100`, token, request);
        assignments.push(...rows.filter((a) => a.published !== false).map((a) => normalizeAssignment(a, c.id)));
      } catch (e) {
        if (e.code === "invalid_token") throw e;
        warnings.push({ courseId: c.id, message: e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, courses.length) }, worker));
  return { connected: true, updatedAt: (/* @__PURE__ */ new Date()).toISOString(), courses, assignments, warnings, partial: warnings.length > 0 };
}

// work/narxoz-independent/runner/sync.mjs
var config = JSON.parse(process.env.NARXOZ_WORKER_CONFIG || "{}");
for (const k of ["siteUrl", "syncKey", "canvasToken", "vapidPublic", "vapidPrivate", "contact"]) if (!config[k]) throw Error("Missing protected worker configuration: " + k);
var base = new URL(config.siteUrl);
if (base.protocol !== "https:") throw Error("HTTPS required");
async function call(body) {
  const response = await fetch(new URL("/api/worker", base), { method: "POST", headers: { Authorization: "Bearer " + config.syncKey, "Content-Type": "application/json" }, body: JSON.stringify(body), redirect: "manual", signal: AbortSignal.timeout(12e4) });
  if (!response.ok) throw Error("Panel API status " + response.status);
  return response.json();
}
async function deliver(op = "deliver") {
  const result = await call({ op });
  console.log(`Notifications: ${result.sent} accepted by push service, ${result.failed} errors, ${result.removed} expired subscriptions removed.`);
  if (result.status !== "ok") throw Error("Notification delivery unavailable");
}
async function run() {
  await call({ op: "configure-push", config: { publicKey: config.vapidPublic, privateKey: config.vapidPrivate, contact: config.contact } });
  if (process.env.NARXOZ_TEST_PUSH === "true") await deliver("test-push");
  try {
    await deliver();
  } catch {
    console.error("Notification delivery unavailable.");
    process.exitCode = 1;
  }
  try {
    const snapshot = await loadCanvas(config.canvasToken);
    await call({ op: "sync", snapshot });
    console.log(`Sync: ${snapshot.courses.length} courses, ${snapshot.assignments.length} assignments, ${snapshot.warnings.length} warnings.`);
    if (snapshot.partial) process.exitCode = 1;
  } catch (error) {
    console.error("Canvas sync failed:", error.code || "connection_or_configuration");
    process.exitCode = 1;
  }
  try {
    await deliver();
  } catch {
    console.error("Notification delivery unavailable.");
    process.exitCode = 1;
  }
}
run().catch(() => {
  console.error("Background setup failed.");
  process.exitCode = 1;
});
