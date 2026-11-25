import React, { useState } from "react";
import "./Experience.css";

const experiences = [
  {
    company: "Wynsync Technologies",
    role: "AI Automation Engineer",
    period: "Mar 2026 – Present",
    responsibilities: [
      "Gather and analyze business requirements with product managers and development teams",
      "Document functional requirements and translate business needs into development tasks",
      "Facilitate requirement discussions with stakeholders to clarify business rules and expected system behavior",
      "Analyze workflows and recommend process improvements",
      "Validate completed features against business requirements",
      "Support QA during functional testing, SIT, and UAT",
      "Document product functionality and workflows",
    ],
    modules: [
      "Campaign Management",
      "Workflow Automation",
      "WhatsApp/Email Automation",
      "Analytics Dashboard",
      "Billing",
      "Contact & User Management",
    ],
  },
];

export default function Experience() {
  const [active, setActive] = useState(0);
  const current = experiences[active];
  const singleRole = experiences.length === 1;

  return (
    <section className="experience" id="experience">
      <p className="eyebrow eyebrow--center">// EXPERIENCE</p>
      <h2 className="experience__heading">Professional Background</h2>
      <p className="experience__sub">
        My journey as a Business Analyst bridging business needs and
        technical implementation.
      </p>

      <div className={`experience__body ${singleRole ? "experience__body--single" : ""}`}>
        {/* ---------- TIMELINE NAV ---------- */}
        {!singleRole && (
          <ul className="timeline" role="tablist" aria-label="Work experience timeline">
            {experiences.map((exp, i) => (
              <li key={exp.company}>
                <button
                  role="tab"
                  aria-selected={active === i}
                  className={`timeline__item ${active === i ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="timeline__dot" />
                  <span className="timeline__meta">
                    <strong>{exp.company}</strong>
                    <span>{exp.period}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ---------- DETAIL CARD ---------- */}
        <article className="exp-card" key={active}> 
          <header className="exp-card__header">
            <div>
              <h3>{current.company}</h3>
              <p className="exp-card__role">{current.role}</p>
            </div>
            <span className="exp-card__period">{current.period}</span>
          </header>

          <div className="exp-card__grid">
            <div>
              <h4>Key Responsibilities</h4>
              <ul className="resp-list">
                {current.responsibilities.map((r) => (
                  <li key={r}>
                    <span className="resp-list__arrow">▸</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Product Exposure</h4>
              <div className="chip-row">
                {current.modules.map((m) => (
                  <span className="chip" key={m}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}










