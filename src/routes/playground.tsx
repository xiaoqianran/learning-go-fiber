import { createFileRoute } from "@tanstack/react-router";
import { FiberDemo } from "@/components/demos/FiberDemos";
import type { DemoKind } from "@/data/lessons";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
});

const PRESETS: { kind: DemoKind; label: string }[] = [
  { kind: "hello", label: "Hello" },
  { kind: "routing", label: "路由" },
  { kind: "params", label: "Params" },
  { kind: "query", label: "Query" },
  { kind: "body", label: "Body" },
  { kind: "middleware", label: "中间件" },
  { kind: "jwt", label: "JWT" },
  { kind: "crud", label: "CRUD" },
  { kind: "validate", label: "校验" },
  { kind: "ratelimit", label: "限流" },
];

function PlaygroundPage() {
  const [kind, setKind] = useState<DemoKind>("body");
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-2xl font-semibold text-fg">请求演练场</h1>
      <p className="mt-1 text-sm text-muted">
        在浏览器里模拟 Fiber handler 的输入输出（教学用，非真实 Go 进程）
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.kind}
            type="button"
            onClick={() => setKind(p.kind)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              kind === p.kind
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <FiberDemo kind={kind} title={`演练 · ${PRESETS.find((p) => p.kind === kind)?.label}`} />
      </div>
    </div>
  );
}
