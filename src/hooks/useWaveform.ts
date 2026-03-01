"use client";

import { useRef, useEffect, useCallback } from "react";

interface UseWaveformOptions {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  color?: string;
}

export function useWaveform({
  analyserNode,
  isActive,
  color = "#00f0ff",
}: UseWaveformOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(render);

      analyserNode.getByteTimeDomainData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();
  }, [analyserNode, isActive, color]);

  useEffect(() => {
    if (isActive && analyserNode) {
      draw();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, analyserNode, draw]);

  return canvasRef;
}
