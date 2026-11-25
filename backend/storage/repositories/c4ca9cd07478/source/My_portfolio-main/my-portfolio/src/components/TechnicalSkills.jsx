import React from "react";
import "./TechnicalSkills.css";

const stack = [
  {
    layer: "Frontend",
    tools: ["HTML / CSS", "JavaScript"],
  },
  {
    layer: "API & Data",
    tools: ["REST APIs", "JSON", "SQL"],
  },
  {
    layer: "BA Tools",
    tools: ["Jira", "Draw.io", "Postman"],
  },
  {
    layer: "Productivity",
    tools: ["MS Excel", "MS Word", "MS PowerPoint"],
  },
];

export default function TechnicalSkills() {
  return (
    <section className="tech" id="technical-skills">
      <p className="eyebrow eyebrow--center">// TECHNICAL SKILLS</p>
      <h2 className="tech__heading">Technical Expertise</h2>
      <p className="tech__sub">
        Leveraging my CSE background to bridge business and technology.
      </p>

      <div className="stack">
        {stack.map((row, i) => (
          <div className="stack__row" key={row.layer}>
            <div className="stack__rail">
              <span className="stack__marker" />
              {i < stack.length - 1 && <span className="stack__connector" />}
            </div>
            <div className="stack__content">
              <span className="stack__label">{row.layer}</span>
              <div className="stack__tools">
                {row.tools.map((t) => (
                  <span className="tool" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}