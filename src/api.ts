import type { Session, SessionEvent } from "../shared/session";
export const sessionId = "sarah-j8xk2";
export const snapshot = async (id = sessionId): Promise<Session> =>
  fetch(`/api/sessions/${id}`).then((r) => {
    if (!r.ok) throw Error("Session not found");
    return r.json();
  });
export const send = async (
  event: SessionEvent,
  id = sessionId,
): Promise<Session> =>
  fetch(`/api/sessions/${id}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  }).then((r) => r.json());
export const socketUrl = (id: string) =>
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/${id}`;
