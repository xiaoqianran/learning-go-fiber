export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};

export type DemoKind =
  | "hello"
  | "ctx"
  | "config"
  | "static"
  | "routing"
  | "params"
  | "query"
  | "body"
  | "headers"
  | "groups"
  | "middleware"
  | "logger"
  | "cors"
  | "ratelimit"
  | "json"
  | "validate"
  | "upload"
  | "jwt"
  | "cookie"
  | "helmet"
  | "error"
  | "crud"
  | "layer"
  | "page"
  | "health"
  | "env"
  | "test"
  | "deploy"
  | "perf"
  | "ws";

export type LessonBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "code"; title?: string; lang?: string; code: string }
  | { type: "tip"; body: string }
  | { type: "demo"; kind: DemoKind; title: string; hint?: string }
  | { type: "quiz"; questions: QuizQuestion[] };

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: "入门" | "进阶" | "实战";
  track: "基础" | "路由与请求" | "中间件" | "数据与校验" | "认证与安全" | "实战 API" | "工程化";
  format?: "course" | "reference";
  minutes: number;
  official?: string;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    "slug": "intro",
    "title": "Fiber 是什么",
    "summary": "Go 里的 Express 风格 Web 框架。",
    "level": "入门",
    "track": "基础",
    "minutes": 6,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "为什么选 Fiber",
        "body": "Fiber 基于 Fasthttp，API 风格接近 Express。适合写 REST API、微服务网关、轻量后台。核心是 app := fiber.New() 然后 app.Get/Post… 最后 app.Listen。\n\n本站用「讲解 → 对应 Go 源码 → 请求演练 Demo → 测验」的方式学：源码里的 handler 就是 Demo 里会响的逻辑。"
      },
      {
        "type": "code",
        "title": "对应源码 · Hello Fiber",
        "lang": "go",
        "code": "package main\n\nimport (\n  \"log\"\n  \"github.com/gofiber/fiber/v2\"\n)\n\nfunc main() {\n  app := fiber.New()\n\n  app.Get(\"/\", func(c *fiber.Ctx) error {\n    return c.SendString(\"Hello, Fiber!\")\n  })\n\n  log.Fatal(app.Listen(\":3000\"))\n}"
      },
      {
        "type": "demo",
        "kind": "hello",
        "title": "动手：Hello 请求"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "i1",
            "question": "Fiber 底层默认基于？",
            "options": [
              "net/http",
              "Fasthttp",
              "Gin",
              "net/rpc"
            ],
            "answer": 1,
            "explain": "Fiber v2 基于 valyala/fasthttp。"
          },
          {
            "id": "i2",
            "question": "启动服务用哪个方法？",
            "options": [
              "app.Run",
              "app.Listen",
              "app.ServeHTTP",
              "app.Start"
            ],
            "answer": 1,
            "explain": "app.Listen(\":port\")。"
          }
        ]
      }
    ]
  },
  {
    "slug": "ctx",
    "title": "上下文 Ctx",
    "summary": "请求/响应都通过 *fiber.Ctx。",
    "level": "入门",
    "track": "基础",
    "minutes": 8,
    "official": "https://docs.gofiber.io/api/ctx",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "*fiber.Ctx",
        "body": "每个 handler 签名是 func(c *fiber.Ctx) error。c 同时封装请求（Method、Path、Query、Body）和响应（Status、JSON、Send）。返回 error 可交给 ErrorHandler。\n\n记住：读请求用 c.Query / c.Params / c.BodyParser；写响应用 c.JSON / c.SendString / c.Status。"
      },
      {
        "type": "code",
        "title": "对应源码 · 读请求写响应",
        "lang": "go",
        "code": "app.Get(\"/ping\", func(c *fiber.Ctx) error {\n  name := c.Query(\"name\", \"world\")\n  return c.JSON(fiber.Map{\n    \"message\": \"pong\",\n    \"hello\":   name,\n  })\n})"
      },
      {
        "type": "demo",
        "kind": "ctx",
        "title": "动手：Ctx Query"
      },
      {
        "type": "tip",
        "body": "handler 返回 nil 表示成功；返回 error 走错误处理链。不要在 handler 里 panic，除非有 Recover 中间件。"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "c1",
            "question": "handler 签名返回值？",
            "options": [
              "void",
              "error",
              "string",
              "int"
            ],
            "answer": 1,
            "explain": "func(*fiber.Ctx) error"
          },
          {
            "id": "c2",
            "question": "JSON 响应常用？",
            "options": [
              "c.WriteJSON",
              "c.JSON",
              "json.NewEncoder",
              "c.RenderJSON"
            ],
            "answer": 1,
            "explain": "c.JSON(v)"
          }
        ]
      }
    ]
  },
  {
    "slug": "app-config",
    "title": "App 配置",
    "summary": "fiber.Config 调超时、错误处理、大小限制。",
    "level": "入门",
    "track": "基础",
    "minutes": 7,
    "official": "https://docs.gofiber.io/api/fiber#config",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "fiber.New(Config{})",
        "body": "生产环境务必显式配置：ReadTimeout / WriteTimeout、BodyLimit、ErrorHandler、DisableStartupMessage。Prefork 可开多进程，但注意有状态中间件。"
      },
      {
        "type": "code",
        "title": "对应源码 · 生产向配置",
        "lang": "go",
        "code": "app := fiber.New(fiber.Config{\n  AppName:      \"learning-go-fiber\",\n  BodyLimit:    4 * 1024 * 1024,\n  ReadTimeout:  10 * time.Second,\n  WriteTimeout: 10 * time.Second,\n  ErrorHandler: func(c *fiber.Ctx, err error) error {\n    code := fiber.StatusInternalServerError\n    if e, ok := err.(*fiber.Error); ok {\n      code = e.Code\n    }\n    return c.Status(code).JSON(fiber.Map{\"error\": err.Error()})\n  },\n})"
      },
      {
        "type": "demo",
        "kind": "config",
        "title": "动手：错误响应"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "a1",
            "question": "限制请求体大小用？",
            "options": [
              "MaxBody",
              "BodyLimit",
              "Limit",
              "MaxBytes"
            ],
            "answer": 1,
            "explain": "Config.BodyLimit"
          },
          {
            "id": "a2",
            "question": "业务错误推荐返回？",
            "options": [
              "panic",
              "fiber.NewError",
              "os.Exit",
              "nil"
            ],
            "answer": 1,
            "explain": "fiber.NewError(code, msg)"
          }
        ]
      }
    ]
  },
  {
    "slug": "static",
    "title": "静态文件",
    "summary": "app.Static 托管前端与资源。",
    "level": "入门",
    "track": "基础",
    "minutes": 5,
    "official": "https://docs.gofiber.io/api/app#static",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "托管静态资源",
        "body": "单页应用常见：API 挂 /api，静态挂 /，最后 Fallback 到 index.html。注意路径穿越与缓存头。"
      },
      {
        "type": "code",
        "title": "对应源码 · Static + SPA",
        "lang": "go",
        "code": "app.Static(\"/\", \"./public\", fiber.Static{\n  Compress:      true,\n  CacheDuration: 24 * time.Hour,\n})\n\n// SPA fallback\napp.Get(\"/*\", func(c *fiber.Ctx) error {\n  return c.SendFile(\"./public/index.html\")\n})"
      },
      {
        "type": "demo",
        "kind": "static",
        "title": "动手：静态路径"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "s1",
            "question": "托管目录用？",
            "options": [
              "app.File",
              "app.Static",
              "app.Dir",
              "app.Public"
            ],
            "answer": 1,
            "explain": "app.Static(prefix, root)"
          }
        ]
      }
    ]
  },
  {
    "slug": "routing",
    "title": "路由基础",
    "summary": "Get/Post/Put/Patch/Delete 与路由顺序。",
    "level": "入门",
    "track": "路由与请求",
    "minutes": 8,
    "official": "https://docs.gofiber.io/guide/routing",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "注册路由",
        "body": "方法绑定：app.Get、Post、Put、Patch、Delete、All、Use。路由按注册顺序匹配；更具体的路径要写在通配/参数路由前面。\n\napp.All 匹配所有方法；app.Use 注册中间件或前缀挂载。"
      },
      {
        "type": "code",
        "title": "对应源码 · 多方法",
        "lang": "go",
        "code": "app.Get(\"/health\", health)\napp.Post(\"/users\", createUser)\napp.Put(\"/users/:id\", updateUser)\napp.Delete(\"/users/:id\", deleteUser)\napp.All(\"/echo\", echo)"
      },
      {
        "type": "demo",
        "kind": "routing",
        "title": "动手：方法与路径"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "r1",
            "question": "匹配所有 HTTP 方法？",
            "options": [
              "app.Any",
              "app.All",
              "app.Every",
              "app.Use"
            ],
            "answer": 1,
            "explain": "app.All"
          },
          {
            "id": "r2",
            "question": "路由匹配顺序？",
            "options": [
              "随机",
              "注册顺序",
              "字母序",
              "长度"
            ],
            "answer": 1,
            "explain": "先注册先匹配"
          }
        ]
      }
    ]
  },
  {
    "slug": "params",
    "title": "路径参数",
    "summary": "c.Params 读取 :id 与通配。",
    "level": "入门",
    "track": "路由与请求",
    "minutes": 7,
    "official": "https://docs.gofiber.io/guide/routing#parameters",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "参数路由",
        "body": ":name 是必填段；* 是通配。c.Params(\"id\") 取字符串，c.ParamsInt 可转 int。可选参数用 ? 语法（版本相关，注意文档）。"
      },
      {
        "type": "code",
        "title": "对应源码 · Params",
        "lang": "go",
        "code": "app.Get(\"/users/:id\", func(c *fiber.Ctx) error {\n  id := c.Params(\"id\")\n  return c.JSON(fiber.Map{\"id\": id})\n})\n\napp.Get(\"/files/*\", func(c *fiber.Ctx) error {\n  path := c.Params(\"*\")\n  return c.SendString(\"file: \" + path)\n})"
      },
      {
        "type": "demo",
        "kind": "params",
        "title": "动手：路径参数"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "p1",
            "question": "取路径参数？",
            "options": [
              "c.Param",
              "c.Params",
              "c.Path",
              "c.Var"
            ],
            "answer": 1,
            "explain": "c.Params(\"id\")"
          }
        ]
      }
    ]
  },
  {
    "slug": "query",
    "title": "Query 查询串",
    "summary": "c.Query / QueryParser。",
    "level": "入门",
    "track": "路由与请求",
    "minutes": 6,
    "official": "https://docs.gofiber.io/api/ctx#query",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "查询参数",
        "body": "c.Query(\"page\", \"1\") 带默认值。批量绑定结构体用 c.QueryParser(&q)。适合分页、筛选、排序。"
      },
      {
        "type": "code",
        "title": "对应源码 · QueryParser",
        "lang": "go",
        "code": "type ListQuery struct {\n  Page  int    `query:\"page\"`\n  Limit int    `query:\"limit\"`\n  Q     string `query:\"q\"`\n}\n\napp.Get(\"/items\", func(c *fiber.Ctx) error {\n  var q ListQuery\n  if err := c.QueryParser(&q); err != nil {\n    return fiber.NewError(fiber.StatusBadRequest, err.Error())\n  }\n  if q.Page < 1 { q.Page = 1 }\n  if q.Limit < 1 { q.Limit = 20 }\n  return c.JSON(q)\n})"
      },
      {
        "type": "demo",
        "kind": "query",
        "title": "动手：Query"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "q1",
            "question": "绑定 query 到结构体？",
            "options": [
              "c.Bind",
              "c.QueryParser",
              "c.ParseQuery",
              "json.Unmarshal"
            ],
            "answer": 1,
            "explain": "QueryParser"
          }
        ]
      }
    ]
  },
  {
    "slug": "body",
    "title": "请求体 Body",
    "summary": "BodyParser 解析 JSON / form。",
    "level": "入门",
    "track": "路由与请求",
    "minutes": 8,
    "official": "https://docs.gofiber.io/api/ctx#bodyparser",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "BodyParser",
        "body": "c.BodyParser(&dto) 按 Content-Type 解析 JSON、表单等。务必校验必填字段；失败返回 400。大文件别整包读进内存，用流式/表单文件 API。"
      },
      {
        "type": "code",
        "title": "对应源码 · JSON Body",
        "lang": "go",
        "code": "type CreateUser struct {\n  Email string `json:\"email\"`\n  Name  string `json:\"name\"`\n}\n\napp.Post(\"/users\", func(c *fiber.Ctx) error {\n  var in CreateUser\n  if err := c.BodyParser(&in); err != nil {\n    return fiber.NewError(400, \"invalid json\")\n  }\n  if in.Email == \"\" {\n    return fiber.NewError(400, \"email required\")\n  }\n  return c.Status(201).JSON(fiber.Map{\n    \"id\": \"u_1\", \"email\": in.Email, \"name\": in.Name,\n  })\n})"
      },
      {
        "type": "demo",
        "kind": "body",
        "title": "动手：POST JSON"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "b1",
            "question": "解析 JSON body？",
            "options": [
              "c.JSON",
              "c.BodyParser",
              "c.ReadJSON",
              "c.Decode"
            ],
            "answer": 1,
            "explain": "BodyParser"
          },
          {
            "id": "b2",
            "question": "创建成功常见状态码？",
            "options": [
              "200",
              "201",
              "204",
              "302"
            ],
            "answer": 1,
            "explain": "201 Created"
          }
        ]
      }
    ]
  },
  {
    "slug": "headers",
    "title": "请求头与响应头",
    "summary": "Get / Set / Vary。",
    "level": "入门",
    "track": "路由与请求",
    "minutes": 5,
    "official": "https://docs.gofiber.io/api/ctx#get",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "Headers",
        "body": "读：c.Get(\"Authorization\")；写：c.Set(\"X-Request-Id\", id)。CORS、缓存、内容类型都靠头。"
      },
      {
        "type": "code",
        "title": "对应源码 · Header",
        "lang": "go",
        "code": "app.Get(\"/whoami\", func(c *fiber.Ctx) error {\n  ua := c.Get(\"User-Agent\")\n  c.Set(\"X-Powered-By\", \"Fiber\")\n  return c.JSON(fiber.Map{\"ua\": ua})\n})"
      },
      {
        "type": "demo",
        "kind": "headers",
        "title": "动手：Headers"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "h1",
            "question": "读请求头用？",
            "options": [
              "c.Header",
              "c.Get",
              "c.RequestHeader",
              "c.HeaderGet"
            ],
            "answer": 1,
            "explain": "c.Get(key)"
          }
        ]
      }
    ]
  },
  {
    "slug": "groups",
    "title": "路由分组",
    "summary": "Group 前缀与挂中间件。",
    "level": "进阶",
    "track": "路由与请求",
    "minutes": 7,
    "official": "https://docs.gofiber.io/guide/grouping",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "app.Group",
        "body": "把 /api/v1 抽成组，组上挂鉴权中间件。子路由路径会拼前缀。嵌套 Group 做版本与资源分层。"
      },
      {
        "type": "code",
        "title": "对应源码 · Group",
        "lang": "go",
        "code": "api := app.Group(\"/api/v1\")\napi.Get(\"/health\", health)\n\nadmin := api.Group(\"/admin\", authMiddleware)\nadmin.Get(\"/stats\", stats)\nadmin.Delete(\"/users/:id\", banUser)"
      },
      {
        "type": "demo",
        "kind": "groups",
        "title": "动手：分组路径"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "g1",
            "question": "路由组方法？",
            "options": [
              "app.Mount",
              "app.Group",
              "app.Prefix",
              "app.Router"
            ],
            "answer": 1,
            "explain": "Group"
          }
        ]
      }
    ]
  },
  {
    "slug": "middleware-intro",
    "title": "中间件入门",
    "summary": "Use 与 next 链式调用。",
    "level": "入门",
    "track": "中间件",
    "minutes": 8,
    "official": "https://docs.gofiber.io/guide/middleware",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "中间件是什么",
        "body": "中间件是 func(c *fiber.Ctx) error，在 handler 前后执行。调用 c.Next() 进入下一环；不调用则短路。顺序：先注册的外层先执行。"
      },
      {
        "type": "code",
        "title": "对应源码 · 自定义中间件",
        "lang": "go",
        "code": "func RequestID() fiber.Handler {\n  return func(c *fiber.Ctx) error {\n    id := c.Get(\"X-Request-Id\")\n    if id == \"\" {\n      id = uuid.NewString()\n    }\n    c.Set(\"X-Request-Id\", id)\n    c.Locals(\"requestId\", id)\n    return c.Next()\n  }\n}\n\napp.Use(RequestID())"
      },
      {
        "type": "demo",
        "kind": "middleware",
        "title": "动手：中间件链"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "m1",
            "question": "进入下一中间件？",
            "options": [
              "c.Continue()",
              "c.Next()",
              "next()",
              "c.Pass()"
            ],
            "answer": 1,
            "explain": "c.Next()"
          },
          {
            "id": "m2",
            "question": "跨 handler 存值？",
            "options": [
              "c.Set",
              "c.Locals",
              "global var",
              "c.Cookie"
            ],
            "answer": 1,
            "explain": "c.Locals"
          }
        ]
      }
    ]
  },
  {
    "slug": "logger-recover",
    "title": "Logger 与 Recover",
    "summary": "日志与 panic 恢复。",
    "level": "入门",
    "track": "中间件",
    "minutes": 6,
    "official": "https://docs.gofiber.io/middleware/logger",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "必备中间件",
        "body": "生产几乎总要：recover.New() 防 panic 打挂进程；logger.New() 打访问日志。Recover 要靠前注册。"
      },
      {
        "type": "code",
        "title": "对应源码 · Logger + Recover",
        "lang": "go",
        "code": "import (\n  \"github.com/gofiber/fiber/v2/middleware/logger\"\n  \"github.com/gofiber/fiber/v2/middleware/recover\"\n)\n\napp.Use(recover.New())\napp.Use(logger.New(logger.Config{\n  Format: \"[${time}] ${status} ${method} ${path} ${latency}\\n\",\n}))"
      },
      {
        "type": "demo",
        "kind": "logger",
        "title": "动手：访问日志"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "lr1",
            "question": "panic 恢复中间件？",
            "options": [
              "catch",
              "recover",
              "safe",
              "guard"
            ],
            "answer": 1,
            "explain": "middleware/recover"
          }
        ]
      }
    ]
  },
  {
    "slug": "cors",
    "title": "CORS",
    "summary": "跨域资源共享配置。",
    "level": "入门",
    "track": "中间件",
    "minutes": 6,
    "official": "https://docs.gofiber.io/middleware/cors",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "cors.New",
        "body": "浏览器跨域会发预检 OPTIONS。AllowOrigins 不要用 * 配 Credentials。按环境拆配置。"
      },
      {
        "type": "code",
        "title": "对应源码 · CORS",
        "lang": "go",
        "code": "import \"github.com/gofiber/fiber/v2/middleware/cors\"\n\napp.Use(cors.New(cors.Config{\n  AllowOrigins:     \"https://app.example.com\",\n  AllowMethods:     \"GET,POST,PUT,DELETE,OPTIONS\",\n  AllowHeaders:     \"Origin,Content-Type,Authorization\",\n  AllowCredentials: true,\n}))"
      },
      {
        "type": "demo",
        "kind": "cors",
        "title": "动手：CORS 头"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "co1",
            "question": "带 Cookie 的跨域能用 AllowOrigins=* 吗？",
            "options": [
              "能",
              "不能",
              "仅 GET 能",
              "仅同站"
            ],
            "answer": 1,
            "explain": "Credentials 时不能 *"
          }
        ]
      }
    ]
  },
  {
    "slug": "rate-limit",
    "title": "限流",
    "summary": "limiter 防刷。",
    "level": "进阶",
    "track": "中间件",
    "minutes": 6,
    "official": "https://docs.gofiber.io/middleware/limiter",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "limiter",
        "body": "按 IP 或用户 ID 限速。Max + Expiration 是滑动/固定窗口配置。超限返回 429。登录接口更该单独收紧。"
      },
      {
        "type": "code",
        "title": "对应源码 · Limiter",
        "lang": "go",
        "code": "import \"github.com/gofiber/fiber/v2/middleware/limiter\"\n\napp.Use(limiter.New(limiter.Config{\n  Max:        60,\n  Expiration: 1 * time.Minute,\n  KeyGenerator: func(c *fiber.Ctx) string {\n    return c.IP()\n  },\n}))"
      },
      {
        "type": "demo",
        "kind": "ratelimit",
        "title": "动手：429"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "rl1",
            "question": "超限状态码？",
            "options": [
              "400",
              "401",
              "403",
              "429"
            ],
            "answer": 3,
            "explain": "Too Many Requests"
          }
        ]
      }
    ]
  },
  {
    "slug": "json-response",
    "title": "统一 JSON 响应",
    "summary": "设计 API 信封与状态码。",
    "level": "进阶",
    "track": "数据与校验",
    "minutes": 7,
    "official": "https://docs.gofiber.io/api/ctx#json",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "响应约定",
        "body": "推荐统一：{ \"data\": ..., \"error\": null } 或 { \"code\", \"message\", \"data\" }。列表带 page/total。错误只暴露安全信息。"
      },
      {
        "type": "code",
        "title": "对应源码 · 信封",
        "lang": "go",
        "code": "type Envelope struct {\n  Code    int         `json:\"code\"`\n  Message string      `json:\"message\"`\n  Data    interface{} `json:\"data,omitempty\"`\n}\n\nfunc OK(c *fiber.Ctx, data interface{}) error {\n  return c.JSON(Envelope{Code: 0, Message: \"ok\", Data: data})\n}\n\nfunc Fail(c *fiber.Ctx, httpStatus int, msg string) error {\n  return c.Status(httpStatus).JSON(Envelope{Code: httpStatus, Message: msg})\n}"
      },
      {
        "type": "demo",
        "kind": "json",
        "title": "动手：JSON 信封"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "j1",
            "question": "无内容成功可用？",
            "options": [
              "200 body null",
              "204 No Content",
              "201 empty",
              "202 only"
            ],
            "answer": 1,
            "explain": "DELETE 常用 204"
          }
        ]
      }
    ]
  },
  {
    "slug": "validation",
    "title": "输入校验",
    "summary": "go-playground/validator 或手写。",
    "level": "进阶",
    "track": "数据与校验",
    "minutes": 8,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "校验策略",
        "body": "BodyParser 只做反序列化，不等于校验。用 validator tag 或显式 if。失败返回 422/400 与字段级错误。"
      },
      {
        "type": "code",
        "title": "对应源码 · validator",
        "lang": "go",
        "code": "type RegisterDTO struct {\n  Email    string `json:\"email\" validate:\"required,email\"`\n  Password string `json:\"password\" validate:\"required,min=8\"`\n}\n\nvar validate = validator.New()\n\napp.Post(\"/register\", func(c *fiber.Ctx) error {\n  var in RegisterDTO\n  if err := c.BodyParser(&in); err != nil {\n    return fiber.NewError(400, \"bad json\")\n  }\n  if err := validate.Struct(in); err != nil {\n    return c.Status(422).JSON(fiber.Map{\"error\": err.Error()})\n  }\n  return c.SendStatus(201)\n})"
      },
      {
        "type": "demo",
        "kind": "validate",
        "title": "动手：校验失败"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "v1",
            "question": "字段校验失败常见？",
            "options": [
              "500",
              "422 或 400",
              "204",
              "301"
            ],
            "answer": 1,
            "explain": "客户端错误"
          }
        ]
      }
    ]
  },
  {
    "slug": "upload",
    "title": "文件上传",
    "summary": "FormFile 与 SaveFile。",
    "level": "进阶",
    "track": "数据与校验",
    "minutes": 7,
    "official": "https://docs.gofiber.io/api/ctx#formfile",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "multipart",
        "body": "c.FormFile(\"file\") 取头；c.SaveFile 落盘。限制扩展名、MIME、大小。生产用对象存储更佳。"
      },
      {
        "type": "code",
        "title": "对应源码 · 上传",
        "lang": "go",
        "code": "app.Post(\"/upload\", func(c *fiber.Ctx) error {\n  file, err := c.FormFile(\"file\")\n  if err != nil {\n    return fiber.NewError(400, \"file required\")\n  }\n  if file.Size > 5*1024*1024 {\n    return fiber.NewError(400, \"too large\")\n  }\n  path := \"./uploads/\" + file.Filename\n  if err := c.SaveFile(file, path); err != nil {\n    return err\n  }\n  return c.JSON(fiber.Map{\"path\": path, \"size\": file.Size})\n})"
      },
      {
        "type": "demo",
        "kind": "upload",
        "title": "动手：上传元信息"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "u1",
            "question": "取上传文件？",
            "options": [
              "c.File",
              "c.FormFile",
              "c.Upload",
              "c.Multipart"
            ],
            "answer": 1,
            "explain": "FormFile"
          }
        ]
      }
    ]
  },
  {
    "slug": "jwt-auth",
    "title": "JWT 认证",
    "summary": "签发与中间件校验。",
    "level": "进阶",
    "track": "认证与安全",
    "minutes": 10,
    "official": "https://docs.gofiber.io/contrib/jwt",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "Bearer JWT",
        "body": "登录签发 token；受保护路由校验 Authorization: Bearer ...。密钥放环境变量。注意过期、刷新与吊销策略。"
      },
      {
        "type": "code",
        "title": "对应源码 · 简化 JWT 流程",
        "lang": "go",
        "code": "// 登录\napp.Post(\"/auth/login\", func(c *fiber.Ctx) error {\n  // 校验账号密码...\n  token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{\n    \"sub\": \"user_1\",\n    \"exp\": time.Now().Add(2 * time.Hour).Unix(),\n  })\n  s, _ := token.SignedString([]byte(os.Getenv(\"JWT_SECRET\")))\n  return c.JSON(fiber.Map{\"token\": s})\n})\n\n// 受保护\napp.Get(\"/me\", jwtMiddleware, func(c *fiber.Ctx) error {\n  return c.JSON(fiber.Map{\"userId\": c.Locals(\"userId\")})\n})"
      },
      {
        "type": "demo",
        "kind": "jwt",
        "title": "动手：Bearer 流程"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "jw1",
            "question": "JWT 常放在？",
            "options": [
              "Cookie only",
              "Authorization Bearer",
              "URL 永久",
              "HTML"
            ],
            "answer": 1,
            "explain": "Authorization: Bearer"
          },
          {
            "id": "jw2",
            "question": "未登录应返回？",
            "options": [
              "200",
              "401",
              "404",
              "500"
            ],
            "answer": 1,
            "explain": "Unauthorized"
          }
        ]
      }
    ]
  },
  {
    "slug": "session-cookie",
    "title": "Session 与 Cookie",
    "summary": "有状态会话。",
    "level": "进阶",
    "track": "认证与安全",
    "minutes": 7,
    "official": "https://docs.gofiber.io/middleware/session",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "session 中间件",
        "body": "适合服务端会话。Cookie 设 HttpOnly、Secure、SameSite。分布式部署要共享存储（Redis）。"
      },
      {
        "type": "code",
        "title": "对应源码 · Cookie",
        "lang": "go",
        "code": "app.Post(\"/login\", func(c *fiber.Ctx) error {\n  c.Cookie(&fiber.Cookie{\n    Name:     \"sid\",\n    Value:    sessionID,\n    HTTPOnly: true,\n    Secure:   true,\n    SameSite: \"Lax\",\n    MaxAge:   86400,\n  })\n  return c.SendStatus(204)\n})"
      },
      {
        "type": "demo",
        "kind": "cookie",
        "title": "动手：Set-Cookie"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "sc1",
            "question": "防 XSS 读 Cookie 应开？",
            "options": [
              "Secure",
              "HttpOnly",
              "Domain",
              "Path"
            ],
            "answer": 1,
            "explain": "HttpOnly"
          }
        ]
      }
    ]
  },
  {
    "slug": "security-headers",
    "title": "安全头 Helmet",
    "summary": "默认安全响应头。",
    "level": "进阶",
    "track": "认证与安全",
    "minutes": 5,
    "official": "https://docs.gofiber.io/middleware/helmet",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "helmet",
        "body": "一键加 X-Content-Type-Options、X-Frame-Options、CSP 等。按前端需求调 CSP，别盲目复制。"
      },
      {
        "type": "code",
        "title": "对应源码 · Helmet",
        "lang": "go",
        "code": "import \"github.com/gofiber/fiber/v2/middleware/helmet\"\n\napp.Use(helmet.New())"
      },
      {
        "type": "demo",
        "kind": "helmet",
        "title": "动手：安全头"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "he1",
            "question": "防 MIME 嗅探头？",
            "options": [
              "X-Frame-Options",
              "X-Content-Type-Options: nosniff",
              "CORS",
              "ETag"
            ],
            "answer": 1,
            "explain": "nosniff"
          }
        ]
      }
    ]
  },
  {
    "slug": "error-handling",
    "title": "错误处理",
    "summary": "fiber.Error 与 ErrorHandler。",
    "level": "进阶",
    "track": "认证与安全",
    "minutes": 8,
    "official": "https://docs.gofiber.io/guide/error-handling",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "统一错误",
        "body": "业务里 return fiber.NewError(404, \"not found\")。自定义 ErrorHandler 映射状态码与 JSON。区分可暴露消息与内部日志。"
      },
      {
        "type": "code",
        "title": "对应源码 · NewError",
        "lang": "go",
        "code": "app.Get(\"/items/:id\", func(c *fiber.Ctx) error {\n  item := find(c.Params(\"id\"))\n  if item == nil {\n    return fiber.NewError(fiber.StatusNotFound, \"item not found\")\n  }\n  return c.JSON(item)\n})"
      },
      {
        "type": "demo",
        "kind": "error",
        "title": "动手：404/500"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "e1",
            "question": "创建 Fiber 错误？",
            "options": [
              "errors.New only",
              "fiber.NewError",
              "fmt.Errorf only",
              "panic"
            ],
            "answer": 1,
            "explain": "带状态码"
          }
        ]
      }
    ]
  },
  {
    "slug": "crud",
    "title": "REST CRUD",
    "summary": "资源标准动词与路径。",
    "level": "实战",
    "track": "实战 API",
    "minutes": 10,
    "official": "https://docs.gofiber.io/guide/routing",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "资源设计",
        "body": "GET 集合/单资源，POST 创建，PUT/PATCH 更新，DELETE 删除。幂等语义要清楚。ID 放路径，过滤放 query。"
      },
      {
        "type": "code",
        "title": "对应源码 · Notes CRUD",
        "lang": "go",
        "code": "notes := app.Group(\"/api/notes\", auth)\n\nnotes.Get(\"/\", listNotes)\nnotes.Post(\"/\", createNote)\nnotes.Get(\"/:id\", getNote)\nnotes.Put(\"/:id\", updateNote)\nnotes.Delete(\"/:id\", deleteNote)"
      },
      {
        "type": "demo",
        "kind": "crud",
        "title": "动手：CRUD 状态码"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "cr1",
            "question": "更新部分字段更合适？",
            "options": [
              "POST",
              "PATCH",
              "GET",
              "HEAD"
            ],
            "answer": 1,
            "explain": "PATCH"
          },
          {
            "id": "cr2",
            "question": "删除成功常返回？",
            "options": [
              "200/204",
              "201",
              "301",
              "100"
            ],
            "answer": 0,
            "explain": "200 或 204"
          }
        ]
      }
    ]
  },
  {
    "slug": "layering",
    "title": "项目分层",
    "summary": "handler / service / repo。",
    "level": "实战",
    "track": "实战 API",
    "minutes": 8,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "别把 SQL 写进 handler",
        "body": "Handler 只做 HTTP：解析、校验、调 service、写响应。Service 业务规则。Repo 访问 DB。便于测试与替换实现。"
      },
      {
        "type": "code",
        "title": "对应源码 · 分层骨架",
        "lang": "go",
        "code": "type NoteHandler struct{ svc *NoteService }\n\nfunc (h *NoteHandler) Create(c *fiber.Ctx) error {\n  var in CreateNoteDTO\n  if err := c.BodyParser(&in); err != nil {\n    return fiber.NewError(400, \"bad json\")\n  }\n  note, err := h.svc.Create(c.Context(), userID(c), in)\n  if err != nil {\n    return err\n  }\n  return c.Status(201).JSON(note)\n}"
      },
      {
        "type": "demo",
        "kind": "layer",
        "title": "动手：调用链"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "ly1",
            "question": "HTTP 解析应在？",
            "options": [
              "repo",
              "handler",
              "SQL 触发器",
              "nginx only"
            ],
            "answer": 1,
            "explain": "handler 层"
          }
        ]
      }
    ]
  },
  {
    "slug": "pagination",
    "title": "分页与过滤",
    "summary": "page/limit/cursor。",
    "level": "实战",
    "track": "实战 API",
    "minutes": 7,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "列表 API",
        "body": "offset 分页简单；大数据用 cursor。始终设 max limit。返回 total 或 next_cursor。"
      },
      {
        "type": "code",
        "title": "对应源码 · 分页",
        "lang": "go",
        "code": "type Page struct {\n  Items []Note `json:\"items\"`\n  Page  int    `json:\"page\"`\n  Limit int    `json:\"limit\"`\n  Total int    `json:\"total\"`\n}\n\nfunc listNotes(c *fiber.Ctx) error {\n  page := c.QueryInt(\"page\", 1)\n  limit := c.QueryInt(\"limit\", 20)\n  if limit > 100 { limit = 100 }\n  // query db...\n  return c.JSON(Page{Items: items, Page: page, Limit: limit, Total: total})\n}"
      },
      {
        "type": "demo",
        "kind": "page",
        "title": "动手：分页参数"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "pg1",
            "question": "limit 为什么要设上限？",
            "options": [
              "好看",
              "防拖垮 DB/带宽",
              "HTTP 规定",
              "Fiber 强制"
            ],
            "answer": 1,
            "explain": "保护后端"
          }
        ]
      }
    ]
  },
  {
    "slug": "health-ready",
    "title": "健康检查",
    "summary": "liveness / readiness。",
    "level": "实战",
    "track": "实战 API",
    "minutes": 5,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "探针",
        "body": "/healthz 存活；/readyz 依赖（DB/Redis）就绪。K8s 据此重启或摘流。"
      },
      {
        "type": "code",
        "title": "对应源码 · Health",
        "lang": "go",
        "code": "app.Get(\"/healthz\", func(c *fiber.Ctx) error {\n  return c.SendString(\"ok\")\n})\n\napp.Get(\"/readyz\", func(c *fiber.Ctx) error {\n  if err := db.Ping(); err != nil {\n    return c.Status(503).JSON(fiber.Map{\"ready\": false})\n  }\n  return c.JSON(fiber.Map{\"ready\": true})\n})"
      },
      {
        "type": "demo",
        "kind": "health",
        "title": "动手：探针"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "hz1",
            "question": "依赖未就绪返回？",
            "options": [
              "200",
              "503",
              "401",
              "301"
            ],
            "answer": 1,
            "explain": "Service Unavailable"
          }
        ]
      }
    ]
  },
  {
    "slug": "config-env",
    "title": "配置与环境变量",
    "summary": "12-factor：配置外置。",
    "level": "进阶",
    "track": "工程化",
    "minutes": 6,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "配置",
        "body": "端口、DB URL、JWT 密钥从环境读取。用 cleanenv/viper 或标准 os.Getenv。禁止把密钥提交进仓库。"
      },
      {
        "type": "code",
        "title": "对应源码 · Env",
        "lang": "go",
        "code": "port := os.Getenv(\"PORT\")\nif port == \"\" {\n  port = \"3000\"\n}\nlog.Fatal(app.Listen(\":\" + port))"
      },
      {
        "type": "demo",
        "kind": "env",
        "title": "动手：默认端口"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "cf1",
            "question": "密钥应放？",
            "options": [
              "源码常量",
              "环境变量/密钥管理",
              "README",
              "前端"
            ],
            "answer": 1,
            "explain": "环境或密钥服务"
          }
        ]
      }
    ]
  },
  {
    "slug": "testing",
    "title": "Handler 测试",
    "summary": "app.Test 发请求。",
    "level": "进阶",
    "track": "工程化",
    "minutes": 8,
    "official": "https://docs.gofiber.io/api/app#test",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "app.Test",
        "body": "无需真监听端口：构造 httptest.NewRequest，app.Test(req) 拿响应。表驱动测状态码与 body。"
      },
      {
        "type": "code",
        "title": "对应源码 · 测试",
        "lang": "go",
        "code": "func TestHealth(t *testing.T) {\n  app := setupApp()\n  req := httptest.NewRequest(\"GET\", \"/healthz\", nil)\n  resp, err := app.Test(req)\n  if err != nil { t.Fatal(err) }\n  if resp.StatusCode != 200 {\n    t.Fatalf(\"got %d\", resp.StatusCode)\n  }\n}"
      },
      {
        "type": "demo",
        "kind": "test",
        "title": "动手：断言状态码"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "t1",
            "question": "不监听端口测 handler？",
            "options": [
              "curl only",
              "app.Test",
              "selenium",
              "ab"
            ],
            "answer": 1,
            "explain": "app.Test"
          }
        ]
      }
    ]
  },
  {
    "slug": "deploy",
    "title": "部署要点",
    "summary": "二进制、反向代理、优雅退出。",
    "level": "进阶",
    "track": "工程化",
    "minutes": 7,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "上线清单",
        "body": "CGO_ENABLED=0 交叉编译；前置 Nginx/Caddy；配 Read/WriteTimeout；监听 SIGTERM 优雅关闭；指标与日志。"
      },
      {
        "type": "code",
        "title": "对应源码 · 优雅退出",
        "lang": "go",
        "code": "go func() {\n  if err := app.Listen(\":3000\"); err != nil {\n    log.Println(err)\n  }\n}()\n\nquit := make(chan os.Signal, 1)\nsignal.Notify(quit, os.Interrupt, syscall.SIGTERM)\n<-quit\n_ = app.Shutdown()"
      },
      {
        "type": "demo",
        "kind": "deploy",
        "title": "动手：关闭流程"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "d1",
            "question": "优雅退出调用？",
            "options": [
              "os.Exit",
              "app.Shutdown",
              "panic",
              "close stdin"
            ],
            "answer": 1,
            "explain": "Shutdown"
          }
        ]
      }
    ]
  },
  {
    "slug": "performance",
    "title": "性能要点",
    "summary": "Fasthttp 注意点与复用。",
    "level": "进阶",
    "track": "工程化",
    "minutes": 7,
    "official": "https://docs.gofiber.io/guide/faster-fiber",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "快的同时别踩坑",
        "body": "c.Body() 等返回值可能被复用——需要时 Copy。避免在 handler 里无界分配。JSON 大对象注意池化。Prefork 与 pprof 按需。"
      },
      {
        "type": "code",
        "title": "对应源码 · 拷贝 Body",
        "lang": "go",
        "code": "app.Post(\"/echo\", func(c *fiber.Ctx) error {\n  // 若异步使用，必须拷贝\n  buf := make([]byte, len(c.Body()))\n  copy(buf, c.Body())\n  return c.Send(buf)\n})"
      },
      {
        "type": "demo",
        "kind": "perf",
        "title": "动手：注意复用"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "pf1",
            "question": "Fasthttp 下 Body 切片？",
            "options": [
              "永远安全长期持有",
              "可能被复用需拷贝",
              "自动 deep copy",
              "只读文件"
            ],
            "answer": 1,
            "explain": "需要时 copy"
          }
        ]
      }
    ]
  },
  {
    "slug": "websocket",
    "title": "WebSocket 简介",
    "summary": "实时通道。",
    "level": "进阶",
    "track": "工程化",
    "minutes": 6,
    "official": "https://docs.gofiber.io/contrib/websocket",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "升级连接",
        "body": "Fiber 可用 websocket 中间件升级。注意心跳、并发写保护、水平扩展（Redis pub/sub）。"
      },
      {
        "type": "code",
        "title": "对应源码 · WS 骨架",
        "lang": "go",
        "code": "app.Use(\"/ws\", func(c *fiber.Ctx) error {\n  if websocket.IsWebSocketUpgrade(c) {\n    return c.Next()\n  }\n  return fiber.ErrUpgradeRequired\n})\n\napp.Get(\"/ws\", websocket.New(func(c *websocket.Conn) {\n  for {\n    mt, msg, err := c.ReadMessage()\n    if err != nil { break }\n    _ = c.WriteMessage(mt, msg)\n  }\n}))"
      },
      {
        "type": "demo",
        "kind": "ws",
        "title": "动手：回声消息"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "ws1",
            "question": "非 WS 请求升级应？",
            "options": [
              "200",
              "426/错误",
              "301",
              "204"
            ],
            "answer": 1,
            "explain": "Upgrade Required"
          }
        ]
      }
    ]
  },
  {
    "slug": "capstone",
    "title": "毕业作品清单",
    "summary": "用 Fiber 独立完成一个 API。",
    "level": "实战",
    "track": "实战 API",
    "minutes": 5,
    "official": "https://docs.gofiber.io/",
    "format": "course",
    "blocks": [
      {
        "type": "text",
        "title": "建议作品",
        "body": "做一个「笔记 API」或「Todo API」：注册登录(JWT)、CRUD、分页、校验、统一错误、健康检查、基础测试、README 含 curl 示例。做完后来 API 工坊闯关验证思路。"
      },
      {
        "type": "code",
        "title": "对应源码 · 最小清单",
        "lang": "go",
        "code": "// POST /auth/login\n// GET  /api/notes\n// POST /api/notes\n// PUT  /api/notes/:id\n// DELETE /api/notes/:id\n// GET  /healthz"
      },
      {
        "type": "demo",
        "kind": "crud",
        "title": "对照：工坊同款 API"
      },
      {
        "type": "quiz",
        "questions": [
          {
            "id": "cap1",
            "question": "作品至少应包含？",
            "options": [
              "仅 HTML",
              "鉴权 + CRUD + 错误处理",
              "仅 Dockerfile",
              "仅前端"
            ],
            "answer": 1,
            "explain": "完整 API 能力"
          }
        ]
      }
    ]
  }
];

export function getCourseLessons() {
  return LESSONS.filter((l) => (l.format ?? "course") === "course");
}

export function getLessonsByTrack(track: Lesson["track"]) {
  return LESSONS.filter((l) => l.track === track);
}

export function getLesson(slug: string) {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonIndex(slug: string) {
  return LESSONS.findIndex((l) => l.slug === slug);
}
