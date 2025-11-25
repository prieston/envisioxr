"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "submitted" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state === "submitting") return;

    setState("submitting");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Contact API error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(data.error || "Failed request");
      }

      setState("submitted");
      event.currentTarget.reset();
    } catch (error) {
      console.error("Contact submission failed", error);
      setState("error");
    }
  };

  const quietMessage =
    state === "submitted"
      ? "We have received your note."
      : state === "error"
        ? "We could not deliver your note. Please try again."
        : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-10 md:grid-cols-2 mt-12">
        <div className="space-y-3">
          <label
            htmlFor="name"
            className="text-xs uppercase tracking-[0.22em] text-text-tertiary"
          >
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="border-b border-line-soft bg-transparent pb-2 text-base text-text-primary focus:border-text-secondary focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <label
            htmlFor="organization"
            className="text-xs uppercase tracking-[0.22em] text-text-tertiary"
          >
            Your Organization
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            required
            className="border-b border-line-soft bg-transparent pb-2 text-base text-text-primary focus:border-text-secondary focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <label
            htmlFor="role"
            className="text-xs uppercase tracking-[0.22em] text-text-tertiary"
          >
            Your Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            required
            className="border-b border-line-soft bg-transparent pb-2 text-base text-text-primary focus:border-text-secondary focus:outline-none"
          />
        </div>
        <div className="space-y-3">
          <label
            htmlFor="email"
            className="text-xs uppercase tracking-[0.22em] text-text-tertiary"
          >
            Email for follow-up
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border-b border-line-soft bg-transparent pb-2 text-base text-text-primary focus:border-text-secondary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="context"
          className="text-xs uppercase tracking-[0.22em] text-text-tertiary"
        >
          Environment / Project Context
        </label>
        <textarea
          id="context"
          name="context"
          required
          rows={6}
          className="border-b border-line-soft bg-transparent pb-3 text-base text-text-primary focus:border-text-secondary focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <button
          type="submit"
          className="inline-flex w-fit items-center border border-line-strong px-7 py-3 text-sm tracking-[0.12em] text-text-primary transition-colors duration-600 hover:border-text-secondary"
          disabled={state === "submitting"}
        >
          Send &rarr;
        </button>
        {quietMessage ? (
          <p className="text-sm text-text-secondary">{quietMessage}</p>
        ) : null}
      </div>
    </form>
  );
}

