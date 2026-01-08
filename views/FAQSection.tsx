import React, { useState } from "react";
import { useInView } from "../utils/useInView";

const faqs = [
  {
    question: "Is SenseiFi safe to use?",
    answer: (
      <>
        Absolutely. <a href="#" className="text-blue-400">SenseiFi uses multi-layered security, real-time threat detection, and smart contract analysis</a> to protect your assets across multiple chains.
      </>
    ),
  },
  {
    question: "Can I trade using SenseiFi?",
    answer: null,
  },
  {
    question: "How does SenseiCard work?",
    answer: null,
  },
  {
    question: "Do I need to install anything?",
    answer: null,
  },
  {
    question: "Which cryptocurrencies are supported?",
    answer: null,
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0 });
  // One ref per FAQ card for staggered animation
  const faqRefs = faqs.map(() => useInView<HTMLDivElement>({ threshold: 0 }));

  return (
    <section
      className="w-full flex flex-col md:flex-row justify-between items-start py-24 bg-black !bg-black !bg-opacity-100 relative z-10"
      id="faq"
      style={{ background: '#000' }}
    >
      {/* Left Side */}
      <div ref={headerRef} className={`md:w-1/2 w-full px-8 md:px-24 flex flex-col items-start ${headerInView ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <span className="px-5 py-1 mb-6 rounded-full border border-blue-400 text-blue-400 font-medium text-base">FAQ</span>
        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 leading-tight">Frequently Asked<br />Question</h2>
        <p className="text-white/70 text-lg max-w-md mb-2">Find quick answers to common questions about our services, pricing, booking, etc</p>
      </div>
      {/* Right Side */}
      <div className="md:w-1/2 w-full flex flex-col gap-6 px-8 mt-12 md:mt-0">
        {faqs.map((faq, idx) => {
          const [faqRef, faqInView] = faqRefs[idx];
          return (
            <div
              key={faq.question}
              ref={faqRef}
              className={`bg-[#0B111E] transition-all duration-300 ${openIndex === idx ? "shadow-lg" : ""} rounded-2xl border border-black relative z-10 ${faqInView ? 'animate-fade-slide-up' : 'opacity-0'}`}
              style={{ background: '#0B111E' }}
            >
              <button
                className="w-full flex justify-between items-center text-left px-8 py-6 text-white text-lg font-normal focus:outline-none"
                onClick={() => setOpenIndex(idx === openIndex ? -1 : idx)}
              >
                <span>{faq.question}</span>
                <span className="ml-4">
                  {openIndex === idx ? (
                    // Up arrow, larger size
                    <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 22V10" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 16l6-6 6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    // Right arrow, larger size
                    <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 16h12" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 10l6 6-6 6" stroke="#5B7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </span>
              </button>
              {openIndex === idx && faq.answer && (
                <div className="px-8 pb-6 text-white/80 text-base">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
