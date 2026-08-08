import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, getLessonsByTrack } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Sparkles,
  Search,
  Server,
  Terminal,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  completedCount,
  getContinueLesson,
  isAllComplete,
  orderedTracks,
  progressPercent,
  TRACK_META,
  trackLabel,
  type TrackName,
} from "@/lib/nav";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type TrackFilter = "全部" | TrackName;

function HomePage() {
  const completed = useProgress((s) => s.completed);
  const streak = useProgress((s) => s.streak);
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<TrackFilter>("全部");

  const progress = progressPercent(completed);
  const doneCount = completedCount(completed);
  const cont = getContinueLesson(completed);
  const allDone = isAllComplete(completed);

  const filtered = useMemo(() => {
    let list = track === "全部" ? LESSONS : getLessonsByTrack(track);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(s) ||
          l.summary.toLowerCase().includes(s) ||
          l.slug.includes(s),
      );
    }
    return list;
  }, [q, track]);

  const pathCards = orderedTracks().map((t) => {
    const list = getLessonsByTrack(t);
    const done = list.filter((l) => completed.includes(l.slug)).length;
    return {
      track: t,
      ...TRACK_META[t],
      done,
      total: list.length,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  });

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 200px at 10% -10%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/60 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              v1 · Fiber 系统路径
            </p>
            {streak > 0 ? (
              <span className="rounded-full bg-surface-3 px-2.5 py-1 font-mono text-xs text-muted">
                连续 {streak} 天
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-fg sm:text-4xl">
            带你系统学 Go Fiber
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            讲解 → 对应 Go 源码 → 请求演练 Demo → 测验（≥80% 掌握）。{LESSONS.length}{" "}
            节课覆盖路由、中间件、校验、JWT、CRUD 与工程化。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {allDone ? (
              <Link
                to="/certificate"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg no-underline"
              >
                领取结业证明
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/lesson/$slug"
                params={{ slug: cont.slug }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg no-underline"
              >
                {doneCount ? "继续学习" : "开始第一课"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/studio"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-4 text-sm font-medium text-fg no-underline"
            >
              <Server className="h-4 w-4" />
              API 工坊
            </Link>
            <Link
              to="/playground"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-muted no-underline hover:bg-surface-2 hover:text-fg"
            >
              <Terminal className="h-4 w-4" />
              请求演练
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              {doneCount}/{LESSONS.length} 课
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              进度 {progress}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-fg">学习路径</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {pathCards.map((p) => (
            <button
              key={p.track}
              type="button"
              onClick={() => setTrack(p.track)}
              className={cn(
                "rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong",
                track === p.track && "border-primary/40 bg-primary-soft",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fg">{trackLabel(p.track)}</span>
                <span className="font-mono text-[11px] text-muted">
                  {p.done}/{p.total}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{p.blurb}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct}%` }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索课程标题 / 摘要…"
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-fg"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant={track === "全部" ? "default" : "secondary"}
            onClick={() => setTrack("全部")}
          >
            全部
          </Button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {filtered.map((lesson, i) => {
            const done = completed.includes(lesson.slug);
            const idx = LESSONS.findIndex((l) => l.slug === lesson.slug);
            return (
              <li key={lesson.slug}>
                <Link
                  to="/lesson/$slug"
                  params={{ slug: lesson.slug }}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3 no-underline transition-colors hover:border-border-strong sm:px-4"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium",
                      done ? "bg-primary text-primary-fg" : "bg-surface-3 text-muted",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-fg">{lesson.title}</span>
                      <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-muted">
                        {lesson.track}
                      </span>
                      <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-muted">
                        {lesson.level}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{lesson.summary}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-subtle">{lesson.minutes}m</span>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted">无匹配课程</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { to: "/hub", icon: LayoutDashboard, label: "学习中心", desc: "打卡与收藏" },
          { to: "/cheatsheet", icon: ClipboardList, label: "速查表", desc: "API 一页通" },
          { to: "/studio", icon: Server, label: "API 工坊", desc: "登录 + CRUD" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-primary/30"
            >
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-semibold text-fg">{item.label}</p>
              <p className="text-xs text-muted">{item.desc}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
