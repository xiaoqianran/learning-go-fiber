import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS } from "@/data/lessons";
import { useProgress } from "@/store/progress";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/lab")({
  component: LabPage,
});

const CHALLENGES = [
  {
    title: "写一个 /healthz",
    desc: "GET 返回 200 与 ok 字符串",
    slug: "health-ready",
  },
  {
    title: "带校验的注册接口",
    desc: "email + password min 8，失败 422",
    slug: "validation",
  },
  {
    title: "JWT 保护 /me",
    desc: "无 token 401，有 token 返回 userId",
    slug: "jwt-auth",
  },
  {
    title: "Notes CRUD 全套",
    desc: "列表/创建/更新/删除状态码正确",
    slug: "crud",
  },
];

function LabPage() {
  const completed = useProgress((s) => s.completed);
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-semibold text-fg">练习场</h1>
      </div>
      <p className="mt-1 text-sm text-muted">综合小挑战：先看对应课，再到工坊验证</p>
      <ul className="mt-6 space-y-3">
        {CHALLENGES.map((c) => {
          const done = completed.includes(c.slug);
          const lesson = LESSONS.find((l) => l.slug === c.slug);
          return (
            <li key={c.slug} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-fg">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">{c.desc}</p>
                </div>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-muted">
                  {done ? "相关课已完成" : "待挑战"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {lesson ? (
                  <Link
                    to="/lesson/$slug"
                    params={{ slug: c.slug }}
                    className="text-xs text-primary no-underline hover:underline"
                  >
                    打开课程
                  </Link>
                ) : null}
                <Link to="/studio" className="text-xs text-primary no-underline hover:underline">
                  去工坊
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
