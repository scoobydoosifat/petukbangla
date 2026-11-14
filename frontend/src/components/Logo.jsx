export default function Logo({ compact = false }) {
  return <span className={`brand ${compact ? 'compact' : ''}`}><span className="logo-mark has-symbol" aria-hidden="true">
    <svg viewBox="0 0 52 52" focusable="false">
      <path className="logo-tile" d="M13 3.8h26A9.2 9.2 0 0 1 48.2 13v26a9.2 9.2 0 0 1-9.2 9.2H13A9.2 9.2 0 0 1 3.8 39V13A9.2 9.2 0 0 1 13 3.8Z" />
      <path className="logo-steam steam-one" d="M20.5 23.5c-3.5-4.8 3.8-6.2.5-11" />
      <path className="logo-steam steam-two" d="M29 22.8c4-4.2-2.7-6.8 1.2-11.2" />
      <path className="logo-bowl" d="M12.5 26.2h27c-1.1 9.1-6.3 13.4-13.5 13.4s-12.4-4.3-13.5-13.4Z" />
      <path className="logo-river" d="M17.2 30.3c5.1-2.2 10.8 3 17.6 0" />
      <circle className="logo-dot" cx="13" cy="16" r="1.5" /><circle className="logo-dot" cx="39" cy="16" r="1.5" />
    </svg>
  </span><span><b>পেটুক বাংলা</b><small>PETUK BANGLA</small></span></span>;
}
