import React, { useState } from "react";
import "./CaseStudies.css";

const arc = [
  "Problem",
  "Analysis",
  "Requirement",
  "Process",
  "Solution",
  "Validation",
  "Outcome",
];

const caseStudies = [
  {
    tag: "Professional Project",
    title: "Enterprise Communication Platform",
    skills: ["Jira", "SQL", "Postman", "Draw.io"],
    description:
      "Gathered and documented functional requirements for a cloud-based platform spanning WhatsApp, Email, campaigns, workflow automation, analytics, and billing. Collaborated with developers and QA through implementation, feature validation, and UAT.",
    href: "#",
  },
  {
    tag: "Portfolio Project",
    title: "Loan Origination System Analysis",
    skills: ["BRD", "FRD", "User Stories", "Gap Analysis", "UAT"],
    description:
      "Prepared BRD, FRD, user stories, and acceptance criteria for an end-to-end digital lending solution. Designed process flow diagrams for loan application, verification, credit evaluation, approval, and disbursement, and performed gap analysis and UAT scenarios.",
    href: "#",
  },
  {
    tag: "Portfolio Project",
    title: "Customer Onboarding Process Improvement",
    skills: ["As-Is / To-Be Mapping", "Business Rules", "Functional Requirements"],
    description:
      "Documented As-Is and To-Be workflows, identified bottlenecks, and defined business rules and functional requirements to reduce manual effort in the customer onboarding process.",
    href: "#",
  },
];

export default function CaseStudy() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="case-study" id="work">
      <p className="eyebrow eyebrow--center">// SELECTED WORK</p>

      {/* signature element: the arc every project follows */}
      <div className="arc">
        {arc.map((step, i) => (
          <React.Fragment key={step}>
            <span className="arc__step">{step}</span>
            {i < arc.length - 1 && <span className="arc__link">→</span>}
          </React.Fragment>
        ))}
      </div>

      {/* dossier-style accordion, deliberately not a card grid */}
      <div className="dossier">
        {caseStudies.map((cs, i) => {
          const isOpen = openIndex === i;
          return (
            <div className={`dossier__row ${isOpen ? "is-open" : ""}`} key={cs.title}>
              <button
                className="dossier__header"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="dossier__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="dossier__titleblock">
                  <span className="dossier__tag">{cs.tag}</span>
                  <span className="dossier__title">{cs.title}</span>
                </span>
                <span className="dossier__toggle">{isOpen ? "−" : "+"}</span>
              </button>

              <div className="dossier__panel">
                <div className="dossier__panel-inner">
                  <p className="dossier__skills">{cs.skills.join("  ·  ")}</p>
                  <p className="dossier__desc">{cs.description}</p>
                  <a className="dossier__link" href={cs.href}>
                    View case study →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}