import React from 'react';
import { Link } from 'react-router-dom';
import data from '../portfolioData.json';

const { personal, contact } = data;

export default function CtaBand({ heading, sub }) {
  return (
    <div className="bevel-outset bg-surface-container-high p-5 lg:p-7">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-led-green led-pulse-green rounded-full"></div>
            <span className="font-status-tiny text-status-tiny text-led-green">{personal.availability}</span>
          </div>
          <div className="font-headline-md text-xl lg:text-2xl text-primary font-bold tracking-wide mb-2">
            {heading}
          </div>
          <p className="font-body-base text-on-surface-variant text-[16px] leading-relaxed max-w-xl">
            {sub}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0 lg:w-56">
          <Link
            to="/contact"
            className="bevel-outset bg-primary text-on-primary px-5 py-3 font-label-caps font-bold text-[16px] text-center hover:bg-primary-container active:translate-y-0.5 transition-all"
          >
            START A PROJECT
          </Link>
          <a
            href={`mailto:${contact.email}`}
            className="bevel-outset bg-surface-container-highest text-primary px-5 py-3 font-label-caps font-bold text-[14px] text-center border border-border-graphite hover:text-primary-container active:translate-y-0.5 transition-all"
          >
            EMAIL DIRECT
          </a>
        </div>
      </div>
    </div>
  );
}
