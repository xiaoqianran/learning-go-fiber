import { http, HttpResponse } from "msw";
import {
  createNote,
  deleteNote,
  findUserByEmail,
  getNote,
  issueToken,
  listNotes,
  revokeToken,
  updateNote,
  userIdFromToken,
} from "./db";

function authUser(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return userIdFromToken(m?.[1] ?? null);
}

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const user = findUserByEmail(body.email || "");
    if (!user || user.password !== body.password) {
      return HttpResponse.json({ error: "invalid credentials" }, { status: 401 });
    }
    const token = issueToken(user.id);
    return HttpResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  }),

  http.post("/api/auth/logout", async ({ request }) => {
    const h = request.headers.get("authorization") || "";
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (m?.[1]) revokeToken(m[1]);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/me", ({ request }) => {
    const uid = authUser(request);
    if (!uid) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    return HttpResponse.json({ userId: uid });
  }),

  http.get("/api/notes", ({ request }) => {
    const uid = authUser(request);
    if (!uid) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    return HttpResponse.json({ items: listNotes(uid) });
  }),

  http.post("/api/notes", async ({ request }) => {
    const uid = authUser(request);
    if (!uid) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = (await request.json()) as { title?: string; body?: string };
    if (!body.title) return HttpResponse.json({ error: "title required" }, { status: 400 });
    const note = createNote(uid, body.title, body.body || "");
    return HttpResponse.json(note, { status: 201 });
  }),

  http.put("/api/notes/:id", async ({ request, params }) => {
    const uid = authUser(request);
    if (!uid) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = (await request.json()) as { title?: string; body?: string };
    const note = updateNote(uid, String(params.id), body.title || "", body.body || "");
    if (!note) return HttpResponse.json({ error: "not found" }, { status: 404 });
    return HttpResponse.json(note);
  }),

  http.delete("/api/notes/:id", ({ request, params }) => {
    const uid = authUser(request);
    if (!uid) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    const ok = deleteNote(uid, String(params.id));
    if (!ok) return HttpResponse.json({ error: "not found" }, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),
];
