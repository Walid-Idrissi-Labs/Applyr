import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Allow scrolling on the landing page even if body is locked globally.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Scroll handlers: navbar state + active nav highlighting
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.landing-nav-links a');
      let current = '';
      sections.forEach((section) => {
        if (!(section instanceof HTMLElement)) return;
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
          current = section.getAttribute('id') || '';
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Bar chart animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const target = entry.target.getAttribute('data-height');
            if (target) entry.target.style.height = target + '%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.bar').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Counter animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const target = parseInt(entry.target.getAttribute('data-count') || '0', 10);
            const prefix = entry.target.getAttribute('data-prefix') || '';
            const suffixAttr = entry.target.getAttribute('data-suffix');
            const label = entry.target.parentElement?.querySelector('.demo-stat-label')?.textContent;
            const suffix = suffixAttr !== null ? suffixAttr : label === 'Response' ? '%' : '';
            let current = 0;
            const duration = 1200;
            const step = target / (duration / 16);
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              entry.target.textContent = `${prefix}${Math.floor(current)}${suffix}`;
            }, 16);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.demo-stat-value[data-count]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (i) => setActiveFaq((prev) => (prev === i ? null : i));

  return (
    <div className="landing-root" data-theme={theme}>
      <style>{`
        :root {
          --bg: #f4f4f5;
          --surface: #ffffff;
          --text: #09090b;
          --text-muted: #71717a;
          --text-faint: #a1a1aa;
          --border: #09090b;
          --border-light: #e4e4e7;
          --accent: #09090b;
          --accent-green: #10b981;
          --accent-green-bg: #d1fae5;
          --accent-red-bg: #fee2e2;
          --accent-red-text: #991b1b;
          --accent-yellow-bg: #fef3c7;
          --accent-yellow-text: #92400e;
          --accent-blue-bg: #dbeafe;
          --accent-blue-text: #1e40af;
          --accent-gray-bg: #f3f4f6;
          --accent-gray-text: #374151;
          --radius: 14px;
          --radius-sm: 10px;
          --font-mono: "JetBrains Mono", "SF Mono", "Courier New", monospace;
          --font-sans: "Inter", system-ui, sans-serif;
          --shadow-offset: 8px;
          --shadow-color: rgba(0,0,0,0.08);
          --transition-fast: 0.15s;
          --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
          --bg: #0a0a0a;
          --surface: #111111;
          --text: #f5f5f5;
          --text-muted: #8a8a8a;
          --text-faint: #525252;
          --border: #2c2c2c;
          --border-light: #1a1a1c;
          --accent: #f5f5f5;
          --shadow-color: rgba(0,0,0,0.5);
          --accent-green-bg: rgba(74, 222, 128, 0.12);
          --accent-green: #4ade80;
          --accent-red-bg: rgba(248, 113, 113, 0.12);
          --accent-red-text: #f87171;
          --accent-yellow-bg: rgba(250, 204, 21, 0.12);
          --accent-yellow-text: #facc15;
          --accent-blue-bg: rgba(96, 165, 250, 0.12);
          --accent-blue-text: #60a5fa;
          --accent-gray-bg: rgba(255,255,255,0.06);
          --accent-gray-text: #a1a1aa;
        }

        html { scroll-behavior: smooth; }

        .landing-root {
          font-family: var(--font-mono);
          background: var(--bg);
          color: var(--text);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          position: relative;
          z-index: 0;
          transition: background-color var(--transition-smooth), color var(--transition-smooth);
        }

        .landing-root::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, #d4d4d8 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.9;
          pointer-events: none;
          z-index: 0;
          transition: opacity var(--transition-smooth);
        }
        .landing-root[data-theme="dark"]::before {
          background-image: radial-gradient(circle, #2a2a2c 1px, transparent 1px);
          opacity: 0.4;
        }

        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* Navigation */
        nav {
          padding: 24px 0;
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(244,244,245, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 2px solid transparent;
          transition: border-color 0.3s, background-color var(--transition-smooth);
        }
        [data-theme="dark"] nav { background: rgba(10,10,10, 0.85); }
        nav.scrolled { border-bottom-color: var(--border); }
        [data-theme="dark"] nav.scrolled { border-bottom-color: var(--border); }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--text);
          border: 2px solid var(--border);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          background: var(--surface);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }
        .logo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .logo:hover::after { transform: translateX(100%); }
        .logo:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--border); }
        [data-theme="dark"] .logo:hover { box-shadow: 4px 4px 0 rgba(255,255,255,0.08); }

        .landing-nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
        }
        .landing-nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
          padding: 4px 0;
        }
        .landing-nav-links a::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--text);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .landing-nav-links a:hover { color: var(--text); }
        .landing-nav-links a:hover::after { width: 100%; }
        .landing-nav-links a.active { color: var(--text); }
        .landing-nav-links a.active::after { width: 100%; }

        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--text);
          color: var(--bg);
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid var(--border);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), color var(--transition-smooth);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .nav-cta:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--border); }
        [data-theme="dark"] .nav-cta:hover { box-shadow: 4px 4px 0 rgba(255,255,255,0.08); }
        .nav-cta:active { transform: translate(0, 0); box-shadow: none; transition-duration: 0.05s; }

        .theme-toggle {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), border-color var(--transition-smooth);
          user-select: none;
        }
        .theme-toggle:hover { transform: translate(-2px, -2px); box-shadow: 3px 3px 0 var(--border); }
        [data-theme="dark"] .theme-toggle:hover { box-shadow: 3px 3px 0 rgba(255,255,255,0.08); }
        .theme-toggle:active { transform: translate(0); box-shadow: none; }

        .mobile-menu-btn {
          display: none;
          background: var(--surface);
          border: 2px solid var(--border);
          padding: 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text);
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }

        /* Hero */
        .hero {
          padding: 80px 0 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .hero-badge {
          display: inline-block;
          border: 2px solid var(--border);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: var(--surface);
          margin-bottom: 24px;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }
        .hero-badge::before {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--accent-green);
          border-radius: 50%;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          animation: pulse-dot 2s infinite;
        }
        .hero-badge span { margin-left: 14px; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(1.3); }
        }

        .hero h1 {
          font-size: clamp(36px, 5vw, 64px);
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }
        .hero p {
          font-family: var(--font-sans);
          font-size: 18px;
          color: var(--text-muted);
          max-width: 480px;
          margin-bottom: 32px;
          line-height: 1.6;
          transition: color var(--transition-smooth);
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--text);
          color: var(--bg);
          padding: 14px 28px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          border: 2px solid var(--border);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), color var(--transition-smooth);
          cursor: pointer;
          font-family: var(--font-mono);
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover { transform: translate(-3px, -3px); box-shadow: 5px 5px 0 var(--border); }
        [data-theme="dark"] .btn-primary:hover { box-shadow: 5px 5px 0 rgba(255,255,255,0.08); }
        .btn-primary:active { transform: translate(0); box-shadow: none; transition-duration: 0.05s; }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          color: var(--text);
          padding: 14px 28px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          border: 2px solid var(--border);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), color var(--transition-smooth);
          cursor: pointer;
          font-family: var(--font-mono);
          position: relative;
          overflow: hidden;
        }
        .btn-secondary:hover { background: var(--bg); transform: translate(-3px, -3px); box-shadow: 5px 5px 0 var(--border); }
        [data-theme="dark"] .btn-secondary:hover { box-shadow: 5px 5px 0 rgba(255,255,255,0.08); }
        .btn-secondary:active { transform: translate(0); box-shadow: none; transition-duration: 0.05s; }
        .hero-note {
          font-size: 12px;
          color: var(--text-faint);
          font-family: var(--font-sans);
          transition: color var(--transition-smooth);
        }

        /* Demo Card */
        .demo-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--shadow-color);
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s, background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
        }
        [data-theme="dark"] .demo-card {
          border: 1.5px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .demo-card:hover { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }
        [data-theme="dark"] .demo-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
        .demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .demo-title { font-weight: 700; font-size: 14px; }
        .demo-live {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          border: 1.5px solid var(--border);
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--accent-green-bg);
          color: var(--accent-green);
          position: relative;
          transition: background-color var(--transition-smooth), color var(--transition-smooth), border-color var(--transition-smooth);
        }
        .demo-live::after {
          content: "";
          position: absolute;
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
          left: 6px;
          top: 50%;
          transform: translateY(-50%);
          animation: pulse-dot 2s infinite;
        }
        .demo-live span { margin-left: 10px; }
        .demo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          margin-bottom: 10px;
          background: var(--bg);
          transition: border-color 0.2s, transform 0.2s, background-color var(--transition-smooth);
          cursor: default;
        }
        .demo-row:hover { border-color: var(--border); transform: translateX(4px); }
        .demo-company { font-weight: 700; font-size: 13px; }
        .demo-role { font-size: 12px; color: var(--text-muted); margin-top: 2px; transition: color var(--transition-smooth); }
        .demo-status {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 6px;
          transition: transform 0.2s;
        }
        .demo-row:hover .demo-status { transform: scale(1.05); }
        .status-interview { background: var(--accent-yellow-bg); color: var(--accent-yellow-text); }
        .status-applied { background: var(--accent-blue-bg); color: var(--accent-blue-text); }
        .status-offer { background: var(--accent-green-bg); color: var(--accent-green); }
        .demo-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
        }
        .demo-stat {
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 12px;
          text-align: center;
          background: var(--bg);
          transition: border-color 0.2s, transform 0.2s, background-color var(--transition-smooth);
        }
        .demo-stat:hover { border-color: var(--border); transform: translateY(-3px); }
        .demo-stat-value { font-weight: 800; font-size: 20px; }
        .demo-stat-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          margin-top: 4px;
          transition: color var(--transition-smooth);
        }

        /* Sections */
        section { padding: 80px 0; }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 48px;
        }
        .kicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 12px;
          transition: color var(--transition-smooth);
        }
        .section-title {
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 800;
          line-height: 1.1;
          max-width: 600px;
        }

        /* Cards */
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .card {
          background: var(--surface);
          border: 2.5px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }
        [data-theme="dark"] .card {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--border);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card:hover { transform: translate(-4px, -4px); box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--shadow-color); }
        [data-theme="dark"] .card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          border-color: #3a3a3c;
        }
        .card:hover::before { transform: scaleX(1); }
        .card-icon {
          width: 48px;
          height: 48px;
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 20px;
          transition: transform 0.3s, border-color var(--transition-smooth);
          background: var(--bg);
        }
        [data-theme="dark"] .card-icon { border-color: var(--border); }
        .card:hover .card-icon { transform: rotate(10deg) scale(1.1); }
        .card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
        .card p {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          transition: color var(--transition-smooth);
        }

        /* Workflow */
        .workflow-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
          align-items: start;
        }
        .workflow-main {
          background: var(--surface);
          border: 2.5px solid var(--border);
          border-radius: var(--radius);
          padding: 40px;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .workflow-main {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .workflow-step {
          display: flex;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1.5px solid var(--border-light);
          transition: border-color var(--transition-smooth);
          opacity: 0;
          transform: translateX(-10px);
          animation: slide-in-right 0.6s forwards;
        }
        .workflow-step:nth-child(2) { animation-delay: 0.1s; }
        .workflow-step:nth-child(3) { animation-delay: 0.2s; }
        .workflow-step:nth-child(4) { animation-delay: 0.3s; }
        .workflow-step:last-child { border-bottom: none; }
        @keyframes slide-in-right {
          to { opacity: 1; transform: translateX(0); }
        }
        .step-num {
          width: 36px;
          height: 36px;
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
          background: var(--bg);
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth), transform 0.3s, color var(--transition-smooth);
        }
        .workflow-step:hover .step-num { transform: scale(1.15); background: var(--text); color: var(--bg); border-color: var(--text); }
        .step-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .step-desc {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-muted);
          transition: color var(--transition-smooth);
        }
        .side-cards { display: flex; flex-direction: column; gap: 20px; }
        .side-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          transition: transform 0.3s, box-shadow 0.3s, background-color var(--transition-smooth), border-color var(--transition-smooth);
          opacity: 0;
          transform: translateY(20px);
          animation: slide-up 0.6s forwards;
        }
        [data-theme="dark"] .side-card {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .side-card:nth-child(2) { animation-delay: 0.15s; }
        @keyframes slide-up {
          to { opacity: 1; transform: translateY(0); }
        }
        .side-card:hover { transform: translateX(8px); box-shadow: 6px 6px 0 var(--shadow-color); }
        [data-theme="dark"] .side-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border-color: #3a3a3c;
        }
        .side-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          margin-bottom: 12px;
          transition: color var(--transition-smooth);
        }
        .side-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .side-desc {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-muted);
          transition: color var(--transition-smooth);
        }

        /* Insights */
        .insights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
        }
        .insights-left ul {
          list-style: none;
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .insights-left li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          opacity: 0;
          transform: translateX(-10px);
          animation: slide-in-right 0.5s forwards;
        }
        .insights-left li:nth-child(2) { animation-delay: 0.1s; }
        .insights-left li:nth-child(3) { animation-delay: 0.2s; }
        .check {
          width: 20px;
          height: 20px;
          background: var(--accent-green-bg);
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: var(--accent-green);
          flex-shrink: 0;
          transition: transform 0.3s, background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        .insights-left li:hover .check { transform: scale(1.2) rotate(10deg); }
        .chart-card {
          background: var(--surface);
          border: 2.5px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .chart-card {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 140px;
        }
        .bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .bar {
          width: 100%;
          background: var(--text);
          border-radius: 6px;
          transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color var(--transition-smooth);
          position: relative;
        }
        .bar-bg {
          width: 100%;
          background: var(--border-light);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          transition: background-color var(--transition-smooth);
        }
        .bar-wrap:hover .bar { filter: brightness(1.2); }

        /* Testimonials / Different */
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .testimonial {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s, background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
        }
        [data-theme="dark"] .testimonial {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .testimonial::after {
          content: "\"";
          position: absolute;
          top: 24px;
          right: 24px;
          font-size: 48px;
          line-height: 1;
          color: var(--border-light);
          font-family: Georgia, serif;
          transition: color var(--transition-smooth);
          pointer-events: none;
        }
        .testimonial:hover { transform: translateY(-6px); box-shadow: 8px 8px 0 var(--shadow-color); }
        [data-theme="dark"] .testimonial:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border-color: #3a3a3c;
        }
        .testimonial p {
          font-family: var(--font-sans);
          font-size: 15px;
          line-height: 1.6;
          color: var(--text);
          margin-bottom: 20px;
          transition: color var(--transition-smooth);
        }
        .testimonial-author { font-size: 13px; font-weight: 700; }
        .testimonial-role { font-size: 12px; color: var(--text-muted); margin-top: 2px; transition: color var(--transition-smooth); }

        /* FAQ */
        .faq-card {
          background: var(--surface);
          border: 2.5px solid var(--border);
          border-radius: var(--radius);
          padding: 40px;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .faq-card {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 32px;
        }
        .faq-item {
          border: 2px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 20px;
          cursor: pointer;
          transition: border-color 0.3s, background-color 0.3s, transform 0.2s;
          user-select: none;
        }
        [data-theme="dark"] .faq-item { border: 1.5px solid var(--border); }
        .faq-item:hover { border-color: var(--border); background: var(--bg); transform: translateY(-2px); }
        [data-theme="dark"] .faq-item:hover { border-color: #3a3a3c; }
        .faq-item.active { border-color: var(--border); background: var(--bg); }
        .faq-q {
          font-size: 14px;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-icon {
          font-size: 18px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 400;
        }
        .faq-item.active .faq-icon { transform: rotate(135deg); }
        .faq-a {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 0;
          line-height: 1.6;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s, margin-top 0.4s;
        }
        .faq-item.active .faq-a {
          max-height: 200px;
          margin-top: 12px;
          opacity: 1;
        }

        /* CTA */
        .cta-card {
          background: var(--text);
          color: var(--bg);
          border: 3px solid var(--border);
          border-radius: var(--radius);
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }
        .cta-card::before {
          content: "";
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 60%);
          pointer-events: none;
        }
        [data-theme="dark"] .cta-card::before { background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 60%); }
        [data-theme="dark"] .cta-card {
          border: 1.5px solid var(--border);
          background: #161618;
        }
        .cta-card h2 {
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 800;
          margin-bottom: 12px;
          color: #fff;
          position: relative;
          z-index: 1;
        }
        [data-theme="dark"] .cta-card h2 { color: var(--text); }
        .cta-card p {
          font-family: var(--font-sans);
          font-size: 15px;
          color: #a1a1aa;
          max-width: 400px;
          position: relative;
          z-index: 1;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg);
          color: var(--text);
          padding: 16px 32px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          border: 2px solid var(--border);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), color var(--transition-smooth);
          white-space: nowrap;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .cta-btn:hover { transform: translate(-3px, -3px); box-shadow: 5px 5px 0 rgba(255,255,255,0.15); }
        .cta-btn:active { transform: translate(0); box-shadow: none; }

        /* Footer */
        footer {
          padding: 40px 0;
          border-top: 2px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 16px;
          transition: border-color var(--transition-smooth);
        }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
          display: inline-block;
        }
        .footer-links a:hover { color: var(--text); transform: translateY(-2px); }

        /* AI Section */
        .ai-section-inner {
          background: var(--surface);
          border: 2.5px solid var(--border);
          border-radius: var(--radius);
          padding: 48px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .ai-section-inner {
          border: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .ai-pill {
          border: 2px solid var(--border);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: var(--bg);
          transition: transform 0.2s, background-color var(--transition-smooth), border-color var(--transition-smooth);
          cursor: default;
          display: inline-block;
        }
        [data-theme="dark"] .ai-pill { border: 1.5px solid var(--border); }
        .ai-pill:hover { transform: translateY(-2px); }
        .ai-card-inner {
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .ai-card-inner { border: 1.5px solid var(--border); }

        /* Extension Section */
        .browser-mockup {
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--shadow-color);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .browser-mockup {
          border: 1.5px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .browser-mockup:hover {
          transform: translate(-2px, -2px);
          box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0 var(--shadow-color);
        }
        [data-theme="dark"] .browser-mockup:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          border-color: #3a3a3c;
        }
        .browser-chrome {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .browser-dots { display: flex; gap: 6px; }
        .browser-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--text-faint);
          border: 1.5px solid var(--border);
          opacity: 0.6;
        }
        .browser-url {
          flex: 1;
          height: 24px;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          background: var(--surface);
          margin-left: 4px;
        }
        .extension-popup {
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 20px;
          background: var(--surface);
          transition: background-color var(--transition-smooth), border-color var(--transition-smooth);
        }
        [data-theme="dark"] .extension-popup { border: 1.5px solid var(--border); }
        .popup-header {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .popup-badge {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          border: 1.5px solid var(--border);
          padding: 3px 8px;
          border-radius: 6px;
          background: var(--accent-green-bg);
          color: var(--accent-green);
          transition: background-color var(--transition-smooth), color var(--transition-smooth), border-color var(--transition-smooth);
        }
        .popup-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .popup-line {
          height: 10px;
          background: var(--border-light);
          border-radius: 4px;
          transition: background-color var(--transition-smooth);
        }
        .popup-line:nth-child(1) { width: 60%; }
        .popup-line:nth-child(2) { width: 85%; }
        .popup-line:nth-child(3) { width: 45%; }
        .popup-success {
          padding: 10px;
          background: var(--accent-green-bg);
          color: var(--accent-green);
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          border-radius: 6px;
          border: 1.5px solid var(--border);
          letter-spacing: 0.05em;
          transition: background-color var(--transition-smooth), color var(--transition-smooth), border-color var(--transition-smooth);
        }
        .extension-features {
          list-style: none;
          margin: 24px 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .extension-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
        }

        /* Animations */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; }
          .demo-card { transform: none; }
          .grid-3, .testimonial-grid, .insights-grid, .workflow-grid, .faq-grid, .ai-section-inner {
            grid-template-columns: 1fr;
          }
          .landing-nav-links { display: none; }
          .mobile-menu-btn { display: block; }
          .cta-card { padding: 40px 24px; text-align: center; justify-content: center; }
          .theme-toggle span { display: none; }
        }
      `}</style>

      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="lp-container nav-inner">
          <Link to="/" className="logo">Applyr</Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#insights">Insights</a>
            <a href="#extension">Extension</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span>{theme === 'dark' ? '☀' : '☾'}</span>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <Link
              to="/login"
              style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}
            >
              Sign in
            </Link>
            <Link to="/login" className="nav-cta">
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() =>
              document.querySelector('.landing-nav-links')?.classList.toggle('active')
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="lp-container">
        {/* Hero */}
        <section className="hero">
          <div className="reveal">
            <div className="hero-badge"><span>Job search, without the noise</span></div>
            <h1>A workspace built for hiring momentum.</h1>
            <p>
              Applyr keeps your applications, resumes, and follow-ups in one calm hub. Stay
              focused, track progress, and move faster with clarity.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#workflow" className="btn-secondary">
                See how it works
              </a>
            </div>
            <div className="hero-note">No credit card. Free to start. Upgrade when you need more.</div>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="demo-card">
              <div className="demo-header">
                <div className="demo-title">Pipeline overview</div>
                <div className="demo-live"><span>Live</span></div>
              </div>
              <div className="demo-row">
                <div>
                  <div className="demo-company">Stripe</div>
                  <div className="demo-role">Product Designer</div>
                </div>
                <div className="demo-status status-interview">Interviewing</div>
              </div>
              <div className="demo-row">
                <div>
                  <div className="demo-company">Linear</div>
                  <div className="demo-role">UX Researcher</div>
                </div>
                <div className="demo-status status-applied">Applied</div>
              </div>
              <div className="demo-row">
                <div>
                  <div className="demo-company">Figma</div>
                  <div className="demo-role">Design Systems</div>
                </div>
                <div className="demo-status status-offer">Offer</div>
              </div>
              <div className="demo-stats">
                <div className="demo-stat">
                  <div className="demo-stat-value" data-count="32">
                    0
                  </div>
                  <div className="demo-stat-label">Response</div>
                </div>
                <div className="demo-stat">
                  <div className="demo-stat-value" data-count="18">
                    0
                  </div>
                  <div className="demo-stat-label">Active</div>
                </div>
                <div className="demo-stat">
                  <div className="demo-stat-value" data-count="2">
                    0
                  </div>
                  <div className="demo-stat-label">Offers</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features">
          <div className="section-header reveal">
            <div>
              <div className="kicker">Why Applyr</div>
              <h2 className="section-title">
                Everything you need,
                <br />
                nothing you don&apos;t.
              </h2>
            </div>
            <Link to="/login" className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid-3">
            <div className="card reveal">
              <div className="card-icon">◼</div>
              <h3>One calm workspace</h3>
              <p>Track applications, notes, and resumes in a single place that stays quiet and focused.</p>
            </div>
            <div className="card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="card-icon">◈</div>
              <h3>Pipeline clarity</h3>
              <p>See every status at a glance with clean summaries and a timeline that never feels busy.</p>
            </div>
            <div className="card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="card-icon">✦</div>
              <h3>AI that stays subtle</h3>
              <p>Extract job details, draft resume variants, and keep wording consistent in one flow.</p>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow">
          <div className="workflow-grid">
            <div className="workflow-main reveal">
              <div className="kicker">Workflow</div>
              <h2 className="section-title" style={{ marginBottom: '24px' }}>
                Move from capture to offer in a clear line.
              </h2>
              <div className="workflow-step">
                <div className="step-num">01</div>
                <div>
                  <div className="step-title">Capture</div>
                  <div className="step-desc">Turn any job post into a structured application in seconds.</div>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-num">02</div>
                <div>
                  <div className="step-title">Organize</div>
                  <div className="step-desc">Move cards across your pipeline with clean status tracking.</div>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-num">03</div>
                <div>
                  <div className="step-title">Follow up</div>
                  <div className="step-desc">Stay on top of reminders, interviews, and outcomes without noise.</div>
                </div>
              </div>
            </div>
            <div className="side-cards reveal" style={{ transitionDelay: '0.15s' }}>
              <div className="side-card">
                <div className="side-label">Today</div>
                <div className="side-title">3 interviews this week.</div>
                <div className="side-desc">
                  Stay ahead with reminders, notes, and the exact status history you need.
                </div>
              </div>
              <div className="side-card">
                <div className="side-label">Momentum</div>
                <div className="side-title">Follow ups that feel automatic.</div>
                <div className="side-desc">Set reminders once and let Applyr keep the cadence for you.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section id="insights">
          <div className="insights-grid">
            <div className="reveal insights-left">
              <div className="kicker">Insights</div>
              <h2 className="section-title">Progress you can feel.</h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  margin: '16px 0 24px',
                  maxWidth: '400px',
                  lineHeight: '1.6',
                }}
              >
                Dashboards summarize your search with clean metrics and growth charts. For admins,
                it&apos;s a dedicated view that keeps the team aligned.
              </p>
              <ul>
                <li>
                  <div className="check">✓</div> Track outcomes by status
                </li>
                <li>
                  <div className="check">✓</div> Measure response and success rates
                </li>
                <li>
                  <div className="check">✓</div> See monthly growth trends
                </li>
              </ul>
              <Link to="/login" className="btn-secondary" style={{ marginTop: '8px' }}>
                Explore dashboards
              </Link>
            </div>
            <div className="chart-card reveal" style={{ transitionDelay: '0.15s' }}>
              <div className="chart-header">
                <div>
                  <div className="side-label">Monthly growth</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
                    Consistent momentum
                  </div>
                </div>
                <div
                  className="growth-counter demo-stat-value"
                  data-count="100"
                  data-prefix="+"
                  data-suffix="%"
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'var(--accent-green)',
                    background: 'var(--accent-green-bg)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--border)',
                  }}
                >
                  0
                </div>
              </div>
              <div className="chart-bars">
                <div className="bar-wrap">
                  <div className="bar-bg" style={{ height: '100%' }}>
                    <div className="bar" style={{ height: '0%', position: 'absolute', bottom: 0 }} data-height="32" />
                  </div>
                </div>
                <div className="bar-wrap">
                  <div className="bar-bg" style={{ height: '100%' }}>
                    <div className="bar" style={{ height: '0%', position: 'absolute', bottom: 0 }} data-height="40" />
                  </div>
                </div>
                <div className="bar-wrap">
                  <div className="bar-bg" style={{ height: '100%' }}>
                    <div className="bar" style={{ height: '0%', position: 'absolute', bottom: 0 }} data-height="28" />
                  </div>
                </div>
                <div className="bar-wrap">
                  <div className="bar-bg" style={{ height: '100%' }}>
                    <div className="bar" style={{ height: '0%', position: 'absolute', bottom: 0 }} data-height="48" />
                  </div>
                </div>
                <div className="bar-wrap">
                  <div className="bar-bg" style={{ height: '100%' }}>
                    <div className="bar" style={{ height: '0%', position: 'absolute', bottom: 0 }} data-height="52" />
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Clean and simple visuals keep you focused on what matters.
              </div>
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section>
          <div className="ai-section-inner reveal">
            <div>
              <div className="kicker">AI workspace</div>
              <h2 className="section-title">Assistance that stays quiet and useful.</h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  marginTop: '16px',
                  lineHeight: '1.6',
                }}
              >
                Extract roles from job pages, generate resume variants, and keep your notes
                consistent without leaving the workspace.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                <span className="ai-pill">Job extraction</span>
                <span className="ai-pill">Resume variants</span>
                <span className="ai-pill">Cover letter drafts</span>
              </div>
            </div>
            <div className="ai-card-inner">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                  transition: 'color var(--transition-smooth)',
                }}
              >
                <Sparkles className="w-4 h-4" />
                AI summary
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--text)',
                  lineHeight: '1.6',
                  transition: 'color var(--transition-smooth)',
                }}
              >
                We highlighted the key requirements and suggested three resume edits tailored to
                the role. Want a draft cover letter?
              </p>
              <button type="button" className="btn-secondary" style={{ marginTop: '20px', fontSize: '13px', padding: '10px 18px' }}>
                Generate draft
              </button>
            </div>
          </div>
        </section>

        {/* Browser Extension */}
        <section id="extension">
          <div className="ai-section-inner reveal">
            <div>
              <div className="kicker">Browser Extension</div>
              <h2 className="section-title">Capture jobs as you browse.</h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  marginTop: '16px',
                  lineHeight: '1.6',
                }}
              >
                Add applications directly from LinkedIn, Indeed, and other job boards without switching tabs.
                One click turns any job post into a tracked application in your pipeline.
              </p>
              <ul className="extension-features">
                <li>
                  <div className="check">✓</div> Auto-fill company, role, and link
                </li>
                <li>
                  <div className="check">✓</div> Detects job status and source site
                </li>
                <li>
                  <div className="check">✓</div> Syncs instantly with your workspace
                </li>
              </ul>
              <a href="/extension.zip" download className="btn-primary" style={{ marginTop: '8px' }}>
                Download Extension
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
            <div className="browser-mockup">
              <div className="browser-chrome">
                <div className="browser-dots">
                  <div className="browser-dot" />
                  <div className="browser-dot" />
                  <div className="browser-dot" />
                </div>
                <div className="browser-url" />
              </div>
              <div className="extension-popup">
                <div className="popup-header">
                  <span>Applyr Extension</span>
                  <span className="popup-badge">Active</span>
                </div>
                <div className="popup-lines">
                  <div className="popup-line" />
                  <div className="popup-line" />
                  <div className="popup-line" />
                </div>
                <div className="popup-success">Added to pipeline ✓</div>
              </div>
            </div>
          </div>
        </section>

        {/* What makes us different */}
        <section>
          <div className="section-header reveal">
            <div>
              <div className="kicker">Different by design</div>
              <h2 className="section-title">What makes us different.</h2>
            </div>
          </div>
          <div className="grid-3">
            <div className="card reveal">
              <div className="card-icon">◫</div>
              <h3>Built for seekers, not recruiters</h3>
              <p>Most tools are designed for the hiring side. Applyr is built for the person doing the searching.</p>
            </div>
            <div className="card reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="card-icon">◈</div>
              <h3>Calm by default</h3>
              <p>No notification spam, no cluttered dashboards. Just signal, no noise.</p>
            </div>
            <div className="card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="card-icon">◉</div>
              <h3>Your data stays yours</h3>
              <p>No selling, no scraping, no &quot;upload your resume to our database.&quot; Your pipeline is private.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="faq-card reveal">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="kicker">FAQ</div>
                <h2 className="section-title">Clear answers, no fluff.</h2>
              </div>
              <Link to="/login" className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
                Start now
              </Link>
            </div>
            <div className="faq-grid">
              {[
                {
                  q: 'Is Applyr free to start?',
                  a: 'Yes. You can start for free and upgrade when you need more features.',
                },
                {
                  q: 'Can I use it for team hiring?',
                  a: 'Yes. Admin dashboards keep teams aligned on user activity and progress.',
                },
                {
                  q: 'Do you store my files securely?',
                  a: 'Files and notes are stored securely with role-based access and activity tracking.',
                },
                {
                  q: 'Does Applyr support resumes and export?',
                  a: 'Yes. Manage resume versions and export PDFs directly from the app.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`faq-item ${activeFaq === i ? 'active' : ''}`}
                  onClick={() => toggleFaq(i)}
                >
                  <div className="faq-q">
                    {item.q} <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-a">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingTop: '40px' }}>
          <div className="cta-card reveal">
            <div>
              <h2>Ready to bring change to your search?</h2>
              <p>Start free and build momentum with a workspace designed for progress.</p>
            </div>
            <Link to="/login" className="cta-btn">
              Create your workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div style={{ fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '14px' }}>
            Applyr
          </div>
          <div className="footer-links">
            <a href="mailto:applyr.app@gmail.com">Contact</a>
            <a href="/extension.zip" download>Download Extension</a>
          </div>
        </footer>
      </div>
    </div>
  );
}