import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getLesson, LESSONS, lessonIndex, type DemoKind } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { CodeBlock } from "@/components/CodeBlock";
import { Quiz } from "@/components/Quiz";
import { FiberDemo } from "@/components/demos/FiberDemos";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lesson/$slug")({
  component: LessonPage,
});

function LessonPage() {
  const { slug } = Route.useParams();
  const lesson = getLesson(slug);
  if (!lesson) throw notFound();

  const idx = lessonIndex(slug);
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

  const markVisited = useProgress((s) => s.markVisited);
  const markComplete = useProgress((s) => s.markComplete);
  const completed = useProgress((s) => s.completed);
  const bookmarks = useProgress((s) => s.bookmarks);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const notes = useProgress((s) => s.notes);
  const setNote = useProgress((s) => s.setNote);
  const [note, setNoteLocal] = useState(notes[slug] ?? "");
  const isDone = completed.includes(slug);
  const isBooked = bookmarks.includes(slug);

  useEffect(() => {
    markVisited(slug);
  }, [slug, markVisited]);

  useEffect(() => {
    setNoteLocal(notes[slug] ?? "");
  }, [slug, notes]);

  return (
    <article className="mx-auto max-w-3xl pb-20">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {lesson.track} · {lesson.level}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />约 {lesson.minutes} 分钟
            </span>
            <span className="font-mono">#{idx + 1}</span>
            {lesson.official ? (
              <a
                href={lesson.official}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary no-underline hover:underline"
              >
                官方文档
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => toggleBookmark(slug)}
          >
            {isBooked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {isBooked ? "已收藏" : "收藏"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isDone ? "secondary" : "default"}
            onClick={() => markComplete(slug)}
          >
            <Check className="h-4 w-4" />
            {isDone ? "已完成" : "标为完成"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {lesson.blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <section key={i} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                {block.title ? (
                  <h2 className="font-display text-base font-semibold text-fg">{block.title}</h2>
                ) : null}
                <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted whitespace-pre-line">
                  {block.body}
                </div>
              </section>
            );
          }
          if (block.type === "code") {
            return (
              <CodeBlock
                key={i}
                title={block.title}
                code={block.code}
                lang={block.lang ?? "go"}
              />
            );
          }
          if (block.type === "tip") {
            return (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm text-fg"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed">{block.body}</p>
              </div>
            );
          }
          if (block.type === "demo") {
            return (
              <FiberDemo
                key={i}
                kind={block.kind as DemoKind}
                title={block.title}
                hint={block.hint}
              />
            );
          }
          if (block.type === "quiz") {
            return (
              <Quiz key={i} slug={slug} questions={block.questions} />
            );
          }
          return null;
        })}
      </div>

      <section className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg">本课笔记</h3>
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg"
          placeholder="记下关键点、易错点…"
          value={note}
          onChange={(e) => setNoteLocal(e.target.value)}
          onBlur={() => setNote(slug, note)}
        />
      </section>

      <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        {prev ? (
          <Link
            to="/lesson/$slug"
            params={{ slug: prev.slug }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg no-underline hover:bg-surface-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/lesson/$slug"
            params={{ slug: next.slug }}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-fg no-underline",
            )}
          >
            {next.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/certificate"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-fg no-underline"
          >
            结业证明
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </article>
  );
}
