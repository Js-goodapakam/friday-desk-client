const logo = '/engage-app-icon.svg';

export default function RefreshLoader() {
  return (
    <div className="friday-refresh-screen" role="status" aria-live="polite" aria-label="Loading Engage Stay workspace">
      <div className="friday-refresh-mark" aria-hidden="true">
        <img className="friday-refresh-intact" src={logo} alt="" />
      </div>
      <div className="friday-refresh-copy">
        <span className="friday-refresh-brand">ENGAGE STAY</span>
        <p>Preparing your workspace…</p>
      </div>
      <div className="friday-refresh-progress" aria-hidden="true"><span /></div>
    </div>
  );
}
