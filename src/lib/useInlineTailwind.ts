import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type StylableElement = Element & ElementCSSInlineStyle;

export function useInlineTailwind<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    applyTailwindInline(node);
  }, []);

  return ref;
}

export function applyTailwindInline(root: HTMLElement) {
  const elements: StylableElement[] = [];

  if (hasStylableClasses(root)) {
    elements.push(root as StylableElement);
  }

  root.querySelectorAll("[class]").forEach((el) => {
    if (hasStylableClasses(el)) {
      elements.push(el as StylableElement);
    }
  });

  elements.forEach(applyClassTokens);
}

function hasStylableClasses(el: Element): el is StylableElement {
  return Boolean(el.getAttribute("class")) && "style" in el;
}

function applyClassTokens(el: StylableElement) {
  const classAttr = el.getAttribute("class");
  if (!classAttr) return;

  const tokens = classAttr.split(/\s+/).filter(Boolean);
  if (!tokens.length) return;

  const lockedProps = new Set<string>();
  for (let i = 0; i < el.style.length; i += 1) {
    const prop = el.style.item(i);
    if (prop) lockedProps.add(prop);
  }

  tokens.forEach((token) => applyToken(el.style, token, lockedProps));
  el.removeAttribute("class");
}

const SIMPLE_STYLES: Record<string, [string, string]> = {
  absolute: ["position", "absolute"],
  relative: ["position", "relative"],
  sticky: ["position", "sticky"],
  flex: ["display", "flex"],
  block: ["display", "block"],
  contents: ["display", "contents"],
  "flex-col": ["flex-direction", "column"],
  "justify-center": ["justify-content", "center"],
  "text-center": ["text-align", "center"],
  "pointer-events-none": ["pointer-events", "none"],
  "pointer-events-auto": ["pointer-events", "auto"],
  "overflow-hidden": ["overflow", "hidden"],
  "overflow-clip": ["overflow", "clip"],
  "whitespace-pre-wrap": ["white-space", "pre-wrap"],
  uppercase: ["text-transform", "uppercase"],
  "not-italic": ["font-style", "normal"],
  "bg-white": ["background-color", "#fff"],
  "bg-black": ["background-color", "#000"],
  "text-white": ["color", "#fff"],
  "text-black": ["color", "#000"],
  "font-light": ["font-weight", "300"],
  "font-medium": ["font-weight", "500"],
  "font-semibold": ["font-weight", "600"],
  "font-bold": ["font-weight", "700"],
  border: ["border-width", "1px"],
  "border-l": ["border-left-width", "1px"],
  "border-l-2": ["border-left-width", "2px"],
  "border-r": ["border-right-width", "1px"],
  "border-solid": ["border-style", "solid"],
  "h-full": ["height", "100%"],
  "w-full": ["width", "100%"],
  "h-px": ["height", "1px"],
  "w-px": ["width", "1px"],
  "max-w-none": ["max-width", "none"],
  "mb-0": ["margin-bottom", "0"],
  "mask-alpha": ["mask-mode", "alpha"],
  "mask-intersect": ["mask-composite", "intersect"],
  "mask-no-clip": ["mask-clip", "no-clip"],
  "mask-no-repeat": ["mask-repeat", "no-repeat"],
};

function applyToken(style: CSSStyleDeclaration, token: string, locked: Set<string>) {
  const simple = SIMPLE_STYLES[token];
  if (simple) {
    setStyleProp(style, locked, simple[0], simple[1]);
    return;
  }

  if (token === "size-full") {
    setStyleProp(style, locked, "width", "100%");
    setStyleProp(style, locked, "height", "100%");
    return;
  }

  if (token === "-translate-x-1/2") {
    addTransform(style, locked, "translateX(-50%)");
    return;
  }

  if (token === "-translate-y-1/2") {
    addTransform(style, locked, "translateY(-50%)");
    return;
  }

  if (handleSpacingToken(token, "top", style, locked)) return;
  if (handleSpacingToken(token, "right", style, locked)) return;
  if (handleSpacingToken(token, "bottom", style, locked)) return;
  if (handleSpacingToken(token, "left", style, locked)) return;

  if (token === "inset-0") {
    setStyleProp(style, locked, "top", "0");
    setStyleProp(style, locked, "right", "0");
    setStyleProp(style, locked, "bottom", "0");
    setStyleProp(style, locked, "left", "0");
    return;
  }

  if (token.startsWith("inset-[")) {
    if (setInsetValues(token, style, locked)) {
      return;
    }
  }

  if (token.startsWith("h-[")) {
    const value = getBracketValue(token, "h-");
    if (value) setStyleProp(style, locked, "height", value);
    return;
  }

  if (token.startsWith("w-[")) {
    const value = getBracketValue(token, "w-");
    if (value) setStyleProp(style, locked, "width", value);
    return;
  }

  if (token.startsWith("size-[")) {
    const value = getBracketValue(token, "size-");
    if (value) {
      setStyleProp(style, locked, "width", value);
      setStyleProp(style, locked, "height", value);
    }
    return;
  }

  if (token.startsWith("aspect-[")) {
    const value = getBracketValue(token, "aspect-");
    if (value) {
      setStyleProp(style, locked, "aspect-ratio", value.replace("/", " / "));
    }
    return;
  }

  if (token.startsWith("bg-[")) {
    const value = getBracketValue(token, "bg-");
    if (value) setStyleProp(style, locked, "background-color", value);
    return;
  }

  if (token.startsWith("text-[")) {
    const value = getBracketValue(token, "text-");
    if (value) {
      if (isColorValue(value)) {
        setStyleProp(style, locked, "color", value);
      } else {
        setStyleProp(style, locked, "font-size", value);
      }
    }
    return;
  }

  if (token.startsWith("font-[")) {
    const value = getBracketValue(token, "font-");
    if (value) setStyleProp(style, locked, "font-family", value);
    return;
  }

  if (token.startsWith("leading-[")) {
    const value = getBracketValue(token, "leading-");
    if (value) setStyleProp(style, locked, "line-height", value);
    return;
  }

  if (token.startsWith("border-[")) {
    const value = getBracketValue(token, "border-");
    if (value) setStyleProp(style, locked, "border-color", value);
    return;
  }

  if (token.startsWith("rounded-bl-[")) {
    const value = getBracketValue(token, "rounded-bl-");
    if (value) setStyleProp(style, locked, "border-bottom-left-radius", value);
    return;
  }

  if (token.startsWith("rounded-br-[")) {
    const value = getBracketValue(token, "rounded-br-");
    if (value) setStyleProp(style, locked, "border-bottom-right-radius", value);
    return;
  }

  if (token.startsWith("rounded-tl-[")) {
    const value = getBracketValue(token, "rounded-tl-");
    if (value) setStyleProp(style, locked, "border-top-left-radius", value);
    return;
  }

  if (token.startsWith("rounded-tr-[")) {
    const value = getBracketValue(token, "rounded-tr-");
    if (value) setStyleProp(style, locked, "border-top-right-radius", value);
    return;
  }

  if (token.startsWith("rounded-[")) {
    const value = getBracketValue(token, "rounded-");
    if (value) setStyleProp(style, locked, "border-radius", value);
    return;
  }

  if (token.startsWith("shadow-[")) {
    const value = getBracketValue(token, "shadow-");
    if (value) setStyleProp(style, locked, "box-shadow", value);
    return;
  }

  if (token.startsWith("mask-position-[")) {
    const value = getBracketValue(token, "mask-position-");
    if (value) setStyleProp(style, locked, "mask-position", value.replace(/_/g, " "));
    return;
  }

  if (token.startsWith("mask-size-[")) {
    const value = getBracketValue(token, "mask-size-");
    if (value) setStyleProp(style, locked, "mask-size", value.replace(/_/g, " "));
    return;
  }

  const opacityMatch = token.match(/^opacity-(\d{1,3})$/);
  if (opacityMatch) {
    const percent = Number(opacityMatch[1]);
    if (!Number.isNaN(percent)) {
      setStyleProp(style, locked, "opacity", String(percent / 100));
    }
    return;
  }
}

function handleSpacingToken(token: string, prop: "top" | "right" | "bottom" | "left", style: CSSStyleDeclaration, locked: Set<string>) {
  if (token === `${prop}-0`) {
    setStyleProp(style, locked, prop, "0");
    return true;
  }

  if (token === `${prop}-1/2`) {
    setStyleProp(style, locked, prop, "50%");
    return true;
  }

  if (token.startsWith(`${prop}-[`)) {
    const value = getBracketValue(token, `${prop}-`);
    if (value) {
      setStyleProp(style, locked, prop, value);
      return true;
    }
  }

  return false;
}

function setInsetValues(token: string, style: CSSStyleDeclaration, locked: Set<string>) {
  const value = getBracketValue(token, "inset-");
  if (!value) return false;

  const parts = value.split("_");
  if (parts.length === 1) {
    setStyleProp(style, locked, "top", parts[0]);
    setStyleProp(style, locked, "right", parts[0]);
    setStyleProp(style, locked, "bottom", parts[0]);
    setStyleProp(style, locked, "left", parts[0]);
    return true;
  }

  if (parts.length === 2) {
    const [vertical, horizontal] = parts;
    setStyleProp(style, locked, "top", vertical);
    setStyleProp(style, locked, "bottom", vertical);
    setStyleProp(style, locked, "left", horizontal);
    setStyleProp(style, locked, "right", horizontal);
    return true;
  }

  if (parts.length === 4) {
    const [top, right, bottom, left] = parts;
    setStyleProp(style, locked, "top", top);
    setStyleProp(style, locked, "right", right);
    setStyleProp(style, locked, "bottom", bottom);
    setStyleProp(style, locked, "left", left);
    return true;
  }

  return false;
}

function getBracketValue(token: string, prefix: string) {
  if (!token.startsWith(prefix)) return null;
  const start = prefix.length;
  if (token[start] !== "[") return null;
  return token.slice(start + 1, -1);
}

function isColorValue(value: string) {
  const lower = value.toLowerCase();
  return lower.startsWith("#") || lower.startsWith("rgb") || lower.startsWith("hsl") || lower.startsWith("var(");
}

function setStyleProp(style: CSSStyleDeclaration, locked: Set<string>, prop: string, value?: string | null) {
  if (!value) return;
  if (prop === "background-color" && (locked.has("background") || locked.has("background-color"))) return;
  if (locked.has(prop)) return;
  style.setProperty(prop, value);
}

function addTransform(style: CSSStyleDeclaration, locked: Set<string>, value: string) {
  if (locked.has("transform")) return;
  const current = style.getPropertyValue("transform");
  const next = current ? `${current} ${value}` : value;
  style.setProperty("transform", next);
}
