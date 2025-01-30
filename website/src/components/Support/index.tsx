export default function Support() {
  return (
    <section id="support" className="pt-14 sm:pt-20 lg:pt-[130px]">
      <div className="px-4 xl:container">
        <div className="-mx-4 flex flex-wrap justify-center">
          <div className="w-full px-4 xl:w-10/12">
            <div className="flex flex-wrap items-center border-b pb-14 dark:border-[#2E333D] lg:pb-0">
              <div className="w-full px-4 lg:w-1/2">
                <div className="relative mb-12 max-w-[500px] pt-6 md:mb-14 lg:pt-16">
                  <span className="title !left-0 !translate-x-0">SUPPORT</span>
                  <h2 className="mb-5 font-heading text-3xl font-semibold text-dark dark:text-white sm:text-4xl md:text-[50px] md:leading-[60px]">
                    Need Assistance? We're Here to Help
                  </h2>
                  <p className="text-base text-dark-text">
                    Have a question or need support? Our team is ready to assist
                    with everything from getting started to maximizing your
                    EnvisioXR experience.
                  </p>
                </div>
              </div>

              <div className="w-full px-4 lg:w-1/2">
                <div className="flex items-center">
                  <span className="mr-10 h-1 w-full max-w-[200px] bg-dark dark:bg-white"></span>
                  <a
                    href="mailto:info@prieston.gr"
                    className="font-heading text-xl text-dark dark:text-white md:text-3xl lg:text-xl xl:text-3xl"
                  >
                    info@prieston.gr
                  </a>
                </div>
              </div>
            </div>

            <div className="-mx-4 flex flex-wrap pt-12">
              <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                <div className="mb-6">
                  <h3 className="mb-2 font-heading text-base text-dark dark:text-white sm:text-xl">
                    Email Support
                  </h3>
                  <p className="text-base font-medium text-dark-text">
                    info@prieston.gr
                  </p>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                <div className="mb-6">
                  <h3 className="mb-2 font-heading text-base text-dark dark:text-white sm:text-xl">
                    Phone Support
                  </h3>
                  <p className="text-base font-medium text-dark-text">
                    +30 (698) 677-2409
                  </p>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                <div className="mb-6">
                  <h3 className="mb-2 font-heading text-base text-dark dark:text-white sm:text-xl">
                    Office Address
                  </h3>
                  <p className="text-base font-medium text-dark-text">
                    3 Karagiannopoulou, Kilkis, Kilkis, Greece
                  </p>
                </div>
              </div>
              <div className="w-full px-4 md:w-1/2 lg:w-1/4">
                <div className="mb-6 flex items-center space-x-5 lg:justify-end">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="text-dark-text hover:text-primary dark:hover:text-white"
                  >
                    {/* Facebook Icon */}
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="text-dark-text hover:text-primary dark:hover:text-white"
                  >
                    {/* Twitter Icon */}
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="text-dark-text hover:text-primary dark:hover:text-white"
                  >
                    {/* LinkedIn Icon */}
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="text-dark-text hover:text-primary dark:hover:text-white"
                  >
                    {/* Instagram Icon */}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[780px] pt-[130px]">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="-mx-4 flex flex-wrap">
              <div className="w-full px-4 sm:w-1/2">
                <div className="mb-12">
                  <label
                    htmlFor="name"
                    className="mb-3 block font-heading text-base text-dark dark:text-white"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Full Name"
                    className="w-full border-b bg-transparent py-5 text-base font-medium text-dark placeholder-dark-text outline-none focus:border-primary dark:border-[#2C3443] dark:text-white dark:focus:border-white"
                  />
                </div>
              </div>
              <div className="w-full px-4 sm:w-1/2">
                <div className="mb-12">
                  <label
                    htmlFor="email"
                    className="mb-3 block font-heading text-base text-dark dark:text-white"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email Address"
                    className="w-full border-b bg-transparent py-5 text-base font-medium text-dark placeholder-dark-text outline-none focus:border-primary dark:border-[#2C3443] dark:text-white dark:focus:border-white"
                  />
                </div>
              </div>
              <div className="w-full px-4">
                <div className="mb-10">
                  <label
                    htmlFor="message"
                    className="mb-3 block font-heading text-base text-dark dark:text-white"
                  >
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    id="message"
                    placeholder="How can we help you?"
                    className="w-full resize-none border-b bg-transparent py-5 text-base font-medium text-dark placeholder-dark-text outline-none focus:border-primary dark:border-[#2C3443] dark:text-white dark:focus:border-white"
                  ></textarea>
                </div>
              </div>

              <div className="w-full px-4">
                <button className="flex w-full items-center justify-center rounded bg-primary px-8 py-[14px] font-heading text-base text-white hover:bg-opacity-90">
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
