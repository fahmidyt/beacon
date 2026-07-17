import {
  initialSession,
  reduceSession,
  type SessionEvent,
  type Session,
} from "../shared/session.js";
export class SessionStore {
  private sessions = new Map<string, Session>();
  get(id: string) {
    if (!this.sessions.has(id)) this.sessions.set(id, initialSession(id));
    return this.sessions.get(id)!;
  }
  apply(id: string, event: SessionEvent) {
    const next = reduceSession(this.get(id), event);
    this.sessions.set(id, next);
    return next;
  }
}
