import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, LogOut, Plus, Server, Trash2 } from "lucide-react";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

type Note = { id: string; title: string; body: string };
type QuestId = "login" | "401" | "create" | "edit" | "delete" | "logout";

const QUESTS: { id: QuestId; label: string }[] = [
  { id: "login", label: "成功登录" },
  { id: "401", label: "触发一次 401" },
  { id: "create", label: "创建笔记" },
  { id: "edit", label: "编辑笔记" },
  { id: "delete", label: "删除笔记" },
  { id: "logout", label: "退出登录" },
];

function StudioPage() {
  const [email, setEmail] = useState("demo@fiber.dev");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [quests, setQuests] = useState<Record<QuestId, boolean>>({
    login: false,
    "401": false,
    create: false,
    edit: false,
    delete: false,
    logout: false,
  });
  const [err, setErr] = useState("");

  const pushLog = useCallback((line: string) => {
    setLog((L) => [`${new Date().toLocaleTimeString()} ${line}`, ...L].slice(0, 40));
  }, []);

  const mark = useCallback((id: QuestId) => {
    setQuests((q) => ({ ...q, [id]: true }));
  }, []);

  async function api(path: string, init: RequestInit = {}, auth = true) {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (auth && token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(path, { ...init, headers });
    pushLog(`${init.method || "GET"} ${path} → ${res.status}`);
    if (res.status === 401) mark("401");
    return res;
  }

  async function login() {
    setErr("");
    const res = await api(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false,
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr((data as { error?: string }).error || "登录失败");
      return;
    }
    setToken((data as { token: string }).token);
    mark("login");
    pushLog("login ok");
  }

  async function loadNotes(t = token) {
    if (!t) return;
    const res = await fetch("/api/notes", {
      headers: { Authorization: `Bearer ${t}` },
    });
    pushLog(`GET /api/notes → ${res.status}`);
    if (res.status === 401) mark("401");
    if (!res.ok) return;
    const data = (await res.json()) as { items: Note[] };
    setNotes(data.items);
  }

  useEffect(() => {
    if (token) void loadNotes(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function trigger401() {
    const res = await fetch("/api/me");
    pushLog(`GET /api/me (no token) → ${res.status}`);
    if (res.status === 401) mark("401");
  }

  async function saveNote() {
    if (!title.trim()) {
      setErr("标题必填");
      return;
    }
    setErr("");
    if (editId) {
      const res = await api(`/api/notes/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ title, body }),
      });
      if (res.ok) {
        mark("edit");
        setEditId(null);
        setTitle("");
        setBody("");
        await loadNotes();
      }
    } else {
      const res = await api("/api/notes", {
        method: "POST",
        body: JSON.stringify({ title, body }),
      });
      if (res.ok) {
        mark("create");
        setTitle("");
        setBody("");
        await loadNotes();
      }
    }
  }

  async function removeNote(id: string) {
    const res = await api(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      mark("delete");
      await loadNotes();
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setToken(null);
    setNotes([]);
    mark("logout");
  }

  const doneCount = QUESTS.filter((q) => quests[q.id]).length;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-fg">
          <Server className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-fg">API 工坊</h1>
          <p className="mt-1 text-sm text-muted">
            模拟 Fiber 风格 REST：登录、401、笔记 CRUD。账号 demo@fiber.dev / password123
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">闯关进度 {doneCount}/{QUESTS.length}</h2>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round((doneCount / QUESTS.length) * 100)}%` }}
            />
          </div>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {QUESTS.map((q) => (
            <li
              key={q.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                quests[q.id]
                  ? "border-primary/30 bg-primary-soft text-fg"
                  : "border-border bg-bg text-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  quests[q.id] ? "bg-primary text-primary-fg" : "bg-surface-3",
                )}
              >
                {quests[q.id] ? <Check className="h-3 w-3" /> : null}
              </span>
              {q.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-border bg-surface p-4">
        {!token ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-fg">登录</h2>
            <label className="block text-xs text-muted">
              邮箱
              <input
                className="mt-1 h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-xs text-muted">
              密码
              <input
                type="password"
                className="mt-1 h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {err ? <p className="text-xs text-danger">{err}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void login()}>
                登录
              </Button>
              <Button type="button" variant="secondary" onClick={() => void trigger401()}>
                无 token 请求 /api/me
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-fg">
                已登录 · token <span className="font-mono text-xs text-muted">{token.slice(0, 18)}…</span>
              </p>
              <Button type="button" size="sm" variant="secondary" onClick={() => void logout()}>
                <LogOut className="h-4 w-4" />
                退出
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-fg"
                placeholder="标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-fg"
                placeholder="正文"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            {err ? <p className="text-xs text-danger">{err}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void saveNote()}>
                <Plus className="h-4 w-4" />
                {editId ? "保存修改" : "创建笔记"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void trigger401()}>
                再触发 401
              </Button>
              {editId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditId(null);
                    setTitle("");
                    setBody("");
                  }}
                >
                  取消编辑
                </Button>
              ) : null}
            </div>
            <ul className="space-y-2">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border bg-bg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-fg">{n.title}</p>
                    <p className="text-xs text-muted">{n.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditId(n.id);
                        setTitle(n.title);
                        setBody(n.body);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void removeNote(n.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {notes.length === 0 ? (
                <li className="py-6 text-center text-xs text-muted">暂无笔记</li>
              ) : null}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-fg">请求日志</h2>
        <ul className="mt-2 max-h-48 space-y-1 overflow-auto font-mono text-[11px] text-muted">
          {log.length === 0 ? <li>尚无请求</li> : log.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </section>
    </div>
  );
}
