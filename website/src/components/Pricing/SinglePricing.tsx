"use client";

import SingleOffer from "./SingleOffer";

export default function SinglePricing({ price }: any) {
  const handleSubscription = (e: any) => {
    e.preventDefault();
    const supportSection = document.getElementById("support");
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`w-full sm:w-1/2 lg:w-1/3 ${
        price?.nickname === "Professional"
          ? "dark:border-[#2E333D] sm:border-l lg:border-x"
          : ""
      }`}
    >
      <div className="pb-20 pt-10 text-center">
        <div className="border-b dark:border-[#2E333D]">
          <h3 className="mb-2 font-heading text-3xl font-medium text-dark dark:text-white">
            {price?.nickname}
          </h3>
          <p
            className="pb-10 pt-10 text-base text-dark-text"
            style={{ height: "150px" }}
          >
            {price?.nickname === "Starter"
              ? "Essential features for individuals and small businesses looking to showcase in 3D."
              : price?.nickname === "Professional"
                ? "Advanced tools for growing businesses and institutions needing enhanced XR experiences."
                : "The ultimate plan for real estate, museums, and large businesses seeking top-tier 3D and XR solutions."}
          </p>
        </div>
        <div className="border-b py-10 dark:border-[#2E333D]">
          <h3 className="mb-6 flex items-end justify-center pt-2 font-heading text-base font-medium text-dark dark:text-white">
            Contact Us to Get Started
          </h3>
          <p className="mx-auto max-w-[300px] text-base text-dark-text">
            {price?.nickname === "Starter"
              ? "A cost-effective plan to get started with EnvisioXR's core features."
              : price?.nickname === "Professional"
                ? "Unlock more storage, customization, and professional-grade XR tools."
                : "Enjoy unlimited access, branding options, and enterprise-ready XR tools."}
          </p>
        </div>
        <div className="space-y-4 px-6 pb-[60px] pt-10 text-left sm:px-10 md:px-8 lg:px-10 xl:px-20">
          {price?.nickname === "Starter" && (
            <>
              <SingleOffer text="100 GB Storage" status="active" />
              <SingleOffer
                text="Up to 100 Interactive 3D Models"
                status="active"
              />
              <SingleOffer text="Standard Support" status="active" />
              <SingleOffer text="Basic Analytics" status="inactive" />
              <SingleOffer text="Custom Branding" status="inactive" />
            </>
          )}
          {price?.nickname === "Professional" && (
            <>
              <SingleOffer text="500 GB Storage" status="active" />
              <SingleOffer
                text="Unlimited Interactive 3D Models"
                status="active"
              />
              <SingleOffer text="Priority Support" status="active" />
              <SingleOffer text="Advanced Analytics" status="active" />
              <SingleOffer text="Custom Branding" status="inactive" />
            </>
          )}
          {price?.nickname === "Business" && (
            <>
              <SingleOffer text="Unlimited Storage" status="active" />
              <SingleOffer
                text="Unlimited Interactive 3D & Virtual Tours"
                status="active"
              />
              <SingleOffer text="Dedicated Account Manager" status="active" />
              <SingleOffer
                text="Premium Analytics & Insights"
                status="active"
              />
              <SingleOffer text="Custom Branding" status="active" />
            </>
          )}
        </div>
        <button
          onClick={handleSubscription}
          className={`inline-flex items-center rounded px-8 py-[14px] font-heading text-base text-white duration-200 ${
            price?.nickname === "Professional"
              ? "bg-primary hover:bg-primary/90"
              : "bg-dark hover:bg-dark/90"
          }`}
        >
          Contact Us
          <span className="pl-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.172 7L6.808 1.636L8.222 0.222L16 8L8.222 15.778L6.808 14.364L12.172 9H0V7H12.172Z"
                fill="white"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
