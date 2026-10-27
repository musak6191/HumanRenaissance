"use client";

export default function CommissionerNavigation({ menuOpen, onToggle, onClose }) {
  return (
    <>
      <button
        className={`menu-button${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={onToggle}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="navigation-layer">
          <button
            className="navigation-backdrop"
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
          />
          <nav className="navigation-menu" aria-label="Main navigation">
            <div className="navigation-brand">
              <span>H</span>
              <strong>Human renaissance</strong>
            </div>
            <a className="navigation-link" href="#market" onClick={onClose}>
              Market
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
