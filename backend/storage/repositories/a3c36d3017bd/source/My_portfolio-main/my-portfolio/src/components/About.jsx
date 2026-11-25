import React from "react";
import "./About.css";

const stats = [
  { value: "2026", label: "CSE Graduate" },
  { value: "3", label: "Projects Completed" },
  { value: "8.0", label: "CGPA / 10" },
  { value: "11", label: "Core BA Skills" },
];

export default function About() {
  return (
    <section className="about-section" id="about">
      <p className="eyebrow eyebrow--center">// ABOUT ME</p>
      <h2 className="about-section__heading">
        Combining Computer Science expertise with Business Analysis
        to deliver <em>impactful solutions.</em>
      </h2>

      <div className="about-section__grid">
        <div className="about-section__copy">
          <p>
            I'm a <strong>2026 graduate with a BE in Computer Science &amp;
            Engineering</strong>, now working as an{" "}
            <strong>AI Automation Engineer</strong> at Wynsync Technologies —
            my first role, and where I'm building hands-on Business Analysis
            experience from day one.
          </p>
          <p>
            In this role and through my portfolio projects, I've practiced{" "}
            <strong>requirement gathering</strong>, writing{" "}
            <strong>BRD/FRD documentation</strong>, creating{" "}
            <strong>user stories and acceptance criteria</strong>, and{" "}
            <strong>process flow mapping</strong> — the full loop from a
            stakeholder's ask to a validated feature.
          </p>
          <p>
            My CS background means I understand <strong>APIs, databases,
            and system architecture</strong> — so even as I'm early in my
            BA career, I can talk to engineering teams in their own
            language while keeping the business goal front and center.
          </p>

          <div className="callout">
            <span className="callout__check">✓</span>
            <span>New to the title, not new to the thinking — I've been solving these problems since college.</span>
          </div>
        </div>

        <div className="about-section__stats">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}