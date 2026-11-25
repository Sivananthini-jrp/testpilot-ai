import React from "react";
import "./AnalysisSkills.css";

const skillGroups = [
  {
    key: "analysis",
    label: "Analysis",
    initial: "A",
    hue: "teal",
    skills: [
      "Requirement Gathering",
      "Gap Analysis",
      "Workflow Analysis",
      "Stakeholder Communication",
    ],
  },
  {
    key: "documentation",
    label: "Documentation",
    initial: "D",
    hue: "amber",
    skills: [
      "BRD / FRD",
      "User Stories & Acceptance Criteria",
      "Process Flow Diagrams",
      "Change Request Analysis",
    ],
  },
  {
    key: "process",
    label: "Process",
    initial: "P",
    hue: "violet",
    skills: ["SDLC", "Agile & Scrum", "UAT / SIT"],
  },
];

export default function AnalysisSkills() {
  return (
    <section className="skills" id="skills">
      <p className="eyebrow eyebrow--center">// BUSINESS ANALYSIS SKILLS</p>
      <h2 className="skills__heading">Comprehensive skills covering the entire BA lifecycle.</h2>

      <div className="skills__grid">
        {skillGroups.map((group) => (
          <div className={`skill-panel skill-panel--${group.hue}`} key={group.key}>
            <div className="skill-panel__head">
              <span className="skill-panel__badge">{group.initial}</span>
              <h3>{group.label}</h3>
            </div>
            <div className="skill-panel__pills">
              {group.skills.map((s) => (
                <span className="pill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}