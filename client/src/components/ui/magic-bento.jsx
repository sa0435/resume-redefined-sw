import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.js";

export function MagicBento({
  children,
  className = "",
  enableStars = true,
  enableSpotlight = true,
  enableTilt = false,
  clickEffect = true,
  enableMagnetism = true,
  spotlightRadius = 300,
  glowColor = "139, 92, 246", // cosmic-purple RGB
  disableAnimations = false,
}) {
  const cardRef = useRef(null);
  const spotlightRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    const spotlight = spotlightRef.current;
    if (!card || disableAnimations) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });

      // Update spotlight position
      if (spotlight && enableSpotlight) {
        spotlight.style.background = `radial-gradient(${spotlightRadius}px circle at ${x}px ${y}px, rgba(${glowColor}, 0.1), transparent 40%)`;
      }

      // Tilt effect
      if (enableTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      // Magnetism effect
      if (enableMagnetism) {
        const distance = Math.sqrt(Math.pow(x - rect.width / 2, 2) + Math.pow(y - rect.height / 2, 2));
        const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
        const magnetism = Math.max(0, 1 - distance / maxDistance) * 5;
        
        const offsetX = ((x - rect.width / 2) / rect.width) * magnetism;
        const offsetY = ((y - rect.height / 2) / rect.height) * magnetism;
        
        if (enableTilt) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${offsetX}px, ${offsetY}px)`;
        } else {
          card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      card.style.transition = "border-color 0.3s ease";
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      card.style.transform = "";
      card.style.transition = "transform 0.3s ease, border-color 0.3s ease";
      if (spotlight) {
        spotlight.style.background = "";
      }
    };

    const handleClick = (e) => {
      if (!clickEffect) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create ripple effect
      const ripple = document.createElement("div");
      ripple.className = "absolute rounded-full pointer-events-none";
      ripple.style.left = x - 50 + "px";
      ripple.style.top = y - 50 + "px";
      ripple.style.width = "100px";
      ripple.style.height = "100px";
      ripple.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.3), transparent 70%)`;
      ripple.style.transform = "scale(0)";
      ripple.style.animation = "ripple 0.6s ease-out";
      
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("click", handleClick);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("click", handleClick);
    };
  }, [enableTilt, enableSpotlight, enableMagnetism, clickEffect, spotlightRadius, glowColor, disableAnimations]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden backdrop-blur-md bg-dark-purple/30 rounded-xl border border-cosmic-purple/30 transition-all duration-300",
        isHovered && !disableAnimations && "border-cosmic-purple/50",
        className
      )}
    >
      {/* Spotlight overlay */}
      {enableSpotlight && !disableAnimations && (
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />
      )}
      
      {/* Stars effect */}
      {enableStars && !disableAnimations && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-stellar-cyan rounded-full animate-twinkle"
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 2 + "s",
                animationDuration: 1 + Math.random() * 2 + "s",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Ripple animation styles */}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}