export function Badge({children}) {
  return <span className={`badge ${String(children).toLowerCase().replaceAll(" ","-")}`}>{children}</span>;
}
export function Field({label,children}) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
export const Toggle=({title,text,checked=true})=><label className="toggle-row"><div><b>{title}</b><small>{text}</small></div><input type="checkbox" defaultChecked={checked}/></label>;
