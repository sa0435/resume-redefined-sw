import { useEffect, useState } from "react";
import { cn } from "@/lib/utils.js";

export function CosmicProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = "",
  showValue = true,
  animated = true,
  glowColor = "139, 92, 246", // cosmic-purple RGB
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (animated) {
      let startTime;
      const duration = 2000; // 2 seconds
      const startValue = 0;
      const endValue = normalizedValue;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easedProgress;
        
        setAnimatedValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimatedValue(normalizedValue);
    }
  }, [normalizedValue, animated]);

  const displayValue = animated ? animatedValue : normalizedValue;
  const displayPercentage = (displayValue / max) * 100;
  const displayStrokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{
          background: `radial-gradient(circle, rgba(${glowColor}, 0.4), transparent 70%)`,
          width: size + 20,
          height: size + 20,
          left: -10,
          top: -10,
        }}
      />
      
      {/* SVG Progress Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#cosmic-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={displayStrokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px rgba(${glowColor}, 0.6))`,
          }}
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="cosmic-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" />
            <stop offset="50%" stopColor="rgb(6, 182, 212)" />
            <stop offset="100%" stopColor="rgb(236, 72, 153)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold text-white">
              {Math.round(displayValue)}
            </span>
            <div className="text-sm text-gray-400">Score</div>
          </div>
        </div>
      )}
    </div>
  );
}