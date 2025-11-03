import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Begin a conversation",
};

export default function ContactPage() {
  return (
    <section className="space-y-12 pt-20">
      <div className="space-y-6">
        <h1 className="text-4xl font-light text-text-primary md:text-[48px]">
          Begin a conversation.
        </h1>
        <p className="max-w-[620px] text-[17px] leading-[1.6] tracking-[0.01em] text-text-secondary">
          Every environment carries its own constraints, histories, and operational rhythms. We begin by understanding context, not assumptions.
        </p>
      </div>

      <ContactForm />
    </section>
  );
}

