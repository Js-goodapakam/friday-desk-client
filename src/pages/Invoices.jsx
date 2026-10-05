import { useMemo, useState } from "react";
import { uid, stamp, offset, date, money, nights } from "../core/data.js";
import "./invoices.css";

const DEFAULT_SETTINGS = {
  prefix: "INV",
  nextNumber: 1,
  template: "hotel-classic",
  taxRate: 5,
  terms: "All payments must be made in full before the commencement of any work.",
  hotelName: "",
  address: "",
  cityStateCountry: "",
  phone: "",
  email: "",
  gstNumber: "",
  website: "",
  logo: "",
  bannerText: "",
  bannerColor: "#eef0f4",
  footerNote: "Thank you for choosing us.",
};

function settingsFrom(data) {
  return { ...DEFAULT_SETTINGS, ...(data.invoiceSettings || {}) };
}

function InvoicesPage({ data, setData }) {
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => settingsFrom(data));

  const invoices = data.invoices || [];

  const metrics = useMemo(() => {
    const total = invoices.reduce((s, x) => s + Number(x.total || 0), 0);
    const paid = invoices.reduce((s, x) => s + Number(x.paid || 0), 0);
    return {
      count: invoices.length,
      issued: invoices.filter(x => x.status !== "Cancelled").length,
      paid,
      balance: Math.max(0, total - paid),
    };
  }, [invoices]);

  const saveSettings = () => {
    setData(d => ({ ...d, invoiceSettings: settings }));
    setSettingsOpen(false);
  };

  const handleLogo = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload a logo below 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setSettings(s => ({ ...s, logo: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const create = payload => {
    const current = settingsFrom(data);
    const num = Number(current.nextNumber || 1);
    const invoice = {
      id: uid("INV"),
      number: `${current.prefix || "INV"}-${String(num).padStart(6, "0")}`,
      createdAt: stamp(),
      status: payload.paid >= payload.total ? "Paid" : payload.paid > 0 ? "Partially Paid" : "Issued",
      ...payload,
      hotelSnapshot: {
        hotelName: current.hotelName,
        address: current.address,
        cityStateCountry: current.cityStateCountry,
        phone: current.phone,
        email: current.email,
        gstNumber: current.gstNumber,
        website: current.website,
        logo: current.logo,
        bannerText: current.bannerText,
        bannerColor: current.bannerColor,
        footerNote: current.footerNote,
      },
    };

    setData(d => ({
      ...d,
      invoices: [invoice, ...(d.invoices || [])],
      invoiceSettings: {
        ...settingsFrom(d),
        nextNumber: num + 1,
      },
    }));
    setCreating(false);
    setViewing(invoice);
  };

  return (
    <div className="invoices-page">
      <div className="page-heading invoice-page-heading">
        <div>
          <div className="eyebrow">GUEST BILLING</div>
          <h1>Invoices</h1>
          <p className="muted">
            Create, review and issue hotel invoices from reservations and guest stays.
          </p>
        </div>
        <div className="invoice-heading-actions">
          <button type="button" className="subtle" onClick={() => setSettingsOpen(true)}>
            ⚙ Invoice Settings
          </button>
          <button type="button" className="primary" onClick={() => setCreating(true)}>
            ＋ Generate Invoice
          </button>
        </div>
      </div>

      <div className="invoice-kpis">
        <Kpi label="Invoices" value={metrics.count} />
        <Kpi label="Issued" value={metrics.issued} />
        <Kpi label="Collected" value={money(metrics.paid)} />
        <Kpi label="Balance Due" value={money(metrics.balance)} />
      </div>

      <section className="invoice-module-card card">
        <div className="invoice-list-head">
          <div>
            <div className="eyebrow">BILLING REGISTER</div>
            <h2>Hotel invoices</h2>
            <p>Every invoice keeps a snapshot of the hotel header used when it was generated.</p>
          </div>
          <span className="invoice-count-pill">{invoices.length}</span>
        </div>

        <div className="table-scroll">
          <table className="invoice-register-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Guest</th>
                <th>Reservation</th>
                <th>Room</th>
                <th>Invoice Date</th>
                <th>Total</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length ? invoices.map(inv => {
                const g = data.guests.find(x => x.id === inv.guestId);
                const r = data.reservations.find(x => x.id === inv.reservationId);
                const balance = Math.max(0, Number(inv.total || 0) - Number(inv.paid || 0));
                return (
                  <tr key={inv.id}>
                    <td><strong>{inv.number}</strong></td>
                    <td>
                      <strong>{g?.name || "—"}</strong>
                      <small>{g?.phone || g?.email || ""}</small>
                    </td>
                    <td>{inv.reservationId || "—"}</td>
                    <td>{r?.room || inv.room || "—"}</td>
                    <td>{date(inv.issueDate)}</td>
                    <td><strong>{money(inv.total)}</strong></td>
                    <td>{money(balance)}</td>
                    <td><span className={`invoice-status invoice-status--${String(inv.status || "Issued").toLowerCase().replaceAll(" ", "-")}`}>{inv.status || "Issued"}</span></td>
                    <td>
                      <button type="button" className="subtle table-action" onClick={() => setViewing(inv)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="9" className="empty-cell">
                    No invoices generated yet. Use Generate Invoice to create the first hotel invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {creating && (
        <InvoiceEditor
          data={data}
          settings={settingsFrom(data)}
          onClose={() => setCreating(false)}
          onSave={create}
        />
      )}

      {viewing && (
        <InvoiceView
          invoice={viewing}
          data={data}
          settings={settingsFrom(data)}
          onClose={() => setViewing(null)}
        />
      )}

      {settingsOpen && (
        <InvoiceSettings
          settings={settings}
          setSettings={setSettings}
          onLogo={handleLogo}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="invoice-kpi card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InvoiceSettings({ settings, setSettings, onLogo, onClose, onSave }) {
  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="modal-backdrop">
      <section className="modal card invoice-settings-modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">HOTEL ADMIN</div>
            <h2>Invoice Settings</h2>
            <p className="muted small">
              Configure the hotel identity that appears in the invoice header and banner.
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>×</button>
        </div>

        <div className="invoice-settings-preview">
          <div className="invoice-settings-logo">
            {settings.logo ? <img src={settings.logo} alt="Hotel logo" /> : <span>LOGO</span>}
          </div>
          <div>
            <strong>{settings.hotelName || "Your Hotel Name"}</strong>
            <span>{settings.address || "Hotel address"}</span>
            <span>{settings.cityStateCountry || "City, State, Country"}</span>
            <span>{settings.phone || "Phone"} · {settings.email || "Email"}</span>
          </div>
        </div>

        <div className="invoice-settings-grid">
          <label className="invoice-field wide">
            <span>Hotel / Property Name *</span>
            <input value={settings.hotelName} onChange={e => update("hotelName", e.target.value)} placeholder="Taj Tirupati" />
          </label>
          <label className="invoice-field wide">
            <span>Address *</span>
            <input value={settings.address} onChange={e => update("address", e.target.value)} placeholder="Hotel street address" />
          </label>
          <label className="invoice-field">
            <span>City / State / Country</span>
            <input value={settings.cityStateCountry} onChange={e => update("cityStateCountry", e.target.value)} placeholder="Tirupati, Andhra Pradesh, India" />
          </label>
          <label className="invoice-field">
            <span>GSTIN</span>
            <input value={settings.gstNumber} onChange={e => update("gstNumber", e.target.value)} placeholder="GSTIN" />
          </label>
          <label className="invoice-field">
            <span>Phone</span>
            <input value={settings.phone} onChange={e => update("phone", e.target.value)} />
          </label>
          <label className="invoice-field">
            <span>Email</span>
            <input type="email" value={settings.email} onChange={e => update("email", e.target.value)} />
          </label>
          <label className="invoice-field">
            <span>Website</span>
            <input value={settings.website} onChange={e => update("website", e.target.value)} />
          </label>
          <label className="invoice-field">
            <span>Invoice Prefix</span>
            <input value={settings.prefix} onChange={e => update("prefix", e.target.value.toUpperCase())} />
          </label>
          <label className="invoice-field">
            <span>Next Invoice Number</span>
            <input type="number" min="1" value={settings.nextNumber} onChange={e => update("nextNumber", Number(e.target.value || 1))} />
          </label>
          <label className="invoice-field">
            <span>Default GST / Tax %</span>
            <input type="number" min="0" max="100" value={settings.taxRate} onChange={e => update("taxRate", Number(e.target.value || 0))} />
          </label>
          <label className="invoice-field wide">
            <span>Header / Banner Text</span>
            <input value={settings.bannerText} onChange={e => update("bannerText", e.target.value)} placeholder="Balance due, hotel slogan, or other header text" />
          </label>
          <label className="invoice-field">
            <span>Banner Background</span>
            <input type="color" value={settings.bannerColor} onChange={e => update("bannerColor", e.target.value)} />
          </label>
          <label className="invoice-field wide">
            <span>Terms & Conditions</span>
            <textarea rows="3" value={settings.terms} onChange={e => update("terms", e.target.value)} />
          </label>
          <label className="invoice-field wide">
            <span>Footer Note</span>
            <input value={settings.footerNote} onChange={e => update("footerNote", e.target.value)} />
          </label>
          <label className="invoice-field wide">
            <span>Hotel Logo</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogo} />
            <small>PNG, JPG or WebP · maximum 2 MB</small>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="subtle" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" onClick={onSave}>Save Hotel Invoice Settings</button>
        </div>
      </section>
    </div>
  );
}

function InvoiceEditor({ data, settings, onClose, onSave }) {
  const [reservationId, setReservationId] = useState("");
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(settings.taxRate ?? 5);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [dueDate, setDueDate] = useState(offset(0));
  const [notes, setNotes] = useState(settings.terms || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [error, setError] = useState("");

  const res = data.reservations.find(r => r.id === reservationId);
  const guest = res ? data.guests.find(g => g.id === res.guestId) : null;

  const subtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.rate || 0), 0);
  const taxable = Math.max(0, subtotal - Number(discount || 0));
  const taxAmount = Math.round(taxable * Number(taxRate || 0) / 100 * 100) / 100;
  const total = Math.max(0, taxable + taxAmount);
  const balance = Math.max(0, total - Number(paid || 0));

  const chooseReservation = value => {
    setReservationId(value);
    setError("");
    const r = data.reservations.find(x => x.id === value);
    if (!r) {
      setItems([]);
      return;
    }
    const n = nights(r);
    setItems([
      {
        id: "room",
        description: `Room ${r.room || "Unassigned"} — accommodation`,
        quantity: n,
        rate: Number(r.rate || 0),
      },
    ]);
    setPaid(Number(r.paid || 0));
  };

  const addItem = () =>
    setItems(x => [...x, { id: uid("LI"), description: "", quantity: 1, rate: 0 }]);

  const updateItem = (id, patch) =>
    setItems(x => x.map(it => it.id === id ? { ...it, ...patch } : it));

  const removeItem = id => setItems(x => x.filter(it => it.id !== id));

  const submit = () => {
    if (!res) {
      setError("Select a reservation to bill.");
      return;
    }
    if (!items.length || items.some(it => !String(it.description || "").trim())) {
      setError("Every line item needs a description.");
      return;
    }
    onSave({
      reservationId: res.id,
      guestId: res.guestId,
      room: res.room,
      arrival: res.arrival,
      departure: res.departure,
      issueDate: offset(0),
      dueDate,
      items: items.map(it => ({
        ...it,
        quantity: Number(it.quantity || 0),
        rate: Number(it.rate || 0),
        amount: Number(it.quantity || 0) * Number(it.rate || 0),
      })),
      taxRate: Number(taxRate || 0),
      discount: Number(discount || 0),
      subtotal,
      taxAmount,
      total,
      paid: Number(paid || 0),
      balance,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="modal-backdrop">
      <section className="modal card invoice-editor-modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">NEW HOTEL INVOICE</div>
            <h2>Generate Invoice</h2>
            <p className="muted small">Select a reservation, verify the stay details, then build the folio line items.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>×</button>
        </div>

        <div className="invoice-editor-layout">
          <div>
            <div className="invoice-form-section">
              <div className="invoice-section-title">
                <span>01</span>
                <div><strong>Guest & stay</strong><small>Reservation-linked billing</small></div>
              </div>

              <label className="invoice-field wide">
                <span>Reservation *</span>
                <select value={reservationId} onChange={e => chooseReservation(e.target.value)}>
                  <option value="">Select reservation</option>
                  {data.reservations.map(r => {
                    const g = data.guests.find(x => x.id === r.guestId);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.id} · {g?.name || "Guest"} · Room {r.room || "Unassigned"} · {date(r.arrival)} → {date(r.departure)}
                      </option>
                    );
                  })}
                </select>
              </label>

              {guest && res && (
                <div className="invoice-guest-summary">
                  <div><span>Guest</span><strong>{guest.name}</strong></div>
                  <div><span>Mobile</span><strong>{guest.phone || "—"}</strong></div>
                  <div><span>Room</span><strong>{res.room || "Unassigned"}</strong></div>
                  <div><span>Stay</span><strong>{date(res.arrival)} → {date(res.departure)}</strong></div>
                  <div><span>Nights</span><strong>{nights(res)}</strong></div>
                  <div><span>Advance / Paid</span><strong>{money(res.paid || 0)}</strong></div>
                </div>
              )}
            </div>

            <div className="invoice-form-section">
              <div className="invoice-section-title">
                <span>02</span>
                <div><strong>Invoice details</strong><small>Document dates and settlement</small></div>
              </div>
              <div className="invoice-fields-grid">
                <label className="invoice-field">
                  <span>Invoice date</span>
                  <input type="date" value={offset(0)} readOnly />
                </label>
                <label className="invoice-field">
                  <span>Due date</span>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </label>
                <label className="invoice-field">
                  <span>Payment received</span>
                  <input type="number" min="0" value={paid} onChange={e => setPaid(e.target.value)} />
                </label>
                <label className="invoice-field">
                  <span>Payment method</span>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Online / Prepaid</option>
                    <option>Corporate Credit</option>
                    <option>OTA Settlement</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="invoice-form-section">
              <div className="invoice-section-title">
                <span>03</span>
                <div><strong>Line items</strong><small>Room, F&B, services and other folio charges</small></div>
              </div>

              <div className="invoice-line-editor">
                <div className="invoice-line-head"><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span><span /></div>
                {items.map(it => (
                  <div className="invoice-line-row" key={it.id}>
                    <input placeholder="e.g. Room accommodation" value={it.description} onChange={e => updateItem(it.id, { description: e.target.value })} />
                    <input type="number" min="0" value={it.quantity} onChange={e => updateItem(it.id, { quantity: e.target.value })} />
                    <input type="number" min="0" value={it.rate} onChange={e => updateItem(it.id, { rate: e.target.value })} />
                    <strong>{money(Number(it.quantity || 0) * Number(it.rate || 0))}</strong>
                    <button type="button" className="icon-button" onClick={() => removeItem(it.id)}>×</button>
                  </div>
                ))}
                <button type="button" className="subtle add-line-button" onClick={addItem}>＋ Add line item</button>
              </div>
            </div>

            <div className="invoice-form-section">
              <div className="invoice-section-title">
                <span>04</span>
                <div><strong>Tax & notes</strong><small>Final billing adjustments</small></div>
              </div>
              <div className="invoice-fields-grid">
                <label className="invoice-field">
                  <span>GST / Tax (%)</span>
                  <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
                </label>
                <label className="invoice-field">
                  <span>Discount (₹)</span>
                  <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
                </label>
                <label className="invoice-field wide">
                  <span>Terms / Notes</span>
                  <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} />
                </label>
              </div>
            </div>

            {error && <div className="invoice-error">{error}</div>}
          </div>

          <aside className="invoice-live-summary">
            <div className="invoice-mini-preview">
              <div className="invoice-mini-banner" style={{ background: settings.bannerColor || "#eef0f4" }}>
                {settings.logo ? <img src={settings.logo} alt="" /> : <span className="invoice-mini-logo">Z</span>}
                <div><strong>{settings.hotelName || "Hotel Name"}</strong><small>{settings.cityStateCountry || "Hotel address"}</small></div>
              </div>
              <div className="invoice-mini-body">
                <span>BALANCE DUE</span>
                <strong>{money(balance)}</strong>
                <hr />
                <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
                <div><span>Discount</span><b>-{money(discount)}</b></div>
                <div><span>Tax</span><b>{money(taxAmount)}</b></div>
                <div className="grand"><span>Total</span><b>{money(total)}</b></div>
              </div>
            </div>
            <div className="invoice-total-card">
              <span>Balance Due</span>
              <strong>{money(balance)}</strong>
              <small>{paid > 0 ? `${money(paid)} recorded as paid` : "No payment recorded"}</small>
            </div>
          </aside>
        </div>

        <div className="modal-actions">
          <button type="button" className="subtle" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" onClick={submit}>Create Invoice</button>
        </div>
      </section>
    </div>
  );
}

function InvoiceView({ invoice, data, settings, onClose }) {
  const res = data.reservations.find(r => r.id === invoice.reservationId);
  const guest = data.guests.find(g => g.id === invoice.guestId);
  const p = { ...settings, ...(invoice.hotelSnapshot || {}) };
  const balance = Math.max(0, Number(invoice.total || 0) - Number(invoice.paid || 0));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal card invoice-view-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head no-print">
          <div>
            <div className="eyebrow">INVOICE PREVIEW</div>
            <h2>{invoice.number}</h2>
            <p className="muted small">Print or save this invoice as PDF using the hotel template.</p>
          </div>
          <div className="modal-head-actions">
            <button type="button" className="primary" onClick={() => window.print()}>Print / Save PDF</button>
            <button type="button" className="icon-button" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="invoice-paper">
          <div className="invoice-paper-banner" style={{ background: p.bannerColor || "#eef0f4" }}>
            <div className="invoice-paper-logo">
              {p.logo ? <img src={p.logo} alt={p.hotelName || "Hotel"} /> : <span>{(p.hotelName || "H").charAt(0).toUpperCase()}</span>}
            </div>
            <div className="invoice-hotel-block">
              <strong>{p.hotelName || "Hotel Name"}</strong>
              <span>{p.address || "Hotel address"}</span>
              <span>{p.cityStateCountry || ""}</span>
              {p.phone && <span>{p.phone}</span>}
              {p.email && <span>{p.email}</span>}
              {p.gstNumber && <span>GSTIN: {p.gstNumber}</span>}
            </div>
            <div className="invoice-balance-banner">
              <span>BALANCE DUE</span>
              <strong>{money(balance)}</strong>
            </div>
          </div>

          <div className="invoice-paper-meta">
            <div className="invoice-bill-to">
              <span className="invoice-label">BILL TO</span>
              <strong>{guest?.name || "Guest"}</strong>
              {guest?.address && <span>{guest.address}</span>}
              {guest?.phone && <span>{guest.phone}</span>}
              {guest?.email && <span>{guest.email}</span>}
              {guest?.idNumber && <span>ID: {guest.idNumber}</span>}
            </div>
            <div className="invoice-meta-grid">
              <div><span>Invoice</span><strong>{invoice.number}</strong></div>
              <div><span>Invoice date</span><strong>{date(invoice.issueDate)}</strong></div>
              <div><span>Due date</span><strong>{date(invoice.dueDate || invoice.issueDate)}</strong></div>
              <div><span>Reservation</span><strong>{invoice.reservationId || "—"}</strong></div>
              <div><span>Room</span><strong>{res?.room || invoice.room || "—"}</strong></div>
              <div><span>Stay</span><strong>{res ? `${date(res.arrival)} → ${date(res.departure)}` : "—"}</strong></div>
            </div>
          </div>

          <div className="invoice-paper-table-wrap">
            <table className="invoice-paper-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ITEM & DESCRIPTION</th>
                  <th className="num">QTY</th>
                  <th className="num">RATE</th>
                  <th className="num">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{it.description}</strong></td>
                    <td className="num">{it.quantity ?? 1}</td>
                    <td className="num">{money(it.rate ?? it.amount ?? 0)}</td>
                    <td className="num"><strong>{money(it.amount ?? Number(it.quantity || 1) * Number(it.rate || 0))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-paper-bottom">
            <div className="invoice-paper-thanks">
              <strong>{p.footerNote || "Thank you for choosing us."}</strong>
              {invoice.notes && <p>{invoice.notes}</p>}
              {invoice.paymentMethod && <p><b>Payment method:</b> {invoice.paymentMethod}</p>}
            </div>
            <div className="invoice-paper-totals">
              <div><span>Sub Total</span><strong>{money(invoice.subtotal)}</strong></div>
              {Number(invoice.discount || 0) > 0 && <div><span>Discount</span><strong>-{money(invoice.discount)}</strong></div>}
              <div><span>Tax ({invoice.taxRate || 0}%)</span><strong>{money(invoice.taxAmount)}</strong></div>
              <div><span>Total</span><strong>{money(invoice.total)}</strong></div>
              <div><span>Paid</span><strong>{money(invoice.paid || 0)}</strong></div>
              <div className="balance"><span>Balance Due</span><strong>{money(balance)}</strong></div>
            </div>
          </div>

          <div className="invoice-paper-terms">
            <strong>Terms & Conditions</strong>
            <span>{settings.terms || "All payments must be made in full before the commencement of any work."}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InvoicesPage;
export { InvoicesPage, InvoiceEditor, InvoiceView };
