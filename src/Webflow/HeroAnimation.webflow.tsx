import { declareComponent } from "@webflow/react";
import tailwindCss from "../styles/webflow-tailwind.inline";
import { HeroAnimation } from "../app/components/HeroAnimation";

const heroStyles = (
  <style
    dangerouslySetInnerHTML={{ __html: tailwindCss }}
    data-origin="HeroAnimation"
  />
);

function HeroAnimationWrapper() {
  return (
    <>
      {heroStyles}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <HeroAnimation />
      </div>
    </>
  );
}

export default declareComponent(HeroAnimationWrapper, {
  name: "Hero Animation",
});
