import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS, getLessonsByTrack } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { orderedTracks, trackLabel, progressPercent } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Bookmark, Flame, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/hub")({
  component: HubPage,
});

function HubPage() {
  const completed = useProgress((s) => s.completed);
  const mastered = useProgress((s) => s.mastered);
  const bookmarks = useProgress((s) => s.bookmarks);
  const streak = useProgress((s) => s.streak);
  const checkIns = useProgress((s) => s.checkIns);
  const checkInToday = useProgress((s) => s.checkInToday);
  const reset = useProgress((s) => s.reset);
  const pct = progressPercent(completed);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-2xl font-semibold text-fg">学习中心</h1>
      <p className="mt-1 text-sm text-muted">进度、打卡、收藏与路径概览</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">总进度</p>
          <p className="mt-1 font-display text-2xl font-semibold text-fg">{pct}%</p>
          <p className="text-xs text-muted">
            完成 {completed.length} · 掌握 {mastered.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1 text-xs text-muted">
            <Flame className="h-3.5 w-3.5 text-primary" />
            连续打卡
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-fg">{streak} 天</p>
          <Button type="button" size="sm" className="mt-2" onClick={() => checkInToday()}>
            <CalendarCheck className="h-4 w-4" />
            今日打卡
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1 text-xs text-muted">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            收藏
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-fg">{bookmarks.length}</p>
          <p className="text-xs text-muted">打卡记录 {checkIns.length} 天</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-fg">路径进度</h2>
        <ul className="mt-3 space-y-2">
          {orderedTracks().map((t) => {
            const list = getLessonsByTrack(t);
            const done = list.filter((l) => completed.includes(l.slug)).length;
            const p = list.length ? Math.round((done / list.length) * 100) : 0;
            return (
              <li key={t} className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-fg">{trackLabel(t)}</span>
                  <span className="font-mono text-xs text-muted">
                    {done}/{list.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full bg-primary" style={{ width: `${p}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {bookmarks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-fg">收藏的课</h2>
          <ul className="mt-3 space-y-1">
            {bookmarks.map((slug) => {
              const l = LESSONS.find((x) => x.slug === slug);
              if (!l) return null;
              return (
                <li key={slug}>
                  <Link
                    to="/lesson/$slug"
                    params={{ slug }}
                    className="block rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg no-underline hover:bg-surface-2"
                  >
                    {l.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-10">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (confirm("确定清空本机全部学习进度？")) reset();
          }}
        >
          <RotateCcw className="h-4 w-4" />
          重置进度
        </Button>
      </div>
    </div>
  );
}
