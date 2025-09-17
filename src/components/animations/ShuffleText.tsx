"use client";

import React, { useState, useEffect, useRef } from "react";

const chars = "!<>-_\\/[]{}—=+*^?#________";

interface ShuffleTextProps {
  text: string;
  className?: string;
}

const ShuffleText: React.FC<ShuffleTextProps> = ({ text, className }) => {
  const [currentText, setCurrentText] = useState(text);
  const elRef = useRef<HTMLSpanElement>(null);
  const frameRequest = useRef<number | null>(null);
  const frame = useRef(0);
  const queue = useRef<{ from: string; to: string; start: number; end: number }[]>([]);

  useEffect(() => {
    const setText = (newText: string) => {
      const oldText = currentText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise<void>((resolve) => {
        const update = () => {
          let output = "";
          let complete = 0;
          for (let i = 0; i < length; i++) {
            const { from, to, start, end } = queue.current[i] || { from: '', to: '', start: 0, end: 0 };
            if (frame.current >= end) {
              complete++;
              output += to;
            } else if (frame.current >= start) {
              if (!from || Math.random() < 0.28) {
                output += chars[Math.floor(Math.random() * chars.length)];
              } else {
                output += from;
              }
            } else {
              output += from;
            }
          }
          setCurrentText(output);
          if (complete === length) {
            resolve();
          } else {
            frame.current++;
            frameRequest.current = requestAnimationFrame(update);
          }
        };

        queue.current = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || "";
          const to = newText[i] || "";
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          queue.current.push({ from, to, start, end });
        }
        if (frameRequest.current) cancelAnimationFrame(frameRequest.current);
        frame.current = 0;
        update();
      });
      return promise;
    };

    setText(text);

    return () => {
      if (frameRequest.current) {
        cancelAnimationFrame(frameRequest.current);
      }
    };
  }, [text, currentText]);

  return (
    <span ref={elRef} className={className}>
      {currentText}
    </span>
  );
};

export default ShuffleText;
