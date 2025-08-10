import { useEffect, useRef } from "react";

export function GalaxyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star particles
    const stars = [];
    const colors = [
      "#8b5cf6", // cosmic-purple
      "#06b6d4", // stellar-cyan
      "#ec4899", // galaxy-pink
      "#ffffff", // white
      "#a855f7", // purple-500
    ];

    // Generate stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(26, 26, 46, 0.4)");
      gradient.addColorStop(0.5, "rgba(22, 33, 62, 0.3)");
      gradient.addColorStop(1, "rgba(15, 52, 96, 0.2)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star, index) => {
        // Update twinkle
        star.twinkle += 0.02;
        
        // Slow movement
        star.x += Math.sin(time + index * 0.1) * 0.1;
        star.y += Math.cos(time + index * 0.1) * 0.05;
        
        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Calculate twinkling opacity
        const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
        
        // Draw star with glow
        ctx.save();
        ctx.globalAlpha = twinkleOpacity;
        
        // Create glow effect
        const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        glowGradient.addColorStop(0, star.color);
        glowGradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
          star.x - star.size * 3,
          star.y - star.size * 3,
          star.size * 6,
          star.size * 6
        );
        
        // Draw star core
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-purple/40 via-deep-blue/30 to-stellar-blue/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cosmic-purple/10 to-transparent"></div>
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)",
            backgroundSize: "50px 50px"
          }}
        ></div>
      </div>
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
      
      {/* Additional floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-stellar-cyan rounded-full animate-twinkle"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-galaxy-pink rounded-full animate-twinkle" style={{animationDelay: "1s"}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cosmic-purple rounded-full animate-twinkle" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-stellar-cyan rounded-full animate-twinkle" style={{animationDelay: "0.5s"}}></div>
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-galaxy-pink rounded-full animate-twinkle" style={{animationDelay: "1.5s"}}></div>
      </div>
    </div>
  );
}