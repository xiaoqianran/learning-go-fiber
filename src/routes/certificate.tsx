import { createFileRoute, Link } from "@tanstack/react-router";
import { getCourseLessons } from "@/data/lessons";
import { isCertificateReady, useProgress } from "@/store/progress";
import { Award, ArrowRight } from "lucide-react";
import { getContinueLesson } from "@/lib/nav";

export const Route = createFileRoute("/certificate")({
  component: CertificatePage,
});

function CertificatePage() {
  const completed = useProgress((s) => s.completed);
  const mastered = useProgress((s) => s.mastered);
  const ready = isCertificateReady(mastered, completed);
  const core = getCourseLessons();
  const cont = getContinueLesson(completed);

  if (!ready) {
    const left = core.filter((l) => !completed.includes(l.slug) && !mastered.includes(l.slug));
    return (
      <div className="mx-auto max-w-lg pb-16 text-center">
        <Award className="mx-auto h-12 w-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-fg">结业证明尚未解锁</h1>
        <p className="mt-2 text-sm text-muted">
          完成全部 {core.length} 节主修课（测验交卷即可；≥80% 为掌握）后解锁。
        </p>
        <p className="mt-4 text-sm text-muted">还剩约 {left.length} 课</p>
        <Link
          to="/lesson/$slug"
          params={{ slug: cont.slug }}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg no-underline"
        >
          继续学习
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const date = new Date().toLocaleDateString("zh-CN");
  return (
    <div className="mx-auto max-w-lg pb-16">
      <div className="rounded-2xl border-2 border-primary/40 bg-surface p-8 text-center shadow-soft">
        <Award className="mx-auto h-14 w-14 text-primary" />
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Certificate of Completion
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-fg">Go Fiber 实战学习</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          已完成 {core.length} 节系统课程，涵盖路由、中间件、校验、认证、REST 与工程化。
        </p>
        <p className="mt-6 font-mono text-xs text-subtle">{date} · learning-go-fiber</p>
      </div>
    </div>
  );
}
