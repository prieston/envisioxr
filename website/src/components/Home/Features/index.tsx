import SectionTitle from "@/components/Common/SectionTitle";
import { featuresData } from "@/static-data/feature";
import SingleFeature from "./SingleFeature";

export default function Features() {
  return (
    <section id="features" className="pt-14 sm:pt-20 lg:pt-[130px]">
      <div className="px-4 xl:container">
        {/* <!-- Section Title --> */}
        <SectionTitle
          mainTitle="Why Choose EnvisioXR?"
          title="Seamless, Immersive, and Engaging Experiences"
          paragraph="Transform the way you showcase products, spaces, and stories. EnvisioXR brings cutting-edge 3D visualization and interactive virtual tours to your audience—effortlessly and beautifully."
        />

        <div className="-mx-4 flex flex-wrap justify-center">
          {featuresData.map((feature) => (
            <SingleFeature key={feature?.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
