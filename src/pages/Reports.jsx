import { useMemo, useState } from "react";
import { nights, total, balance, toCSV, downloadCSV } from "../core/data.js";
import "./reports.css";

const REPORT_STATUSES = ["Confirmed", "Checked In", "Checked Out"];

function DownloadIcon({ size = 17 }) {
  return (
    <svg
      className="reports-download-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3v11" />
      <path d="m7.5 10 4.5 4.5 4.5-4.5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="reports-close-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="reports-calendar-svg" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M7 3.5v3M17 3.5v3M3.5 9h17" />
    </svg>
  );
}

function ReportsDownloadModal({ data, onClose }) {
  const now = new Date();

  const monthString = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const [from, setFrom] = useState(
    monthString(new Date(now.getFullYear(), now.getMonth() - 11, 1))
  );
  const [to, setTo] = useState(monthString(now));

  const presets = [
    ["This month", 1],
    ["Last 3 months", 3],
    ["Last 6 months", 6],
    ["Last 12 months", 12],
  ];

  const setPreset = (months) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    setFrom(monthString(start));
    setTo(monthString(now));
  };

  const download = () => {
    if (!from || !to || from > to) return;

    const fromDate = `${from}-01`;
    const [toYear, toMonth] = to.split("-").map(Number);
    const lastDay = new Date(toYear, toMonth, 0).getDate();
    const toDate = `${to}-${String(lastDay).padStart(2, "0")}`;

    const rows = data.reservations
      .filter((r) => r.arrival >= fromDate && r.arrival <= toDate)
      .map((r) => {
        const guest = data.guests.find((x) => x.id === r.guestId);
        return {
          "Reservation ID": r.id,
          Guest: guest?.name || "",
          Room: r.room || "",
          Arrival: r.arrival,
          Departure: r.departure,
          Nights: nights(r),
          Rate: r.rate,
          Total: total(r),
          Paid: r.paid,
          Balance: balance(r),
          Status: r.status,
          Source: r.source,
          "Booking Date": r.bookingDate,
        };
      });

    const headers = [
      "Reservation ID",
      "Guest",
      "Room",
      "Arrival",
      "Departure",
      "Nights",
      "Rate",
      "Total",
      "Paid",
      "Balance",
      "Status",
      "Source",
      "Booking Date",
    ];

    downloadCSV(`report_${from}_to_${to}.csv`, toCSV(rows, headers));
    onClose();
  };

  return (
    <div className="reports-modal-backdrop" onMouseDown={onClose}>
      <section
        className="reports-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reports-download-title"
      >
        <div className="reports-modal-top">
          <div className="reports-modal-icon">
            <DownloadIcon size={18} />
          </div>

          <button
            type="button"
            className="reports-modal-close"
            onClick={onClose}
            aria-label="Close download report"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="reports-modal-heading">
          <div className="reports-modal-eyebrow">REPORT EXPORT</div>
          <h2 id="reports-download-title">Download reservation report</h2>
          <p>
            Select the reservation period you want to export. The report will
            be downloaded as an Excel-ready CSV file.
          </p>
        </div>

        <div className="reports-range-section">
          <div className="reports-section-label">Quick range</div>

          <div className="reports-presets">
            {presets.map(([label, months]) => (
              <button
                type="button"
                key={label}
                className={
                  from === monthString(
                    new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
                  )
                    ? "reports-preset active"
                    : "reports-preset"
                }
                onClick={() => setPreset(months)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="reports-date-grid">
          <label className="reports-date-field">
            <span>From month</span>
            <div className="reports-date-input">
              <CalendarIcon />
              <input
                type="month"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
          </label>

          <div className="reports-date-arrow" aria-hidden="true">
            →
          </div>

          <label className="reports-date-field">
            <span>To month</span>
            <div className="reports-date-input">
              <CalendarIcon />
              <input
                type="month"
                value={to}
                min={from}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </label>
        </div>

        {from > to && (
          <div className="reports-date-error">
            The ending month must be the same as or later than the starting
            month.
          </div>
        )}

        <div className="reports-export-note">
          <div className="reports-export-note-icon">
            <DownloadIcon size={15} />
          </div>
          <div>
            <strong>CSV export</strong>
            <span>
              Includes reservation, guest, room, stay, payment and balance
              details.
            </span>
          </div>
        </div>

        <div className="reports-modal-actions">
          <button type="button" className="reports-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="reports-download-primary"
            onClick={download}
            disabled={!from || !to || from > to}
          >
            <DownloadIcon size={16} />
            <span>Download report</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default function ReportsPage({ data, requests = [] }) {
  const [showDownload, setShowDownload] = useState(false);

  const lifecycle = useMemo(() => {
    const count = data.reservations.length || 1;

    return REPORT_STATUSES.map((status) => {
      const value = data.reservations.filter(
        (reservation) => reservation.status === status
      ).length;

      return {
        status,
        value,
        percentage: Math.max(4, (value / count) * 100),
      };
    });
  }, [data.reservations]);

  const totals = useMemo(() => {
    const reservations = data.reservations || [];

    return {
      stays: reservations.length,
      guests: data.guests?.length || 0,
      openRequests: requests.filter((request) => request.status === "Open").length,
      revenue: reservations.reduce((sum, reservation) => sum + Number(total(reservation) || 0), 0),
      collected: reservations.reduce((sum, reservation) => sum + Number(reservation.paid || 0), 0),
      outstanding: reservations.reduce(
        (sum, reservation) => sum + Number(balance(reservation) || 0),
        0
      ),
    };
  }, [data, requests]);

  const collectionPercentage = totals.revenue
    ? Math.min(100, (totals.collected / totals.revenue) * 100)
    : 0;

  return (
    <div className="reports-page">
      <header className="reports-page-heading">
        <div>
          <div className="reports-eyebrow">OPERATIONS & ANALYTICS</div>
          <h1>Reports</h1>
          <p>
            Monitor hotel performance, stay activity and financial collection
            across your reservations.
          </p>
        </div>

        <button
          type="button"
          className="reports-download-trigger"
          title="Download reservation report"
          aria-label="Download reservation report"
          onClick={() => setShowDownload(true)}
        >
          <DownloadIcon size={17} />
          <span>Download report</span>
        </button>
      </header>

      <section className="reports-kpi-grid">
        <article className="reports-kpi-card">
          <div className="reports-kpi-label">Total stays</div>
          <strong>{totals.stays}</strong>
          <span>Reservation records</span>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-label">Unique guests</div>
          <strong>{totals.guests}</strong>
          <span>Registered guest profiles</span>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-label">Collected</div>
          <strong>₹{totals.collected.toLocaleString("en-IN")}</strong>
          <span>{Math.round(collectionPercentage)}% of billed value</span>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-label">Outstanding</div>
          <strong>₹{totals.outstanding.toLocaleString("en-IN")}</strong>
          <span>Pending guest balance</span>
        </article>
      </section>

      <section className="reports-content-grid">
        <article className="reports-panel reports-lifecycle-panel">
          <div className="reports-panel-heading">
            <div>
              <div className="reports-panel-title">Stay lifecycle</div>
              <p>Current reservation status distribution</p>
            </div>
            <span className="reports-panel-badge">{totals.stays} stays</span>
          </div>

          <div className="reports-lifecycle-list">
            {lifecycle.map((item) => (
              <div className="reports-lifecycle-row" key={item.status}>
                <div className="reports-lifecycle-label">
                  <span>{item.status}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className="reports-bar-track">
                  <i style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="reports-panel reports-snapshot-panel">
          <div className="reports-panel-heading">
            <div>
              <div className="reports-panel-title">Hotel snapshot</div>
              <p>Operational indicators</p>
            </div>
          </div>

          <div className="reports-snapshot-list">
            <div>
              <span>Unique guests</span>
              <strong>{totals.guests}</strong>
            </div>
            <div>
              <span>Total stays</span>
              <strong>{totals.stays}</strong>
            </div>
            <div>
              <span>Open requests</span>
              <strong>{totals.openRequests}</strong>
            </div>
            <div>
              <span>Outstanding balance</span>
              <strong>₹{totals.outstanding.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="reports-bottom-panel">
        <div>
          <div className="reports-bottom-icon">
            <DownloadIcon size={17} />
          </div>
          <div>
            <strong>Need a detailed reservation report?</strong>
            <span>
              Export a custom date range with guest, room, payment and balance
              information.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="reports-secondary-action"
          onClick={() => setShowDownload(true)}
        >
          Export CSV
          <DownloadIcon size={15} />
        </button>
      </section>

      {showDownload && (
        <ReportsDownloadModal
          data={data}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}
