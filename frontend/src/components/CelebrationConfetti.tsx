import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "star";
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
  wobble: number;
  wobbleSpeed: number;
}

export default function CelebrationConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = [
      "#4f46e5", // Indigo
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f59e0b", // Amber / Gold
      "#ec4899", // Pink
      "#8b5cf6", // Purple
      "#ef4444", // Red
      "#3b82f6", // Blue
      "#f97316", // Orange
    ];

    const particles: Particle[] = [];
    const shapes: ("rect" | "circle" | "star")[] = ["rect", "circle", "star", "rect", "rect"];

    const createBurst = (originX: number, originY: number, count: number, angleDeg: number, spreadDeg: number) => {
      for (let i = 0; i < count; i++) {
        const angle = ((angleDeg - spreadDeg / 2 + Math.random() * spreadDeg) * Math.PI) / 180;
        const speed = Math.random() * 14 + 10;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          decay: Math.random() * 0.006 + 0.004,
          wobble: Math.random() * Math.PI,
          wobbleSpeed: Math.random() * 0.1 + 0.05,
        });
      }
    };

    // Initial Cracker Bursts from Bottom-Left, Bottom-Right & Top-Center
    createBurst(width * 0.15, height * 0.9, 55, -60, 45);
    createBurst(width * 0.85, height * 0.9, 55, -120, 45);
    createBurst(width * 0.5, height * 0.75, 70, -90, 70);

    // Subsequent Wave of Crackers after 400ms and 800ms
    const t1 = setTimeout(() => {
      createBurst(width * 0.3, height * 0.85, 45, -75, 40);
      createBurst(width * 0.7, height * 0.85, 45, -105, 40);
    }, 450);

    const t2 = setTimeout(() => {
      createBurst(width * 0.5, height * 0.6, 60, -90, 90);
    }, 900);

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.98; // Air Drag
        p.vy *= 0.98;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x + Math.sin(p.wobble) * 2, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(0, 0, 5, p.size, p.size / 2.5);
        } else {
          // Ribbon rectangle
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.8);
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    animationId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full"
    />
  );
}
