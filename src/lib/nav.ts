import {
  BookOpen,
  Bookmark,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Library,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { getCourseLessons, getLessonsByTrack, LESSONS, type Lesson } from "@/data/lessons";

export const TRACK_ORDER = [
  "基础",
  "路由与请求",
  "中间件",
  "数据与校验",
  "认证与安全",
  "实战 API",
  "工程化",
] as const;

export type TrackName = (typeof TRACK_ORDER)[number];

export const TRACK_META: Record<
  TrackName,
  { blurb: string; color: string }
> = {
  基础: { blurb: "Fiber 是什么、Hello World、上下文 c", color: "var(--ctp-blue)" },
  "路由与请求": { blurb: "路由、参数、Query、Body、分组", color: "var(--ctp-sapphire)" },
  中间件: { blurb: "中间件链、日志、CORS、限流", color: "var(--ctp-teal)" },
  "数据与校验": { blurb: "JSON、表单、文件、校验器", color: "var(--ctp-green)" },
  "认证与安全": { blurb: "JWT、Session、Helmet、错误处理", color: "var(--ctp-peach)" },
  "实战 API": { blurb: "CRUD、分层、统一响应、分页", color: "var(--ctp-mauve)" },
  工程化: { blurb: "配置、测试、部署、性能", color: "var(--ctp-lavender)" },
};

export function orderedTracks(): TrackName[] {
  return [...TRACK_ORDER];
}

export function trackLabel(track: string) {
  return track;
}

export function completedCount(completed: string[]) {
  return LESSONS.filter((l) => completed.includes(l.slug)).length;
}

export function progressPercent(completed: string[]) {
  return LESSONS.length ? Math.round((completedCount(completed) / LESSONS.length) * 100) : 0;
}

export function getContinueLesson(completed: string[]): Lesson {
  const next = LESSONS.find((l) => !completed.includes(l.slug));
  return next ?? LESSONS[LESSONS.length - 1]!;
}

export function getContinueHref(completed: string[]): {
  kind: "lesson" | "certificate";
  slug?: string;
} {
  const core = getCourseLessons();
  if (core.every((l) => completed.includes(l.slug))) {
    return { kind: "certificate" };
  }
  const cont = getContinueLesson(completed);
  return { kind: "lesson", slug: cont.slug };
}

export function isAllComplete(completed: string[]) {
  return getCourseLessons().every((l) => completed.includes(l.slug));
}

export type NavItem = {
  to: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
};

export const NAV_PRIMARY: NavItem[] = [
  { to: "/", label: "课程大纲", hint: "全部路径", icon: BookOpen },
  { to: "/playground", label: "请求演练", hint: "模拟 Fiber 请求", icon: Terminal },
  { to: "/studio", label: "API 工坊", hint: "登录 + CRUD 闯关", icon: Server },
  { to: "/hub", label: "学习中心", hint: "进度与打卡", icon: LayoutDashboard },
];

export const NAV_TOOLS: NavItem[] = [
  { to: "/cheatsheet", label: "速查表", icon: ClipboardList },
  { to: "/docs", label: "文档地图", icon: Library },
  { to: "/lab", label: "练习场", icon: FlaskConical },
  { to: "/mistakes", label: "错题本", icon: Bookmark },
  { to: "/certificate", label: "结业证明", icon: GraduationCap },
];
