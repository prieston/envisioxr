"use client";

import Image from "next/image";
import { Typewriter } from "react-simple-typewriter";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative z-40 overflow-hidden pb-24 pt-28 sm:pt-36 lg:pb-[120px] lg:pt-[170px]"
    >
      <div className="px-4 xl:container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-3 lg:w-1/2">
            <div className="mx-auto mb-12 max-w-[530px] text-center lg:mb-0 lg:ml-0 lg:text-left">
              <span className="mb-8 inline-block rounded-full bg-primary bg-opacity-5 px-5 py-[10px] font-heading text-base text-primary dark:bg-white dark:bg-opacity-10 dark:text-white">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                The Future of Digital Showcasing
              </span>
              <h1 className="mb-5 font-heading text-2xl font-semibold dark:text-white sm:text-4xl md:text-[50px] md:leading-[60px]">
                Bring Your World to Life with{" "}
                <Typewriter
                  words={[
                    "3D Presentations",
                    "Immersive Virtual Tours",
                    "Interactive XR Experiences",
                  ]}
                  cursor
                  loop={0}
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </h1>
              <p className="mb-12 text-base text-dark-text">
                EnvisioXR transforms the way you present and experience spaces.
                Showcase products, infrastructure, museums, or heritage sites
                with **stunning 3D presentations** or guide audiences through
                **fully immersive virtual tours**—all accessible from any
                device.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start">
                <a
                  href="#features"
                  className="inline-flex items-center rounded bg-primary px-6 py-[10px] font-heading text-base text-white hover:bg-opacity-90 md:px-8 md:py-[14px]"
                >
                  Start Your Experience
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
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center rounded px-8 py-[14px] font-heading text-base text-dark hover:text-primary dark:text-white dark:hover:text-primary"
                >
                  <span className="pr-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="fill-current"
                    >
                      <path d="M19.376 12.416L8.777 19.482C8.70171 19.5321 8.61423 19.5608 8.52389 19.5652C8.43355 19.5695 8.34373 19.5492 8.264 19.5065C8.18427 19.4639 8.1176 19.4003 8.07111 19.3228C8.02462 19.2452 8.00005 19.1564 8 19.066V4.934C8.00005 4.84356 8.02462 4.75482 8.07111 4.67724C8.1176 4.59966 8.18427 4.53615 8.264 4.49346C8.34373 4.45077 8.43355 4.43051 8.52389 4.43483C8.61423 4.43915 8.70171 4.46789 8.777 4.518L19.376 11.584C19.4445 11.6297 19.5006 11.6915 19.5395 11.7641C19.5783 11.8367 19.5986 11.9177 19.5986 12C19.5986 12.0823 19.5783 12.1633 19.5395 12.2359C19.5006 12.3085 19.4445 12.3703 19.376 12.416Z" />
                    </svg>
                  </span>
                  Learn More
                </a>
              </div>
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="wow fadeInRight relative z-30 mx-auto h-[560px] w-full max-w-[700px] lg:ml-0">
              <div className="absolute right-0 top-0 lg:w-11/12">
                <Image
                  src="/images/hero/image-1.png"
                  alt="hero-image"
                  width={560}
                  height={520}
                />
              </div>
              <div className="absolute bottom-0 left-0 z-10">
                <Image
                  src="/images/hero/image-2.png"
                  alt="hero-image"
                  width={350}
                  height={420}
                />
                <div className="absolute -right-6 -top-6 -z-10 h-full w-full border border-primary border-opacity-10 bg-primary bg-opacity-5 backdrop-blur-[6px] dark:border-white dark:border-opacity-10 dark:bg-white dark:bg-opacity-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
