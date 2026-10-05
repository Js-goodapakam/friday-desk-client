import { useEffect, useState } from "react";
import { uid } from "../core/data.js";
import { TELECMI_LOGO, WHATSAPP_LOGO, RCS_LOGO } from "../core/assets.js";
import { Field } from "../components/Common.jsx";
import RoomEditor from "../components/settings/RoomEditor.jsx";
import UserEditor from "../components/settings/UserEditor.jsx";
import PropertyEditor from "../components/settings/PropertyEditor.jsx";
import { useTeleCMISDKStatus } from "../services/telecmi.js";
import "./settings.css";

const MENU = [
  ["Property", "Hotel details"],
  ["Rooms & Units", "Rooms and inventory"],
  ["Booking Rules", "Check-in & booking"],
  ["Payments & Tax", "Payments and GST"],
  ["Guest Communication", "Guest messages"],
  ["Notifications", "Front desk alerts"],
  ["Users & Roles", "Staff access"],
  ["Invoice", "Invoice defaults"],
  ["Integrations", "Connect services"],
  ["Security", "Login and security"],
];

const CHANNELS = [
  { id: "telephony", label: "Telephony", icon: "☎", hint: "Guest calling" },
  { id: "whatsapp", label: "WhatsApp", icon: "W", hint: "Guest messaging" },
  { id: "rcs", label: "RCS", icon: "R", hint: "Rich messaging" },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h3l1.4 4-2.1 1.7a14 14 0 0 0 5 5l1.7-2.1L20 14v3c0 1.1-.9 2-2 2C10.3 19 5 13.7 5 6c0-1.1.9-2 2-2Z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5h14v11H9l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

function SettingsToggle({ title, text, checked = true }) {
  const [enabled, setEnabled] = useState(checked);
  return (
    <label className="fd-setting-toggle">
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />
      <i />
    </label>
  );
}

function SectionHeader({ title, description, onSave, saved }) {
  return (
    <div className="fd-settings-header">
      <div>
        <div className="fd-settings-eyebrow">SETTINGS</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {onSave && (
        <button className="fd-save-button" type="button" onClick={onSave}>
          {saved ? <><CheckIcon /> Saved</> : "Save changes"}
        </button>
      )}
    </div>
  );
}

function StatusPill({ connected }) {
  return (
    <span className={`fd-status-pill ${connected ? "connected" : ""}`}>
      <i />
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

export default function Settings({ data, setData }) {
  const [tab, setTab] = useState("Property");
  const [saved, setSaved] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [staffModal, setStaffModal] = useState(null);
  const [addingProperty, setAddingProperty] = useState(false);
  const [providerModal, setProviderModal] = useState(null);
  const [teleError, setTeleError] = useState("");
  const [testingTele, setTestingTele] = useState(false);
  const [backendConfig, setBackendConfig] = useState(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [channel, setChannel] = useState("telephony");

  const sdkStatus = useTeleCMISDKStatus();
  const teleStatus = data.telecmi?.status || "Not connected";
  const teleAgents = data.telecmi?.agents || [];

  const [waForm, setWaForm] = useState({
    phoneId: data.whatsapp?.phoneId || "",
    wabaId: data.whatsapp?.wabaId || "",
    token: "",
  });
  const [rcsForm, setRcsForm] = useState({
    agentId: data.rcs?.agentId || "",
    brandId: data.rcs?.brandId || "",
    token: "",
  });
  const [waError, setWaError] = useState("");
  const [rcsError, setRcsError] = useState("");

  useEffect(() => {
    if (tab !== "Integrations") return;

    fetch(`${import.meta.env.VITE_API_URL}/api/telecmi/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((result) => {
        if (!result?.success) return;
        setBackendConfig(result);
        setData((d) => ({
          ...d,
          telecmi: {
            ...d.telecmi,
            appId: result.appId || d.telecmi?.appId || "",
            sbc: result.sbc || d.telecmi?.sbc || "sbcind.telecmi.com",
          },
        }));
      })
      .catch(() => {});
  }, [tab, setData]);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const isConnected = (id) =>
    id === "telecmi"
      ? teleStatus === "Connected"
      : id === "whatsapp-cloud"
      ? !!data.whatsapp?.connected
      : !!data.rcs?.connected;

  const testTeleCMIConnection = async () => {
    try {
      setTestingTele(true);
      setTeleError("");
      setData((d) => ({ ...d, telecmi: { ...d.telecmi, status: "Connecting..." } }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/telecmi/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();

      if (!result.success) {
        setData((d) => ({ ...d, telecmi: { ...d.telecmi, status: "Connection failed" } }));
        setTeleError(result.message || "TeleCMI authentication failed.");
        return;
      }

      const agents = (result.agents || []).map((agent) => ({
        userId: agent.user_id,
        firstName: agent.first_name,
        lastName: agent.last_name,
        phone: agent.phone,
        agentId: agent.agent_id,
        extension: agent.extension,
        startTime: agent.start_time,
        endTime: agent.end_time,
        notify: agent.notify,
        status: "Available",
      }));

      setData((d) => ({
        ...d,
        telecmi: { ...d.telecmi, enabled: true, status: "Connected", agents },
      }));
      save();
    } catch (error) {
      console.error(error);
      setData((d) => ({ ...d, telecmi: { ...d.telecmi, status: "Connection failed" } }));
      setTeleError("Unable to reach the Friday AI - Desk server. Please check that the backend is running.");
    } finally {
      setTestingTele(false);
    }
  };

  const disconnectTeleCMI = () => {
    setData((d) => ({
      ...d,
      telecmi: { ...d.telecmi, enabled: false, status: "Not connected", agents: [] },
    }));
    setTeleError("");
  };

  const connectWhatsapp = () => {
    if (!waForm.phoneId.trim() || !waForm.token.trim()) {
      setWaError("Enter the Phone Number ID and Access Token.");
      return;
    }
    setWaError("");
    setData((d) => ({
      ...d,
      whatsapp: {
        ...d.whatsapp,
        phoneId: waForm.phoneId,
        wabaId: waForm.wabaId,
        connected: true,
      },
    }));
  };

  const disconnectWhatsapp = () =>
    setData((d) => ({ ...d, whatsapp: { ...d.whatsapp, connected: false } }));

  const connectRcs = () => {
    if (!rcsForm.agentId.trim() || !rcsForm.token.trim()) {
      setRcsError("Enter the RCS Agent ID and Access Token.");
      return;
    }
    setRcsError("");
    setData((d) => ({
      ...d,
      rcs: {
        ...d.rcs,
        agentId: rcsForm.agentId,
        brandId: rcsForm.brandId,
        connected: true,
      },
    }));
  };

  const disconnectRcs = () =>
    setData((d) => ({ ...d, rcs: { ...d.rcs, connected: false } }));

  const providerForChannel = {
    telephony: {
      id: "telecmi",
      name: "TeleCMI",
      description: "Cloud calling for the front desk",
      logo: TELECMI_LOGO,
      icon: "T",
    },
    whatsapp: {
      id: "whatsapp-cloud",
      name: "WhatsApp Business",
      description: "Guest messages on WhatsApp",
      logo: WHATSAPP_LOGO,
      icon: "W",
    },
    rcs: {
      id: "rcs-business",
      name: "RCS Business Messaging",
      description: "Rich guest messages",
      logo: RCS_LOGO,
      icon: "R",
    },
  }[channel];

  const activeDescription =
    MENU.find(([name]) => name === tab)?.[1] || "";

  return (
    <div className="fd-settings-page">
      <aside className="fd-settings-sidebar">
        <div className="fd-settings-sidebar-title">
          <span className="fd-settings-gear">⚙</span>
          <div>
            <strong>Settings</strong>
            <small>Manage your hotel</small>
          </div>
        </div>

        <div className="fd-settings-menu">
          {MENU.map(([name, description]) => (
            <button
              key={name}
              type="button"
              className={tab === name ? "active" : ""}
              onClick={() => {
                setTab(name);
                setSaved(false);
              }}
            >
              <span className="fd-menu-icon">
                {name === "Property" ? "⌂" :
                 name === "Rooms & Units" ? "▣" :
                 name === "Booking Rules" ? "▤" :
                 name === "Payments & Tax" ? "₹" :
                 name === "Guest Communication" ? "◌" :
                 name === "Notifications" ? "◉" :
                 name === "Users & Roles" ? "♙" :
                 name === "Invoice" ? "▤" :
                 name === "Integrations" ? "⌘" : "◈"}
              </span>
              <span className="fd-menu-copy">
                <b>{name}</b>
                <small>{description}</small>
              </span>
              <ChevronIcon />
            </button>
          ))}
        </div>

        <div className="fd-settings-help">
          <div className="fd-help-icon">?</div>
          <div>
            <b>Need help?</b>
            <span>Ask your hotel admin before changing system settings.</span>
          </div>
        </div>
      </aside>

      <main className="fd-settings-main">
        {tab === "Property" && (
          <>
            <SectionHeader title="Hotel Profile" description="Basic details shown across your hotel workspace." onSave={save} saved={saved} />

            <section className="fd-settings-card">
              <div className="fd-card-title">
                <div><strong>Hotel information</strong><span>Keep these details up to date for invoices and guest communication.</span></div>
              </div>

              <div className="fd-form-grid">
                <Field label="Hotel name">
                  <input value={data.property?.name || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, name: e.target.value } }))} />
                </Field>
                <Field label="Property type">
                  <select value={data.property?.type || "Hotel"} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, type: e.target.value } }))}>
                    <option>Hotel</option><option>Resort</option><option>Homestay</option>
                  </select>
                </Field>
                <Field label="Address">
                  <input value={data.property?.address || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, address: e.target.value } }))} />
                </Field>
                <Field label="Phone">
                  <input value={data.property?.phone || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, phone: e.target.value } }))} />
                </Field>
                <Field label="Email">
                  <input type="email" value={data.property?.email || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, email: e.target.value } }))} />
                </Field>
                <Field label="GST number">
                  <input value={data.property?.gstNumber || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, gstNumber: e.target.value } }))} placeholder="Optional" />
                </Field>
              </div>
            </section>

            <section className="fd-settings-card fd-active-property">
              <div className="fd-active-dot" />
              <div><strong>{data.property?.name || "Your hotel"}</strong><span>{data.property?.address || "No address added"} · Active property</span></div>
              <span className="fd-status-pill connected"><i />Active</span>
            </section>

            <section className="fd-settings-card">
              <div className="fd-card-title">
                <div><strong>Your properties</strong><span>Switch between hotel locations managed from this workspace.</span></div>
                <button type="button" className="fd-outline-button" onClick={() => setAddingProperty(true)}>+ Add property</button>
              </div>
              <div className="fd-simple-list">
                {data.properties.map((property) => {
                  const active = property.name === data.property?.name && property.address === data.property?.address;
                  return (
                    <div className="fd-list-row" key={property.id}>
                      <div><b>{property.name}</b><span>{property.address}</span></div>
                      {active ? <StatusPill connected /> : <button type="button" className="fd-text-button" onClick={() => setData((d) => ({ ...d, property: { ...d.property, ...property } }))}>Switch</button>}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {tab === "Rooms & Units" && (
          <>
            <SectionHeader title="Rooms & Units" description="Manage the rooms that front desk can assign to guests." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title">
                <div><strong>Room inventory</strong><span>Availability is calculated from your reservations.</span></div>
                <button type="button" className="fd-outline-button" onClick={() => setAddingRoom(true)}>+ Add room</button>
              </div>
              <div className="fd-room-grid">
                {data.rooms.map((room) => {
                  const occupied = data.reservations.some((r) => r.room === room.number && ["Confirmed", "Checked In"].includes(r.status));
                  return (
                    <div className="fd-room-card" key={room.number}>
                      <div className="fd-room-number">{room.number}</div>
                      <div className="fd-room-info"><b>{room.type}</b><span>Up to {room.capacity} guests</span></div>
                      <span className={`fd-room-state ${occupied ? "busy" : ""}`}>{occupied ? "In use" : "Available"}</span>
                      <button type="button" className="fd-icon-button" disabled={occupied} title={occupied ? "Room has an active reservation" : "Remove room"} onClick={() => { if (window.confirm(`Remove Room ${room.number}?`)) setData((d) => ({ ...d, rooms: d.rooms.filter((x) => x.number !== room.number) })); }}>
                        <CloseIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {tab === "Booking Rules" && (
          <>
            <SectionHeader title="Booking & Check-in" description="Simple rules that guide reservation and front desk workflows." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Standard timings</strong><span>These times are used as the default for new reservations.</span></div></div>
              <div className="fd-form-grid">
                <Field label="Standard check-in"><input type="time" defaultValue="14:00" /></Field>
                <Field label="Standard check-out"><input type="time" defaultValue="12:00" /></Field>
                <Field label="Early check-in"><select defaultValue="Subject to availability"><option>Subject to availability</option><option>Always allowed</option><option>Not allowed</option></select></Field>
                <Field label="Late check-out"><select defaultValue="Subject to availability"><option>Subject to availability</option><option>Always allowed</option><option>Not allowed</option></select></Field>
              </div>
            </section>
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Reservation rules</strong><span>Controls that help prevent front desk mistakes.</span></div></div>
              <SettingsToggle title="Prevent overlapping room reservations" text="Stop staff from confirming the same room for overlapping dates." />
              <SettingsToggle title="Require room assignment before confirmation" text="Use this only if your hotel assigns rooms at booking time." checked={false} />
              <SettingsToggle title="Allow reservation cancellation" text="Let staff cancel reservations when the hotel's cancellation policy allows it." />
            </section>
          </>
        )}

        {tab === "Payments & Tax" && (
          <>
            <SectionHeader title="Payments & Tax" description="Set the payment options and tax defaults used by the hotel." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Payment defaults</strong><span>These are defaults for the front desk and invoices.</span></div></div>
              <div className="fd-form-grid">
                <Field label="Currency"><select defaultValue="INR — Indian Rupee"><option>INR — Indian Rupee</option></select></Field>
                <Field label="GST number"><input value={data.property?.gstNumber || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, gstNumber: e.target.value } }))} placeholder="Optional" /></Field>
                <Field label="Tax display"><select defaultValue="Included in room rate"><option>Included in room rate</option><option>Added separately</option></select></Field>
                <Field label="Default advance"><input type="number" min="0" defaultValue="0" /></Field>
                <Field label="Accepted payment methods"><select defaultValue="Cash, UPI & Card"><option>Cash, UPI & Card</option><option>Cash & UPI</option><option>Card & UPI</option></select></Field>
              </div>
            </section>
            <section className="fd-settings-card">
              <SettingsToggle title="Show balance due on the front desk" text="Keep outstanding guest balances visible during the stay." />
              <SettingsToggle title="Review balance before checkout" text="Ask staff to confirm the outstanding balance before checkout." checked={false} />
            </section>
          </>
        )}

        {tab === "Guest Communication" && (
          <>
            <SectionHeader title="Guest Communication" description="Set the contact details and messages used when communicating with guests." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Contact details</strong><span>These details can be shown to guests.</span></div></div>
              <div className="fd-form-grid">
                <Field label="Front desk phone"><input defaultValue="+91 87777 00000" /></Field>
                <Field label="Guest support email"><input type="email" defaultValue="frontdesk@tajtirupati.local" /></Field>
                <Field label="WhatsApp number"><input defaultValue="+91 87777 00000" /></Field>
                <Field label="Preferred channel"><select defaultValue="WhatsApp"><option>WhatsApp</option><option>SMS</option><option>Email</option></select></Field>
              </div>
              <Field label="Welcome message"><textarea rows="3" defaultValue="Welcome to Taj Tirupati. We are pleased to have you with us." /></Field>
            </section>
            <section className="fd-settings-card">
              <SettingsToggle title="Send reservation confirmation" text="Send booking details after a reservation is confirmed." />
              <SettingsToggle title="Send check-in message" text="Send a welcome message after the guest is checked in." />
            </section>
          </>
        )}

        {tab === "Notifications" && (
          <>
            <SectionHeader title="Notifications & Alerts" description="Choose which events should be highlighted for the front desk." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Front desk alerts</strong><span>Keep staff informed without overwhelming them.</span></div></div>
              <SettingsToggle title="New reservation" text="Alert staff when a new reservation is created." />
              <SettingsToggle title="Guest request" text="Alert staff when an in-house guest sends a request." />
              <SettingsToggle title="Payment due" text="Alert staff when a stay has an outstanding balance." />
              <SettingsToggle title="Today's arrivals and departures" text="Show reminders for today's expected check-ins and check-outs." />
            </section>
          </>
        )}

        {tab === "Users & Roles" && (
          <>
            <SectionHeader title="Staff & Roles" description="Add your hotel staff and control what each person can access." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title">
                <div><strong>Staff accounts</strong><span>Give each team member only the access they need.</span></div>
                <button type="button" className="fd-outline-button" onClick={() => setStaffModal("new")}>+ Add staff</button>
              </div>
              <div className="fd-staff-list">
                {data.users.map((user, index) => (
                  <div className="fd-staff-row" key={user.id}>
                    <span className="fd-avatar">{(user.name || "U").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}</span>
                    <div className="fd-staff-main"><b>{user.name}</b><span>{user.email}</span></div>
                    <span className="fd-role-pill">{user.role}</span>
                    {user.extension && <span className="fd-extension">Ext {user.extension}</span>}
                    <button type="button" className="fd-text-button" onClick={() => setStaffModal({ index, user })}>Edit</button>
                  </div>
                ))}
              </div>
              <div className="fd-role-guide">
                <strong>Role guide</strong>
                <span><b>Admin</b> — everything. <b>Manager</b> — reservations, guests, rooms, reports and invoices. <b>Front Desk</b> — reservations, guests and check-in/out.</span>
              </div>
            </section>
          </>
        )}

        {tab === "Invoice" && (
          <>
            <SectionHeader title="Invoice Defaults" description="Set the hotel details and defaults printed on invoices." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <div className="fd-card-title"><div><strong>Invoice information</strong><span>Changes here also update the property details used by invoices.</span></div></div>
              <div className="fd-form-grid">
                <Field label="Hotel name"><input value={data.property?.name || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, name: e.target.value } }))} /></Field>
                <Field label="Manager name"><input value={data.property?.managerName || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, managerName: e.target.value } }))} /></Field>
                <Field label="Address"><input value={data.property?.address || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, address: e.target.value } }))} /></Field>
                <Field label="GST number"><input value={data.property?.gstNumber || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, gstNumber: e.target.value } }))} /></Field>
                <Field label="Phone"><input value={data.property?.phone || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, phone: e.target.value } }))} /></Field>
                <Field label="Email"><input type="email" value={data.property?.email || ""} onChange={(e) => setData((d) => ({ ...d, property: { ...d.property, email: e.target.value } }))} /></Field>
                <Field label="Invoice number prefix"><input value={data.invoiceSettings?.prefix || ""} onChange={(e) => setData((d) => ({ ...d, invoiceSettings: { ...d.invoiceSettings, prefix: e.target.value } }))} placeholder="INV" /></Field>
                <Field label="Default tax / GST rate (%)"><input type="number" min="0" max="100" value={data.invoiceSettings?.taxRate ?? 0} onChange={(e) => setData((d) => ({ ...d, invoiceSettings: { ...d.invoiceSettings, taxRate: Number(e.target.value) } }))} /></Field>
              </div>
              <Field label="Terms & footer note"><textarea rows="3" value={data.invoiceSettings?.terms || ""} onChange={(e) => setData((d) => ({ ...d, invoiceSettings: { ...d.invoiceSettings, terms: e.target.value } }))} /></Field>
              <div className="fd-info-strip"><b>Next invoice number</b><span>{data.invoiceSettings?.prefix || "INV"}-{String(data.invoiceSettings?.nextNumber || 1).padStart(4, "0")}</span></div>
            </section>
          </>
        )}

        {tab === "Integrations" && (
          <>
            <SectionHeader title="Connected Services" description="Connect the services your front desk uses. Click a service to configure it." />
            <div className="fd-channel-tabs">
              {CHANNELS.map((item) => (
                <button key={item.id} type="button" className={channel === item.id ? "active" : ""} onClick={() => setChannel(item.id)}>
                  <span>{item.icon}</span><b>{item.label}</b><small>{item.hint}</small>
                </button>
              ))}
            </div>

            <section className="fd-integration-card">
              <div className="fd-integration-top">
                <div className="fd-integration-channel">
                  <span className={`fd-service-logo ${channel}`}>
                    {providerForChannel.logo ? <img src={providerForChannel.logo} alt="" /> : providerForChannel.icon}
                  </span>
                  <div><strong>{providerForChannel.name}</strong><span>{providerForChannel.description}</span></div>
                </div>
                <StatusPill connected={isConnected(providerForChannel.id)} />
              </div>

              <div className="fd-integration-body">
                <div className="fd-integration-explain">
                  {channel === "telephony" && <><PhoneIcon /><div><b>What this does</b><span>Lets the front desk call guests from Friday AI - Desk and identify incoming guest calls.</span></div></>}
                  {channel === "whatsapp" && <><MessageIcon /><div><b>What this does</b><span>Lets your team send and receive guest messages through your WhatsApp Business number.</span></div></>}
                  {channel === "rcs" && <><MessageIcon /><div><b>What this does</b><span>Lets your team send rich, branded guest messages through RCS.</span></div></>}
                </div>

                <button type="button" className="fd-configure-button" onClick={() => setProviderModal(providerForChannel.id)}>
                  {isConnected(providerForChannel.id) ? "Manage connection" : "Connect service"}
                  <ChevronIcon />
                </button>
              </div>
            </section>

            <div className="fd-integration-tip">
              <span>i</span>
              <div><b>For hotel admins</b><small>Connect services once. Front desk staff do not need to know API keys, tokens or technical settings.</small></div>
            </div>
          </>
        )}

        {tab === "Security" && (
          <>
            <SectionHeader title="Security" description="Controls for protecting the hotel admin workspace." onSave={save} saved={saved} />
            <section className="fd-settings-card">
              <SettingsToggle title="Automatic session timeout" text="Sign out inactive admin sessions automatically." />
              <SettingsToggle title="Login activity alerts" text="Notify the admin when a new device signs in." />
              <SettingsToggle title="Two-step verification" text="Require an additional verification step for admin login." checked={false} />
              <div className="fd-password-row"><div><b>Change admin password</b><span>Update the password used for the admin workspace.</span></div><button type="button" className="fd-outline-button">Change password</button></div>
            </section>
          </>
        )}
      </main>

      {addingRoom && <RoomEditor existingNumbers={data.rooms.map((r) => r.number)} onClose={() => setAddingRoom(false)} onSave={(room) => { setData((d) => ({ ...d, rooms: [...d.rooms, room] })); setAddingRoom(false); }} />}

      {staffModal && <UserEditor initial={staffModal === "new" ? null : staffModal.user} onClose={() => setStaffModal(null)} onSave={(user) => { if (staffModal === "new") setData((d) => ({ ...d, users: [...d.users, { ...user, id: uid("USR") }] })); else setData((d) => ({ ...d, users: d.users.map((x, i) => i === staffModal.index ? { ...x, ...user } : x) })); setStaffModal(null); }} />}

      {addingProperty && <PropertyEditor onClose={() => setAddingProperty(false)} onSave={(property) => { setData((d) => ({ ...d, properties: [...d.properties, property] })); setAddingProperty(false); }} />}

      {providerModal === "telecmi" && (
        <div className="fd-provider-backdrop" onMouseDown={() => setProviderModal(null)}>
          <section className="fd-provider-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="fd-provider-head">
              <div className="fd-provider-title">
                <span className="fd-service-logo telephony">{TELECMI_LOGO ? <img src={TELECMI_LOGO} alt="" /> : "T"}</span>
                <div><small>TELEPHONY</small><h3>TeleCMI</h3><span>Cloud calling for the front desk</span></div>
              </div>
              <button type="button" className="fd-icon-button" onClick={() => setProviderModal(null)}><CloseIcon /></button>
            </div>

            <div className={`fd-connection-banner ${teleStatus === "Connected" ? "success" : ""}`}>
              <div><b>{teleStatus === "Connected" ? "TeleCMI is connected" : "Connect TeleCMI"}</b><span>{teleStatus === "Connected" ? `${teleAgents.length} calling agent${teleAgents.length !== 1 ? "s" : ""} available.` : "Connect your hotel calling service to use browser calling."}</span></div>
              <StatusPill connected={teleStatus === "Connected"} />
            </div>

            <div className="fd-form-grid">
              <Field label="App ID">
                <input value={data.telecmi?.appId || backendConfig?.appId || ""} onChange={(e) => setData((d) => ({ ...d, telecmi: { ...d.telecmi, appId: e.target.value } }))} />
              </Field>
              <Field label="App Secret">
                <div className="fd-secret-field">
                  <input type={secretVisible ? "text" : "password"} value={secretVisible ? "Server-side secret configured" : "••••••••••••"} readOnly />
                  <button type="button" onClick={() => setSecretVisible((v) => !v)}>{secretVisible ? "Hide" : "Show"}</button>
                </div>
              </Field>
              <Field label="Region"><select defaultValue="India"><option>India</option><option>Asia</option><option>Europe</option><option>America</option></select></Field>
              <Field label="SBC"><input value={data.telecmi?.sbc || backendConfig?.sbc || "sbcind.telecmi.com"} onChange={(e) => setData((d) => ({ ...d, telecmi: { ...d.telecmi, sbc: e.target.value } }))} /></Field>
            </div>

            {teleError && <div className="fd-error-box"><b>Connection issue</b><span>{teleError}</span></div>}

            <div className="fd-provider-actions">
              <button type="button" className="fd-primary-button" onClick={testTeleCMIConnection} disabled={testingTele}>{testingTele ? "Connecting..." : teleStatus === "Connected" ? "Reconnect" : "Connect TeleCMI"}</button>
              {teleStatus === "Connected" && <button type="button" className="fd-outline-button" onClick={disconnectTeleCMI}>Disconnect</button>}
            </div>

            <div className="fd-simple-info"><b>Calling users</b><span>{teleAgents.length ? `${teleAgents.length} TeleCMI agent${teleAgents.length !== 1 ? "s" : ""} synced.` : "Connect TeleCMI to sync calling agents."}</span></div>

            {teleStatus === "Connected" && (
              <div className="fd-agent-table">
                <div className="fd-agent-head"><span>Agent</span><span>Extension</span><span>Agent ID</span><span>Status</span></div>
                {teleAgents.map((agent) => <div className="fd-agent-row" key={agent.userId || agent.agentId}><div><b>{agent.firstName} {agent.lastName}</b><small>{agent.phone || "—"}</small></div><strong>{agent.extension || "—"}</strong><code>{agent.agentId || "—"}</code><span>● {agent.status || "Available"}</span></div>)}
              </div>
            )}

            <div className="fd-technical-note"><b>Technical settings are protected</b><span>The App Secret is handled by the Friday AI - Desk server and is not displayed in the browser.</span><small>Browser SDK: {sdkStatus === "connected" ? "Connected" : sdkStatus === "connecting" ? "Connecting..." : "Not connected"}</small></div>
          </section>
        </div>
      )}

      {providerModal === "whatsapp-cloud" && (
        <div className="fd-provider-backdrop" onMouseDown={() => setProviderModal(null)}>
          <section className="fd-provider-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="fd-provider-head">
              <div className="fd-provider-title">
                <span className="fd-service-logo whatsapp">{WHATSAPP_LOGO ? <img src={WHATSAPP_LOGO} alt="" /> : "W"}</span>
                <div><small>MESSAGING</small><h3>WhatsApp Business</h3><span>Guest messaging</span></div>
              </div>
              <button type="button" className="fd-icon-button" onClick={() => setProviderModal(null)}><CloseIcon /></button>
            </div>

            <div className="fd-connection-banner">
              <div><b>WhatsApp Business</b><span>Connect the number your hotel uses for guest messages.</span></div>
              <StatusPill connected={!!data.whatsapp?.connected} />
            </div>

            <div className="fd-form-grid">
              <Field label="Phone Number ID"><input value={waForm.phoneId} onChange={(e) => setWaForm((f) => ({ ...f, phoneId: e.target.value }))} placeholder="Required" /></Field>
              <Field label="Access Token"><input type="password" value={waForm.token} onChange={(e) => setWaForm((f) => ({ ...f, token: e.target.value }))} placeholder="Required" /></Field>
              <Field label="Business Account ID"><input value={waForm.wabaId} onChange={(e) => setWaForm((f) => ({ ...f, wabaId: e.target.value }))} placeholder="Optional" /></Field>
            </div>

            {waError && <div className="fd-error-box"><b>Connection issue</b><span>{waError}</span></div>}
            <div className="fd-provider-actions">
              <button type="button" className="fd-primary-button" onClick={connectWhatsapp}>{data.whatsapp?.connected ? "Reconnect" : "Connect WhatsApp"}</button>
              {data.whatsapp?.connected && <button type="button" className="fd-outline-button" onClick={disconnectWhatsapp}>Disconnect</button>}
            </div>
          </section>
        </div>
      )}

      {providerModal === "rcs-business" && (
        <div className="fd-provider-backdrop" onMouseDown={() => setProviderModal(null)}>
          <section className="fd-provider-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="fd-provider-head">
              <div className="fd-provider-title">
                <span className="fd-service-logo rcs">{RCS_LOGO ? <img src={RCS_LOGO} alt="" /> : "R"}</span>
                <div><small>MESSAGING</small><h3>RCS Business Messaging</h3><span>Rich guest messaging</span></div>
              </div>
              <button type="button" className="fd-icon-button" onClick={() => setProviderModal(null)}><CloseIcon /></button>
            </div>

            <div className="fd-connection-banner">
              <div><b>RCS Business Messaging</b><span>Connect the RCS service used by your hotel.</span></div>
              <StatusPill connected={!!data.rcs?.connected} />
            </div>

            <div className="fd-form-grid">
              <Field label="RCS Agent ID"><input value={rcsForm.agentId} onChange={(e) => setRcsForm((f) => ({ ...f, agentId: e.target.value }))} placeholder="Required" /></Field>
              <Field label="Access Token"><input type="password" value={rcsForm.token} onChange={(e) => setRcsForm((f) => ({ ...f, token: e.target.value }))} placeholder="Required" /></Field>
              <Field label="Brand ID"><input value={rcsForm.brandId} onChange={(e) => setRcsForm((f) => ({ ...f, brandId: e.target.value }))} placeholder="Optional" /></Field>
            </div>

            {rcsError && <div className="fd-error-box"><b>Connection issue</b><span>{rcsError}</span></div>}
            <div className="fd-provider-actions">
              <button type="button" className="fd-primary-button" onClick={connectRcs}>{data.rcs?.connected ? "Reconnect" : "Connect RCS"}</button>
              {data.rcs?.connected && <button type="button" className="fd-outline-button" onClick={disconnectRcs}>Disconnect</button>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
