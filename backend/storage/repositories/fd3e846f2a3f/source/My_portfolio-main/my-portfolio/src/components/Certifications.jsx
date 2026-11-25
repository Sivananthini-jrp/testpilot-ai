import React from "react";
import "./Certifications.css";

const icons = {
  cap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" strokeLinejoin="round" />
      <path d="M6 10.5v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5" strokeLinejoin="round" />
      <path d="M20 9v6" strokeLinecap="round" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
};

const groups = [
  {
    icon: "cap",
    title: "Education",
    items: [
      "Bachelor of Engineering — Computer Science & Engineering",
      "Sethu Institute of Technology · CGPA 8.0/10 · 2026",
    ],
  },
  {
    icon: "spark",
    title: "Soft Skills",
    items: [
      "Analytical Thinking",
      "Communication",
      "Stakeholder Management",
      "Critical Thinking",
      "Problem Solving",
      "Adaptability",
      "Time Management",
    ],
  },
];

export default function Certifications() {
  return (
    <section className="certs" id="certifications">
      <p className="eyebrow eyebrow--center">// EDUCATION & SKILLS</p>
      <h2 className="certs__heading">Foundations</h2>
      <p className="certs__sub">My academic background and the skills I bring to every project.</p>

      <div className="certs__grid">
        {groups.map((g) => (
          <div className="cert-card" key={g.title}>
            <span className="cert-card__icon">{icons[g.icon]}</span>
            <h3>{g.title}</h3>
            <ul>
              {g.items.map((item) => (
                <li key={item}>
                  <span className="cert-card__check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}