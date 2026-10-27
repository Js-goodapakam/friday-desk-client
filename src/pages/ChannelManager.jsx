import { useMemo, useState } from "react";
import "./channel-manager.css";
import {workspaceRequest} from "../services/workspace.js";

const PROVIDERS = ["Booking.com", "Expedia", "Airbnb", "MakeMyTrip", "Goibibo", "Agoda"];

export default function ChannelManager({ data, setData, onReload }) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [propertyCode, setPropertyCode] = useState("");
  const [notice, setNotice] = useState("");
  const channels = data.channelManager?.channels || [];
  const [scenario,setScenario]=useState("new_booking"),[mockChannel,setMockChannel]=useState(""),[running,setRunning]=useState(false),[activityPage,setActivityPage]=useState(0);
  const events=data.channelManager?.syncEvents||[];
  const failures=events.filter(e=>e.status==="Failed"&&!events.some(retry=>retry.retryOf===e.id)).length;
  const runMock=async()=>{setRunning(true);setNotice("");try{await workspaceRequest(data.property.id,"POST",{channelId:mockChannel||channels[0]?.id,scenario},"mock-sync");await onReload();setNotice("Simulation completed in the local database. No OTA was contacted.");}catch(error){setNotice(error.message);}finally{setRunning(false);}};
  const roomTypes = useMemo(() => [...new Set((data.rooms || []).map((room) => room.type))], [data.rooms]);

  const saveSetup = (event) => {
    event.preventDefault();
    const name = propertyCode.trim();
    if (!name) return setNotice("Enter the property ID supplied by the channel.");
    if (channels.some((channel) => channel.provider === provider)) return setNotice(`${provider} is already in setup.`);
    setData((current) => ({
      ...current,
      channelManager: {
        ...(current.channelManager || {}),
        channels: [...(current.channelManager?.channels || []), {
          id: `${provider}-${Date.now()}`,
          provider,
          propertyCode: name,
          status: "Setup required",
          createdAt: new Date().toISOString(),
          mappings: roomTypes.map((type) => ({ type, externalCode: "" })),
        }],
        syncEvents: current.channelManager?.syncEvents || [],
      },
    }));
    setNotice(`${provider} setup was saved. Add provider credentials on the server before a connection can be verified.`);
    setOpen(false);
    setPropertyCode("");
  };

  return <section className="cm-page">
    <header className="cm-head">
      <div><span className="cm-eyebrow">REVENUE & DISTRIBUTION</span><h1>Channel Manager</h1><p>Connection readiness, mappings and synchronization health for {data.property?.name || "this property"}.</p></div>
      <button className="cm-primary" disabled={!!data.demo} onClick={() => { setOpen(true); setNotice(""); }}>{data.demo?"Sample data channels configured":"Add channel"}</button>
    </header>

    {notice && <div className="cm-notice" role="status">{notice}</div>}
    <div className="cm-metrics">
      <Metric label={data.demo?"Simulated channels":"Connected"} value={String(channels.filter(c=>data.demo?c.simulated:c.connected&&!c.simulated).length)} note={data.demo?"Local mock integrations only":"Verified live integrations"} />
      <Metric label="Setup required" value={String(channels.filter(c=>!c.simulated&&!c.connected).length)} note="Awaiting credentials or mapping" />
      <Metric label="Sync health" value={data.demo?(failures?String(failures)+" failed":"Mock healthy"):"Unavailable"} note={data.demo?"Derived from mock event and retry records":"No configured sync provider"} />
    </div>

    <section className="cm-card">
      <div className="cm-card-head"><div><h2>Channel connections</h2><p>Only verified integrations appear as connected.</p></div><span className="cm-badge">{channels.length} configured</span></div>
      {channels.length === 0 ? <Empty onAdd={() => setOpen(true)} /> : <div className="cm-table-wrap"><table><thead><tr><th>Channel</th><th>Property mapping</th><th>Room-type mapping</th><th>Connection</th><th>Last sync</th></tr></thead><tbody>{channels.map((channel) => <tr key={channel.id}><td><strong>{channel.provider}</strong><small>Property ID: {channel.propertyCode}</small></td><td><span className="cm-state cm-state--pending">{channel.simulated?"Mock mapping complete":"Pending verification"}</span></td><td>{channel.mappings?.filter((mapping) => mapping.externalCode).length || 0} of {channel.mappings?.length || 0} mapped</td><td><span className="cm-state cm-state--setup">{channel.status}</span></td><td>{channel.lastSync?new Date(channel.lastSync).toLocaleString("en-IN"):"Not available"}</td></tr>)}</tbody></table></div>}
    </section>

    <div className="cm-grid"><section className="cm-card"><div className="cm-card-head"><div><h2>Synchronization activity</h2><p>Inventory, rates and reservations will appear here after connection.</p></div></div>{events.length?<div className="cm-table-wrap"><table><thead><tr><th>Channel / event</th><th>Status</th></tr></thead><tbody>{events.slice(activityPage*8,activityPage*8+8).map(event=><tr key={event.id}><td><strong>{event.channel}</strong>{event.action}<small>{event.error||event.details||event.at}</small></td><td>{event.status}{event.retryOf&&<small>Retry recorded</small>}</td></tr>)}</tbody></table><div className="demo-pagination"><button disabled={!activityPage} onClick={()=>setActivityPage(activityPage-1)}>Previous</button><span>{events.length} mock events</span><button disabled={(activityPage+1)*8>=events.length} onClick={()=>setActivityPage(activityPage+1)}>Next</button></div></div>:<div className="cm-empty-small"><b>No synchronization records</b><span>Configure an OTA provider and verify its credentials to enable sync.</span></div>}</section><section className="cm-card"><div className="cm-card-head"><div><h2>Readiness checklist</h2><p>Complete these on every channel before going live.</p></div></div><ul className="cm-checklist"><li><i>1</i><span><b>Provider credentials</b><small>Store securely on the server, never in the browser.</small></span></li><li><i>2</i><span><b>Property and room mappings</b><small>Match each Friday room type to the OTA inventory.</small></span></li><li><i>3</i><span><b>Verification and initial sync</b><small>Confirm a successful provider response before publishing.</small></span></li></ul></section></div>

    {data.demo&&<section className="cm-card" style={{marginTop:16,padding:18}}><h2 style={{fontSize:16}}>Mock OTA operations</h2><p>All actions run locally and revalidate inventory, billing and property access.</p><div className="demo-controls"><label>Channel<select value={mockChannel||channels[0]?.id} onChange={e=>setMockChannel(e.target.value)}>{channels.map(channel=><option key={channel.id} value={channel.id}>{channel.provider}</option>)}</select></label><label>Scenario<select value={scenario} onChange={e=>setScenario(e.target.value)}>{[["new_booking","New OTA reservation"],["modification","Modify reservation"],["cancellation","Cancel and restore inventory"],["rate_update","Update rate"],["stop_sell","Toggle stop-sell"],["failure","Inject failed sync"],["retry","Retry failed sync"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="cm-primary" disabled={running} onClick={runMock}>{running?"Running…":"Run mock scenario"}</button></div><details><summary>Room and rate-plan mapping records</summary>{channels.map(channel=><div key={channel.id}><h3>{channel.provider} — {channel.propertyCode}</h3>{channel.mappings.map(m=><p key={m.roomTypeId}>{m.type} → {m.externalCode}</p>)}{channel.rateMappings?.map(m=><p key={m.ratePlanId}>{m.ratePlanId} → {m.externalCode}</p>)}</div>)}</details></section>}
    {open && <div className="cm-modal-backdrop" role="presentation"><form className="cm-modal" role="dialog" aria-modal="true" aria-label="Channel setup" onSubmit={saveSetup}>{notice && <p role="alert">{notice}</p>}<div><span className="cm-eyebrow">NEW CONNECTION</span><h2>Start channel setup</h2><p>Saving this creates a setup record only. It does not connect or synchronize the channel.</p></div><label>Channel<select value={provider} onChange={(event) => setProvider(event.target.value)}>{PROVIDERS.map((item) => <option key={item}>{item}</option>)}</select></label><label>Provider property ID<input value={propertyCode} onChange={(event) => setPropertyCode(event.target.value)} placeholder="e.g. 1234567" required /></label><div className="cm-modal-actions"><button type="button" className="cm-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="cm-primary" type="submit">Save setup</button></div></form></div>}
  </section>;
}

function Metric({ label, value, note }) { return <article className="cm-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function Empty({ onAdd }) { return <div className="cm-empty"><div className="cm-empty-icon">↔</div><h3>No channels configured</h3><p>Add a channel to record its setup. Friday will not show it as connected until server-side credentials and verification are in place.</p><button className="cm-secondary" onClick={onAdd}>Add a channel</button></div>; }
