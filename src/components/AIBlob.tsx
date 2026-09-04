"use client";
import React, { useEffect, useRef } from "react";
import clsx from "clsx";

export type BlobState = "idle" | "listening" | "thinking" | "speaking";

interface AIBlobProps {
  state?: BlobState;
  className?: string;
}

export default function AIBlob({ state = "idle", className }: AIBlobProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    tiltX: 0,
    tiltY: 0,
    targetScale: 1,
    currentScale: 1,
    stateBaseScale: 1,
    stateSpeedMultiplier: 1,
    animId: 0,
  });

  useEffect(() => {
    const p = physicsRef.current;
    if (state === "listening") {
      p.stateBaseScale = 1.04;
      p.stateSpeedMultiplier = 1.25;
    } else if (state === "thinking") {
      p.stateBaseScale = 0.96;
      p.stateSpeedMultiplier = 1.7;
    } else if (state === "speaking") {
      p.stateBaseScale = 1.06;
      p.stateSpeedMultiplier = 1.4;
    } else {
      p.stateBaseScale = 1;
      p.stateSpeedMultiplier = 1;
    }
  }, [state]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const p = physicsRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const maxDistance = 400;
      const proximity = Math.max(0, 1 - dist / maxDistance);

      p.targetScale = 1 + proximity * 0.08;

      const targetSpeed = (11 - proximity * 4.5) / p.stateSpeedMultiplier;
      stage.style.setProperty("--blob-speed", `${targetSpeed.toFixed(2)}s`);
      stage.style.setProperty("--speed-mid", `${(targetSpeed * 0.9).toFixed(2)}s`);
      stage.style.setProperty("--speed-core", `${(targetSpeed * 1.1).toFixed(2)}s`);
      stage.style.setProperty("--speed-distort", `${(targetSpeed * 1.25).toFixed(2)}s`);

      const normX = dx / (window.innerWidth / 2);
      const normY = dy / (window.innerHeight / 2);
      p.targetX = Math.max(-9, Math.min(9, normX * 9));
      p.targetY = Math.max(-9, Math.min(9, normY * 9));
      p.tiltX = -normY * 7;
      p.tiltY = normX * 7;
    };

    const handleMouseLeave = () => {
      p.targetX = 0;
      p.targetY = 0;
      p.tiltX = 0;
      p.tiltY = 0;
      p.targetScale = 1;
      const baseSpeed = 11 / p.stateSpeedMultiplier;
      stage.style.setProperty("--blob-speed", `${baseSpeed}s`);
      stage.style.setProperty("--speed-mid", `${baseSpeed * 0.9}s`);
      stage.style.setProperty("--speed-core", `${baseSpeed * 1.1}s`);
      stage.style.setProperty("--speed-distort", `${baseSpeed * 1.25}s`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const updatePhysics = () => {
      p.currentX += (p.targetX - p.currentX) * 0.045;
      p.currentY += (p.targetY - p.currentY) * 0.045;
      p.currentScale += (p.targetScale * p.stateBaseScale - p.currentScale) * 0.045;

      if (stage) {
        stage.style.transform = `translate3d(${p.currentX}px, ${p.currentY}px, 0) rotateX(${p.tiltX}deg) rotateY(${p.tiltY}deg) scale(${p.currentScale})`;
      }
      p.animId = requestAnimationFrame(updatePhysics);
    };
    p.animId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(p.animId);
    };
  }, []);

  return (
    <div
      className={clsx("relative flex items-center justify-center select-none pointer-events-none", className)}
      style={{ perspective: "1400px" }}
    >
      <div
        ref={stageRef}
        className={clsx(
          "blob-stage",
          state === "listening" && "state-listening",
          state === "thinking" && "state-thinking",
          state === "speaking" && "state-speaking"
        )}
      >
        <div className="blob-glow" />
        <div className="blob-outline-back" />
        <div className="blob-core" />
        <div className="blob-layer-mid" />
        <div className="ai-blob-front">
          <div className="blob-noise" />
        </div>
      </div>
    </div>
  );
}
