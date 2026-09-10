import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Moon, Sun } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

import terms from '../content/legal/terms.md?raw';
import privacy from '../content/legal/privacy.md?raw';
import aiUse from '../content/legal/ai-use.md?raw';
import cookies from '../content/legal/cookies.md?raw';

const documents = [
  { id: 'terms', title: 'Terms of Service', description: 'The rules for using Applyr and its browser extension.', content: terms },
  { id: 'privacy', title: 'Privacy Policy', description: 'How Applyr collects, uses, stores, and deletes personal data.', content: privacy },
  { id: 'ai-use', title: 'AI Use Disclosure', description: 'What Applyr’s AI features do and what you should review.', content: aiUse },
  { id: 'cookies', title: 'Cookie Notice', description: 'How Applyr uses cookies and browser storage.', content: cookies },
];

export default function LegalPage() {
  const { documentId } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const selected = documents.find((document) => document.id === documentId) || documents[0];
  const relatedDocuments = documents.filter((document) => document.id !== selected.id);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [documentId]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="legal-root" data-theme={theme}>
      <style>{`
        .legal-root {
          --legal-bg: #f9f8f4;
          --legal-surface: #fffefa;
          --legal-text: #09090b;
          --legal-muted: #71717a;
          --legal-border: #09090b;
          --legal-radius: 10px;
          min-height: 100vh;
          background: var(--legal-bg);
          color: var(--legal-text);
          font-family: "Azeret Mono", "SF Mono", "Courier New", monospace;
          line-height: 1.6;
          position: relative;
          isolation: isolate;
          transition: background-color .35s ease, color .35s ease;
        }
        .legal-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          background-image: radial-gradient(circle, #d4d4d8 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: .55;
          pointer-events: none;
        }
        .legal-root[data-theme="dark"] {
          --legal-bg: #0a0a0a;
          --legal-surface: #111;
          --legal-text: #f5f5f5;
          --legal-muted: #a1a1aa;
          --legal-border: #2c2c2c;
        }
        .legal-root[data-theme="dark"]::before { background-image: radial-gradient(circle, #2a2a2c 1px, transparent 1px); opacity: .4; }
        .legal-nav-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
        .legal-navbar {
          padding: 24px 0;
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(249, 248, 244, .85);
          backdrop-filter: blur(12px);
          border-bottom: 2px solid transparent;
          transition: border-color .3s, background-color .35s ease;
        }
        .legal-root[data-theme="dark"] .legal-navbar { background: rgba(10, 10, 10, .85); }
        .legal-navbar.scrolled { border-bottom-color: var(--legal-border); }
        .legal-nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .legal-logo {
          color: var(--legal-text);
          background: var(--legal-surface);
          border: 2px solid var(--legal-border);
          border-radius: var(--legal-radius);
          padding: 8px 16px;
          font-family: "JetBrains Mono", "SF Mono", "Courier New", monospace;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: .25em;
          line-height: 1.5;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .legal-logo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent); transform: translateX(-100%); transition: transform .5s; }
        .legal-logo:hover::after { transform: translateX(100%); }
        .legal-logo:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--legal-border); }
        .legal-nav-links { display: flex; gap: 32px; align-items: center; font-size: 13px; font-weight: 500; }
        .legal-nav-links a { color: var(--legal-muted); text-decoration: none; position: relative; padding: 4px 0; transition: color .2s; }
        .legal-nav-links a::after { content: ""; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: var(--legal-text); transition: width .3s cubic-bezier(.4, 0, .2, 1); }
        .legal-nav-links a:hover { color: var(--legal-text); }
        .legal-nav-links a:hover::after { width: 100%; }
        .legal-nav-actions { display: flex; gap: 18px; align-items: center; }
        .legal-theme {
          color: var(--legal-text);
          background: transparent;
          border: 2px solid var(--legal-border);
          border-radius: var(--legal-radius);
          padding: 8px 12px;
          font: 600 12px "Azeret Mono", "SF Mono", monospace;
          display: inline-flex;
          gap: 6px;
          align-items: center;
          cursor: pointer;
        }
        .legal-theme:hover { background: rgba(0,0,0,.04); }
        .legal-root[data-theme="dark"] .legal-theme:hover { background: rgba(255,255,255,.06); }
        .legal-signin { color: var(--legal-muted); text-decoration: none; font-size: 13px; font-weight: 500; }
        .legal-signin:hover { color: var(--legal-text); }
        .legal-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--legal-text);
          color: var(--legal-bg);
          padding: 10px 20px;
          border-radius: var(--legal-radius);
          border: 2px solid var(--legal-border);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .legal-cta:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--legal-border); }
        .legal-content { width: min(800px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0 90px; }
        .legal-document { background: var(--legal-surface); border: 2px solid var(--legal-border); border-radius: 14px; padding: clamp(28px, 6vw, 64px); box-shadow: 7px 7px 0 var(--legal-border); animation: legal-page-enter .8s cubic-bezier(.22, 1, .36, 1) both; }
        .legal-document article { font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; }
        .legal-document h1 { font-size: clamp(30px, 5vw, 46px); letter-spacing: -.055em; line-height: 1.05; margin: 0 0 30px; color: var(--legal-text); }
        .legal-document h2 { color: var(--legal-text); font-size: 20px; margin: 40px 0 12px; padding-top: 22px; border-top: 1px solid color-mix(in srgb, var(--legal-muted) 30%, transparent); }
        .legal-document p, .legal-document li { color: var(--legal-muted); font-size: 14px; }
        .legal-document strong { color: var(--legal-text); }
        .legal-document a { color: var(--legal-text); text-decoration-thickness: 1px; text-underline-offset: 3px; }
        .legal-document ul { padding-left: 22px; }
        .legal-document li { margin: 7px 0; }
        .legal-related { margin-top: 68px; }
        .legal-related h2 { margin: 0 0 20px; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; font-size: 22px; letter-spacing: -.035em; }
        .legal-related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .legal-related-card { display: flex; min-height: 130px; flex-direction: column; justify-content: space-between; padding: 16px; border: 2px solid var(--legal-border); border-radius: 10px; color: var(--legal-text); text-decoration: none; background: var(--legal-bg); box-shadow: 3px 3px 0 var(--legal-border); transition: transform .15s ease, box-shadow .15s ease; }
        .legal-related-card:hover { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--legal-border); }
        .legal-related-card-title { display: flex; gap: 8px; align-items: center; font-weight: 700; font-size: 13px; }
        .legal-related-card p { margin: 12px 0 0; color: var(--legal-muted); font-size: 11px; line-height: 1.45; }
        .legal-related-card span { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--legal-muted); margin-top: 14px; }
        .legal-footer { width: min(1200px, calc(100% - 48px)); margin: 0 auto; padding: 22px 0 30px; border-top: 2px solid var(--legal-border); display: flex; justify-content: space-between; gap: 20px; color: var(--legal-muted); font-size: 11px; }
        .legal-footer a { color: inherit; }
        @keyframes legal-page-enter { from { opacity: 0; transform: translateY(18px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .legal-document { animation: none; } }
        @media (max-width: 900px) {
          .legal-navbar { padding: 16px 0; }
          .legal-nav-container { padding: 0 16px; }
          .legal-logo { font-size: 15px; padding: 6px 12px; letter-spacing: .2em; }
          .legal-nav-links, .legal-signin { display: none; }
          .legal-nav-actions { gap: 10px; }
          .legal-theme { padding: 8px 10px; }
          .legal-theme span { display: none; }
          .legal-cta { padding: 8px 12px; font-size: 12px; }
        }
        @media (max-width: 620px) {
          .legal-content { width: min(100% - 28px, 800px); padding-top: 42px; }
          .legal-document { padding: 26px 22px; box-shadow: 4px 4px 0 var(--legal-border); }
          .legal-related-grid { grid-template-columns: 1fr; }
          .legal-related-card { min-height: 0; }
          .legal-footer { width: min(100% - 28px, 1200px); flex-direction: column; }
        }
      `}</style>

      <nav className={`legal-navbar ${scrolled ? 'scrolled' : ''}`} aria-label="Main navigation">
        <div className="legal-nav-container legal-nav-inner">
          <Link to="/" className="legal-logo">Applyr</Link>
          <div className="legal-nav-links">
            <a href="/#features">Features</a>
            <a href="/#workflow">Workflow</a>
            <a href="/#insights">Insights</a>
            <a href="/#extension">Extension</a>
            <a href="/#faq">FAQ</a>
          </div>
          <div className="legal-nav-actions">
            <button className="legal-theme" onClick={toggleTheme} aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <Link to="/login" className="legal-signin">Sign in</Link>
            <Link to="/login" className="legal-cta">Start free <ArrowRight size={16} /></Link>
          </div>
        </div>
      </nav>

      <main className="legal-content">
        <div className="legal-document" key={selected.id}>
          <article><ReactMarkdown>{selected.content}</ReactMarkdown></article>
        </div>

        <section className="legal-related" aria-labelledby="other-legal-documents">
          <h2 id="other-legal-documents">Other legal documents</h2>
          <div className="legal-related-grid">
            {relatedDocuments.map((document) => (
              <Link key={document.id} to={`/legal/${document.id}`} className="legal-related-card">
                <div>
                  <div className="legal-related-card-title"><FileText size={15} /> {document.title}</div>
                  <p>{document.description}</p>
                </div>
                <span>Read document <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="legal-footer">
        <span>© 2026 Applyr</span>
        <span>Questions? <a href="mailto:applyr.app@gmail.com">applyr.app@gmail.com</a></span>
      </footer>
    </div>
  );
}
