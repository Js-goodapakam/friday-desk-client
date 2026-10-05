import { useEffect, useMemo, useState } from "react";
import { iso } from "../core/data.js";
import "./calendar.css";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOUR_HEIGHT = 64;
const TOTAL_HOURS = 24;

function pad(n){ return String(n).padStart(2,"0"); }
function isoOf(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }
function parseISO(value){
  const [y,m,d] = String(value).slice(0,10).split("-").map(Number);
  return new Date(y, (m || 1)-1, d || 1);
}
function startOfWeek(d){
  const x = new Date(d);
  x.setHours(0,0,0,0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function addDays(d,n){
  const x = new Date(d);
  x.setDate(x.getDate()+n);
  return x;
}
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function formatDateRange(start,end){
  const sameMonth = start.getMonth()===end.getMonth() && start.getFullYear()===end.getFullYear();
  if(sameMonth){
    return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;
}
function timeText(minutes){
  const h = Math.floor(minutes/60);
  const m = minutes%60;
  return `${pad(h)}:${pad(m)}`;
}
function timeMinutes(value,fallback){
  if(!value) return fallback;
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if(!match) return fallback;
  return Math.max(0,Math.min(1439,Number(match[1])*60+Number(match[2])));
}
function checkInMinutes(r){ return timeMinutes(r.checkInTime || r.arrivalTime || r.checkinTime || r.expectedIn, 14*60); }
function checkOutMinutes(r){ return timeMinutes(r.checkOutTime || r.departureTime || r.checkoutTime || r.expectedOut, 12*60); }
function guestName(data,r){
  const g=(data.guests||[]).find(x=>x.id===r?.guestId);
  return g?.name || r?.guestName || "Guest";
}
function guestFor(data,r){
  return (data.guests||[]).find(x=>x.id===r?.guestId);
}
function isActive(r,d){
  return r.status!=="Cancelled" && r.arrival<=d && d<=r.departure;
}
function dayReservations(data,d){
  return (data.reservations||[]).filter(r=>isActive(r,d));
}
function dayArrivals(data,d){
  return (data.reservations||[]).filter(r=>r.status!=="Cancelled" && r.arrival===d);
}
function dayDepartures(data,d){
  return (data.reservations||[]).filter(r=>r.status!=="Cancelled" && r.departure===d);
}
function statusTone(status=""){
  const s=status.toLowerCase();
  if(s.includes("cancel")) return "cancelled";
  if(s.includes("check") && s.includes("out")) return "departure";
  if(s.includes("check") && s.includes("in")) return "checked";
  if(s.includes("confirm")) return "confirmed";
  return "reserved";
}
function getRoomName(data,r){
  if(r.room) return String(r.room);
  const room=(data.rooms||[]).find(x=>x.id===r.roomId);
  return room?.number || room?.name || "Unassigned";
}
function reservationTimeForDay(r,d){
  const first=r.arrival===d;
  const last=r.departure===d;
  const start=first ? checkInMinutes(r) : 0;
  const end=last ? checkOutMinutes(r) : 24*60;
  return {start,end:Math.max(end,start+30),first,last};
}

function MiniCalendar({cursor,onPick,data}){
  const [miniCursor,setMiniCursor]=useState(new Date(cursor.getFullYear(),cursor.getMonth(),1));
  useEffect(()=>setMiniCursor(new Date(cursor.getFullYear(),cursor.getMonth(),1)),[cursor]);

  const y=miniCursor.getFullYear(), m=miniCursor.getMonth();
  const lead=new Date(y,m,1).getDay();
  const today=iso(new Date());
  const cells=[];
  for(let i=0;i<lead;i++) cells.push(null);
  for(let d=1;d<=daysInMonth(y,m);d++) cells.push(d);
  while(cells.length%7) cells.push(null);

  return (
    <div className="teams-mini-calendar">
      <div className="teams-mini-title">
        <strong>{MONTH_NAMES[m]} {y}</strong>
        <div>
          <button type="button" onClick={()=>setMiniCursor(new Date(y,m-1,1))}>‹</button>
          <button type="button" onClick={()=>setMiniCursor(new Date(y,m+1,1))}>›</button>
        </div>
      </div>
      <div className="teams-mini-weekdays">{WEEKDAYS.map(x=><span key={x}>{x[0]}</span>)}</div>
      <div className="teams-mini-grid">
        {cells.map((d,i)=>{
          if(!d) return <span key={i}/>;
          const dIso=isoOf(y,m,d);
          const active=dayReservations(data,dIso).length>0;
          const selected=iso(cursor)===dIso;
          return (
            <button type="button" key={i}
              className={`${selected?"selected ":""}${dIso===today?"today ":""}${active?"has-events":""}`}
              onClick={()=>onPick(parseISO(dIso))}
            >
              {d}
            </button>
          );
        })}
      </div>
      <button type="button" className="mini-today" onClick={()=>onPick(new Date())}>Today</button>
    </div>
  );
}

function FilterBar({roomFilter,setRoomFilter,statusFilter,setStatusFilter,rooms}){
  return (
    <div className="calendar-filters">
      <select value={roomFilter} onChange={e=>setRoomFilter(e.target.value)} aria-label="Room filter">
        <option value="all">All Rooms</option>
        {rooms.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Status filter">
        <option value="all">All Status</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Checked In">Checked In</option>
        <option value="Checked Out">Checked Out</option>
        <option value="Reserved">Reserved</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}

function ReservationBlock({data,reservation,day,compact=false}){
  const d=iso(day);
  const {start,end,first,last}=reservationTimeForDay(reservation,d);
  const top=(start/60)*HOUR_HEIGHT;
  const height=Math.max(34,((end-start)/60)*HOUR_HEIGHT);
  const tone=statusTone(reservation.status);
  const guest=guestFor(data,reservation);
  return (
    <button
      type="button"
      className={`teams-event teams-event--${tone}${compact?" compact":""}`}
      style={{top,height}}
      title={`${guestName(data,reservation)} · Room ${getRoomName(data,reservation)}`}
    >
      <strong>{guestName(data,reservation)}</strong>
      <span>Room {getRoomName(data,reservation)}</span>
      {!compact && <small>{first?timeText(checkInMinutes(reservation)):"00:00"} – {last?timeText(checkOutMinutes(reservation)):"24:00"}</small>}
    </button>
  );
}

function TimeGrid({data,days,query,roomFilter,statusFilter}){
  const now=new Date();
  const today=iso(now);
  const filtered=(data.reservations||[]).filter(r=>{
    if(r.status==="Cancelled" && statusFilter!=="Cancelled") return false;
    if(statusFilter!=="all" && r.status!==statusFilter) return false;
    if(roomFilter!=="all" && getRoomName(data,r)!==roomFilter) return false;
    const q=query.trim().toLowerCase();
    if(!q) return true;
    return `${guestName(data,r)} ${getRoomName(data,r)} ${r.id||""} ${r.status||""}`.toLowerCase().includes(q);
  });

  return (
    <div className="teams-timeline-scroll">
      <div className="teams-time-header" style={{gridTemplateColumns:`58px repeat(${days.length},minmax(${days.length===1?640:145}px,1fr))`}}>
        <div className="teams-time-spacer"/>
        {days.map(d=>{
          const dIso=iso(d);
          const isToday=dIso===today;
          return (
            <div className={`teams-day-head${isToday?" today":""}`} key={dIso}>
              <span>{WEEKDAYS[d.getDay()]}</span>
              <b>{d.getDate()}</b>
              <small>{MONTH_NAMES[d.getMonth()].slice(0,3)}</small>
            </div>
          );
        })}
      </div>

      <div className="teams-time-body">
        <div className="teams-hour-axis">
          {Array.from({length:TOTAL_HOURS},(_,h)=><div key={h}>{pad(h)}:00</div>)}
        </div>

        <div className="teams-day-columns" style={{gridTemplateColumns:`repeat(${days.length},minmax(${days.length===1?640:145}px,1fr))`}}>
          {days.map(d=>{
            const dIso=iso(d);
            const isToday=dIso===today;
            const events=filtered.filter(r=>isActive(r,dIso));
            return (
              <div className={`teams-day-column${isToday?" today":""}`} key={dIso}>
                {Array.from({length:TOTAL_HOURS},(_,h)=><div className="teams-hour-row" key={h}/>)}
                {events.map(r=><ReservationBlock key={`${r.id}-${dIso}`} data={data} reservation={r} day={d}/>)}
                {isToday && (
                  <div className="teams-now-line" style={{top:(now.getHours()*60+now.getMinutes())/60*HOUR_HEIGHT}}>
                    <span>{timeText(now.getHours()*60+now.getMinutes())}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthView({data,cursor,onPickDay,query,roomFilter,statusFilter}){
  const y=cursor.getFullYear(),m=cursor.getMonth(),lead=new Date(y,m,1).getDay();
  const today=iso(new Date()), cells=[];
  for(let i=0;i<lead;i++) cells.push(null);
  for(let d=1;d<=daysInMonth(y,m);d++) cells.push(d);
  while(cells.length%7) cells.push(null);

  const filtered=(dIso)=>{
    const q=query.trim().toLowerCase();
    return dayReservations(data,dIso).filter(r=>{
      if(statusFilter!=="all" && r.status!==statusFilter) return false;
      if(roomFilter!=="all" && getRoomName(data,r)!==roomFilter) return false;
      if(!q) return true;
      return `${guestName(data,r)} ${getRoomName(data,r)} ${r.id||""}`.toLowerCase().includes(q);
    });
  };

  return (
    <div className="teams-month">
      {WEEKDAYS.map(w=><div className="teams-month-head" key={w}>{w}</div>)}
      {cells.map((d,i)=>{
        if(!d) return <div className="teams-month-cell outside" key={i}/>;
        const dIso=isoOf(y,m,d), events=filtered(dIso);
        return (
          <button type="button" className={`teams-month-cell${dIso===today?" today":""}`} key={i} onClick={()=>onPickDay(parseISO(dIso))}>
            <span className="teams-month-number">{d}</span>
            <div className="teams-month-events">
              {events.slice(0,4).map(r=><span className={`month-event month-event--${statusTone(r.status)}`} key={r.id}>
                <b>{guestName(data,r)}</b><em>· {getRoomName(data,r)}</em>
              </span>)}
              {events.length>4 && <span className="month-more">+{events.length-4} more</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function YearView({data,year,onPickMonth}){
  return (
    <div className="teams-year">
      {MONTH_NAMES.map((name,m)=>{
        const total=(data.reservations||[]).filter(r=>r.status!=="Cancelled" && r.arrival?.slice(0,7)===`${year}-${pad(m+1)}`).length;
        const activeDays=Array.from({length:daysInMonth(year,m)},(_,i)=>dayReservations(data,isoOf(year,m,i+1)).length).filter(Boolean).length;
        return (
          <button type="button" className="teams-year-card" key={name} onClick={()=>onPickMonth(m)}>
            <div className="year-card-head"><strong>{name}</strong><span>{total} arrivals</span></div>
            <div className="year-bars">
              {Array.from({length:Math.min(daysInMonth(year,m),31)},(_,i)=>{
                const count=dayReservations(data,isoOf(year,m,i+1)).length;
                return <i key={i} style={{height:`${Math.max(4,Math.min(28,4+count*4))}px`}}/>;
              })}
            </div>
            <div className="year-card-foot"><span>{activeDays} active days</span><b>{total ? "Active" : "Quiet"}</b></div>
          </button>
        );
      })}
    </div>
  );
}

function Agenda({data,day,query,roomFilter,statusFilter,onOpenGuest}){
  const d=iso(day);
  const rows=[...dayArrivals(data,d),...dayDepartures(data,d),...dayReservations(data,d)]
    .filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i)
    .filter(r=>{
      if(statusFilter!=="all" && r.status!==statusFilter) return false;
      if(roomFilter!=="all" && getRoomName(data,r)!==roomFilter) return false;
      const q=query.trim().toLowerCase();
      return !q || `${guestName(data,r)} ${getRoomName(data,r)} ${r.id||""}`.toLowerCase().includes(q);
    })
    .sort((a,b)=>checkInMinutes(a)-checkInMinutes(b));

  return (
    <aside className="teams-agenda">
      <div className="agenda-title">
        <div>
          <span className="eyebrow">SELECTED DAY</span>
          <h3>{day.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</h3>
        </div>
        <span className="agenda-count">{rows.length}</span>
      </div>
      {rows.length===0 ? <div className="agenda-empty">No reservations for this day.</div> : rows.map(r=>{
        const g=guestFor(data,r);
        return (
          <button type="button" className={`agenda-row agenda-row--${statusTone(r.status)}`} key={r.id} onClick={()=>onOpenGuest?.(g)}>
            <span className="agenda-time">{r.arrival===d?timeText(checkInMinutes(r)):r.departure===d?timeText(checkOutMinutes(r)):"In house"}</span>
            <span className="agenda-main">
              <strong>{guestName(data,r)}</strong>
              <small>Room {getRoomName(data,r)} · {r.status}</small>
            </span>
          </button>
        );
      })}
    </aside>
  );
}

export default function CalendarPage({data,onOpenGuest,onNewReservation}){
  const today=new Date();
  const [view,setView]=useState("week");
  const [cursor,setCursor]=useState(today);
  const [query,setQuery]=useState("");
  const [roomFilter,setRoomFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");

  const rooms=useMemo(()=>{
    const map=new Map();
    (data.rooms||[]).forEach(r=>{
      const value=String(r.number ?? r.name ?? r.id ?? "");
      if(value) map.set(value,{value,label:`Room ${value}`});
    });
    (data.reservations||[]).forEach(r=>{
      const value=getRoomName(data,r);
      if(value && value!=="Unassigned") map.set(value,{value,label:`Room ${value}`});
    });
    return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label,undefined,{numeric:true}));
  },[data]);

  const rangeStart=view==="week"?startOfWeek(cursor):cursor;
  const rangeEnd=view==="week"?addDays(rangeStart,6):cursor;
  const title=view==="day"
    ? cursor.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    : view==="week"
      ? formatDateRange(rangeStart,rangeEnd)
      : view==="month"
        ? `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
        : `${cursor.getFullYear()}`;

  const move=(delta)=>{
    setCursor(prev=>{
      const x=new Date(prev);
      if(view==="day") x.setDate(x.getDate()+delta);
      else if(view==="week") x.setDate(x.getDate()+delta*7);
      else if(view==="month") x.setMonth(x.getMonth()+delta);
      else x.setFullYear(x.getFullYear()+delta);
      return x;
    });
  };
  const goToday=()=>setCursor(new Date());

  const changeView=(v)=>{
    setView(v);
    if(v==="day" || v==="week") setCursor(cursor);
  };

  const weekDays=Array.from({length:7},(_,i)=>addDays(startOfWeek(cursor),i));

  return (
    <section className="teams-calendar-page">
      <header className="teams-calendar-toolbar">
        <div className="teams-calendar-title">
          <div className="eyebrow">STAY SCHEDULE</div>
          <h1>Calendar</h1>
        </div>
        <div className="teams-calendar-actions">
          <div className="teams-search">
            <span>⌕</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search guests, rooms, reservations..." />
          </div>
          <button type="button" className="teams-new-button" onClick={()=>onNewReservation?.()}>
            <b>＋</b> New Reservation <span>⌄</span>
          </button>
        </div>
      </header>

      <div className="teams-calendar-commandbar">
        <div className="teams-command-left">
          <button type="button" className="teams-today-button" onClick={goToday}>Today</button>
          <button type="button" className="teams-nav-button" onClick={()=>move(-1)}>‹</button>
          <button type="button" className="teams-nav-button" onClick={()=>move(1)}>›</button>
          <strong>{title}</strong>
        </div>
        <div className="teams-command-right">
          <div className="teams-view-switch">
            {["day","week","month","year"].map(v=>
              <button type="button" key={v} className={view===v?"active":""} onClick={()=>changeView(v)}>
                {v[0].toUpperCase()+v.slice(1)}
              </button>
            )}
          </div>
          <FilterBar rooms={rooms} roomFilter={roomFilter} setRoomFilter={setRoomFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
        </div>
      </div>

      <div className="teams-calendar-workspace">
        <aside className="teams-calendar-sidebar">
          <MiniCalendar cursor={cursor} onPick={d=>{setCursor(d);setView("day")}} data={data}/>
          <div className="teams-sidebar-section">
            <div className="teams-sidebar-section-title">My calendars</div>
            <label><i className="calendar-check blue"/> Reservations</label>
            <label><i className="calendar-check green"/> Housekeeping</label>
            <label><i className="calendar-check orange"/> Maintenance</label>
            <label><i className="calendar-check purple"/> Check-in / Check-out</label>
          </div>
          <div className="teams-sidebar-summary">
            <span>Upcoming</span>
            <strong>{(data.reservations||[]).filter(r=>r.status!=="Cancelled" && r.arrival>=iso(new Date())).length}</strong>
            <small>active reservations</small>
          </div>
        </aside>

        <main className="teams-calendar-main">
          {(view==="day" || view==="week") && (
            <div className={`teams-schedule-layout${view==="day"?" day-layout":""}`}>
              <div className="teams-grid-main">
                <TimeGrid data={data} days={view==="day"?[cursor]:weekDays} query={query} roomFilter={roomFilter} statusFilter={statusFilter}/>
              </div>
              <Agenda data={data} day={cursor} query={query} roomFilter={roomFilter} statusFilter={statusFilter} onOpenGuest={onOpenGuest}/>
            </div>
          )}
          {view==="month" && (
            <MonthView data={data} cursor={cursor} query={query} roomFilter={roomFilter} statusFilter={statusFilter} onPickDay={d=>{setCursor(d);setView("day")}}/>
          )}
          {view==="year" && (
            <YearView data={data} year={cursor.getFullYear()} onPickMonth={m=>{setCursor(new Date(cursor.getFullYear(),m,1));setView("month")}}/>
          )}
        </main>
      </div>

      <div className="teams-calendar-legend">
        <span><i className="legend-dot blue"/> Confirmed</span>
        <span><i className="legend-dot green"/> Checked In</span>
        <span><i className="legend-dot orange"/> Check-out</span>
        <span><i className="legend-dot purple"/> Reserved</span>
        <span className="legend-note">24-hour schedule · Poppins</span>
      </div>
    </section>
  );
}
