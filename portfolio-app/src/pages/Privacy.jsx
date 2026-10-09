import React from 'react';
import { Link } from 'react-router-dom';
import data from '../portfolioData.json';

const { contact } = data;

// Every claim on this page is checked against api/ — api/contact.js for the
// order of the checks, api/_lib/mail.js for what goes into the email, and
// api/_lib/security.js for how long an IP is held. If any of those change,
// this page changes with them.
const LAST_UPDATED = '9 October 2026';

function Section({ title, children }) {
  return (
    <section className="bevel-outset bg-surface-dim p-4 lg:p-6">
      <h2 className="font-headline-md text-lg lg:text-xl text-primary font-bold tracking-wide mb-3">
        {title}
      </h2>
      <div className="font-body-base text-on-surface-variant text-[16px] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="page-enter">
      <div className="max-w-[72ch] mx-auto flex flex-col gap-4">

        <div className="bevel-outset bg-surface-dim p-4 lg:p-6">
          <h1 className="font-display-lg text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-2">
            Privacy
          </h1>
          <p className="font-mono-data text-outline text-[13px]">
            LAST UPDATED {LAST_UPDATED.toUpperCase()}
          </p>
          <p className="font-body-base text-on-surface-variant text-[16px] leading-relaxed mt-4">
            The short version: this site sets no cookies, runs no analytics and
            tracks nobody. It has exactly one form, and this page explains what
            happens to what you type into it.
          </p>
        </div>

        <Section title="What the contact form collects">
          <p>
            When you send the form on the contact page, it submits your name,
            your email address, the project type you picked (optional) and your
            message.
          </p>
          <p>
            Alongside those, the request carries three things you did not type:
            your IP address, your browser's user-agent string, and the time the
            message arrived. The form also measures how long the page was open
            before you submitted, which is only used to tell a person apart from
            a script that fills forms instantly.
          </p>
        </Section>

        <Section title="Where it goes">
          <p>
            Straight into my email inbox, as one message, delivered by{' '}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-container underline"
            >
              Resend
            </a>
            . Your email address is set as the reply-to, so answering you is one
            click rather than a copy-and-paste. The IP, user-agent and timestamp
            are included at the bottom of that email.
          </p>
          <p>
            There is no database. Your message is not saved to a server, a
            spreadsheet, or a CRM, and it is not used to build a mailing list.
            You will not be added to anything.
          </p>
          <p>
            If the form's own backend is unreachable, it falls back to opening
            your email client with the message pre-filled. In that case nothing
            passes through my server at all — you send it yourself, directly.
          </p>
        </Section>

        <Section title="What is kept, and for how long">
          <p>
            <strong className="text-primary-container">Your message:</strong>{' '}
            lives in my inbox until I delete it. If we end up working together it
            stays as ordinary business correspondence; if we don't, it gets
            cleared out.
          </p>
          <p>
            <strong className="text-primary-container">Your IP address:</strong>{' '}
            held in the server function's own memory so the form can be rate
            limited — one message a minute, five an hour, fifteen a day. Entries
            older than 24 hours are discarded, and the whole thing is wiped
            whenever the function restarts or the site is redeployed, which
            happens often. It is never written to disk. A copy does travel inside
            the notification email, so that one lasts as long as the email does.
          </p>
          <p>
            <strong className="text-primary-container">Everything else:</strong>{' '}
            nothing. No session, no profile, no device fingerprint.
          </p>
        </Section>

        <Section title="Other companies involved">
          <p>
            <strong className="text-primary-container">Vercel</strong> hosts this
            site and runs the form's backend, so its servers handle every request
            to the site, including your IP address.
          </p>
          <p>
            <strong className="text-primary-container">Resend</strong> delivers
            the contact email and therefore processes its contents in transit.
          </p>
          <p>
            <strong className="text-primary-container">Google Fonts</strong>{' '}
            serves two of the typefaces here. Your browser fetches them from
            Google's servers while the page loads, which means Google sees your
            IP address as part of that request. This happens on page load whether
            or not you use the form.
          </p>
        </Section>

        <Section title="What you can do about it">
          <p>
            You never have to use the form. My email address and phone number are
            on the contact page and in the footer of every page — reaching me
            that way involves none of the above.
          </p>
          <p>
            If you have already sent something and want it gone, email me and ask.
            I will delete the message and confirm that I have. You can also ask
            what I hold about you, and I will tell you.
          </p>
        </Section>

        <Section title="Getting in touch about this">
          <p>
            <a
              href={`mailto:${contact.email}`}
              className="text-primary hover:text-primary-container underline break-all"
            >
              {contact.email}
            </a>
            <br />
            <a
              href={`tel:${contact.phone}`}
              className="text-primary hover:text-primary-container underline"
            >
              {contact.phoneDisplay}
            </a>
            <br />
            <span className="text-outline">{contact.address}, India</span>
          </p>
          <p className="text-outline text-[15px]">
            This page describes how the site works today. If I change what the
            form does, I will change this page and the date at the top of it.
          </p>
        </Section>

        <div className="pb-2">
          <Link
            to="/"
            className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
          >
            &larr; BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
