import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/cheatsheet")({
  component: CheatsheetPage,
});

const SECTIONS = [
  {
    title: "启动与路由",
    code: `app := fiber.New()
app.Get("/", handler)
app.Post("/users", create)
app.Group("/api", mw)
app.Listen(":3000")`,
  },
  {
    title: "读请求",
    code: `c.Params("id")
c.Query("page", "1")
c.QueryParser(&q)
c.BodyParser(&dto)
c.Get("Authorization")
c.FormFile("file")`,
  },
  {
    title: "写响应",
    code: `c.SendString("ok")
c.JSON(fiber.Map{"ok": true})
c.Status(201).JSON(v)
c.SendStatus(204)
c.Set("X-Request-Id", id)
c.Cookie(&fiber.Cookie{...})`,
  },
  {
    title: "中间件",
    code: `app.Use(recover.New())
app.Use(logger.New())
app.Use(cors.New())
app.Use(limiter.New())
// 自定义
return c.Next()`,
  },
  {
    title: "错误",
    code: `return fiber.NewError(404, "not found")
// Config.ErrorHandler 统一 JSON`,
  },
  {
    title: "测试",
    code: `req := httptest.NewRequest("GET", "/healthz", nil)
resp, err := app.Test(req)`,
  },
];

function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-2xl font-semibold text-fg">Fiber 速查表</h1>
      <p className="mt-1 text-sm text-muted">一页核心 API，复习与面试前扫一眼</p>
      <div className="mt-6 space-y-4">
        {SECTIONS.map((s) => (
          <CodeBlock key={s.title} title={s.title} lang="go" code={s.code} />
        ))}
      </div>
    </div>
  );
}
