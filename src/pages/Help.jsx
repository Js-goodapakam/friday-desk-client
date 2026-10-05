import { SimplePage } from "./SimplePage.jsx";
export default function Help({setPage}) {
 return <SimplePage title="Help & Support" eyebrow="FRIDAY AI SUPPORT"><div className="dashboard-grid"><section className="card support-card"><h2>How can we help?</h2><p className="muted">Find assistance with reservations, guest profiles, billing, and property settings.</p><div className="support-links"><button className="subtle" onClick={()=>setPage("reservations")}>Reservation help</button><button className="subtle" onClick={()=>setPage("invoices")}>Invoice & billing help</button><button className="subtle" onClick={()=>setPage("settings")}>Property settings</button></div></section></div></SimplePage>;
}
