import { declareComponent } from "@webflow/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import tailwindCss from "../styles/webflow-tailwind.inline";
import { HeroAnimation } from "../app/components/HeroAnimation";

const heroStyles = (
  <style
    dangerouslySetInnerHTML={{ __html: tailwindCss }}
    data-origin="HeroAnimation"
  />
);

function HeroAnimationWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hostHeight, setHostHeight] = useState<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const parent = wrapper.parentElement;
    if (!parent) return;

    const update = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.height > 0) {
        setHostHeight((prev) => {
          if (prev !== null && Math.abs(prev - rect.height) < 0.5) return prev;
          return rect.height;
        });
      }
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  };
  if (hostHeight !== null) {
    wrapperStyle.height = `${hostHeight}px`;
  } else {
    wrapperStyle.height = "100vh";
    wrapperStyle.minHeight = "720px";
  }

  return (
    <>
      {heroStyles}
      <div
        ref={wrapperRef}
        style={{
          ...wrapperStyle,
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
