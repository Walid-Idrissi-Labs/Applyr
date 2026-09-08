import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function InteractiveDotBackground() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (event) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    const dots = [];
    const spacing = 32;
    const glowRadius = 500;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const createDots = () => {
      dots.length = 0;
      canvas.width = width;
      canvas.height = height;

      for (let x = 0; x <= width; x += spacing) {
        for (let y = 0; y <= height; y += spacing) {
          dots.push({
            x,
            y,
            baseColor: theme === 'dark' ? '#222222' : '#bbbbbb',
            glowColor: theme === 'dark' ? '#333333' : '#aaaaaa',
          });
        }
      }
    };

    createDots();

    let animationFrame;
    const draw = () => {
      context.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        context.beginPath();
        context.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        context.fillStyle = dot.baseColor;
        context.fill();
      });

      dots.forEach((dot) => {
        const distance = Math.hypot(dot.x - cursor.x, dot.y - cursor.y);
        if (distance >= glowRadius) return;

        const opacity = 1 - (distance / glowRadius);
        context.beginPath();
        context.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        context.fillStyle = opacity > 0.5 ? dot.glowColor : dot.baseColor;
        context.globalAlpha = opacity > 0.5 ? 1 : opacity;
        context.fill();
        context.globalAlpha = 1;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      createDots();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [cursor, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="interactive-dot-background"
      aria-hidden="true"
    />
  );
}
