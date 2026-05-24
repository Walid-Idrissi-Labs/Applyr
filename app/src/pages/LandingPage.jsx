import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Layers, LineChart, Sparkles, ShieldCheck } from 'lucide-react';

const featureItems = [
  {
    title: 'One calm workspace',
    description: 'Track applications, notes, and resumes in a single place that stays quiet and focused.',
    icon: Layers,
  },
  {
    title: 'Pipeline clarity',
    description: 'See every status at a glance with clean summaries and a timeline that never feels busy.',
    icon: LineChart,
  },
  {
    title: 'AI that stays subtle',
    description: 'Extract job details, draft resume variants, and keep wording consistent in one flow.',
    icon: Sparkles,
  },
];

const workflowItems = [
  {
    title: 'Capture',
    description: 'Turn any job post into a structured application in seconds.',
  },
  {
    title: 'Organize',
    description: 'Move cards across your pipeline with clean status tracking.',
  },
  {
    title: 'Follow up',
    description: 'Stay on top of reminders, interviews, and outcomes without noise.',
  },
];

const insightItems = [
  {
    label: 'Response rate',
    value: '32%',
  },
  {
    label: 'Active applications',
    value: '18',
  },
  {
    label: 'Offers this month',
    value: '2',
  },
];

const testimonials = [
  {
    quote: 'Applyr makes my job search feel like a product, not a spreadsheet.',
    name: 'Nora M.',
    title: 'Product Designer',
  },
  {
    quote: 'Everything is where I expect it to be. No clutter, just signal.',
    name: 'Imran K.',
    title: 'Data Analyst',
  },
  {
    quote: 'The admin view keeps our team aligned without extra meetings.',
    name: 'Helene R.',
    title: 'Talent Lead',
  },
];

const faqs = [
  {
    question: 'Is Applyr free to start?',
    answer: 'Yes. You can start for free and upgrade when you need more features.',
  },
  {
    question: 'Can I use it for team hiring?',
    answer: 'Yes. Admin dashboards keep teams aligned on user activity and progress.',
  },
  {
    question: 'Do you store my files securely?',
    answer: 'Files and notes are stored securely with role-based access and activity tracking.',
  },
  {
    question: 'Does Applyr support resumes and export?',
    answer: 'Yes. Manage resume versions and export PDFs directly from the app.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing-root landing-bg min-h-screen">
      <div className="relative z-10">
        <header className="landing-shell flex items-center justify-between py-6">
          <Link to="/" className="landing-display text-[18px] tracking-[0.3em] uppercase">
            Applyr
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[13px]">
            <a href="#features" className="landing-link">Features</a>
            <a href="#workflow" className="landing-link">Workflow</a>
            <a href="#insights" className="landing-link">Insights</a>
            <a href="#security" className="landing-link">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="landing-link hidden sm:inline-flex">Sign in</Link>
            <Link to="/login" className="landing-btn">
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <section className="landing-shell pt-10 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 landing-rise">
              <span className="landing-pill">Job search, without the noise</span>
              <h1 className="landing-display text-[40px] md:text-[52px] lg:text-[60px] leading-[1.05]">
                A Notion-like workspace built for hiring momentum.
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#4b4b4b] max-w-xl">
                Applyr keeps your applications, resumes, and follow-ups in one calm hub. Stay focused,
                track progress, and move faster with clarity.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Link to="/login" className="landing-btn">
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#workflow" className="landing-btn-outline">See how it works</a>
              </div>
              <div className="text-[12px] text-[#6b6b6b]">
                No credit card. Free to start. Upgrade when you need more.
              </div>
            </div>

            <div className="landing-card p-6 md:p-8 landing-rise" style={{ animationDelay: '0.12s' }}>
              <div className="flex items-center justify-between">
                <div className="landing-display text-[16px]">Pipeline overview</div>
                <span className="landing-pill">Live</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { company: 'Stripe', role: 'Product Designer', status: 'Interviewing' },
                  { company: 'Linear', role: 'UX Researcher', status: 'Applied' },
                  { company: 'Figma', role: 'Design Systems', status: 'Offer' },
                ].map((item) => (
                  <div key={item.company} className="landing-soft p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[13px]">{item.company}</div>
                      <div className="text-[12px] text-[#6b6b6b]">{item.role}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0f766e]">{item.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {insightItems.map((item) => (
                  <div key={item.label} className="landing-soft p-3 text-center">
                    <div className="landing-display text-[18px]">{item.value}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-shell py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="landing-kicker">Why Applyr</div>
              <h2 className="landing-display text-[28px] md:text-[34px]">Everything you need, nothing you do not.</h2>
            </div>
            <Link to="/login" className="landing-link inline-flex items-center gap-2">
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {featureItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="landing-card p-6 landing-rise"
                  style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                >
                  <div className="w-10 h-10 rounded-full border border-[#111] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="landing-display text-[18px] mt-4">{item.title}</h3>
                  <p className="text-[13px] text-[#5b5b5b] mt-2">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="workflow" className="landing-shell py-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div className="landing-card p-7 md:p-8">
              <div className="landing-kicker">Workflow</div>
              <h2 className="landing-display text-[26px] md:text-[32px]">Move from capture to offer in a clear line.</h2>
              <div className="mt-6 space-y-5">
                {workflowItems.map((item, index) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-[#111] flex items-center justify-center text-[12px] font-semibold">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold">{item.title}</div>
                      <div className="text-[12px] text-[#5f5f5f] mt-1">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="landing-soft p-5">
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#6b6b6b]">Today</div>
                <div className="landing-display text-[22px] mt-3">3 interviews this week.</div>
                <p className="text-[12px] text-[#6b6b6b] mt-2">
                  Stay ahead with reminders, notes, and the exact status history you need.
                </p>
              </div>
              <div className="landing-soft p-5">
                <div className="text-[12px] uppercase tracking-[0.2em] text-[#6b6b6b]">Momentum</div>
                <div className="landing-display text-[22px] mt-3">Follow ups that feel automatic.</div>
                <p className="text-[12px] text-[#6b6b6b] mt-2">
                  Set reminders once and let Applyr keep the cadence for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="insights" className="landing-shell py-12">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div className="space-y-5">
              <div className="landing-kicker">Insights</div>
              <h2 className="landing-display text-[26px] md:text-[32px]">Progress you can feel.</h2>
              <p className="text-[13px] text-[#5b5b5b]">
                Dashboards summarize your search with clean metrics and growth charts. For admins,
                it is a dedicated view that keeps the team aligned.
              </p>
              <ul className="space-y-3">
                {['Track outcomes by status', 'Measure response and success rates', 'See monthly growth trends'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[12px]">
                    <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="landing-btn-outline inline-flex">Explore dashboards</Link>
            </div>
            <div className="landing-card p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] uppercase tracking-[0.2em] text-[#6b6b6b]">Monthly growth</div>
                  <div className="landing-display text-[22px] mt-2">Consistent momentum</div>
                </div>
                <div className="text-[12px] font-semibold text-[#0f766e]">+18%</div>
              </div>
              <div className="mt-6 grid grid-cols-5 gap-2 items-end h-28">
                {[32, 40, 28, 48, 52].map((value, index) => (
                  <div key={value + index} className="w-full rounded-full bg-[#111] bg-opacity-10">
                    <div
                      className="w-full rounded-full bg-[#111]"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[11px] text-[#6b6b6b]">
                Clean visuals keep you focused on what matters.
              </div>
            </div>
          </div>
        </section>

        <section className="landing-shell py-12">
          <div className="landing-card p-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <div className="landing-kicker">AI workspace</div>
              <h2 className="landing-display text-[26px] md:text-[32px]">Assistance that stays quiet and useful.</h2>
              <p className="text-[13px] text-[#5b5b5b] mt-3">
                Extract roles from job pages, generate resume variants, and keep your notes consistent
                without leaving the workspace.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {['Job extraction', 'Resume variants', 'Cover letter drafts'].map((item) => (
                  <span key={item} className="landing-pill">{item}</span>
                ))}
              </div>
            </div>
            <div className="landing-soft p-6">
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#6b6b6b]">
                <Sparkles className="w-4 h-4" />
                AI summary
              </div>
              <p className="text-[13px] text-[#4b4b4b] mt-4">
                We highlighted the key requirements and suggested three resume edits tailored to the
                role. Want a draft cover letter?
              </p>
              <button type="button" className="landing-btn-outline mt-5">
                Generate draft
              </button>
            </div>
          </div>
        </section>

        <section id="security" className="landing-shell py-12">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="landing-kicker">Security</div>
              <h2 className="landing-display text-[26px] md:text-[32px]">Professional by default.</h2>
              <p className="text-[13px] text-[#5b5b5b]">
                Applyr keeps your data protected with clear permissions and secure storage.
              </p>
            </div>
            {[
              'Role-based admin controls',
              'Secure file storage',
              'Audit-ready activity history',
            ].map((item) => (
              <div key={item} className="landing-soft p-5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0f766e]" />
                <div className="text-[13px] text-[#3f3f3f] font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-shell py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="landing-kicker">Teams love it</div>
              <h2 className="landing-display text-[26px] md:text-[32px]">Trusted by focused job seekers.</h2>
            </div>
            <Link to="/login" className="landing-btn-outline">Join them</Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div key={item.name} className="landing-card p-6">
                <p className="text-[13px] text-[#3f3f3f]">"{item.quote}"</p>
                <div className="mt-4 text-[12px] text-[#6b6b6b]">
                  <div className="font-semibold text-[#111]">{item.name}</div>
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-shell py-12">
          <div className="landing-card p-7 md:p-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="landing-kicker">FAQ</div>
                <h2 className="landing-display text-[26px] md:text-[32px]">Clear answers, no fluff.</h2>
              </div>
              <Link to="/login" className="landing-btn">Start now</Link>
            </div>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {faqs.map((item) => (
                <div key={item.question} className="landing-soft p-5">
                  <div className="font-semibold text-[13px]">{item.question}</div>
                  <p className="text-[12px] text-[#5f5f5f] mt-2">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-shell py-12">
          <div className="landing-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="landing-display text-[26px] md:text-[32px]">Ready to bring calm to your search?</div>
              <p className="text-[13px] text-[#5b5b5b] mt-2">
                Start free and build momentum with a workspace designed for progress.
              </p>
            </div>
            <Link to="/login" className="landing-btn">
              Create your workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <footer className="landing-shell pb-10 pt-4 text-[11px] text-[#6b6b6b] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="landing-display tracking-[0.2em] uppercase">Applyr</div>
          <div className="flex items-center gap-4">
            <span>Privacy</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
