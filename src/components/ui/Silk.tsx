"use client";
import React, { useRef, useEffect } from 'react';

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const Silk: React.FC<SilkProps> = ({ 
  speed = 5.9, 
  scale = 0.7, 
  color = '#9c57d6', 
  noiseIntensity = 1.5, 
  rotation = 0 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Simple noise-like function for silky waves
    const draw = () => {
      time += speed * 0.001;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.save();
      
      // Create a subtle base gradient
      const baseGrd = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      baseGrd.addColorStop(0, `${color}11`);
      baseGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = baseGrd;
      ctx.fillRect(0, 0, width, height);

      ctx.translate(width / 2, height / 2);
      ctx.rotate(rotation);
      ctx.translate(-width / 2, -height / 2);

      const lines = 15;
      ctx.lineWidth = 1.5 * scale;
      
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const offset = i * (height / lines);
        
        // Gradient for each line
        const grd = ctx.createLinearGradient(0, 0, width, 0);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.5, color);
        grd.addColorStop(1, 'transparent');
        ctx.strokeStyle = grd;
        ctx.globalAlpha = 0.2 + (Math.sin(time + i) * 0.1);

        for (let x = -100; x <= width + 100; x += 10) {
          const y = offset + 
            Math.sin(x * 0.003 * scale + time + i * 0.5) * 50 * noiseIntensity +
            Math.cos(x * 0.001 * scale - time * 0.3 + i) * 30;
          
          if (x === -100) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block"
      style={{ filter: 'blur(40px) saturate(1.5)' }}
    />
  );
};

export default Silk;
