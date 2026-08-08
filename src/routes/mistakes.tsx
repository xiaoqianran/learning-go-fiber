import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/store/progress";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/mistakes")({
  component: MistakesPage,
});

function MistakesPage() {
  const wrongBook = useProgress((s) => s.wrongBook);
  const clearWrong = useProgress((s) => s.clearWrong);
  const clearAllWrong = useProgress((s) => s.clearAllWrong);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-fg">错题本</h1>
          <p className="mt-1 text-sm text-muted">测验中答错的题目会收集在这里</p>
        </div>
        {wrongBook.length > 0 ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => clearAllWrong()}>
            <Trash2 className="h-4 w-4" />
            清空
          </Button>
        ) : null}
      </div>
      {wrongBook.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">暂无错题，去课程里做测验吧</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {wrongBook.map((w) => (
            <li key={w.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-fg">{w.question}</p>
              <p className="mt-2 text-xs text-danger">
                你的选择：{w.options[w.wrongChoice] ?? "—"}
              </p>
              <p className="mt-1 text-xs text-primary">正确答案：{w.options[w.answer]}</p>
              <p className="mt-2 text-xs text-muted">{w.explain}</p>
              <div className="mt-3 flex gap-3">
                <Link
                  to="/lesson/$slug"
                  params={{ slug: w.lessonSlug }}
                  className="text-xs text-primary no-underline hover:underline"
                >
                  回看课程
                </Link>
                <button
                  type="button"
                  className="text-xs text-muted hover:text-fg"
                  onClick={() => clearWrong(w.id)}
                >
                  移除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
