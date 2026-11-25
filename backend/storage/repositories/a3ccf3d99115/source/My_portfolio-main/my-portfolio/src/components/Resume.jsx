import React from "react";
import "./Resume.css";

export default function Resume() {
  return (
    <section className="resume" id="resume">
      <p className="eyebrow eyebrow--center">// RESUME</p>
      <p className="resume__sub">A quick overview of my professional profile.</p>

      <div className="pass">
        <p className="pass__summary">
          Business Analyst with hands-on experience in{" "}
          <strong>requirement gathering</strong>, functional documentation,
          and workflow improvement across the SDLC. Currently an{" "}
          <strong>AI Automation Engineer</strong>, translating business
          needs into functional specifications and validated solutions.
        </p>

        <a
          className="pass__cta"
          href="/Sivananthini_Jeyamurugan_BA_Resume_v2.pdf"
          download
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v12" strokeLinecap="round" />
            <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 19.5h16" strokeLinecap="round" />
          </svg>
          Download Resume
        </a>
      </div>
    </section>
  );
}