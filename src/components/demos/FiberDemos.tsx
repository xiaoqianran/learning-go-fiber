import { useMemo, useState } from "react";
import type { DemoKind } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, RotateCcw } from "lucide-react";

type SimResult = {
  status: number;
  headers?: Record<string, string>;
  body: string;
  log?: string[];
};

function simulate(kind: DemoKind, input: Record<string, string>): SimResult {
  switch (kind) {
    case "hello":
      return { status: 200, body: "Hello, Fiber!", headers: { "Content-Type": "text/plain" } };
    case "ctx": {
      const name = input.name || "world";
      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "pong", hello: name }, null, 2),
      };
    }
    case "config":
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "invalid request" }, null, 2),
        log: ["ErrorHandler mapped fiber.Error → JSON"],
      };
    case "static": {
      const path = input.path || "/index.html";
      if (path.startsWith("/api")) {
        return { status: 404, body: "Cannot GET " + path };
      }
      return {
        status: 200,
        headers: { "Content-Type": "text/html", "Cache-Control": "public, max-age=86400" },
        body: `<!-- static file for ${path} -->\n<html><body>public${path}</body></html>`,
      };
    }
    case "routing": {
      const method = (input.method || "GET").toUpperCase();
      const path = input.path || "/health";
      const key = `${method} ${path}`;
      const table: Record<string, SimResult> = {
        "GET /health": { status: 200, body: JSON.stringify({ ok: true }) },
        "POST /users": { status: 201, body: JSON.stringify({ id: "u_1" }) },
        "DELETE /users/1": { status: 204, body: "" },
      };
      return (
        table[key] ?? {
          status: 404,
          body: JSON.stringify({ error: `no route for ${key}` }),
        }
      );
    }
    case "params": {
      const id = input.id || "42";
      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }, null, 2),
      };
    }
    case "query": {
      const page = Math.max(1, parseInt(input.page || "1", 10) || 1);
      let limit = parseInt(input.limit || "20", 10) || 20;
      if (limit < 1) limit = 20;
      return {
        status: 200,
        body: JSON.stringify({ page, limit, q: input.q || "" }, null, 2),
      };
    }
    case "body": {
      try {
        const data = JSON.parse(input.body || "{}") as { email?: string; name?: string };
        if (!data.email) {
          return { status: 400, body: JSON.stringify({ error: "email required" }) };
        }
        return {
          status: 201,
          body: JSON.stringify({ id: "u_1", email: data.email, name: data.name ?? "" }, null, 2),
        };
      } catch {
        return { status: 400, body: JSON.stringify({ error: "invalid json" }) };
      }
    }
    case "headers":
      return {
        status: 200,
        headers: { "X-Powered-By": "Fiber", "Content-Type": "application/json" },
        body: JSON.stringify({ ua: input.ua || "FiberDemo/1.0" }, null, 2),
      };
    case "groups": {
      const path = input.path || "/api/v1/health";
      if (path.startsWith("/api/v1/admin") && input.token !== "admin") {
        return { status: 401, body: JSON.stringify({ error: "unauthorized" }) };
      }
      if (path === "/api/v1/health") {
        return { status: 200, body: JSON.stringify({ ok: true }) };
      }
      if (path.startsWith("/api/v1/admin")) {
        return { status: 200, body: JSON.stringify({ stats: { users: 12 } }) };
      }
      return { status: 404, body: JSON.stringify({ error: "not found" }) };
    }
    case "middleware":
      return {
        status: 200,
        headers: { "X-Request-Id": input.rid || "req_demo_001" },
        body: JSON.stringify({ ok: true, requestId: input.rid || "req_demo_001" }, null, 2),
        log: ["RequestID()", "→ handler", "← response headers set"],
      };
    case "logger":
      return {
        status: 200,
        body: "ok",
        log: [`[${new Date().toISOString()}] 200 GET /ping 1.2ms`],
      };
    case "cors":
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": input.origin || "https://app.example.com",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Credentials": "true",
        },
        body: "",
        log: ["OPTIONS preflight handled by cors middleware"],
      };
    case "ratelimit": {
      const n = parseInt(input.hits || "1", 10) || 1;
      if (n > 60) {
        return { status: 429, body: JSON.stringify({ error: "Too Many Requests" }) };
      }
      return {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(Math.max(0, 60 - n)) },
        body: JSON.stringify({ ok: true, hits: n }),
      };
    }
    case "json":
      return {
        status: 200,
        body: JSON.stringify({ code: 0, message: "ok", data: { id: 1 } }, null, 2),
      };
    case "validate": {
      const email = input.email || "";
      const password = input.password || "";
      if (!email.includes("@") || password.length < 8) {
        return {
          status: 422,
          body: JSON.stringify({ error: "validation failed: email/password" }, null, 2),
        };
      }
      return { status: 201, body: "" };
    }
    case "upload": {
      const size = parseInt(input.size || "1024", 10) || 0;
      const name = input.filename || "a.png";
      if (size > 5 * 1024 * 1024) {
        return { status: 400, body: JSON.stringify({ error: "too large" }) };
      }
      return {
        status: 200,
        body: JSON.stringify({ path: "./uploads/" + name, size }, null, 2),
      };
    }
    case "jwt": {
      if (input.token === "valid-token") {
        return { status: 200, body: JSON.stringify({ userId: "user_1" }, null, 2) };
      }
      return { status: 401, body: JSON.stringify({ error: "missing or invalid token" }) };
    }
    case "cookie":
      return {
        status: 204,
        headers: {
          "Set-Cookie": "sid=sess_demo; HttpOnly; Secure; SameSite=Lax; Max-Age=86400",
        },
        body: "",
      };
    case "helmet":
      return {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "SAMEORIGIN",
          "Referrer-Policy": "no-referrer",
        },
        body: "ok",
      };
    case "error": {
      if (input.id === "missing") {
        return { status: 404, body: JSON.stringify({ error: "item not found" }) };
      }
      return { status: 200, body: JSON.stringify({ id: input.id || "1", title: "demo" }) };
    }
    case "crud": {
      const method = (input.method || "GET").toUpperCase();
      if (method === "GET") return { status: 200, body: JSON.stringify([{ id: "n1", title: "hello" }]) };
      if (method === "POST") return { status: 201, body: JSON.stringify({ id: "n2", title: input.title || "note" }) };
      if (method === "PUT" || method === "PATCH")
        return { status: 200, body: JSON.stringify({ id: "n1", title: input.title || "updated" }) };
      if (method === "DELETE") return { status: 204, body: "" };
      return { status: 405, body: "method not allowed" };
    }
    case "layer":
      return {
        status: 201,
        body: JSON.stringify({ id: "n1", title: "layered" }, null, 2),
        log: ["handler.Create", "→ service.Create", "→ repo.Insert", "← 201 JSON"],
      };
    case "page": {
      let limit = parseInt(input.limit || "20", 10) || 20;
      if (limit > 100) limit = 100;
      const page = Math.max(1, parseInt(input.page || "1", 10) || 1);
      return {
        status: 200,
        body: JSON.stringify(
          {
            items: [{ id: "n1" }],
            page,
            limit,
            total: 1,
          },
          null,
          2,
        ),
      };
    }
    case "health":
      if (input.ready === "0") {
        return { status: 503, body: JSON.stringify({ ready: false }) };
      }
      return { status: 200, body: input.kind === "ready" ? JSON.stringify({ ready: true }) : "ok" };
    case "env":
      return {
        status: 200,
        body: JSON.stringify({ listen: `:${input.port || "3000"}` }),
        log: ["PORT from env, default 3000"],
      };
    case "test": {
      const code = parseInt(input.expect || "200", 10);
      return {
        status: 200,
        body: JSON.stringify({ pass: code === 200, got: 200, expect: code }),
        log: ["app.Test(httptest.NewRequest(...))"],
      };
    }
    case "deploy":
      return {
        status: 200,
        body: "shutting down",
        log: ["SIGTERM received", "app.Shutdown()", "drain in-flight"],
      };
    case "perf":
      return {
        status: 200,
        body: input.body || "echo",
        log: ["copy(c.Body()) before async use"],
      };
    case "ws":
      return {
        status: 101,
        headers: { Upgrade: "websocket", Connection: "Upgrade" },
        body: input.msg || "echo",
        log: ["websocket upgrade", "echo frame"],
      };
    default:
      return { status: 200, body: "ok" };
  }
}

const FIELDS: Partial<Record<DemoKind, { key: string; label: string; placeholder?: string; multiline?: boolean }[]>> = {
  ctx: [{ key: "name", label: "Query name", placeholder: "Fiber" }],
  static: [{ key: "path", label: "Path", placeholder: "/index.html" }],
  routing: [
    { key: "method", label: "Method", placeholder: "GET" },
    { key: "path", label: "Path", placeholder: "/health" },
  ],
  params: [{ key: "id", label: "Params id", placeholder: "42" }],
  query: [
    { key: "page", label: "page", placeholder: "1" },
    { key: "limit", label: "limit", placeholder: "20" },
    { key: "q", label: "q", placeholder: "fiber" },
  ],
  body: [{ key: "body", label: "JSON body", placeholder: '{"email":"a@b.c","name":"Ada"}', multiline: true }],
  headers: [{ key: "ua", label: "User-Agent", placeholder: "curl/8.0" }],
  groups: [
    { key: "path", label: "Path", placeholder: "/api/v1/health" },
    { key: "token", label: "token (admin 才过)", placeholder: "admin" },
  ],
  middleware: [{ key: "rid", label: "X-Request-Id", placeholder: "req_demo_001" }],
  ratelimit: [{ key: "hits", label: "本分钟请求数", placeholder: "1" }],
  validate: [
    { key: "email", label: "email", placeholder: "a@b.c" },
    { key: "password", label: "password", placeholder: "secret123" },
  ],
  upload: [
    { key: "filename", label: "filename", placeholder: "a.png" },
    { key: "size", label: "size bytes", placeholder: "1024" },
  ],
  jwt: [{ key: "token", label: "Bearer token", placeholder: "valid-token" }],
  error: [{ key: "id", label: "id (missing → 404)", placeholder: "1" }],
  crud: [
    { key: "method", label: "Method", placeholder: "GET" },
    { key: "title", label: "title", placeholder: "note" },
  ],
  page: [
    { key: "page", label: "page", placeholder: "1" },
    { key: "limit", label: "limit", placeholder: "20" },
  ],
  health: [
    { key: "kind", label: "kind health|ready", placeholder: "health" },
    { key: "ready", label: "ready 1/0", placeholder: "1" },
  ],
  env: [{ key: "port", label: "PORT", placeholder: "3000" }],
  test: [{ key: "expect", label: "expect status", placeholder: "200" }],
  perf: [{ key: "body", label: "body", placeholder: "hello" }],
  ws: [{ key: "msg", label: "message", placeholder: "ping" }],
  cors: [{ key: "origin", label: "Origin", placeholder: "https://app.example.com" }],
};

export function FiberDemo({ kind, title, hint }: { kind: DemoKind; title: string; hint?: string }) {
  const fields = FIELDS[kind] ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SimResult | null>(null);

  const defaults = useMemo(() => {
    const d: Record<string, string> = {};
    for (const f of fields) if (f.placeholder) d[f.key] = f.placeholder;
    return d;
  }, [fields]);

  function run() {
    const merged = { ...defaults, ...values };
    setResult(simulate(kind, merged));
  }

  function reset() {
    setValues({});
    setResult(null);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-2.5">
        <div>
          <p className="text-sm font-semibold text-fg">{title}</p>
          <p className="text-[11px] text-muted">模拟 Fiber 处理 · 非真实 Go 运行时{hint ? ` · ${hint}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </Button>
          <Button type="button" size="sm" onClick={run}>
            <Play className="h-3.5 w-3.5" />
            发送
          </Button>
        </div>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">请求</p>
          {fields.length === 0 ? (
            <p className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-muted">
              无需参数，直接发送即可。
            </p>
          ) : (
            fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-[11px] text-muted">{f.label}</span>
                {f.multiline ? (
                  <textarea
                    className="min-h-20 w-full rounded-lg border border-border bg-bg px-2.5 py-2 font-mono text-xs text-fg"
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className="h-9 w-full rounded-lg border border-border bg-bg px-2.5 font-mono text-xs text-fg"
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            ))
          )}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">响应</p>
          {!result ? (
            <p className="rounded-lg border border-dashed border-border bg-bg px-3 py-8 text-center text-xs text-muted">
              点击「发送」查看模拟响应
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 font-mono text-xs font-semibold",
                    result.status < 300
                      ? "bg-primary-soft text-primary"
                      : result.status < 400
                        ? "bg-surface-3 text-fg"
                        : "bg-danger-soft text-danger",
                  )}
                >
                  {result.status}
                </span>
                {result.headers
                  ? Object.entries(result.headers).map(([k, v]) => (
                      <span key={k} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                        {k}: {v}
                      </span>
                    ))
                  : null}
              </div>
              <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-bg p-2.5 font-mono text-[11px] leading-relaxed text-fg">
                {result.body || "(empty body)"}
              </pre>
              {result.log?.length ? (
                <ul className="space-y-0.5 rounded-lg border border-border bg-surface-2 p-2 text-[11px] text-muted">
                  {result.log.map((line, i) => (
                    <li key={i} className="font-mono">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
