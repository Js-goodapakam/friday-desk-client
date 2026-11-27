import {useState} from 'react';
import {SimplePage} from './SimplePage.jsx';

const formatMoney=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'});
const money=value=>formatMoney.format(value);

export default function ManagedFolio({data,session,record}) {
  const [reservationId,select]=useState(''),[kind,setKind]=useState('charge');
  const [amount,setAmount]=useState(''),[reference,setReference]=useState('');
  const [operationId,setOperationId]=useState(()=>crypto.randomUUID());
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const entries=data.folioLedger.filter(row=>row.reservationId===reservationId);
  const charges=entries.filter(row=>['room','charge','adjust'].includes(row.kind)).reduce((sum,row)=>sum+row.amount,0);
  const paid=entries.filter(row=>['opening','payment','refund'].includes(row.kind)).reduce((sum,row)=>sum+row.amount,0);
  async function submit(event) {
    event.preventDefault();
    if(busy)return;
    const action=entries.length?kind:'open';
    const minor=Math.round(Number(amount)*100);
    setBusy(true);setError('');setNotice('');
    try {
      await record({id:operationId,reservationId,kind:action,
        reference:action==='open'?'Room accommodation':reference,
        ...(!['open','issue'].includes(action)?{amount:minor}:{})});
      setOperationId(crypto.randomUUID());setReference('');setAmount('');setNotice('Folio entry recorded.');
    } catch(failure){setError(failure.message);}
    finally{setBusy(false);}
  }
  return <SimplePage title="Guest folios" eyebrow="GUEST BILLING">
    <section className="card pw-admin">
      <p>Record offline guest transactions. Enter final charge amounts. Credits and refunds appear in folio history and preserve issued invoices.</p>
      <form onSubmit={submit}>
        <div className="pw-form-grid">
          <label>Reservation<select required disabled={busy} value={reservationId} onChange={event=>{select(event.target.value);setError('');setNotice('');}}>
            <option value="">Select reservation</option>
            {data.reservations.map(stay=><option key={stay.id} value={stay.id}>{data.guests.find(guest=>guest.id===stay.guestId)?.name||'Guest'} · {stay.id}</option>)}
          </select></label>
          {entries.length>0&&<>
            <label>Folio operation<select disabled={busy} value={kind} onChange={event=>setKind(event.target.value)}>
              <option value="charge">Additional charge</option><option value="adjust">Credit adjustment</option>
              <option value="payment">Record payment</option><option value="issue">Issue invoice</option>
              {session.role==='ADMIN'&&<option value="refund">Record refund</option>}
            </select></label>
            {kind!=='issue'&&<label>Amount (INR)<input required disabled={busy} type="number" min=".01" step=".01" value={amount} onChange={event=>setAmount(event.target.value)}/></label>}
            <label>Reference<input required disabled={busy} maxLength={100} value={reference} onChange={event=>setReference(event.target.value)}/></label>
          </>}
        </div>
        <button className="primary" disabled={!reservationId||busy}>{busy?'Saving…':entries.length?'Save folio entry':'Open folio'}</button>
        {notice&&<p role="status">{notice}</p>}
        {error&&<p role="alert">{error}</p>}
      </form>
      {entries.length>0&&<>
        <p>Charges {money(charges/100)} · Net receipts {money(paid/100)} · {charges>=paid?'Outstanding':'Credit'} {money(Math.abs(charges-paid)/100)}</p>
        <div className="pw-table-scroll"><table className="pw-table"><caption>Folio history</caption>
          <thead><tr><th scope="col">Entry</th><th scope="col">Reference</th><th scope="col">Amount</th></tr></thead>
          <tbody>{entries.map(entry=><tr key={entry.id}><td>{entry.kind}</td><td>{entry.reference}</td><td>{money(entry.amount/100)}</td></tr>)}</tbody>
        </table></div>
      </>}
    </section>
  </SimplePage>;
}
