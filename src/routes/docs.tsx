import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS } from "@/data/lessons";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-2xl font-semibold text-fg">文档地图</h1>
      <p className="mt-1 text-sm text-muted">
        本站课程 ↔{" "}
        <a
          href="https://docs.gofiber.io/"
          target="_blank"
          rel="noreferrer"
          className="text-primary no-underline hover:underline"
        >
          docs.gofiber.io
        </a>
      </p>
      <ul className="mt-6 space-y-2">
        {LESSONS.map((l) => (
          <li
            key={l.slug}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div>
              <Link
                to="/lesson/$slug"
                params={{ slug: l.slug }}
                className="text-sm font-medium text-fg no-underline hover:text-primary"
              >
                {l.title}
              </Link>
              <p className="text-[11px] text-muted">
                {l.track} · {l.slug}
              </p>
            </div>
            {l.official ? (
              <a
                href={l.official}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary no-underline"
              >
                官方
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-xs text-subtle">—</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
