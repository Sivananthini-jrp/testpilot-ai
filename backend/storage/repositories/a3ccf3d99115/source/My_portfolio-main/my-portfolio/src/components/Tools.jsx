import React from "react";
import "./Tools.css";

const tools = [
  { name: "Jira", rotate: -2 },
  { name: "Draw.io", rotate: 1.5 },
  { name: "Postman", rotate: -1 },
  { name: "MS Excel", rotate: 2 },
  { name: "MS Word", rotate: -2.5 },
  { name: "MS PowerPoint", rotate: 1 },
];

export default function Tools() {
  return (
    <section className="tools" id="tools">
      <p className="eyebrow eyebrow--center">// TOOLS</p>
      <p className="tools__sub">Tools I've genuinely used in my BA workflow.</p>

      <div className="sticker-sheet">
        {tools.map((t) => (
          <span
            className="sticker"
            key={t.name}
            style={{ "--rotate": `${t.rotate}deg` }}
          >
            {t.name}
          </span>
        ))}
      </div>
    </section>
  );
}