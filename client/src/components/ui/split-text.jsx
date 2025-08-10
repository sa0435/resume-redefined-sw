import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.js";

export function SplitText({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  splitType = "chars",
  threshold = 0.1,
  onComplete,
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer for animation trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, isVisible]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isVisible) return;

    // Clear existing content
    element.innerHTML = "";

    let items = [];
    if (splitType === "chars") {
      items = Array.from(text);
    } else if (splitType === "words") {
      items = text.split(" ");
    } else if (splitType === "lines") {
      items = text.split("\n");
    }

    // Create spans for each item
    items.forEach((item, index) => {
      const span = document.createElement("span");
      span.textContent = item === " " ? "\u00A0" : item;
      span.style.opacity = "0";
      span.style.transform = "translateY(20px)";
      span.style.display = splitType === "words" ? "inline-block" : "inline";
      span.style.transition = `all ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      span.style.transitionDelay = `${index * delay}ms`;
      
      if (splitType === "words" && index < items.length - 1) {
        span.style.marginRight = "0.25em";
      }

      element.appendChild(span);
    });

    // Trigger animation
    const animationTimeout = setTimeout(() => {
      const spans = element.querySelectorAll("span");
      spans.forEach((span) => {
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      });

      // Call onComplete after all animations finish
      if (onComplete) {
        const totalDuration = (items.length - 1) * delay + duration * 1000;
        setTimeout(onComplete, totalDuration);
      }
    }, 50);

    return () => clearTimeout(animationTimeout);
  }, [text, delay, duration, splitType, isVisible, onComplete]);

  return (
    <div
      ref={elementRef}
      className={cn("inline-block", className)}
      style={{ 
        textAlign: splitType === "lines" ? "left" : "inherit",
        whiteSpace: splitType === "words" ? "normal" : "nowrap"
      }}
    />
  );
}