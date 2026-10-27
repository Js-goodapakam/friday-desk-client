import { useMemo, useState } from "react";
import { fmt, date, initials } from "../core/data.js";
import "./guests.css";

const EMPTY_GUEST = {
  id: "",
  name: "",
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  nationality: "Indian",
  phone: "",
  email: "",
  photo: "",
  idType: "",
  idNumber: "",
  idDocument: "",
  kycStatus: "Pending",
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  passportNumber: "",
  passportIssuePlace: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  visaNumber: "",
  visaType: "",
  visaIssueDate: "",
  visaExpiryDate: "",
  indiaAddress: "",
  purposeOfVisit: "",
  arrivedFrom: "",
  nextDestination: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  company: "",
  purpose: "",
  preferences: "",
  notes: "",
  room: "",
};

const idOptions = [
  "Aadhaar",
  "Passport",
  "Driving Licence",
  "Voter ID",
  "Other Government ID",
];

function getGuestNameParts(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function buildGuestForm(guest = {}) {
  const parts = getGuestNameParts(guest.name);
  return {
    ...EMPTY_GUEST,
    ...guest,
    firstName: guest.firstName ?? parts.firstName,
    lastName: guest.lastName ?? parts.lastName,
    nationality: guest.nationality || "Indian",
    country: guest.country || "India",
    kycStatus: guest.kycStatus || "Pending",
  };
}

export default function Guests({ data, setSelected, setData, onCall }) {
  const [q, setQ] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_GUEST);
  const [activeSection, setActiveSection] = useState("overview");
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [roomSaveMessage, setRoomSaveMessage] = useState("");

  const checkedInReservations = useMemo(
    () => data.demo ? data.guests.map(g=>data.reservations.find(r=>r.guestId===g.id&&r.status==="Checked In")||data.reservations.find(r=>r.guestId===g.id)).filter(Boolean) : data.reservations.filter((r) => r.status === "Checked In"),
    [data.reservations,data.guests,data.demo]
  );

  const rows = useMemo(() => {
    return checkedInReservations
      .map((r) => {
        const guest = data.guests.find((g) => g.id === r.guestId);
        return guest ? { guest, reservation: r } : null;
      })
      .filter(Boolean)
      .filter(({ guest, reservation }) => {
        const haystack = [
          guest.name,
          guest.email,
          guest.phone,
          guest.id,
          guest.idNumber,
          reservation.room,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q.toLowerCase());
      });
  }, [checkedInReservations, data.guests, q]);

  const kycPending = rows.filter(
    ({ guest }) => guest.kycStatus !== "Verified"
  ).length;

  const getRoomAllocation = (roomNumber, currentReservationId) => {
    const room = String(roomNumber || "");
    const current = data.reservations.find((r) => r.id === currentReservationId);

    const conflicting = data.reservations.find((r) => {
      if (r.id === currentReservationId) return false;
      if (!["Confirmed", "Checked In", "Modified"].includes(r.status)) return false;
      if (String(r.room || "") !== room) return false;
      if (!current?.arrival || !current?.departure) return true;
      return current.arrival < r.departure && current.departure > r.arrival;
    });

    return conflicting
      ? { status: "Reserved", reservation: conflicting }
      : { status: "Available", reservation: null };
  };

  const roomOptions = useMemo(() => {
    const reservationId = selectedGuest?.reservation?.id;
    return (data.rooms || []).map((room) => ({
      ...room,
      allocation: getRoomAllocation(room.number, reservationId),
    }));
  }, [data.rooms, data.reservations, selectedGuest?.reservation?.id]);

  const openGuest = (guest, reservation) => {
    setSelectedGuest({ guest, reservation });
    setForm({ ...buildGuestForm(guest), room: reservation?.room || "" });
    setEditing(false);
    setRoomPickerOpen(false);
    setRoomSaveMessage("");
    setActiveSection("overview");
  };

  const openEdit = () => {
    if (!selectedGuest) return;
    setForm({
      ...buildGuestForm(selectedGuest.guest),
      room: selectedGuest.reservation?.room || "",
    });
    setEditing(true);
    setRoomPickerOpen(false);
    setRoomSaveMessage("");
    setActiveSection("edit");
  };

  const closeProfile = () => {
    setSelectedGuest(null);
    setEditing(false);
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveRoomAllocation = () => {
    if (!selectedGuest?.reservation?.id) return;

    const reservationId = selectedGuest.reservation.id;
    const roomNumber = String(form.room || "").trim();

    if (!roomNumber) {
      setRoomSaveMessage("Please select an available room.");
      return;
    }

    const currentReservation = data.reservations.find(
      (r) => r.id === reservationId
    );

    if (!currentReservation) {
      setRoomSaveMessage("Reservation could not be found.");
      return;
    }

    const conflict = data.reservations.some((r) => {
      if (r.id === reservationId) return false;
      if (!["Confirmed", "Checked In", "Modified"].includes(r.status)) return false;
      if (String(r.room || "") !== roomNumber) return false;
      if (!currentReservation.arrival || !currentReservation.departure) return true;
      return (
        currentReservation.arrival < r.departure &&
        currentReservation.departure > r.arrival
      );
    });

    if (conflict) {
      setRoomSaveMessage(`Room ${roomNumber} is reserved for another stay.`);
      return;
    }

    setData((current) => ({
      ...current,
      reservations: (current.reservations || []).map((r) =>
        r.id === reservationId ? { ...r, room: roomNumber } : r
      ),
    }));

    setSelectedGuest((prev) =>
      prev
        ? {
            ...prev,
            reservation: { ...prev.reservation, room: roomNumber },
          }
        : prev
    );

    setForm((prev) => ({ ...prev, room: roomNumber }));
    setRoomPickerOpen(false);
    setRoomSaveMessage(`Room ${roomNumber} allocated successfully.`);
  };

  const saveGuest = () => {
    /*
      Guests.jsx is intentionally UI/data-model compatible with the current
      Guests page. Persistence should be wired to the application's existing
      state/service layer when the guest master API is introduced.
    */
    const name =
      `${form.firstName || ""} ${form.lastName || ""}`.trim() ||
      form.name ||
      "Guest";

    const { room: _room, ...guestFields } = form;
    const nextGuest = {
      ...guestFields,
      name,
      firstName: form.firstName,
      lastName: form.lastName,
    };

    if (setData) {
      setData((current) => ({
        ...current,
        guests: (current.guests || []).map((item) =>
          item.id === nextGuest.id ? { ...item, ...nextGuest } : item
        ),
      }));
    }

    setForm(nextGuest);
    setSelectedGuest((prev) =>
      prev ? { ...prev, guest: nextGuest } : prev
    );
    setEditing(false);
  };

  if (selectedGuest) {
    const { guest, reservation } = selectedGuest;
    const isForeign = (form.nationality || guest.nationality) !== "Indian";
    const displayName =
      `${form.firstName || ""} ${form.lastName || ""}`.trim() ||
      form.name ||
      guest.name;

    return (
      <div className="guest-profile-page">
        <div className="guest-profile-topbar">
          <button className="subtle guest-back" onClick={closeProfile}>
            ← Guests
          </button>

          <div className="guest-profile-actions">
            {!editing ? (
              <button className="subtle" onClick={openEdit}>
                Edit details
              </button>
            ) : (
              <>
                <button className="subtle" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="primary" onClick={saveGuest}>
                  Save guest
                </button>
              </>
            )}
          </div>
        </div>

        <div className="guest-profile-hero card">
          <div className="guest-profile-avatar">
            {initials(displayName)}
          </div>
          <div className="guest-profile-title">
            <div className="eyebrow">GUEST REGISTRATION</div>
            <h1>{displayName}</h1>
            <p>
              {guest.id || "Guest profile"} ·{" "}
              {reservation?.room ? `Room ${reservation.room}` : "Room pending"}
            </p>
          </div>
          <div className="guest-status-stack">
            <span className="guest-live-pill">IN-HOUSE</span>
            <span
              className={`guest-kyc-pill ${
                form.kycStatus === "Verified" ? "verified" : "pending"
              }`}
            >
              KYC {form.kycStatus || "Pending"}
            </span>
          </div>
        </div>

        <div className="guest-profile-layout">
          <aside className="guest-profile-nav card">
            {[
              ...(editing ? [["edit", "Edit Registration"]] : [["overview", "Overview"]]),
              ["identity", "Identity & KYC"],
              ["stay", "Room Allocation"],
              ["address", "Address"],
              ...(isForeign ? [["foreign", "Foreign Guest Details"]] : []),
              ["contact", "Emergency & Contact"],
              ["history", "Stay History"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={activeSection === key ? "active" : ""}
                onClick={() => setActiveSection(key)}
              >
                {label}
              </button>
            ))}
          </aside>

          <main className="guest-profile-content">
            {activeSection === "edit" && editing && (
              <ProfileSection title="Edit guest registration" eyebrow="EDIT REGISTRATION">
                <div className="guest-edit-note">
                  Complete the guest registration captured at check-in. Use the sections on the left for KYC, address, foreign guest and emergency details.
                </div>
                <div className="guest-form-grid">
                  <Field label="First name" value={form.firstName} disabled={!editing} onChange={(v) => update("firstName", v)} />
                  <Field label="Last name" value={form.lastName} disabled={!editing} onChange={(v) => update("lastName", v)} />
                  <SelectField label="Gender" value={form.gender} disabled={!editing} onChange={(v) => update("gender", v)} options={["Male", "Female", "Other", "Prefer not to say"]} />
                  <Field label="Date of birth" type="date" value={form.dob} disabled={!editing} onChange={(v) => update("dob", v)} />
                  <Field label="Nationality" value={form.nationality} disabled={!editing} onChange={(v) => update("nationality", v)} />
                  <Field label="Mobile" value={form.phone} disabled={!editing} onChange={(v) => update("phone", v)} />
                  <Field label="Email" type="email" value={form.email} disabled={!editing} onChange={(v) => update("email", v)} />
                  <Field label="Company / organisation" value={form.company} disabled={!editing} onChange={(v) => update("company", v)} />
                  <Field label="Stay purpose" value={form.purpose} disabled={!editing} onChange={(v) => update("purpose", v)} />
                  <Field label="Preferences / notes" value={form.preferences} disabled={!editing} onChange={(v) => update("preferences", v)} wide />
                </div>
              </ProfileSection>
            )}

            {activeSection === "overview" && !editing && (
              <>
                <ProfileSection title="Guest overview" eyebrow="REGISTRATION">
                  <InfoGrid>
                    <InfoItem label="Guest ID" value={guest.id || "—"} />
                    <InfoItem label="Full name" value={displayName || "—"} />
                    <InfoItem label="Nationality" value={form.nationality || "—"} />
                    <InfoItem label="Gender" value={form.gender || "—"} />
                    <InfoItem label="Date of birth" value={form.dob || "—"} />
                    <div className="guest-info-item guest-mobile-item">
                      <span>Mobile</span>
                      <div className="guest-mobile-value">
                        <strong>{form.phone || "—"}</strong>
                        {form.phone && (
<button
  type="button"
  className="guest-call-button"
  onClick={() =>
    onCall?.({
      ...guest,
      name: displayName,
      phone: form.phone,
    })
  }
  aria-label={`Call ${displayName}`}
  title={`Call ${displayName}`}
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
  </svg>
</button>
                        )}
                      </div>
                    </div>
                    <InfoItem label="Email" value={form.email || "—"} />
                    <InfoItem label="Company" value={form.company || "—"} />
                  </InfoGrid>
                </ProfileSection>

                <ProfileSection title="Current stay" eyebrow="ACTIVE RESERVATION">
                  <InfoGrid>
                    <InfoItem label="Reservation" value={reservation?.id || "—"} />
                    <InfoItem label="Room" value={reservation?.room || "Not assigned"} />
                    <InfoItem label="Check-in" value={reservation?.actualCheckIn ? fmt(reservation.actualCheckIn) : "—"} />
                    <InfoItem label="Expected checkout" value={reservation ? `${date(reservation.departure)} · ${reservation.expectedOut || ""}` : "—"} />
                    <InfoItem label="Adults / Children" value={reservation ? `${reservation.adults || 0} / ${reservation.children || 0}` : "—"} />
                    <InfoItem label="Stay purpose" value={form.purpose || "—"} />
                  </InfoGrid>
                </ProfileSection>
              </>
            )}

            {activeSection === "identity" && (
              <ProfileSection
                title="Identity & KYC"
                eyebrow="IDENTITY VERIFICATION"
              >
                <div className="guest-form-grid">
                  <Field
                    label="First name"
                    value={form.firstName}
                    disabled={!editing}
                    onChange={(v) => update("firstName", v)}
                  />
                  <Field
                    label="Last name"
                    value={form.lastName}
                    disabled={!editing}
                    onChange={(v) => update("lastName", v)}
                  />
                  <SelectField
                    label="Gender"
                    value={form.gender}
                    disabled={!editing}
                    onChange={(v) => update("gender", v)}
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                  />
                  <Field
                    label="Date of birth"
                    type="date"
                    value={form.dob}
                    disabled={!editing}
                    onChange={(v) => update("dob", v)}
                  />
                  <Field
                    label="Nationality"
                    value={form.nationality}
                    disabled={!editing}
                    onChange={(v) => update("nationality", v)}
                  />
                  <SelectField
                    label="ID type"
                    value={form.idType}
                    disabled={!editing}
                    onChange={(v) => update("idType", v)}
                    options={idOptions}
                  />
                  <Field
                    label="ID number"
                    value={form.idNumber}
                    disabled={!editing}
                    onChange={(v) => update("idNumber", v)}
                  />
                  <SelectField
                    label="Verification status"
                    value={form.kycStatus}
                    disabled={!editing}
                    onChange={(v) => update("kycStatus", v)}
                    options={["Pending", "Verified", "Rejected"]}
                  />
                </div>

                <div className="guest-document-box">
                  <div>
                    <strong>Identity document</strong>
                    <p>
                      Upload the ID collected during check-in. Accepted:
                      PDF, JPG, JPEG or PNG.
                    </p>
                  </div>
                  <div className="guest-document-actions">
                    <label className={`upload-button ${!editing ? "disabled" : ""}`}>
                      {form.idDocument ? "Replace document" : "Upload document"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={!editing}
                        onChange={(e) =>
                          update(
                            "idDocument",
                            e.target.files?.[0]?.name || ""
                          )
                        }
                      />
                    </label>
                    {form.idDocument && (
                      <span className="document-name">{form.idDocument}</span>
                    )}
                  </div>
                </div>

                <div className="guest-security-note">
                  <strong>Production security:</strong> KYC files should be
                  stored in secured backend/object storage with access control,
                  encryption, audit logging and retention/deletion rules. Do
                  not store identity documents in browser localStorage.
                </div>
              </ProfileSection>
            )}

            {activeSection === "stay" && (
              <ProfileSection title="Room Allocation" eyebrow="ROOM ASSIGNMENT">
                <div className="room-allocation-panel">
                  <div className="room-allocation-copy">
                    <span className="room-allocation-label">Room number</span>
                    <strong>
                      {form.room || "Room not assigned"}
                    </strong>
                    <small>
                      Select an available room for this checked-in reservation.
                      Reserved rooms cannot be allocated.
                    </small>
                  </div>

                  <div className="room-picker-wrap">
                    <button
                      type="button"
                      className={`room-picker-trigger ${
                        !editing ? "disabled" : ""
                      }`}
                      disabled={!editing}
                      onClick={() => editing && setRoomPickerOpen((v) => !v)}
                    >
                      <span>
                        {form.room
                          ? `Room ${form.room}`
                          : "Select room"}
                      </span>
                      <span className="room-picker-chevron">
                        {roomPickerOpen ? "⌃" : "⌄"}
                      </span>
                    </button>

                    {roomPickerOpen && editing && (
                      <div className="room-picker-menu">
                        <div className="room-picker-menu-head">
                          <strong>Select room</strong>
                          <span>
                            {roomOptions.filter(
                              (r) => r.allocation.status === "Available"
                            ).length}{" "}
                            available
                          </span>
                        </div>

                        <div className="room-picker-list">
                          {roomOptions.map((room) => {
                            const isCurrent =
                              String(room.number) === String(form.room);
                            const available =
                              room.allocation.status === "Available";

                            return (
                              <button
                                type="button"
                                key={room.number}
                                className={`room-option ${
                                  isCurrent ? "selected" : ""
                                } ${!available ? "reserved" : ""}`}
                                disabled={!available}
                                onClick={() => {
                                  if (!available) return;
                                  update("room", String(room.number));
                                  setRoomPickerOpen(false);
                                  setRoomSaveMessage("");
                                }}
                              >
                                <span className="room-option-main">
                                  <strong>Room {room.number}</strong>
                                  <small>
                                    {room.type || "Room"} · Floor{" "}
                                    {room.floor || "—"}
                                  </small>
                                </span>
                                <span
                                  className={`room-availability ${
                                    available ? "available" : "reserved"
                                  }`}
                                >
                                  {available ? "Available" : "Reserved"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {roomSaveMessage && (
                  <div
                    className={`room-save-message ${
                      roomSaveMessage.toLowerCase().includes("reserved") ||
                      roomSaveMessage.toLowerCase().includes("select")
                        ? "error"
                        : "success"
                    }`}
                  >
                    {roomSaveMessage}
                  </div>
                )}

                {editing && (
                  <div className="room-allocation-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={saveRoomAllocation}
                    >
                      Save room allocation
                    </button>
                  </div>
                )}

                <InfoGrid>
                  <InfoItem label="Reservation ID" value={reservation?.id || "—"} />
                  <InfoItem label="Room type" value={reservation?.roomType || "—"} />
                  <InfoItem
                    label="Check-in date"
                    value={reservation?.arrival || "—"}
                  />
                  <InfoItem
                    label="Expected checkout"
                    value={reservation?.departure || "—"}
                  />
                  <InfoItem
                    label="Expected checkout time"
                    value={reservation?.expectedOut || "—"}
                  />
                  <InfoItem
                    label="Adults"
                    value={reservation?.adults ?? "—"}
                  />
                  <InfoItem
                    label="Children"
                    value={reservation?.children ?? "—"}
                  />
                </InfoGrid>

                <div className="guest-payment-panel">
                  <div>
                    <span>Reservation total</span>
                    <strong>
                      ₹{Number(reservation?.total || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Paid</span>
                    <strong>
                      ₹{Number(reservation?.paid || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span>Balance</span>
                    <strong>
                      ₹{Number(reservation?.balance || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </ProfileSection>
            )}

            {activeSection === "address" && (
              <ProfileSection title="Address" eyebrow="CONTACT ADDRESS">
                <div className="guest-form-grid">
                  <Field
                    label="Address line 1"
                    value={form.address1}
                    disabled={!editing}
                    onChange={(v) => update("address1", v)}
                    wide
                  />
                  <Field
                    label="Address line 2"
                    value={form.address2}
                    disabled={!editing}
                    onChange={(v) => update("address2", v)}
                    wide
                  />
                  <Field
                    label="City"
                    value={form.city}
                    disabled={!editing}
                    onChange={(v) => update("city", v)}
                  />
                  <Field
                    label="State"
                    value={form.state}
                    disabled={!editing}
                    onChange={(v) => update("state", v)}
                  />
                  <Field
                    label="Country"
                    value={form.country}
                    disabled={!editing}
                    onChange={(v) => update("country", v)}
                  />
                  <Field
                    label="PIN / Postal code"
                    value={form.pincode}
                    disabled={!editing}
                    onChange={(v) => update("pincode", v)}
                  />
                </div>
              </ProfileSection>
            )}

            {activeSection === "foreign" && isForeign && (
              <ProfileSection
                title="Foreign guest details"
                eyebrow="IMMIGRATION / FOREIGN GUEST"
              >
                <div className="guest-form-grid">
                  <Field
                    label="Passport number"
                    value={form.passportNumber}
                    disabled={!editing}
                    onChange={(v) => update("passportNumber", v)}
                  />
                  <Field
                    label="Passport issuing place"
                    value={form.passportIssuePlace}
                    disabled={!editing}
                    onChange={(v) => update("passportIssuePlace", v)}
                  />
                  <Field
                    label="Passport issue date"
                    type="date"
                    value={form.passportIssueDate}
                    disabled={!editing}
                    onChange={(v) => update("passportIssueDate", v)}
                  />
                  <Field
                    label="Passport expiry"
                    type="date"
                    value={form.passportExpiryDate}
                    disabled={!editing}
                    onChange={(v) => update("passportExpiryDate", v)}
                  />
                  <Field
                    label="Visa number"
                    value={form.visaNumber}
                    disabled={!editing}
                    onChange={(v) => update("visaNumber", v)}
                  />
                  <Field
                    label="Visa type"
                    value={form.visaType}
                    disabled={!editing}
                    onChange={(v) => update("visaType", v)}
                  />
                  <Field
                    label="Visa issue date"
                    type="date"
                    value={form.visaIssueDate}
                    disabled={!editing}
                    onChange={(v) => update("visaIssueDate", v)}
                  />
                  <Field
                    label="Visa expiry"
                    type="date"
                    value={form.visaExpiryDate}
                    disabled={!editing}
                    onChange={(v) => update("visaExpiryDate", v)}
                  />
                  <Field
                    label="Address / reference in India"
                    value={form.indiaAddress}
                    disabled={!editing}
                    onChange={(v) => update("indiaAddress", v)}
                    wide
                  />
                  <Field
                    label="Purpose of visit"
                    value={form.purposeOfVisit}
                    disabled={!editing}
                    onChange={(v) => update("purposeOfVisit", v)}
                  />
                  <Field
                    label="Arrived from"
                    value={form.arrivedFrom}
                    disabled={!editing}
                    onChange={(v) => update("arrivedFrom", v)}
                  />
                  <Field
                    label="Next destination"
                    value={form.nextDestination}
                    disabled={!editing}
                    onChange={(v) => update("nextDestination", v)}
                  />
                </div>
              </ProfileSection>
            )}

            {activeSection === "contact" && (
              <ProfileSection title="Emergency & contact" eyebrow="CONTACT">
                <div className="guest-form-grid">
                  <Field
                    label="Mobile"
                    value={form.phone}
                    disabled={!editing}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    disabled={!editing}
                    onChange={(v) => update("email", v)}
                  />
                  <Field
                    label="Emergency contact name"
                    value={form.emergencyName}
                    disabled={!editing}
                    onChange={(v) => update("emergencyName", v)}
                  />
                  <Field
                    label="Emergency contact mobile"
                    value={form.emergencyPhone}
                    disabled={!editing}
                    onChange={(v) => update("emergencyPhone", v)}
                  />
                  <Field
                    label="Relationship"
                    value={form.emergencyRelation}
                    disabled={!editing}
                    onChange={(v) => update("emergencyRelation", v)}
                  />
                  <Field
                    label="Company / organisation"
                    value={form.company}
                    disabled={!editing}
                    onChange={(v) => update("company", v)}
                  />
                  <Field
                    label="Stay purpose"
                    value={form.purpose}
                    disabled={!editing}
                    onChange={(v) => update("purpose", v)}
                  />
                  <Field
                    label="Preferences / notes"
                    value={form.preferences}
                    disabled={!editing}
                    onChange={(v) => update("preferences", v)}
                    wide
                  />
                </div>
              </ProfileSection>
            )}

            {activeSection === "history" && (
              <ProfileSection title="Stay history" eyebrow="GUEST HISTORY">
                <div className="guest-history-table">
                  <div className="guest-history-head">
                    <span>Reservation</span>
                    <span>Stay</span>
                    <span>Room</span>
                    <span>Status</span>
                  </div>
                  {data.reservations
                    .filter((r) => r.guestId === guest.id)
                    .map((r) => (
                      <div className="guest-history-row" key={r.id}>
                        <span>{r.id}</span>
                        <span>
                          {date(r.arrival)} → {date(r.departure)}
                        </span>
                        <span>{r.room || "Unassigned"}</span>
                        <span>{r.status}</span>
                      </div>
                    ))}
                </div>
              </ProfileSection>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="guests-page">
      <div className="page-heading guests-heading">
        <div>
          <div className="eyebrow">GUEST MANAGEMENT</div>
          <h1>Guests</h1>
          <p className="muted">
            Manage in-house guest profiles, registration, identity verification
            and stay history.
          </p>
        </div>
        <span className="pill">{rows.length} {data.demo?"profiles":"in-house"}</span>
      </div>

      <div className="guest-kpis">
        <Kpi label={data.demo?"Guest profiles":"In-house guests"} value={rows.length} />
        <Kpi label="KYC pending" value={kycPending} />
        <Kpi
          label="Arrivals today"
          value={
            data.reservations.filter(
              (r) => r.status === "Checked In" && r.arrival === new Date().toISOString().slice(0, 10)
            ).length
          }
        />
        <Kpi
          label="Guest profiles"
          value={data.guests.length}
        />
      </div>

      <div className="guest-toolbar card">
        <div className="guest-search-wrap">
          <span>⌕</span>
          <input
            placeholder="Search name, mobile, email, guest ID, ID number or room…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          className="subtle"
          onClick={() => setQ("")}
          disabled={!q}
        >
          Clear
        </button>
      </div>

      <section className="card table-card guests-table-card">
        <div className="guest-table-title">
          <div>
            <strong>{data.demo?"Guest directory":"In-house guests"}</strong>
            <span>Guests who have completed the reservation-to-check-in flow.</span>
          </div>
          <span className="guest-table-count">{rows.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room / Stay</th>
              <th>Contact</th>
              <th>Identity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map(({ guest, reservation }) => (
                <tr
                  key={`${guest.id}-${reservation.id}`}
                  onClick={() => openGuest(guest, reservation)}
                  className="clickable"
                >
                  <td>
                    <div className="guest-cell">
                      <span className="avatar">{initials(guest.name)}</span>
                      <div>
                        <strong>{guest.name}</strong>
                        <small>{guest.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{reservation.room || "—"}</strong>
                    <small>
                      {date(reservation.arrival)} → {date(reservation.departure)}
                    </small>
                  </td>
                  <td>
                    <strong>{guest.phone || "—"}</strong>
                    <small>{guest.email || "No email"}</small>
                  </td>
                  <td>
                    <span
                      className={`guest-kyc-pill ${
                        guest.kycStatus === "Verified" ? "verified" : "pending"
                      }`}
                    >
                      {guest.kycStatus || "Pending"}
                    </span>
                    <small>{guest.idType || "ID not recorded"}</small>
                  </td>
                  <td>
                    <span className="guest-live-pill">IN-HOUSE</span>
                  </td>
                  <td>
                    <button
                      className="subtle table-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGuest(guest, reservation);
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No in-house guests match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ProfileSection({ eyebrow, title, children }) {
  return (
    <section className="card guest-profile-section">
      <div className="guest-section-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoGrid({ children }) {
  return <div className="guest-info-grid">{children}</div>;
}

function InfoItem({ label, value }) {
  return (
    <div className="guest-info-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  wide = false,
}) {
  return (
    <label className={`guest-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, disabled, options }) {
  return (
    <label className="guest-field">
      <span>{label}</span>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="card guest-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
