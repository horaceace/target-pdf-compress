"use client";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq-accordion">
      {items.map((item) => (
        <details className="faq-entry" key={item.question}>
          <summary className="faq-entry__summary">
            <span>{item.question}</span>
            <span className="faq-entry__icon" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="faq-entry__answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
