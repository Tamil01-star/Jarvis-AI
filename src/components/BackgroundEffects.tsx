import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

interface Star {
  x: number; y: number;
  size: number; alpha: number; speed: number;
}

interface DataPacket {
  x: number; y: number;
  targetX: number; targetY: number;
  progress: number; speed: number;
  color: string;
}

export const BackgroundEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -999, y: -999, tx: -999, ty: -999 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = (canvas.width = innerWidth);
    let H = (canvas.height = innerHeight);
    let raf: number;

    /* ----- Stars ----- */
    const stars: Star[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.06 + 0.02,
    }));

    /* ----- Data Packets (moving circuit-like sparks) ----- */
    const packets: DataPacket[] = [];
    const spawnPacket = () => {
      const side = Math.floor(Math.random() * 4);
      let sx = 0, sy = 0;
      if (side === 0) { sx = Math.random() * W; sy = 0; }
      else if (side === 1) { sx = W; sy = Math.random() * H; }
      else if (side === 2) { sx = Math.random() * W; sy = H; }
      else { sx = 0; sy = Math.random() * H; }
      packets.push({
        x: sx, y: sy,
        targetX: W / 2 + (Math.random() - 0.5) * 300,
        targetY: H / 2 + (Math.random() - 0.5) * 200,
        progress: 0, speed: Math.random() * 0.004 + 0.002,
        color: Math.random() > 0.3 ? 'rgba(0,240,255,' : 'rgba(0,102,255,'
      });
    };
    for (let i = 0; i < 12; i++) spawnPacket();

    /* ----- Mouse Particles ----- */
    const particles: Particle[] = [];

    const onResize = () => {
      W = canvas.width = innerWidth;
      H = canvas.height = innerHeight;
    };
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = e.clientX;
      mouse.current.ty = e.clientY;
      if (Math.random() > 0.45) {
        const isOrange = Math.random() > 0.7;
        particles.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.4,
          life: 60 + Math.random() * 40,
          maxLife: 60 + Math.random() * 40,
          size: Math.random() * 2.2 + 0.5,
          color: isOrange ? 'rgba(255,93,0,' : 'rgba(0,240,255,'
        });
      }
    };

    addEventListener('resize', onResize);
    addEventListener('mousemove', onMove);

    let radarAngle = 0;
    let sonarR = 0;
    let tick = 0;

    const draw = () => {
      tick++;

      /* ---- clear ---- */
      ctx.fillStyle = 'rgba(3,5,12,0.88)';
      ctx.fillRect(0, 0, W, H);

      /* ---- hex grid ---- */
      ctx.save();
      ctx.strokeStyle = 'rgba(0,240,255,0.025)';
      ctx.lineWidth = 0.5;
      const gs = 50;
      for (let x = 0; x < W + gs; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H + gs; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();

      /* ---- Stars drift ---- */
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) { s.y = H; s.x = Math.random() * W; }
        s.alpha += (Math.random() - 0.5) * 0.03;
        s.alpha = Math.max(0.05, Math.min(0.6, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,240,255,${s.alpha})`;
        ctx.fill();
      });

      /* ---- Radar sweep from center ---- */
      const cx = W / 2, cy = H / 2;
      radarAngle += 0.008;

      // Background concentric rings
      for (let r = 100; r < Math.max(W, H) * 0.6; r += 160) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,240,255,0.025)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Sweep gradient fill (fading wedge)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarAngle);
      const sweepLen = Math.max(W, H) * 0.7;
      const gradient = ctx.createLinearGradient(0, 0, sweepLen, 0);
      gradient.addColorStop(0, 'rgba(0,240,255,0.12)');
      gradient.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sweepLen, -0.3, 0.3);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      /* ---- Sonar pulse ring ---- */
      sonarR += 1.2;
      if (sonarR > Math.max(W, H) * 0.55) sonarR = 0;
      const sonarAlpha = Math.max(0, 0.05 * (1 - sonarR / (Math.max(W, H) * 0.55)));
      ctx.beginPath();
      ctx.arc(cx, cy, sonarR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,240,255,${sonarAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ---- Data Packets (circuit sparks) ---- */
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) { packets.splice(i, 1); spawnPacket(); continue; }
        const px = p.x + (p.targetX - p.x) * p.progress;
        const py = p.y + (p.targetY - p.y) * p.progress;
        const alpha = Math.sin(p.progress * Math.PI) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
        // tail
        const prevPx = p.x + (p.targetX - p.x) * Math.max(0, p.progress - 0.05);
        const prevPy = p.y + (p.targetY - p.y) * Math.max(0, p.progress - 0.05);
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${p.color}${alpha * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      /* ---- Mouse smooth tracking ---- */
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.09;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.09;

      // Mouse spotlight glow
      if (mouse.current.x > 0) {
        const grad = ctx.createRadialGradient(mouse.current.x, mouse.current.y, 0, mouse.current.x, mouse.current.y, 220);
        grad.addColorStop(0, 'rgba(0,240,255,0.055)');
        grad.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.current.x, mouse.current.y, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---- Mouse trail particles ---- */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const a = (p.life / p.maxLife) * 0.55;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
