import React from "react";
import "./Home.css";
import portrait from "../assets/portfolio_pic.png";

const metrics = [
  "REQUIREMENT GATHERING → FUNCTIONAL SPECS → VALIDATED SOLUTIONS",
  "BRD · FRD · USER STORIES · UAT/SIT",
  "AGILE & SCRUM · SDLC",
  "FOCUS: BANKING & FINANCIAL SERVICES",
];

export default function Home() {
  return (
    <div className="home">
      {/* ---------- NAV ---------- */}
      <nav className="nav">
        <span className="nav__mark">SJ</span>
        <ul className="nav__links">
          <li>Home</li>
          <li>About</li>
          <li>Work</li>
          <li>Contact</li>
        </ul>
        <a className="nav__cta" href="#contact">
          Get in touch
        </a>
      </nav>

      {/* ---------- HERO ---------- */}
      <header className="hero">
        <div className="hero__text">
          <p className="eyebrow">// BUSINESS ANALYST</p>
          <h1 className="hero__name">Sivananthini Jeyamurugan</h1>
          <p className="hero__role">
            I turn <em>business needs</em> into functional specs and
            validated solutions.
          </p>
          <p className="hero__desc">
            Business Analyst with hands-on experience in requirement
            gathering, functional documentation, and workflow improvement
            across the SDLC. Currently an AI Automation Engineer at Wynsync
            Technologies, translating business needs into functional
            specifications and validated solutions.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#work">
              View my work
            </a>
            <a
              className="btn btn--ghost"
              href="/Sivananthini_Jeyamurugan_BA_Resume_v2.pdf"
              download
            >
              Download résumé
            </a>
          </div>
        </div>

        <div className="hero__portrait">
          <div className="frame">
            <img src={portrait} alt="Sivananthini Jeyamurugan, Business Analyst" />
            <span className="frame__tag frame__tag--tl">FIG. 01</span>
            <span className="frame__tag frame__tag--br">STATUS: AVAILABLE</span>
          </div>
        </div>
      </header>

      {/* ---------- METRIC TICKER (signature element) ---------- */}
      <div className="ticker" aria-hidden="false">
        <div className="ticker__track">
          {[...metrics, ...metrics].map((m, i) => (
            <span className="ticker__item" key={i}>
              {m}
              <span className="ticker__dot">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}