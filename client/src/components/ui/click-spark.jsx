import { useEffect, useRef } from "react";

export function ClickSpark({
  children,
  sparkColor = "#8b5cf6", // cosmic-purple
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  extraScale = 1,
  easing = "ease-out",
}) {
  const containerRef = useRef(null);

  const createSpark = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sparkContainer = document.createElement("div");
    sparkContainer.className = "fixed pointer-events-none z-50";
    sparkContainer.style.left = (e.clientX) + "px";
    sparkContainer.style.top = (e.clientY) + "px";

    // Create individual sparks
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement("div");
      spark.className = "absolute rounded-full";
      
      const angle = (i / sparkCount) * Math.PI * 2;
      const distance = sparkRadius * extraScale;
      
      spark.style.width = "2px";
      spark.style.height = sparkSize + "px";
      spark.style.backgroundColor = sparkColor;
      spark.style.transformOrigin = "center bottom";
      spark.style.transform = `rotate(${angle * (180 / Math.PI)}deg)`;
      spark.style.left = "-1px";
      spark.style.top = `-${sparkSize}px`;
      
      // Animate the spark
      spark.animate([
        {
          transform: `rotate(${angle * (180 / Math.PI)}deg) translateY(0px) scale(1)`,
          opacity: "1"
        },
        {
          transform: `rotate(${angle * (180 / Math.PI)}deg) translateY(-${distance}px) scale(0.5)`,
          opacity: "0"
        }
      ], {
        duration: duration,
        easing: easing,
        fill: "forwards"
      });
      
      sparkContainer.appendChild(spark);
    }

    document.body.appendChild(sparkContainer);
    
    // Clean up
    setTimeout(() => {
      if (sparkContainer.parentNode) {
        sparkContainer.parentNode.removeChild(sparkContainer);
      }
    }, duration + 100);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e) => {
      createSpark(e);
    };

    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale, easing]);

  return (
    <div ref={containerRef} className="inline-block">
      {children}
    </div>
  );
}