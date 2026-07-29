import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// OfficialMail AI — App Intro page
// Background: real people photo (dimmed) behind the constellation,
// like an ambient scene. Headline: giant, halftone-patterned display
// text. Robot + feature callouts stay as before.
//
// NOTE: swap PEOPLE_PHOTO_URL below for your own chosen photo
// whenever you'd like — this one is free-to-use (Unsplash License).
// ─────────────────────────────────────────────────────────────

const PEOPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1633114128729-0a8dc13406b9?fm=jpg&q=60&w=1600&auto=format&fit=crop";

const FEATURES = [
  {
    label: "AI-Powered Email Generation",
    desc: "Draft polished emails from a few key points in seconds.",
  },
  {
    label: "Smart Inbox Summaries",
    desc: "Paste any email, get the gist and ready-to-send replies.",
  },
  {
    label: "Bulk Email Sending",
    desc: "Send personalized emails to your whole list at once.",
  },
  {
    label: "Spam Risk Detection",
    desc: "Catch spammy phrasing before it costs you deliverability.",
  },
];

const POSITIONS = [
  { top: "6%", left: "4%", align: "left" },
  { top: "6%", right: "4%", align: "right" },
  { bottom: "10%", left: "4%", align: "left" },
  { bottom: "10%", right: "4%", align: "right" },
];

export default function AppIntro() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [wink, setWink] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  function goTo(path) {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      navigate(path);
      return;
    }
    setPendingPath(path);
    setExiting(true);
  }

  useEffect(() => {
    if (!exiting || !pendingPath) return;
    const t = setTimeout(() => navigate(pendingPath), 700);
    return () => clearTimeout(t);
  }, [exiting, pendingPath]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const id = setInterval(() => {
      setActiveFeature((i) => (i + 1) % FEATURES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const id = setInterval(() => {
      setWink(true);
      setTimeout(() => setWink(false), 260);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, particles, raf;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * DPR;
      canvas.height = height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.round((width * height) / 14000);
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.4,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const op = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(61,90,254,${op})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(245,166,35,0.55)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    resize();
    step();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-[#080A14] text-white flex flex-col ${
        exiting ? "page-tear" : ""
      }`}
    >
      <style>{`
        @keyframes blurIn {
          from { opacity: 0; filter: blur(10px); transform: translateY(14px); }
          to   { opacity: 1; filter: blur(0);     transform: translateY(0); }
        }
        .blur-in { animation: blurIn 0.8s ease forwards; opacity: 0; }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .float-robot { animation: floatY 4.5s ease-in-out infinite; }
        @keyframes tearAway {
          0% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            transform: translate(0, 0) rotate(0deg) scale(1);
            filter: blur(0px);
          }
          35% {
            clip-path: polygon(0 0, 100% 0, 55% 68%, 0 100%);
            transform: translate(1%, -1%) rotate(-2deg) scale(0.99);
            filter: blur(0px);
          }
          100% {
            clip-path: polygon(0 0, 34% 0, 6% 26%, 0 55%);
            transform: translate(85%, -70%) rotate(-22deg) scale(0.3);
            filter: blur(3px);
            opacity: 0;
          }
        }
        .page-tear {
          animation: tearAway 0.7s cubic-bezier(0.6, 0, 0.8, 0.2) forwards;
          transform-origin: top right;
        }
        .hero-headline {
          background-image:
            repeating-radial-gradient(circle at 3px 3px, #F5A623 0px, #F5A623 1.2px, transparent 1.3px, transparent 7px),
            linear-gradient(135deg, #3D5AFE, #F5A623);
          background-size: 7px 7px, 100% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          .blur-in { animation: none; opacity: 1; filter: none; transform: none; }
          .float-robot { animation: none; }
        }
      `}</style>

      {/* Real-people ambient background photo */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${PEOPLE_PHOTO_URL})` }}
      />
      <div className="absolute inset-0 w-full h-full bg-[#080A14]/85" />

      {/* Constellation background (on top of the photo) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[720px] rounded-full bg-[#3D5AFE]/20 blur-[120px]" />

      <header
        className={`relative z-10 flex items-center justify-between px-6 md:px-12 py-6 ${
          loaded ? "blur-in" : ""
        }`}
      >
        <span className="font-semibold tracking-wide text-lg">
          OfficialMail <span className="text-[#F5A623]">AI</span>
        </span>
        <button
          onClick={() => goTo("/login")}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Log in
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative w-full max-w-5xl flex flex-col items-center">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              style={POSITIONS[i]}
              className={`hidden lg:block absolute w-56 rounded-2xl border px-4 py-3 backdrop-blur-md transition-all duration-500 ${
                i === activeFeature
                  ? "border-[#F5A623]/60 bg-[#131A2E]/90 opacity-100 scale-100 shadow-[0_0_24px_rgba(245,166,35,0.25)]"
                  : "border-white/10 bg-[#131A2E]/40 opacity-40 scale-95"
              } ${POSITIONS[i].align === "right" ? "text-right" : "text-left"}`}
            >
              <p className="text-sm font-medium text-white">{f.label}</p>
              <p className="mt-1 text-xs text-white/60">{f.desc}</p>
            </div>
          ))}

          <div
            className={`float-robot ${loaded ? "blur-in" : ""}`}
            style={{ animationDelay: "0.1s" }}
          >
            <RobotMascot wink={wink} />
          </div>

          <h1
            className={`hero-headline mt-4 text-[15vw] leading-[0.85] sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight ${
              loaded ? "blur-in" : ""
            }`}
            style={{ animationDelay: "0.25s" }}
          >
            Write less.
            <br />
            Send smarter.
          </h1>

          <p
            className={`mt-6 max-w-xl text-white/60 text-base md:text-lg ${
              loaded ? "blur-in" : ""
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            OfficialMail AI drafts, summarizes, and protects your email —
            built for real inboxes, real people.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 lg:hidden w-full max-w-md">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`rounded-2xl border px-4 py-3 text-left transition-all duration-500 ${
                  i === activeFeature
                    ? "border-[#F5A623]/60 bg-[#131A2E]/90"
                    : "border-white/10 bg-[#131A2E]/40 opacity-50"
                }`}
              >
                <p className="text-sm font-medium">{f.label}</p>
                <p className="mt-1 text-xs text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>

          <div
            className={`mt-10 flex items-center gap-4 ${loaded ? "blur-in" : ""}`}
            style={{ animationDelay: "0.55s" }}
          >
            <button
              onClick={() => goTo("/login")}
              className="rounded-full px-6 py-3 font-medium text-[#080A14] bg-gradient-to-r from-[#3D5AFE] to-[#F5A623] shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_32px_rgba(245,166,35,0.5)] transition-shadow"
            >
              Get Started
            </button>
            <button
              onClick={() => goTo("/login")}
              className="rounded-full px-6 py-3 font-medium border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-colors"
            >
              I already have an account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function RobotMascot({ wink }) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3D5AFE" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <line x1="75" y1="18" x2="75" y2="34" stroke="#F5A623" strokeWidth="3" />
      <circle cx="75" cy="14" r="5" fill="#F5A623" />
      <rect x="35" y="34" width="80" height="56" rx="18" fill="url(#robotBody)" opacity="0.9" />
      <circle cx="60" cy="62" r="6" fill="#080A14" />
      {wink ? (
        <line x1="84" y1="62" x2="96" y2="62" stroke="#080A14" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <circle cx="90" cy="62" r="6" fill="#080A14" />
      )}
      <rect x="45" y="94" width="60" height="42" rx="14" fill="url(#robotBody)" opacity="0.75" />
      <circle cx="75" cy="114" r="8" fill="#F5A623">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}