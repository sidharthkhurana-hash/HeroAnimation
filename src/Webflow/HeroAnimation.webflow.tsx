import { declareComponent } from "@webflow/react";
import { HeroAnimation } from "../app/components/HeroAnimation";

function HeroAnimationWrapper() {
  return (
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
  );
}

export default declareComponent(HeroAnimationWrapper, {
  name: "Hero Animation",
});