import { useMemo, useState } from "react";
import { date, money, balance, initials } from "../core/data.js";
import { Badge } from "../components/Common.jsx";

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none">
      <path
        d="M7.2 4.7 9.5 4c.7-.2 1.4.2 1.7.8l1.1 2.7c.2.5.1 1.1-.3 1.4l-1.5 1.2c1 2 2.4 3.4 4.4 4.4l1.2-1.5c.3-.4.9-.5 1.4-.3l2.7 1.1c.6.3.9 1 .8 1.7l-.7 2.3c-.2.7-.8 1.2-1.5 1.2C10.9 18.8 5.2 13.1 5 6.2c0-.7.5-1.3 1.2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Reservations({ data, setPage, onCheckIn, onEdit, onCall }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All Rooms");
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  const rooms = useMemo(
    () => [...new Set(data.reservations.map((r) => r.room).filter(Boolean))].sort(),
    [data.reservations]
  );

  const sources = useMemo(
    () => [...new Set(data.reservations.map((r) => r.source || "Direct"))].sort(),
    [data.reservations]
  );

  const rows = useMemo(() => {
    return data.reservations
      .filter((r) => {
        const g = data.guests.find((x) => x.id === r.guestId) || {};
        const searchText = [g.name, g.phone, r.id, r.room, r.source]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchSearch = searchText.includes(q.trim().toLowerCase());

        const matchStatus =
          filter === "All" ||
          (filter === "Upcoming"
            ? ["Confirmed", "Upcoming"].includes(r.status)
            : r.status === filter);

        const matchRoom =
          roomFilter === "All Rooms" || String(r.room) === String(roomFilter);

        const matchSource =
          sourceFilter === "All Sources" ||
          String(r.source || "Direct") === String(sourceFilter);

        return matchSearch && matchStatus && matchRoom && matchSource;
      })
      .sort((a, b) => String(a.arrival).localeCompare(String(b.arrival)));
  }, [data.reservations, data.guests, q, filter, roomFilter, sourceFilter]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">BOOKING PIPELINE</div>
          <h1>Reservations</h1>
          <p className="muted">
            View and manage guest reservations, stay details, room allocation and payment status.
          </p>
        </div>
      </div>

      <section
        className="card"
        style={{
          marginBottom: 14,
          padding: 12,
          borderRadius: 12,
          border: "1px solid #dfe7f2",
          boxShadow: "0 4px 14px rgba(20,45,85,.04)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) repeat(3, minmax(140px, 180px))",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7c8da5",
                fontSize: 14,
                pointerEvents: "none",
              }}
            >
              ⌕
            </span>
            <input
              aria-label="Search reservations"
              placeholder="Search guest, mobile, room or reservation..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px 0 34px",
                border: "1px solid #d8e2ef",
                borderRadius: 9,
                background: "#fff",
                color: "#15284b",
                outline: "none",
                fontFamily: "Poppins, sans-serif",
                fontSize: 12,
              }}
            />
          </div>

          <select
            aria-label="Reservation status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={toolbarSelectStyle}
          >
            <option value="All">All Reservations</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <select
            aria-label="Room"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            style={toolbarSelectStyle}
          >
            <option>All Rooms</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                Room {room}
              </option>
            ))}
          </select>

          <select
            aria-label="Booking source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={toolbarSelectStyle}
          >
            <option>All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="card table-card" style={{ overflow: "hidden" }}>
        <div
          className="reservations-table-scroll"
          style={{ width: "100%", overflowX: "auto" }}
        >
          <table style={{ minWidth: "1260px" }}>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Mobile</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Room</th>
                <th>Source</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((r) => {
                  const g = data.guests.find((x) => x.id === r.guestId) || {};
                  const adults = r.adults ?? "—";
                  const children = r.children ?? "—";
                  const room = r.room || "—";
                  const source = r.source || "Direct";
                  const phone = g.phone || "";
                  const paid = Number(r.paid || 0);
                  const due = balance(r);

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="guest-cell">
                          <span className="avatar">
                            {initials(g.name || "Guest")}
                          </span>
                          <div>
                            <strong>{g.name || "Unknown guest"}</strong>
                            <small>{r.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {phone ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <strong>{phone}</strong>
                            <button
                              type="button"
                              title={`Call ${g.name || "guest"}`}
                              aria-label={`Call ${g.name || "guest"} at ${phone}`}
                              onClick={() =>
                                onCall?.({
                                  ...g,
                                  phone,
                                  name: g.name || "Guest",
                                })
                              }
                              disabled={!onCall}
                              style={{
                                width: 28,
                                height: 28,
                                padding: 0,
                                display: "inline-grid",
                                placeItems: "center",
                                borderRadius: "50%",
                                border: "1px solid #cfe0fb",
                                background: "#edf5ff",
                                color: "#1769e0",
                                cursor: onCall ? "pointer" : "not-allowed",
                                opacity: onCall ? 1 : 0.45,
                                transition: "all .18s ease",
                              }}
                            >
                              <CallIcon />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#98a6b8" }}>No mobile</span>
                        )}
                      </td>

                      <td>
                        <strong>{date(r.arrival)}</strong>
                        <small>{r.expectedIn || "—"}</small>
                      </td>

                      <td>
                        <strong>{date(r.departure)}</strong>
                        <small>{r.expectedOut || "—"}</small>
                      </td>

                      <td>
                        <strong>{adults}</strong>
                      </td>

                      <td>
                        <strong>{children}</strong>
                      </td>

                      <td>
                        <strong>{room}</strong>
                      </td>

                      <td>
                        <span>{source}</span>
                      </td>

                      <td>
                        <Badge>{r.status}</Badge>
                      </td>

                      <td>
                        <strong>{money(due)}</strong>
                        <small>{money(paid)} paid</small>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {onEdit && (
                            <button
                              type="button"
                              title={`Edit reservation ${r.id}`}
                              aria-label={`Edit reservation ${r.id}`}
                              onClick={() => onEdit(r)}
                              style={{
                                width: 30,
                                height: 30,
                                padding: 0,
                                display: "inline-grid",
                                placeItems: "center",
                                borderRadius: 8,
                                border: "1px solid #cfe0fb",
                                background: "#edf5ff",
                                color: "#1769e0",
                                cursor: "pointer",
                                transition: "all .18s ease",
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="m14.5 7.5 2 2"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          )}

                          {r.status === "Confirmed" && (
                            <button
                              type="button"
                              className="primary small-btn"
                              onClick={() => onCheckIn(r)}
                            >
                              Check in
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="empty-cell">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const toolbarSelectStyle = {
  width: "100%",
  height: 40,
  padding: "0 30px 0 11px",
  border: "1px solid #d8e2ef",
  borderRadius: 9,
  background: "#fff",
  color: "#24385b",
  fontFamily: "Poppins, sans-serif",
  fontSize: 12,
  outline: "none",
};
