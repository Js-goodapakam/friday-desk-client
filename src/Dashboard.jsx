import { useState } from "react";
import "./dashboard.css";

/* Small inline icons (same approach as Friday.jsx and Onboarding.jsx) */
const Ico = ({ children, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  bed: (<><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M12 4v6" /><path d="M2 18h20" /></>),
  login: (<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  rupee: (<><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" /></>),
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  arrow: (<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  check: (<path d="m5 12 5 5L20 7" />),
};

/* ---------- helpers ---------- */

const TZ = "Asia/Kolkata";

const to12 = (hhmm) => {
  if (!hhmm) return "—";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const clock = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: TZ }).toUpperCase() : "—";

const istDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

const since = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (istDay(d) === istDay(new Date())) return `Since ${clock(iso)}`;
  const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: TZ });
  return `Since ${day}, ${clock(iso)}`;
};

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ---------- pieces ---------- */

function Kpi({ icon, label, value, note, active, onClick, onHover }) {
  return (
    <button
      type="button"
      className={`fd-kpi${active ? " fd-kpi--active" : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <span className="fd-kpi-top">
        <span className="fd-kpi-icon"><Ico>{ICONS[icon]}</Ico></span>
        <span className="fd-kpi-label">{label}</span>
      </span>
      <span className="fd-kpi-value">{value}</span>
      <span className="fd-kpi-note">{note}</span>
    </button>
  );
}

function MoveRow({ r, guest, tab, utils, onCheckIn, onCheckOut, onOpenGuest }) {
  const due = utils.balance(r);
  const name = guest?.name || "Unknown guest";
  const timing =
    tab === "arrivals" ? `Expected ${to12(r.expectedIn)}`
      : tab === "departures" ? `Due out ${to12(r.expectedOut)}`
        : since(r.actualCheckIn);
  return (
    <li className="fd-row">
      <span className="fd-avatar" aria-hidden="true">{guest ? utils.initials(name) : "?"}</span>
      <div className="fd-row-main">
        <button type="button" className="fd-name" onClick={() => guest && onOpenGuest?.(guest)}>{name}</button>
        <span className="fd-meta">
          Room {r.room} · {plural(utils.nights(r), "night")} · {timing}
        </span>
      </div>
      <div className="fd-row-side">
        {due > 0
          ? <span className="fd-badge fd-badge--due">{utils.money(due)} due</span>
          : <span className="fd-badge fd-badge--paid">Paid</span>}
        {tab === "arrivals"
          ? <button type="button" className="fd-btn fd-btn--sm fd-btn--primary" onClick={() => onCheckIn?.(r)}>Check in</button>
          : <button type="button" className="fd-btn fd-btn--sm" onClick={() => onCheckOut?.(r)}>Check out</button>}
      </div>
    </li>
  );
}

function Empty({ icon, title, text, action }) {
  return (
    <div className="fd-empty">
      <span className="fd-empty-icon"><Ico>{ICONS[icon]}</Ico></span>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="fd-dash" aria-busy="true" aria-label="Loading dashboard">
      <div className="fd-skel" style={{ height: 64, width: 320, marginBottom: 22 }} />
      <div className="fd-kpis">
        {[0, 1, 2, 3].map((i) => <div key={i} className="fd-skel" style={{ height: 132 }} />)}
      </div>
      <div className="fd-skel" style={{ height: 64, margin: "14px 0 18px" }} />
      <div className="fd-grid">
        <div className="fd-skel" style={{ height: 360 }} />
        <div className="fd-skel" style={{ height: 360 }} />
      </div>
    </div>
  );
}

/* =========================================================
   Hospitality dashboard

   Props
    - data:        { guests, reservations, requests }
    - hotel:       { name, location, rooms: [roomNumber, ...] }
    - utils:       { offset, money, balance, initials, nights } (shared with App.jsx)
    - setPage:     (pageId) => void
    - onNew:       () => void            open the new-reservation form
    - onCheckIn / onCheckOut: (reservation) => void
    - onOpenGuest: (guest) => void       open the guest profile
    - loading:     boolean               show a skeleton while data loads
   ========================================================= */
export default function Dashboard({
  data, hotel, utils, setPage, onNew, onCheckIn, onCheckOut, onOpenGuest, loading = false,
}) {
  const [tab, setTab] = useState("arrivals");
  const [hoveredKpi, setHoveredKpi] = useState(0);
  if (loading) return <DashboardSkeleton />;

  const showTab = (id) => {
    setTab(id);
    document.getElementById("fd-moves-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const { offset, money, balance } = utils;
  const today = offset(0);
  const totalRooms = hotel.rooms.length;
  const guestOf = (id) => data.guests.find((g) => g.id === id);

  const arrivals = data.reservations.filter((r) => r.arrival === today && r.status === "Confirmed");
  const inhouse = data.reservations.filter((r) => r.status === "Checked In");
  const departures = data.reservations.filter((r) => r.departure === today && r.status === "Checked In");
  const occupied = new Set(inhouse.map((r) => r.room));
  const occupancy = totalRooms ? Math.round((occupied.size / totalRooms) * 100) : 0;

  const withBalance = data.reservations
    .map((r) => ({ r, due: balance(r) }))
    .filter((x) => x.due > 0)
    .sort((a, b) => b.due - a.due);
  const totalDue = withBalance.reduce((sum, x) => sum + x.due, 0);
  const openRequests = data.requests.filter((q) => q.status === "Open");
  const upcoming = data.reservations.filter((r) => ["Confirmed", "Upcoming"].includes(r.status)).length;

  /* 7-day outlook: check-out day is not an occupied night */
  const outlook = Array.from({ length: 7 }, (_, i) => {
    const day = offset(i);
    const rooms = new Set(
      data.reservations
        .filter((r) => ["Confirmed", "Checked In"].includes(r.status) && r.arrival <= day && day < r.departure)
        .map((r) => r.room),
    );
    if (i === 0) occupied.forEach((room) => rooms.add(room));
    const pct = totalRooms ? Math.round((rooms.size / totalRooms) * 100) : 0;
    const d = new Date(`${day}T12:00:00`);
    return {
      day, pct, rooms: rooms.size,
      weekday: i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  });
  const average = Math.round(outlook.reduce((sum, d) => sum + d.pct, 0) / outlook.length);

  const roomState = (room) => {
    const stay = inhouse.find((r) => r.room === room);
    if (stay) {
      return { key: "occupied", text: guestOf(stay.guestId)?.name?.split(" ")[0] || "Occupied", leaving: stay.departure === today };
    }
    if (arrivals.some((r) => r.room === room)) return { key: "arriving", text: "Arriving", leaving: false };
    return { key: "available", text: "Available", leaving: false };
  };

  const tabs = [
    { id: "arrivals", label: "Arrivals", rows: arrivals },
    { id: "inhouse", label: "In-house", rows: inhouse },
    { id: "departures", label: "Departures", rows: departures },
  ];
  const active = tabs.find((t) => t.id === tab);
  const emptyText = {
    arrivals: "No arrivals are waiting to check in today.",
    inhouse: "No guests are checked in right now.",
    departures: "No check-outs are due today.",
  };

  const todayLabel = new Date(`${today}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="fd-dash">
      {/* ---------- Header ---------- */}
      <header className="fd-head">
        <div>
          <div className="fd-eyebrow">{todayLabel}</div>
          <h1 className="fd-title">{greeting()}</h1>
          <p className="fd-sub">Here is what is happening at {hotel.name}, {hotel.location} today.</p>
        </div>
        <div className="fd-head-actions">
          
          <button type="button" className="fd-btn fd-btn--primary" onClick={onNew}>
            <Ico>{ICONS.plus}</Ico>New reservation
          </button>
        </div>
      </header>

      {/* ---------- Reference-style welcome / quick actions ---------- */}
      <section className="fd-welcome" aria-label="Hospitality quick actions">
        <div className="fd-welcome-copy">
          <span className="fd-welcome-kicker">FRIDAY AI · HOSPITALITY CRM</span>
          <h2>Make every stay exceptional</h2>
          <p>Manage reservations, guests, billing and hotel operations in one place.</p>
        </div>
<div className="fd-welcome-actions">
  <button
    type="button"
    className="fd-welcome-action"
    onClick={() => setPage("reservations")}
  >
    <span className="fd-action-icon">▤</span>
    <b>Reservations</b>
  </button>

  <button
    type="button"
    className="fd-welcome-action"
    onClick={onNew}
  >
    <span className="fd-action-icon">＋</span>
    <b>Walk-in Guest</b>
  </button>

  <button
    type="button"
    className="fd-welcome-action"
    onClick={() => setPage("reports")}
  >
    <span className="fd-action-icon">▤</span>
    <b>Generate Report</b>
  </button>
</div>
      </section>

      {/* ---------- KPIs ---------- */}
      <section
        className="fd-kpis"
        aria-label="Key numbers for today"
        style={{ "--kpi-index": hoveredKpi, "--kpi-col": hoveredKpi % 2, "--kpi-row": Math.floor(hoveredKpi / 2) }}
        onMouseLeave={() => setHoveredKpi(0)}
      >
        <span className="fd-kpi-gradient" aria-hidden="true" />
        <Kpi active={hoveredKpi === 0} icon="bed" label="Occupancy tonight" value={`${occupancy}%`}
          note={`${occupied.size} of ${plural(totalRooms, "room")} occupied`} onHover={() => setHoveredKpi(0)} onClick={() => setPage("rooms")} />
        <Kpi active={hoveredKpi === 1} icon="login" label="Arrivals today" value={arrivals.length}
          note={arrivals.length ? "Waiting to check in" : "Nothing pending"} onHover={() => setHoveredKpi(1)} onClick={() => showTab("arrivals")} />
        <Kpi active={hoveredKpi === 2} icon="logout" label="Departures today" value={departures.length}
          note={departures.length ? "Waiting to check out" : "Nothing pending"} onHover={() => setHoveredKpi(2)} onClick={() => showTab("departures")} />
        <Kpi active={hoveredKpi === 3} icon="rupee" label="Balance due" value={money(totalDue)}
          note={withBalance.length ? `Across ${plural(withBalance.length, "reservation")}` : "Everything is settled"}
          onHover={() => setHoveredKpi(3)} onClick={() => setPage("payments")} />
      </section>

      <section className="fd-strip" aria-label="More numbers">
        <button type="button" onClick={() => showTab("inhouse")}><b>{inhouse.length}</b><span>In-house guests</span></button>
        <button type="button" onClick={() => setPage("rooms")}><b>{totalRooms - occupied.size}</b><span>Rooms available</span></button>
        <button type="button" onClick={() => setPage("reservations")}><b>{upcoming}</b><span>Upcoming reservations</span></button>
        <button type="button" onClick={() => setPage("requests")}><b>{openRequests.length}</b><span>Open guest requests</span></button>
        <button type="button" onClick={() => setPage("guests")}><b>{data.guests.length}</b><span>Guest profiles</span></button>
      </section>

      <div className="fd-grid">
        {/* ---------- Left column ---------- */}
        <div className="fd-col-stack">
          <section className="fd-card" aria-labelledby="fd-moves-title">
            <div className="fd-card-head">
              <div>
                <h2 id="fd-moves-title">Today's guests</h2>
                <p>Act on the next guest, then move on.</p>
              </div>
              <div className="fd-tabs" role="tablist" aria-label="Guest lists">
                {tabs.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
                    className="fd-tab" onClick={() => setTab(t.id)}>
                    {t.label}<span className="fd-count">{t.rows.length}</span>
                  </button>
                ))}
              </div>
            </div>
            {active.rows.length ? (
              <ul className="fd-list" role="tabpanel">
                {active.rows.map((r) => (
                  <MoveRow key={r.id} r={r} guest={guestOf(r.guestId)} tab={tab} utils={utils}
                    onCheckIn={onCheckIn} onCheckOut={onCheckOut} onOpenGuest={onOpenGuest} />
                ))}
              </ul>
            ) : (
              <Empty icon="check" title="All clear" text={emptyText[tab]}
                action={tab === "arrivals"
                  ? <button type="button" className="fd-btn fd-btn--sm" onClick={onNew}>New reservation</button>
                  : null} />
            )}
          </section>

          <section className="fd-card" aria-labelledby="fd-outlook-title">
            <div className="fd-card-head">
              <div>
                <h2 id="fd-outlook-title">7-day occupancy outlook</h2>
                <p>Confirmed and in-house stays. Check-out day is not counted as a night.</p>
              </div>
              <span className="fd-pill fd-pill--blue">Average {average}%</span>
            </div>
            <div className="fd-chart" role="img"
              aria-label={`Occupancy for the next 7 days: ${outlook.map((d) => `${d.weekday} ${d.pct}%`).join(", ")}`}>
              {outlook.map((d, i) => (
                <div key={d.day} className={`fd-bar-col${i === 0 ? " is-today" : ""}`}
                  title={`${d.label}: ${plural(d.rooms, "room")} occupied`}>
                  <span className="fd-bar-val">{d.pct}%</span>
                  <span className="fd-bar-track"><span className="fd-bar" style={{ height: `${Math.max(d.pct, 3)}%` }} /></span>
                  <span className="fd-bar-day">{d.weekday}<small>{d.label}</small></span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ---------- Right column ---------- */}
        <div className="fd-col-stack">
          <section className="fd-card" aria-labelledby="fd-rooms-title">
            <div className="fd-card-head">
              <div>
                <h2 id="fd-rooms-title">Room status</h2>
                <p>{plural(totalRooms, "room")} at {hotel.name}</p>
              </div>
              <button type="button" className="fd-link" onClick={() => setPage("rooms")}>
                All rooms<Ico>{ICONS.arrow}</Ico>
              </button>
            </div>
            <div className="fd-rooms">
              {hotel.rooms.map((room) => {
                const s = roomState(room);
                return (
                  <div key={room} className={`fd-room fd-room--${s.key}`}
                    title={s.leaving ? `Room ${room} · ${s.text} · leaving today` : `Room ${room} · ${s.text}`}>
                    {s.leaving && <i className="fd-flag" aria-label="Leaving today" />}
                    <b>{room}</b>
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </div>
            <div className="fd-legend">
              <span><i className="fd-dot fd-dot--occupied" />Occupied</span>
              <span><i className="fd-dot fd-dot--arriving" />Arriving</span>
              <span><i className="fd-dot fd-dot--available" />Available</span>
              <span><i className="fd-dot fd-dot--flag" />Leaving today</span>
            </div>
          </section>

          <section className="fd-card" aria-labelledby="fd-attn-title">
            <div className="fd-card-head">
              <div>
                <h2 id="fd-attn-title">Needs attention</h2>
                <p>Payments and guest requests</p>
              </div>
            </div>

            <div className="fd-block">
              <div className="fd-block-head">
                <h3>Payments due</h3>
                <button type="button" className="fd-link" onClick={() => setPage("payments")}>View all<Ico>{ICONS.arrow}</Ico></button>
              </div>
              {withBalance.length ? withBalance.slice(0, 3).map(({ r, due }) => {
                const g = guestOf(r.guestId);
                return (
                  <div className="fd-item" key={r.id}>
                    <div>
                      <strong>{g?.name || "Unknown guest"}</strong>
                      <span>Room {r.room} · {r.id}</span>
                    </div>
                    <b>{money(due)}</b>
                  </div>
                );
              }) : <p className="fd-none">No pending balances.</p>}
            </div>

            <div className="fd-block">
              <div className="fd-block-head">
                <h3>Guest requests</h3>
                <button type="button" className="fd-link" onClick={() => setPage("requests")}>View all<Ico>{ICONS.arrow}</Ico></button>
              </div>
              {openRequests.length ? openRequests.slice(0, 3).map((q) => {
                const g = guestOf(q.guestId);
                return (
                  <div className="fd-item" key={q.id}>
                    <div>
                      <strong>{q.text}</strong>
                      <span>{g?.name || "Unknown guest"}</span>
                    </div>
                    <span className="fd-badge fd-badge--info">Open</span>
                  </div>
                );
              }) : <p className="fd-none">No open requests.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
