import { useMemo, useState } from "react";
import { money, balance, total, date } from "../core/data.js";
import "./finance.css";

const METHODS = ["Cash", "UPI", "Credit / Debit Card", "Bank Transfer", "Online Payment", "Other"];

export default function Finance({ data, setData }) {
  const [tab, setTab] = useState("overview");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState({
    amount: "",
    method: "UPI",
    reference: "",
    notes: "",
  });

  const rows = useMemo(() => {
    return data.reservations
      .map((reservation) => ({
        reservation,
        guest: data.guests.find((g) => g.id === reservation.guestId),
        total: Number(total(reservation) || 0),
        paid: Number(reservation.paid || 0),
        balance: Number(balance(reservation) || 0),
      }))
      .filter(({ reservation, guest }) => {
        const haystack = [
          reservation.id,
          reservation.room,
          reservation.status,
          guest?.name,
          guest?.phone,
        ].filter(Boolean).join(" ").toLowerCase();

        const matchesSearch = haystack.includes(q.toLowerCase());
        const matchesStatus =
          status === "All" ||
          (status === "Paid" && balance(reservation) <= 0) ||
          (status === "Partial" && Number(reservation.paid || 0) > 0 && balance(reservation) > 0) ||
          (status === "Outstanding" && Number(reservation.paid || 0) <= 0 && balance(reservation) > 0);

        return matchesSearch && matchesStatus;
      });
  }, [data, q, status]);

  const collected = rows.reduce((sum, r) => sum + r.paid, 0);
  const outstanding = rows.reduce((sum, r) => sum + r.balance, 0);
  const invoiceValue = rows.reduce((sum, r) => sum + r.total, 0);
  const paidCount = rows.filter((r) => r.balance <= 0).length;
  const partialCount = rows.filter((r) => r.paid > 0 && r.balance > 0).length;
  const outstandingCount = rows.filter((r) => r.paid <= 0 && r.balance > 0).length;

  const openPayment = (row) => {
    setSelected(row);
    setPayment({
      amount: row.balance > 0 ? String(row.balance) : "",
      method: "UPI",
      reference: "",
      notes: "",
    });
    setPaymentOpen(true);
  };

  const recordPayment = () => {
    if (!selected || !setData) return;

    const amount = Number(payment.amount || 0);
    if (!amount || amount <= 0) return;
    if (amount > selected.balance) return;

    setData((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === selected.reservation.id
          ? {
              ...r,
              paid: Number(r.paid || 0) + amount,
              balance: Math.max(0, Number(r.balance || balance(r)) - amount),
              paymentMethod: payment.method,
              paymentReference: payment.reference,
              paymentNotes: payment.notes,
            }
          : r
      ),
    }));

    setPaymentOpen(false);
    setSelected(null);
  };

  return (
    <div className="finance-page">
      <div className="finance-heading">
        <div>
          <div className="finance-eyebrow">FINANCE & COLLECTIONS</div>
          <h1>Finance</h1>
          <p>Track guest collections, outstanding balances and payment transactions.</p>
        </div>
        <button className="finance-primary" onClick={() => setTab("collections")}>
          Record Payment
        </button>
      </div>

      <div className="finance-kpis">
        <Kpi label="Total billed" value={money(invoiceValue)} />
        <Kpi label="Collected" value={money(collected)} />
        <Kpi label="Outstanding" value={money(outstanding)} />
        <Kpi label="Paid reservations" value={paidCount} />
      </div>

      <div className="finance-tabs">
        {[
          ["overview", "Overview"],
          ["collections", "Collections"],
          ["transactions", "Transactions"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="finance-overview-grid">
          <section className="finance-card">
            <div className="finance-card-head">
              <div>
                <strong>Collection position</strong>
                <span>Current reservation-level receivables</span>
              </div>
            </div>
            <div className="finance-progress">
              <div
                className="finance-progress-fill"
                style={{
                  width: invoiceValue ? `${Math.min(100, (collected / invoiceValue) * 100)}%` : "0%",
                }}
              />
            </div>
            <div className="finance-progress-meta">
              <span>{invoiceValue ? Math.round((collected / invoiceValue) * 100) : 0}% collected</span>
              <strong>{money(outstanding)} outstanding</strong>
            </div>
          </section>

          <section className="finance-card">
            <div className="finance-card-head">
              <div>
                <strong>Receivable status</strong>
                <span>Reservations by payment position</span>
              </div>
            </div>
            <div className="finance-status-list">
              <StatusRow label="Paid" count={paidCount} className="paid" />
              <StatusRow label="Partially paid" count={partialCount} className="partial" />
              <StatusRow label="Outstanding" count={outstandingCount} className="outstanding" />
            </div>
          </section>
        </div>
      )}

      <section className="finance-card finance-register">
        <div className="finance-register-head">
          <div>
            <strong>{tab === "transactions" ? "Payment transactions" : "Guest collections"}</strong>
            <span>Reservation-linked payment and balance information</span>
          </div>
          <span className="finance-count">{rows.length}</span>
        </div>

        <div className="finance-filters">
          <div className="finance-search">
            <span>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search guest, reservation, room or mobile…"
            />
          </div>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Paid</option>
            <option>Partial</option>
            <option>Outstanding</option>
          </select>
        </div>

        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Reservation</th>
                <th>Stay</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const state =
                  row.balance <= 0 ? "Paid" : row.paid > 0 ? "Partial" : "Outstanding";

                return (
                  <tr key={row.reservation.id}>
                    <td>
                      <strong>{row.guest?.name || "Guest"}</strong>
                      <small>{row.guest?.phone || "No mobile"}</small>
                    </td>
                    <td>
                      <strong>{row.reservation.id}</strong>
                      <small>{row.reservation.source || "Direct"}</small>
                    </td>
                    <td>
                      <strong>Room {row.reservation.room || "Unassigned"}</strong>
                      <small>{date(row.reservation.arrival)} → {date(row.reservation.departure)}</small>
                    </td>
                    <td>{money(row.total)}</td>
                    <td className="finance-paid">{money(row.paid)}</td>
                    <td className="finance-balance">{money(row.balance)}</td>
                    <td>
                      <span className={`finance-status ${state.toLowerCase()}`}>{state}</span>
                    </td>
                    <td>
                      {row.balance > 0 ? (
                        <button className="finance-action" onClick={() => openPayment(row)}>
                          Collect
                        </button>
                      ) : (
                        <button className="finance-action muted-action" onClick={() => setSelected(row)}>
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan="8" className="finance-empty">No finance records match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {paymentOpen && selected && (
        <div className="finance-modal-backdrop" onMouseDown={() => setPaymentOpen(false)}>
          <div className="finance-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="finance-modal-head">
              <div>
                <div className="finance-eyebrow">RECORD COLLECTION</div>
                <h2>Record Payment</h2>
                <p>{selected.guest?.name || "Guest"} · {selected.reservation.id}</p>
              </div>
              <button className="finance-close" onClick={() => setPaymentOpen(false)}>×</button>
            </div>

            <div className="finance-payment-summary">
              <div><span>Total</span><strong>{money(selected.total)}</strong></div>
              <div><span>Already paid</span><strong>{money(selected.paid)}</strong></div>
              <div><span>Balance</span><strong>{money(selected.balance)}</strong></div>
            </div>

            <div className="finance-form-grid">
              <label>
                <span>Amount received</span>
                <input
                  type="number"
                  min="0"
                  max={selected.balance}
                  value={payment.amount}
                  onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
                />
              </label>
              <label>
                <span>Payment method</span>
                <select
                  value={payment.method}
                  onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
                >
                  {METHODS.map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>
              <label className="wide">
                <span>Reference / Transaction ID</span>
                <input
                  value={payment.reference}
                  onChange={(e) => setPayment((p) => ({ ...p, reference: e.target.value }))}
                  placeholder="Optional"
                />
              </label>
              <label className="wide">
                <span>Notes</span>
                <textarea
                  rows="3"
                  value={payment.notes}
                  onChange={(e) => setPayment((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Payment notes…"
                />
              </label>
            </div>

            <div className="finance-modal-actions">
              <button className="finance-secondary" onClick={() => setPaymentOpen(false)}>Cancel</button>
              <button className="finance-primary" onClick={recordPayment}>Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="finance-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusRow({ label, count, className }) {
  return (
    <div className="finance-status-row">
      <span><i className={className} />{label}</span>
      <strong>{count}</strong>
    </div>
  );
}
