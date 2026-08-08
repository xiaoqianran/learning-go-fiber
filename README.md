# Go Fiber 实战学习

交互式中文 Go Fiber 教程：课程 + 测验 + 进度 + 请求演练 + API 工坊。

**在线访问：** [https://xiaoqianran.github.io/learning-go-fiber/](https://xiaoqianran.github.io/learning-go-fiber/)  
**仓库：** [https://github.com/xiaoqianran/learning-go-fiber](https://github.com/xiaoqianran/learning-go-fiber)

> 姊妹项目：[learning-vue3](https://github.com/xiaoqianran/learning-vue3)

---

## 这是什么

面向想系统学习 **Go Fiber** 写 HTTP API 的同学。内容以「读一点、动手一点、测一点」组织。

你可以：

- 按路径学完 **31 节** 课程（讲解 + 对应 Go 源码 + 请求演练 Demo + 小测验）
- 在 **请求演练场** 里模拟 Fiber 的请求/响应
- 在 **API 工坊** 里练登录、401、笔记 CRUD（模拟 REST API）
- 用 **速查表** 复习，用 **学习中心 / 错题本 / 结业证明** 跟进度

> 说明：本站用 React + TanStack Start 承载教学内容；请求演练与工坊在浏览器内模拟 Fiber 语义，便于交互学习。

---

## 功能一览

| 模块 | 路径 | 说明 |
|------|------|------|
| 课程 | `/lesson/:slug` | 正文、对应源码、请求 Demo、测验、笔记 |
| 首页大纲 | `/` | 搜索、路径筛选、进度条 |
| 请求演练 | `/playground` | 模拟 Fiber handler 输入输出 |
| API 工坊 | `/studio` | 模拟登录 + 笔记 CRUD 闯关 |
| 文档地图 | `/docs` | 对照 docs.gofiber.io |
| 主题 | 全局 | Catppuccin（默认 Blue 点缀） |
| 速查表 | `/cheatsheet` | 一页核心 API |
| 学习中心 | `/hub` | 打卡、收藏、路径进度 |
| 练习场 | `/lab` | 综合练习 |
| 错题本 | `/mistakes` | 测验错题回顾 |
| 结业证明 | `/certificate` | 全部完成后解锁 |

### API 工坊演示账号

```text
邮箱：demo@fiber.dev
密码：password123
```

闯关：成功登录 → 触发一次 401 → 创建 / 编辑 / 删除笔记 → 退出。

---

## 学习路径

| 路径 | 你学到什么 |
|------|------------|
| **基础** | Fiber 简介、Ctx、配置、静态文件 |
| **路由与请求** | 路由、参数、Query、Body、Header、Group |
| **中间件** | 自定义链、Logger/Recover、CORS、限流 |
| **数据与校验** | JSON 信封、validator、上传 |
| **认证与安全** | JWT、Cookie、Helmet、错误处理 |
| **实战 API** | CRUD、分层、分页、健康检查、毕业清单 |
| **工程化** | 配置、测试、部署、性能、WebSocket |

---

## 本地运行

环境：Node 22+ 推荐。

```bash
git clone https://github.com/xiaoqianran/learning-go-fiber.git
cd learning-go-fiber
npm install
npm run dev
```

GitHub Pages 构建：

```bash
npm run build:pages
```

---

## 技术栈

- React 19 + TypeScript + Vite
- TanStack Start / Router
- Tailwind CSS v4 + Catppuccin 主题
- Zustand 进度本地持久化
- MSW 模拟 REST API（工坊）

---

MIT · 参考 [gofiber/fiber](https://github.com/gofiber/fiber) 官方文档
