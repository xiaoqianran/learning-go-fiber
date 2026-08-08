export type User = { id: string; email: string; password: string; name: string };
export type Note = { id: string; userId: string; title: string; body: string; updatedAt: number };

const g = globalThis as unknown as {
  __fiberStudioDb?: { users: User[]; notes: Note[]; tokens: Map<string, string> };
};

function db() {
  if (!g.__fiberStudioDb) {
    g.__fiberStudioDb = {
      users: [
        {
          id: "u_demo",
          email: "demo@fiber.dev",
          password: "password123",
          name: "Fiber Demo",
        },
      ],
      notes: [
        {
          id: "n1",
          userId: "u_demo",
          title: "欢迎",
          body: "这是模拟 Fiber API 的第一条笔记",
          updatedAt: Date.now(),
        },
      ],
      tokens: new Map(),
    };
  }
  return g.__fiberStudioDb;
}

export function findUserByEmail(email: string) {
  return db().users.find((u) => u.email === email);
}

export function issueToken(userId: string) {
  const t = `tok_${userId}_${Math.random().toString(36).slice(2, 10)}`;
  db().tokens.set(t, userId);
  return t;
}

export function userIdFromToken(token: string | null) {
  if (!token) return null;
  return db().tokens.get(token) ?? null;
}

export function revokeToken(token: string) {
  db().tokens.delete(token);
}

export function listNotes(userId: string) {
  return db()
    .notes.filter((n) => n.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNote(userId: string, id: string) {
  return db().notes.find((n) => n.id === id && n.userId === userId) ?? null;
}

export function createNote(userId: string, title: string, body: string) {
  const n: Note = {
    id: `n_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    title,
    body,
    updatedAt: Date.now(),
  };
  db().notes.push(n);
  return n;
}

export function updateNote(userId: string, id: string, title: string, body: string) {
  const n = getNote(userId, id);
  if (!n) return null;
  n.title = title;
  n.body = body;
  n.updatedAt = Date.now();
  return n;
}

export function deleteNote(userId: string, id: string) {
  const arr = db().notes;
  const i = arr.findIndex((n) => n.id === id && n.userId === userId);
  if (i < 0) return false;
  arr.splice(i, 1);
  return true;
}
