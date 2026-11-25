import React from "react";
import "./Deliverables.css";

const deliverables = [
  {
    code: "BRD",
    title: "Business Requirements Document",
    blurb: "The business case, scope, and goals stakeholders sign off on.",
  },
  {
    code: "FRD",
    title: "Functional Requirements Document",
    blurb: "What the system must do, broken down feature by feature.",
  },
  {
    code: "US",
    title: "User Stories & Acceptance Criteria",
    blurb: "Written from the user's side, with a clear definition of done.",
  },
  {
    code: "PFD",
    title: "Process Flow Diagrams",
    blurb: "The full workflow mapped from trigger to outcome.",
  },
  {
    code: "GAP",
    title: "Gap Analysis Reports",
    blurb: "Where the current state falls short of the target state.",
  },
  {
    code: "WF",
    title: "Workflow Analysis Documentation",
    blurb: "As-Is and To-Be workflows, with bottlenecks called out.",
  },
  {
    code: "CR",
    title: "Change Request Analysis",
    blurb: "Impact assessment before a change gets greenlit.",
  },
  {
    code: "UAT",
    title: "UAT / SIT Test Scenarios",
    blurb: "Structured validation so what ships matches what was asked for.",
  },
];

export default function Deliverables() {
  return (
    <section className="deliverables" id="deliverables">
      <p className="eyebrow eyebrow--center">// BA DELIVERABLES</p>
      <h2 className="deliverables__heading">Artifacts That Drive Development</h2>
      <p className="deliverables__sub">
        From requirements to acceptance — I produce clear, actionable
        documentation.
      </p>

      <div className="ledger">
        {deliverables.map((d, i) => (
          <div className="ledger__cell" key={d.code}>
            <div className="ledger__top">
              <span className="ledger__index">{String(i + 1).padStart(2, "0")}</span>
              <span className="ledger__code">{d.code}</span>
            </div>
            <h3 className="ledger__title">{d.title}</h3>
            <p className="ledger__blurb">{d.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}