export function SimplePage({title,eyebrow,children,action}) {
 return <><div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{action}</div>{children}</>;
}
