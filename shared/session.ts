export type Phase =
  | "onboarding"
  | "name"
  | "contact1"
  | "contact2"
  | "home"
  | "search"
  | "setup"
  | "active"
  | "checkin"
  | "panic"
  | "alerted"
  | "arrived"
  | "settings"
  | "profile"
  | "add-contact"
  | "edit-contact"
  | "calling"
  | "connected"
  | "watch";
export interface Contact {
  id: string;
  name: string;
  phone: string;
  color: string;
  phoneCall: boolean;
  inApp: boolean;
  sms: boolean;
  push: boolean;
}
export interface Activity {
  id: string;
  label: string;
  detail: string;
  time: string;
  kind: "heart" | "check" | "pin" | "pulse" | "walk" | "alert";
}
export interface Session {
  id: string;
  phase: Phase;
  name: string;
  destination: string;
  address: string;
  duration: number;
  elapsed: number;
  heartRate: number;
  watchBattery: number;
  contacts: Contact[];
  buffer: number;
  status: "idle" | "safe" | "checkin" | "panic" | "arrived";
  activity: Activity[];
  updatedAt: number;
}
export type SessionEvent =
  | { type: "patch"; patch: Partial<Session> }
  | { type: "phase"; phase: Phase }
  | { type: "tick"; minutes?: number }
  | { type: "panic" }
  | { type: "arrive" }
  | { type: "reset" };
export const starterContacts: Contact[] = [
  {
    id: "mom",
    name: "Mom",
    phone: "(555) 234-5678",
    color: "#65afa0",
    phoneCall: true,
    inApp: true,
    sms: true,
    push: true,
  },
  {
    id: "jamie",
    name: "Jamie",
    phone: "(555) 876-4321",
    color: "#a77ab3",
    phoneCall: true,
    inApp: true,
    sms: true,
    push: false,
  },
];
export const initialSession = (id = "sarah-j8xk2"): Session => ({
  id,
  phase: "onboarding",
  name: "Sarah",
  destination: "Home",
  address: "42 Maple Drive",
  duration: 12,
  elapsed: 3,
  heartRate: 74,
  watchBattery: 62,
  contacts: starterContacts,
  buffer: 10,
  status: "idle",
  activity: [
    {
      id: "walk",
      label: "Walk started",
      detail: "6 min ago",
      time: "10:37 PM",
      kind: "walk",
    },
    {
      id: "location",
      label: "Location updated",
      detail: "4 min ago",
      time: "10:39 PM",
      kind: "pulse",
    },
    {
      id: "oak",
      label: "Near Oak & Maple",
      detail: "3 min ago",
      time: "10:40 PM",
      kind: "pin",
    },
    {
      id: "check",
      label: "Checked in",
      detail: "2 min ago",
      time: "10:41 PM",
      kind: "check",
    },
    {
      id: "heart",
      label: "Heart rate: 74 bpm",
      detail: "via Apple Watch",
      time: "10:43 PM",
      kind: "heart",
    },
  ],
  updatedAt: Date.now(),
});
export function reduceSession(s: Session, e: SessionEvent): Session {
  const now = Date.now();
  if (e.type === "reset") return initialSession(s.id);
  if (e.type === "phase") return { ...s, phase: e.phase, updatedAt: now };
  if (e.type === "patch") return { ...s, ...e.patch, id: s.id, updatedAt: now };
  if (e.type === "tick") {
    const elapsed = Math.min(s.duration, s.elapsed + (e.minutes ?? 1));
    return {
      ...s,
      elapsed,
      phase: elapsed >= 10 ? "checkin" : "active",
      status: elapsed >= 10 ? "checkin" : "safe",
      heartRate: 72 + (elapsed % 7),
      watchBattery: Math.max(20, s.watchBattery - 1),
      updatedAt: now,
    };
  }
  if (e.type === "panic")
    return {
      ...s,
      phase: "panic",
      status: "panic",
      activity: [
        ...s.activity,
        {
          id: String(now),
          label: "Panic alert sent",
          detail: "Mom notified",
          time: "Now",
          kind: "alert",
        },
      ],
      updatedAt: now,
    };
  return {
    ...s,
    phase: "arrived",
    status: "arrived",
    activity: [
      ...s.activity,
      {
        id: String(now),
        label: "Sarah arrived safely",
        detail: s.address,
        time: "Now",
        kind: "check",
      },
    ],
    updatedAt: now,
  };
}
