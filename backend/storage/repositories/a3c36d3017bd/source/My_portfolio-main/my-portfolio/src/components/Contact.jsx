import React from "react";
import "./Contact.css";

const links = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sivananthini-j-b2b524311",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <path d="M8 10.5v6M8 7.8v.01" strokeLinecap="round" />
        <path d="M12 16.5v-3.7c0-1.3 1-2.3 2.3-2.3s2.2 1 2.2 2.3v3.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/sivananthiniwynsync-jpg",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path
          d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 3.8 2.4 6.9 5.8 8 .4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1.1-2.9-1.1-.4-1-1-1.2-1-1.2-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.7.1-.6.3-1 .6-1.2-1.9-.2-4-1-4-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8 8 0 0 1 4.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.2-2.1 4-4 4.2.3.3.6.8.6 1.6v2.3c0 .2.2.5.6.4 3.4-1.1 5.8-4.2 5.8-8 0-4.7-3.8-8.5-8.5-8.5Z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:sivananthinijeyamurugan@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m4 6.5 8 6.5 8-6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__signal" aria-hidden="true">
        <span className="ring ring--1" />
        <span className="ring ring--2" />
        <span className="ring ring--3" />
      </div>

      <p className="eyebrow eyebrow--center">// LET'S CONNECT</p>
      <h2 className="contact__heading">Get in Touch</h2>
      <p className="contact__sub">
        I'm always open to discussing new opportunities and collaborations.
      </p>

      <div className="contact-card">
        <p className="contact-card__prompt">
          Interested in discussing business analysis, product strategy, or
          potential opportunities? Let's connect!
        </p>

        <p className="contact-card__location">
          Chennai, Tamil Nadu &nbsp;·&nbsp; +91 9965455740
        </p>

        <div className="contact-card__links">
          {links.map((l) => (
            <a
              className="contact-link"
              href={l.href}
              key={l.label}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span className="contact-link__icon">{l.icon}</span>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}