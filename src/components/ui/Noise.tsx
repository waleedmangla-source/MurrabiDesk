"use client";
import React, { useRef, useEffect } from 'react';

export interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 350,
  patternScaleX = 0.9,
  patternScaleY = 0.9,
  patternRefreshInterval = 5,
  patternAlpha = 25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frameCount = 0;

    // Set canvas dimensions to the patternSize
    canvas.width = patternSize;
    canvas.height = patternSize;

    // Create an offscreen buffer to generate noise efficiently
    const imgData = ctx.createImageData(patternSize, patternSize);
    const data = imgData.data;
    const len = data.length;
    
    // Normalize alpha between 0 and 255
    const alphaValue = patternAlpha > 1 ? Math.min(patternAlpha, 255) : Math.floor(patternAlpha * 255);

    const generateNoise = () => {
      for (let i = 0; i < len; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;         // Red
        data[i + 1] = val;     // Green
        data[i + 2] = val;     // Blue
        data[i + 3] = alphaValue; // Alpha
      }
      ctx.putImageData(imgData, 0, 0);
    };

    // Initial draw
    generateNoise();

    const loop = () => {
      frameCount++;
      if (frameCount % patternRefreshInterval === 0) {
        generateNoise();
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [patternSize, patternAlpha, patternRefreshInterval]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none mix-blend-overlay"
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${patternScaleX}, ${patternScaleY})`,
        transformOrigin: 'top left',
      }}
    />
  );
};

export default Noise;
