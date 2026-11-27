export function Badge({children}) {
  return <span className={`badge ${String(children).toLowerCase().replaceAll(" ","-")}`}>{children}</span>;
}
export function Field({label,children}) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
export const Toggle=({title,text,checked=true})=><label className="toggle-row"><div><b>{title}</b><small>{text}</small></div><input type="checkbox" defaultChecked={checked}/></label>;

export function Button({variant="primary",className="",type="button",children,...props}) {
  return <button type={type} className={`eh-button eh-button--${variant} ${className}`} {...props}>{children}</button>;
}
export function Card({className="",children,...props}) {
  return <section className={`eh-card ${className}`} {...props}>{children}</section>;
}
export function TextInput({className="",...props}) {
  return <input className={`eh-input ${className}`} {...props}/>;
}
export function Select({className="",children,...props}) {
  return <select className={`eh-input ${className}`} {...props}>{children}</select>;
}
export function TextArea({className="",...props}) {
  return <textarea className={`eh-input ${className}`} {...props}/>;
}

const stateTitles={loading:"Loading…",empty:"No results found",error:"Something went wrong",success:"Completed successfully"};
export function UIState({state="empty",title,description,onAction,actionLabel="Retry"}) {
  return <div className={`eh-state eh-state--${state}`}>
    <div role={state==="error"?"alert":"status"} aria-atomic="true">
      <strong>{title||stateTitles[state]}</strong>
      {description&&<p>{description}</p>}
    </div>
    {onAction&&<Button variant="secondary" onClick={onAction}>{actionLabel}</Button>}
  </div>;
}
