import { FormEvent, ReactNode, useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Contact, Phase, Session } from "../shared/session";
import { initialSession } from "../shared/session";
import { send, sessionId, snapshot, socketUrl } from "./api";
const places = [
  ["🏠", "Home", "42 Maple Drive", 12],
  ["🏢", "Work", "1 Harbor Blvd", 22],
  ["🌳", "Central Park", "59th St & 5th Ave", 18],
  ["📚", "The Public Library", "476 5th Ave", 14],
] as const;
function Icon({ children }: { children: ReactNode }) {
  return <span className="icon">{children}</span>;
}
function Button({
  children,
  onClick,
  kind = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: string;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`btn ${kind}`} onClick={onClick}>
      {children}
    </button>
  );
}
function Phone({ children }: { children: ReactNode }) {
  return (
    <main className="phone">
      <div className="ios">
        <b>11:17</b>
        <span></span>
        <em>⌁ ▱</em>
      </div>
      <div className="viewport">{children}</div>
      <div className="home-indicator" />
    </main>
  );
}
function Header({
  title,
  back,
  right,
}: {
  title: string;
  back?: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="header">
      {back ? <button onClick={back}>‹</button> : <span />}
      <h1>{title}</h1>
      {right ?? <span />}
    </header>
  );
}
function Map({ progress = 55 }: { progress?: number }) {
  return (
    <div className="map">
      <i className="street a" />
      <i className="street b" />
      <i className="street c" />
      <i className="route" style={{ width: `${progress}%` }} />
      <span>⌂</span>
    </div>
  );
}
function App() {
  const isShare = location.pathname.startsWith("/share/");
  return isShare ? <SharePage /> : <Walker />;
}
export { App };
function Walker() {
  const [state, setState] = useState<Session>(() => initialSession());
  const [qr, setQr] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [online, setOnline] = useState(false);
  useEffect(() => {
    snapshot()
      .then((s) => {
        setState(s);
        setOnline(true);
      })
      .catch(() => {});
    const ws = new WebSocket(socketUrl(sessionId));
    ws.onmessage = (e) => {
      setState(JSON.parse(e.data));
      setOnline(true);
    };
    ws.onclose = () => setOnline(false);
    return () => ws.close();
  }, []);
  const act = async (e: Parameters<typeof send>[0]) => {
    const s = await send(e);
    setState(s);
  };
  const phase = (p: Phase) => act({ type: "phase", phase: p });
  useEffect(() => {
    if (showShare)
      QRCode.toDataURL(`${location.origin}/share/${sessionId}`, {
        margin: 1,
        width: 210,
      }).then(setQr);
  }, [showShare]);
  return (
    <div className="demo-stage">
      <Phone>{renderPhase(state, act, phase, () => setShowShare(true))}</Phone>
      <nav className="presenter">
        <span>{online ? "● Live server" : "○ reconnecting"}</span>
        <button onClick={() => act({ type: "reset" })}>Reset</button>
        <select
          value={state.phase}
          onChange={(e) => phase(e.target.value as Phase)}
        >
          {[
            "onboarding",
            "name",
            "contact1",
            "contact2",
            "home",
            "search",
            "setup",
            "active",
            "checkin",
            "panic",
            "alerted",
            "arrived",
            "settings",
            "profile",
            "add-contact",
            "edit-contact",
            "calling",
            "connected",
            "watch",
          ].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </nav>
      {showShare && (
        <div className="modal">
          <section>
            <button className="x" onClick={() => setShowShare(false)}>
              ×
            </button>
            <p className="kicker">RECEIVER LINK</p>
            <h2>Share Sarah's walk</h2>
            {qr && <img src={qr} />}
            <code>
              {location.origin}/share/{sessionId}
            </code>
            <Button
              onClick={() =>
                navigator.clipboard?.writeText(
                  `${location.origin}/share/${sessionId}`,
                )
              }
            >
              Copy share link
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
function renderPhase(
  s: Session,
  act: (e: any) => void,
  phase: (p: Phase) => void,
  share: () => void,
) {
  const back = (p: Phase) => () => phase(p);
  switch (s.phase) {
    case "onboarding":
      return <Onboarding next={() => phase("name")} />;
    case "name":
      return (
        <Name
          s={s}
          save={(n) =>
            act({ type: "patch", patch: { name: n, phase: "contact1" } })
          }
        />
      );
    case "contact1":
      return <ContactStep n={1} s={s} next={() => phase("contact2")} />;
    case "contact2":
      return <ContactStep n={2} s={s} next={() => phase("home")} />;
    case "home":
      return <Home s={s} phase={phase} />;
    case "search":
      return <Search s={s} act={act} back={back("home")} />;
    case "setup":
      return <Setup s={s} act={act} back={back("home")} share={share} />;
    case "active":
      return <Active s={s} act={act} phase={phase} share={share} />;
    case "checkin":
      return <Checkin act={act} />;
    case "panic":
      return <Panic phase={phase} />;
    case "alerted":
      return <Alerted s={s} phase={phase} />;
    case "arrived":
      return <Arrived s={s} phase={phase} />;
    case "settings":
      return <Settings s={s} phase={phase} />;
    case "profile":
      return <Profile s={s} act={act} back={back("settings")} />;
    case "add-contact":
      return (
        <ContactEditor
          title="Add contact"
          s={s}
          act={act}
          back={back("settings")}
        />
      );
    case "edit-contact":
      return (
        <ContactEditor
          title="Edit contact"
          s={s}
          act={act}
          back={back("settings")}
        />
      );
    case "calling":
      return <Call connected={false} phase={phase} />;
    case "connected":
      return <Call connected phase={phase} />;
    default:
      return <Watch s={s} phase={phase} />;
  }
}
function Onboarding({ next }: { next: () => void }) {
  return (
    <div className="page onboarding">
      <div className="beacon-mark">⌁</div>
      <h1>Beacon</h1>
      <h2>We've got you.</h2>
      <p>
        Share your walk home with someone who cares. They'll know you made it —
        or know when to help.
      </p>
      <div className="features">
        <Row icon="⌁" title="Share your live location" />
        <Row icon="♢" title="Auto-alert if you don't check in" />
        <Row icon="!" title="One-tap panic button" />
      </div>
      <Button onClick={next}>Get started</Button>
    </div>
  );
}
function Name({ s, save }: { s: Session; save: (n: string) => void }) {
  const [n, setN] = useState(s.name);
  return (
    <form
      className="page form"
      onSubmit={(e) => {
        e.preventDefault();
        if (n.trim()) save(n);
      }}
    >
      <div className="steps">
        — <b>1 of 3</b>
      </div>
      <h1>
        First, what's
        <br />
        your name?
      </h1>
      <p>Your contacts will see this when they monitor your walk.</p>
      <div className="avatar big">{n[0] || "?"}</div>
      <label>
        Your name
        <input
          value={n}
          onChange={(e) => setN(e.target.value)}
          placeholder="Alex, Jordan, Sam…"
        />
      </label>
      <Button type="submit">Continue</Button>
    </form>
  );
}
function ContactStep({
  n,
  s,
  next,
}: {
  n: number;
  s: Session;
  next: () => void;
}) {
  const c = s.contacts[n - 1];
  return (
    <div className="page form">
      <div className="steps">
        —— <b>{n} of 2</b>
      </div>
      <h1>Add your {n === 1 ? "first" : "second"} trusted contact</h1>
      <p>
        {n === 1
          ? "Beacon requires at least 2 contacts so there's always a backup if one doesn't pick up."
          : "Your second contact acts as a backup. They'll only be called if the first doesn't respond."}
      </p>
      {n === 2 && (
        <Row icon="A" title="Contact 1" detail={s.contacts[0].name} />
      )}
      <label>
        Name
        <input defaultValue={c.name} />
      </label>
      <label>
        Phone number
        <input defaultValue={c.phone} />
      </label>
      <div className="note">
        ⓘ{" "}
        {n === 1
          ? "They'll be alerted first if you don't check in."
          : "Having two contacts means Beacon can always reach someone."}
      </div>
      <Button onClick={next}>
        {n === 1 ? "Continue — add second contact" : "Done — let's go"}
      </Button>
    </div>
  );
}
function Home({ s, phase }: { s: Session; phase: (p: Phase) => void }) {
  return (
    <div className="page home">
      <header>
        <div>
          <small>Good afternoon</small>
          <h1>{s.name} 👋</h1>
        </div>
        <button onClick={() => phase("settings")}>⚙</button>
      </header>
      <button className="start" onClick={() => phase("setup")}>
        ⌁
        <b>
          Start a<br />
          walk
        </b>
      </button>
      <p>Tap to share your route with Mom</p>
      <h3>RECENT</h3>
      {places.slice(0, 3).map((p) => (
        <Place key={p[1]} p={p} onClick={() => phase("setup")} />
      ))}
      <footer>⌁ Beacon</footer>
    </div>
  );
}
function Search({
  s,
  act,
  back,
}: {
  s: Session;
  act: (e: any) => void;
  back: () => void;
}) {
  const [q, setQ] = useState("");
  return (
    <div className="page search">
      <Header title="" back={back} />
      <input
        className="searchbox"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for a destination…"
        autoFocus
      />
      <h3>{q ? `RESULTS FOR “${q}”` : "SAVED PLACES"}</h3>
      {places
        .filter(
          (p) =>
            !q ||
            p[1].toLowerCase().includes(q.toLowerCase()) ||
            p[2].toLowerCase().includes(q.toLowerCase()),
        )
        .map((p) => (
          <Place
            key={p[1]}
            p={p}
            onClick={() =>
              act({
                type: "patch",
                patch: {
                  destination: p[1],
                  address: p[2],
                  duration: p[3],
                  phase: "setup",
                },
              })
            }
          />
        ))}
    </div>
  );
}
function Setup({
  s,
  act,
  back,
  share,
}: {
  s: Session;
  act: (e: any) => void;
  back: () => void;
  share: () => void;
}) {
  return (
    <div className="page setup">
      <Header title="Set up your walk" back={back} />
      <Map />
      <Card title="DESTINATION">
        <Row
          icon="⌂"
          title={s.destination}
          detail={s.address}
          right={
            <button onClick={() => act({ type: "phase", phase: "search" })}>
              Change
            </button>
          }
        />
      </Card>
      <Card title="ESTIMATED ARRIVAL">
        <Row
          icon="◷"
          title={`${s.duration} minutes`}
          detail="~0.8 mi · mostly flat"
        />
      </Card>
      <Card title="SAFETY BUFFER">
        <Row
          icon="−"
          title={`Alert Mom if ${s.buffer} min late`}
          right={<b>−　{s.buffer}　＋</b>}
        />
      </Card>
      <Card title="WHO'S WATCHING OVER YOU">
        {s.contacts.map((c) => (
          <Row
            key={c.id}
            icon={c.name[0]}
            title={c.name}
            detail={c.phone}
            right="✓"
          />
        ))}
      </Card>
      <button className="share-mini" onClick={share}>
        ⌁ Preview share link
      </button>
      <Button
        onClick={() =>
          act({ type: "patch", patch: { phase: "active", status: "safe" } })
        }
      >
        Start sharing · {s.duration} min
      </Button>
    </div>
  );
}
function Active({
  s,
  act,
  phase,
  share,
}: {
  s: Session;
  act: (e: any) => void;
  phase: (p: Phase) => void;
  share: () => void;
}) {
  const left = Math.max(0, s.duration - s.elapsed);
  return (
    <div className="page active">
      <header>
        <span>Sharing with Mom</span>
        <b>● LIVE</b>
      </header>
      <Map progress={Math.round((s.elapsed / s.duration) * 100)} />
      <div className="timer">
        <i />
        <strong>{left}:21</strong>
        <small>almost home</small>
      </div>
      <h2>Almost home, {s.name}</h2>
      <p>
        {s.destination} · {s.address}
      </p>
      <Button onClick={() => act({ type: "arrive" })}>
        ✓ I've arrived safely
      </Button>
      <div className="split">
        <Button kind="light" onClick={() => phase("checkin")}>
          Check in early
        </Button>
        <Button kind="danger" onClick={() => phase("panic")}>
          ⚠ Panic
        </Button>
      </div>
      <button className="share-mini" onClick={share}>
        Open receiver link
      </button>
      <div className="demo-controls">
        <button onClick={() => act({ type: "tick", minutes: 2 })}>
          +2 min
        </button>
        <button onClick={() => phase("watch")}>Watch</button>
      </div>
    </div>
  );
}
function Checkin({ act }: { act: (e: any) => void }) {
  return (
    <div className="page checkin">
      <div className="moon">🌙</div>
      <h1>Almost home!</h1>
      <p>
        Just checking in — you should be arriving soon. Let us know you're okay.
      </p>
      <Button
        onClick={() =>
          act({ type: "patch", patch: { phase: "active", status: "safe" } })
        }
      >
        ✓ I'm safe
      </Button>
      <Button kind="outline" onClick={() => act({ type: "panic" })}>
        Need help
      </Button>
      <small>No response in 2 min — Mom is alerted automatically</small>
    </div>
  );
}
function Panic({ phase }: { phase: (p: Phase) => void }) {
  useEffect(() => {
    const t = setTimeout(() => phase("alerted"), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="page panic">
      <div className="warning">⚠</div>
      <h1>Alerting Mom</h1>
      <p>Sending your live location now</p>
      {["Location shared", "Texting Mom", "Calling Mom…"].map((x, i) => (
        <div className="panic-step" key={x}>
          <span>{i < 2 ? "✓" : "◌"}</span>
          {x}
        </div>
      ))}
      <small>Hold to cancel alarm</small>
      <button className="cancel" onClick={() => phase("active")}>
        ×
      </button>
    </div>
  );
}
function Alerted({ s, phase }: { s: Session; phase: (p: Phase) => void }) {
  return (
    <div className="page alerted">
      <div className="call-icon">☎</div>
      <h1>Mom was notified</h1>
      <p>Your live location has been shared. Stay where you are if you can.</p>
      <Row icon="M" title="Mom" detail="Notified · live location active" />
      <Button onClick={() => phase("calling")}>☎ Call Mom now</Button>
      <small>Stay calm. Help is on the way. 💛</small>
      <Button kind="light" onClick={() => phase("active")}>
        I'm okay now
      </Button>
    </div>
  );
}
function Arrived({ s, phase }: { s: Session; phase: (p: Phase) => void }) {
  return (
    <div className="page arrived">
      <div className="celebrate">🎉</div>
      <h1>You made it!</h1>
      <h2>Home safe and sound.</h2>
      <p>
        Mom has been notified you arrived safely.
        <br />
        Walk ended at 10:47 PM.
      </p>
      <Card title="WALK SUMMARY">
        <Row
          icon="⌂"
          title={`${s.destination} · ${s.address}`}
          right={
            <b>
              12:03
              <br />
              <small>minutes</small>
            </b>
          }
        />
      </Card>
      <Button onClick={() => phase("home")}>Done</Button>
    </div>
  );
}
function Settings({ s, phase }: { s: Session; phase: (p: Phase) => void }) {
  return (
    <div className="page settings">
      <Header title="Settings" back={() => phase("home")} />
      <Card title="MY PROFILE">
        <Row
          icon={s.name[0]}
          title={s.name}
          detail="Beacon Premium"
          right={<button onClick={() => phase("profile")}>›</button>}
        />
      </Card>
      <h3>TRUSTED CONTACTS</h3>
      {s.contacts.map((c, i) => (
        <Row
          key={c.id}
          icon={c.name[0]}
          title={c.name}
          detail={c.phone}
          right={<button onClick={() => phase("edit-contact")}>✎</button>}
        />
      ))}
      <button className="add" onClick={() => phase("add-contact")}>
        ＋ Add contact
      </button>
      <Card title="DEFAULTS">
        <Row
          icon="◷"
          title="Safety buffer"
          detail="Extra time before alert"
          right={`${s.buffer} min`}
        />
        <Row
          icon="♬"
          title="Alarm sound"
          detail="Plays on contact's device"
          right="›"
        />
      </Card>
      <Card title="PERMISSIONS">
        <Row icon="⌖" title="Location" right="✓" />
        <Row icon="♧" title="Notifications" right="✓" />
        <Row icon="☎" title="Contacts" right="✓" />
        <Row icon="♩" title="Microphone" right="✓" />
      </Card>
    </div>
  );
}
function Profile({
  s,
  act,
  back,
}: {
  s: Session;
  act: (e: any) => void;
  back: () => void;
}) {
  const [n, setN] = useState(s.name);
  return (
    <div className="page form">
      <Header
        title="Edit Profile"
        back={back}
        right={
          <button
            onClick={() =>
              act({ type: "patch", patch: { name: n, phase: "settings" } })
            }
          >
            Save
          </button>
        }
      />
      <div className="avatar big">{n[0]}</div>
      <div className="colors">● ● ● ● ● ● ●</div>
      <label>
        Display name
        <input value={n} onChange={(e) => setN(e.target.value)} />
      </label>
      <label>
        Phone
        <input value="(555) 100-0000" readOnly />
      </label>
      <label>
        Email
        <input value="me@beacon.app" readOnly />
      </label>
      <Row
        icon="✦"
        title="Beacon Premium"
        detail="Live monitoring for contacts"
        right="Active"
      />
      <Row icon="→" title="Sign out" />
    </div>
  );
}
function ContactEditor({
  title,
  s,
  act,
  back,
}: {
  title: string;
  s: Session;
  act: (e: any) => void;
  back: () => void;
}) {
  const c = s.contacts[title.startsWith("Edit") ? 1 : 0];
  return (
    <div className="page form contact-edit">
      <Header title={title} back={back} />
      <div className="avatar big">{c.name[0]}</div>
      <div className="colors">● ● ● ● ● ● ●</div>
      <label>
        Name
        <input
          defaultValue={title.startsWith("Add") ? "" : c.name}
          placeholder="Mom, Alex, Sam…"
        />
      </label>
      <label>
        Phone
        <input
          defaultValue={title.startsWith("Add") ? "" : c.phone}
          placeholder="(555) 000-0000"
        />
      </label>
      <h3>ALERT ME VIA</h3>
      {[
        ["☎", "Phone call", "Standard call to their number"],
        ["◉", "In-app call", "Calls via Beacon (requires app)"],
        ["▱", "SMS", "Text message to their number"],
        ["♢", "App notification", "Push alert within Beacon"],
      ].map((r, i) => (
        <Row
          key={r[1]}
          icon={r[0]}
          title={r[1]}
          detail={r[2]}
          right={<input type="checkbox" defaultChecked={i !== 3} />}
        />
      ))}
      <Button onClick={() => act({ type: "phase", phase: "settings" })}>
        {title.startsWith("Add") ? "Add contact" : "Save changes"}
      </Button>
    </div>
  );
}
function Call({
  connected,
  phase,
}: {
  connected: boolean;
  phase: (p: Phase) => void;
}) {
  return (
    <div className="page call">
      <small>In-app call</small>
      <div className="call-avatar">M</div>
      <h1>Mom</h1>
      <p>{connected ? "Connected · 0:02" : "Calling…"}</p>
      {connected && (
        <div className="call-tools">
          <button>
            ♩<span>Mute</span>
          </button>
          <button>
            ◖<span>Speaker</span>
          </button>
        </div>
      )}
      <button className="end-call" onClick={() => phase("alerted")}>
        ⌕<span>End call</span>
      </button>
      {!connected && (
        <button className="simulate" onClick={() => phase("connected")}>
          Simulate answer
        </button>
      )}
    </div>
  );
}
function Watch({ s, phase }: { s: Session; phase: (p: Phase) => void }) {
  return (
    <div className="page watch">
      <div className="watch-time">
        <b>1:17</b>
        <span>
          {s.heartRate}
          <small>BPM</small>
        </span>
      </div>
      <button onClick={() => phase("panic")}>
        <i>⚠</i>HOLD PANIC
      </button>
      <footer>
        <b>Walking</b>
        <span>
          {s.destination} · {Math.max(1, s.duration - s.elapsed)} min
        </span>
        <em>{s.watchBattery}%</em>
      </footer>
    </div>
  );
}
function SharePage() {
  const id = location.pathname.split("/").pop() || sessionId;
  const [s, setS] = useState<Session | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    snapshot(id)
      .then(setS)
      .catch(() => {});
    let ws: WebSocket, t: number;
    const connect = () => {
      ws = new WebSocket(socketUrl(id));
      ws.onopen = () => setConnected(true);
      ws.onmessage = (e) => setS(JSON.parse(e.data));
      ws.onclose = () => {
        setConnected(false);
        t = window.setTimeout(connect, 1200);
      };
    };
    connect();
    return () => {
      clearTimeout(t);
      ws?.close();
    };
  }, [id]);
  if (!s)
    return (
      <div className="share-error">Share link not found or reconnecting…</div>
    );
  const left = Math.max(0, s.duration - s.elapsed),
    danger = s.status === "panic";
  return (
    <div className={`share-page ${danger ? "danger" : ""}`}>
      <div className="browserbar">
        <b>‹</b>
        <code>beacon-share.app/{id}</code>
        <span>⌾</span>
      </div>
      <header>
        <div>
          <small>⌁　MONITORING</small>
          <h1>{s.name}'s walk</h1>
        </div>
        <b>{connected ? "● Live" : "○ Reconnecting"}</b>
      </header>
      <Map progress={Math.round((s.elapsed / s.duration) * 100)} />
      {danger && (
        <div className="share-alert">
          <b>⚠ PANIC ALERT</b>
          <span>Mom has been notified · live location active</span>
        </div>
      )}
      <div className="share-status">
        <b>
          <i />{" "}
          {s.status === "arrived"
            ? "Arrived safely"
            : danger
              ? "Help requested"
              : `On track · ~${left} min away`}
        </b>
        <strong>
          {left}:12<small>ETA</small>
        </strong>
      </div>
      <div className="metrics">
        <Card title="♡ HEART RATE">
          <strong className="hr">
            {s.heartRate}
            <small>bpm</small>
          </strong>
          <div className="ecg">⌁⌁╱╲⌁</div>
          <small>Normal walking</small>
        </Card>
        <Card title="♙ WATCH">
          <strong>▰ {s.watchBattery}%</strong>
          <progress value={s.watchBattery} max="100" />
          <small>
            ♟ Connected
            <br />
            Apple Watch Series 9
          </small>
        </Card>
      </div>
      <h3>ACTIVITY</h3>
      <div className="activity">
        {[...s.activity].reverse().map((a) => (
          <Row
            key={a.id}
            icon={
              a.kind === "heart"
                ? "♡"
                : a.kind === "check"
                  ? "✓"
                  : a.kind === "pin"
                    ? "⌾"
                    : a.kind === "alert"
                      ? "!"
                      : "⌁"
            }
            title={a.label}
            detail={a.detail}
            right={a.time}
          />
        ))}
      </div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function Row({
  icon,
  title,
  detail,
  right,
}: {
  icon: string;
  title: string;
  detail?: string;
  right?: ReactNode;
}) {
  return (
    <div className="row">
      <Icon>{icon}</Icon>
      <span>
        <b>{title}</b>
        {detail && <small>{detail}</small>}
      </span>
      {right && <em>{right}</em>}
    </div>
  );
}
function Place({
  p,
  onClick,
}: {
  p: readonly [string, string, string, number];
  onClick: () => void;
}) {
  return (
    <button className="place" onClick={onClick}>
      <Icon>{p[0]}</Icon>
      <span>
        <b>{p[1]}</b>
        <small>{p[2]}</small>
      </span>
      <em>{p[3]} min</em>
    </button>
  );
}
