"use client";

export default function CommissionerNavigation({ menuOpen, onToggle, onClose, onMarket, onProfile }) {
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
            <button className="navigation-link" type="button" onClick={onMarket}>
              Market
            </button>
            <button className="navigation-link" type="button" onClick={onProfile}>
              Profile
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
