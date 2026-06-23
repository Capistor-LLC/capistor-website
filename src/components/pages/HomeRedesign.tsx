import { useEffect, useRef, useState } from "react";
import Seo from "../ui/Seo";
import "./HomeRedesign.css";

const FIVERR_URL = "https://www.fiverr.com/shoaibmustafa7";

const navLinks = [
  { label: "WORK", href: "#work" },
  { label: "CAPABILITIES", href: "#capabilities" },
  { label: "REVIEWS", href: "#reviews" },
  { label: "CONTACT", href: "#contact" },
];

const capabilities = [
  { n: "01", title: "Embedded Systems", body: "Hardware-software platforms for IoT and automation — from first concept to a production-ready device." },
  { n: "02", title: "PCB Design", body: "Multi-layer boards engineered for signal integrity, thermal performance, and clean manufacturability." },
  { n: "03", title: "Firmware", body: "Robust, performant firmware for microcontrollers and embedded Linux targets." },
  { n: "04", title: "Mechanical & CAD", body: "Precise 3D models and enclosure design built for rapid prototyping and mass production." },
];

const work = [
  { n: "01", title: "Restaurant Table Pager", meta: "Wireless · LED feedback · 24h battery", img: "/redesign/pager.jpeg", bg: "#54524d" },
  { n: "02", title: "Heater Controller", meta: "4.2V @ 10A · thermal-optimized · UAE", img: "/redesign/heater-produced.jpeg", bg: "#e9e4db" },
];

const process = [
  { n: "01", title: "Consult", body: "We start with your requirements, constraints, and the outcome you need." },
  { n: "02", title: "Design", body: "Schematics, PCB layout, CAD models, and a functional prototype." },
  { n: "03", title: "Iterate", body: "Refined against testing — tuned for performance and manufacturability." },
  { n: "04", title: "Deliver", body: "Documentation, firmware, and ongoing engineering support." },
];

const stats = [
  { num: "1500+", label: "BOARDS DESIGNED" },
  { num: "EU · US · UAE", label: "MARKETS SERVED" },
  { num: "12+ yrs", label: "ENGINEERING DISCIPLINE" },
];

const reviews = [
  { quote: "He analyzed the whole project, questioned the architecture, proposed better technical solutions, and provided clear documentation explaining his decisions. Far beyond what I expected.", name: "guillaumevdr", country: "Belgium", tag: "PCB Design" },
  { quote: "Deep understanding of schematics and PCB design. He didn’t just execute what I asked — he thought everything through and suggested improvements that significantly improved my board. Exceeded my expectations.", name: "daanmem", country: "United States", tag: "PCB Design" },
  { quote: "Very proactive — not only understanding our requirements but suggesting improvements where necessary. Communication was clear and always flexible. Highly recommend.", name: "adietsche", country: "Switzerland", tag: "Custom PCB + ordering" },
  { quote: "Exceptional design for my shot-tracker. Improved the schematic with proper level shifting, a buck-boost converter, pull-up resistors and mounting notches — and tested the Gerbers on JLCPCB before delivery.", name: "jeremiahsterlin", country: "United States", tag: "PCB Design" },
  { quote: "I had no prior experience with PCB design and only a rough idea of what I needed. He guided me through, asked the right questions, and shared helpful tips. Professional, responsive, polite.", name: "jari_tfs", country: "Switzerland", tag: "Prototype board" },
  { quote: "My third project working with Shoaib. Once again he’s exceeded all expectations. Would not hesitate to recommend him to others.", name: "ks64ks64", country: "United States", tag: "Repeat client" },
];

/* Nav is isolated so its scroll-driven re-renders don't reset the body's reveal classes. */
function RedesignNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > window.innerHeight * 0.7;
      setScrolled((prev) => (prev !== s ? s : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = !scrolled;
  const navInk = dark ? "#f5f2ec" : "#1a1813";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background .5s ease, border-color .5s ease, padding .5s ease",
        background: dark ? "rgba(7,7,7,0)" : "rgba(243,239,232,0.88)",
        borderBottom: `1px solid ${dark ? "rgba(243,239,232,0)" : "rgba(0,0,0,0.08)"}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 48px", display: "flex", alignItems: "center", gap: 40 }}>
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: navInk, transition: "color .5s ease" }}>
          <img src="/redesign/logo.png" alt="Capistor" style={{ width: 26, height: 26, filter: dark ? "brightness(0) invert(1)" : "none" }} />
          <span style={{ fontWeight: 500, fontSize: 17, letterSpacing: "0.16em" }}>CAPISTOR</span>
        </a>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <span className="nav-links" style={{ display: "flex", alignItems: "center", gap: 34 }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="ul-link" style={{ textDecoration: "none", color: navInk, fontSize: 12, letterSpacing: "0.22em", fontWeight: 400, transition: "color .5s ease" }}>
                {l.label}
              </a>
            ))}
          </span>
          <a href="#contact" className="ul-link" style={{ textDecoration: "none", color: navInk, fontSize: 12, letterSpacing: "0.22em", fontWeight: 500, transition: "color .5s ease" }}>
            START A PROJECT
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function HomeRedesign() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Force the hero video to autoplay (Safari/iOS won't always honor the attribute).
  useEffect(() => {
    const v = rootRef.current?.querySelector<HTMLVideoElement>(".hero-media video");
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);

  // Scroll-driven fade-up reveals, with a safety net so nothing stays hidden.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    els.forEach((el) => el.classList.add("reveal"));
    const reveal = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of els) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
      }
    };
    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal, { passive: true });
    const t = window.setTimeout(() => els.forEach((el) => el.classList.add("in")), 1400);
    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("resize", reveal);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="home-rd" ref={rootRef} style={{ background: "#f3efe8", color: "#16140f" }}>
      <Seo
        title="Capistor — Custom hardware, engineered for production"
        description="From schematic to shipped device — embedded systems, PCB design, and firmware for IoT, industrial, and food-service teams."
        url="/"
      />

      <RedesignNav />

      {/* ===== HERO ===== */}
      <section id="top" style={{ position: "relative", minHeight: "100svh", background: "#070707", overflow: "hidden", display: "flex", alignItems: "center", padding: "96px 0 64px" }}>
        <div className="rd-px" style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 48px", width: "100%" }}>
          <div className="hero-wrap">
            <div className="hero-copy" data-reveal>
              <div style={{ fontSize: 12, letterSpacing: "0.42em", color: "rgba(243,239,232,.65)", fontWeight: 400, marginBottom: 36 }}>
                EMBEDDED SYSTEMS &nbsp;·&nbsp; PCB DESIGN &nbsp;·&nbsp; FIRMWARE
              </div>
              <h1 style={{ fontWeight: 200, fontSize: "clamp(42px,5.6vw,96px)", lineHeight: 1.03, letterSpacing: "-0.015em", color: "#f5f2ec" }}>
                Custom hardware,<br />engineered for production.
              </h1>
              <p style={{ fontWeight: 300, fontSize: "clamp(16px,1.4vw,21px)", lineHeight: 1.6, color: "rgba(243,239,232,.72)", marginTop: 32, maxWidth: 480 }}>
                From schematic to shipped device — quietly precise engineering for IoT, industrial, and food-service teams.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 46, flexWrap: "wrap" }}>
                <a href="#contact" className="ul-link" style={{ textDecoration: "none", color: "#f5f2ec", fontSize: 13, letterSpacing: "0.26em", fontWeight: 500 }}>START A PROJECT</a>
                <a href="#work" className="ul-link" style={{ textDecoration: "none", color: "rgba(243,239,232,.7)", fontSize: 13, letterSpacing: "0.26em", fontWeight: 400 }}>VIEW SELECTED WORK</a>
              </div>
            </div>
            <div className="hero-media" data-reveal>
              <div style={{ position: "absolute", inset: "-6% -10%", background: "radial-gradient(ellipse at 60% 50%,rgba(120,160,130,.18) 0%,rgba(7,7,7,0) 62%)", pointerEvents: "none" }} />
              <video src="/redesign/circular-pcb.mp4" autoPlay loop muted playsInline poster="/redesign/hero-poster.webp" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, borderTop: "1px solid rgba(243,239,232,.16)", background: "rgba(7,7,7,.4)" }}>
          <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 48px", display: "flex", flexWrap: "wrap", gap: 34, fontSize: 11, letterSpacing: "0.24em", color: "rgba(243,239,232,.5)" }}>
            <span>1500+ BOARDS DESIGNED</span><span>EU · US · UAE</span><span>IOT · INDUSTRIAL · FOOD-SERVICE</span>
          </div>
        </div>
      </section>

      {/* ===== STATEMENT + CAPABILITIES ===== */}
      <section id="capabilities" className="rd-pad" style={{ background: "#f3efe8", padding: "140px 0 130px" }}>
        <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
          <div className="rd-statement" data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 80, alignItems: "start", marginBottom: 110 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "#8a8276", paddingTop: 14 }}>WHAT WE DO</div>
            <h2 style={{ fontWeight: 200, fontSize: "clamp(28px,3.4vw,52px)", lineHeight: 1.18, letterSpacing: "-0.01em", color: "#1a1813" }}>
              We take an idea and return a manufacturable product — the schematic, the board, the firmware, the enclosure, and the documentation to build it at scale.
            </h2>
          </div>

          <div data-reveal>
            {capabilities.map((c) => (
              <div key={c.n} className="cap-row" style={{ display: "grid", gridTemplateColumns: "80px 1fr 1.3fr", gap: 40, alignItems: "baseline", padding: "34px 0", borderTop: "1px solid #d8d2c6" }}>
                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#a89f90", fontWeight: 400 }}>{c.n}</div>
                <h3 style={{ fontWeight: 300, fontSize: "clamp(22px,2.2vw,32px)", letterSpacing: "-0.005em", color: "#1a1813" }}>{c.title}</h3>
                <p style={{ fontWeight: 300, fontSize: 16, lineHeight: 1.65, color: "#6f685c" }}>{c.body}</p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #d8d2c6" }} />
          </div>
        </div>
      </section>

      {/* ===== FEATURED BUILD (dark full-bleed) ===== */}
      <section style={{ position: "relative", background: "#0b0b0a", minHeight: "88vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <img src="/redesign/macro-render.webp" alt="Capistor mixed-signal control board" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(8,8,8,.94) 0%,rgba(8,8,8,.2) 50%,rgba(8,8,8,.45) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(8,8,8,.55) 0%,rgba(8,8,8,0) 55%)" }} />
        <div className="rd-px rd-featured-copy" data-reveal style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", width: "100%", padding: "0 48px 120px" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "rgba(243,239,232,.6)", marginBottom: 26 }}>FEATURED BUILD</div>
          <h2 style={{ fontWeight: 200, fontSize: "clamp(32px,5vw,76px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "#f5f2ec", maxWidth: 900 }}>Engineered to the last component.</h2>
          <p style={{ fontWeight: 300, fontSize: "clamp(15px,1.4vw,19px)", lineHeight: 1.65, color: "rgba(243,239,232,.68)", marginTop: 28, maxWidth: 540 }}>
            A mixed-signal control board — high-density layout, clean power delivery, every footprint placed with intent.
          </p>
        </div>
      </section>

      {/* ===== SELECTED WORK ===== */}
      <section id="work" className="rd-pad" style={{ background: "#f3efe8", padding: "140px 0 130px" }}>
        <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
          <div className="rd-work-head" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "#8a8276", marginBottom: 22 }}>SELECTED WORK</div>
              <h2 style={{ fontWeight: 200, fontSize: "clamp(30px,3.6vw,56px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: "#1a1813", maxWidth: 620 }}>Boards designed for clients,<br />shipped into the field.</h2>
            </div>
            <a href="#contact" className="ul-link" style={{ textDecoration: "none", color: "#1a1813", fontSize: 12, letterSpacing: "0.24em", fontWeight: 500, paddingBottom: 10 }}>ALL PROJECTS</a>
          </div>

          <div className="rd-work-grid" data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {work.map((w) => (
              <div key={w.n} className="tile" style={{ cursor: "pointer" }}>
                <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: w.bg }}>
                  <img src={w.img} alt={w.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "24px 4px 0", borderTop: "1px solid #d8d2c6", marginTop: 22 }}>
                  <div>
                    <h3 style={{ fontWeight: 400, fontSize: 22, letterSpacing: "-0.005em", color: "#1a1813" }}>{w.title}</h3>
                    <p style={{ fontWeight: 300, fontSize: 14, color: "#8a8276", marginTop: 6, letterSpacing: "0.04em" }}>{w.meta}</p>
                  </div>
                  <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "#a89f90" }}>{w.n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS + STATS ===== */}
      <section className="rd-pad" style={{ background: "#ebe6dd", padding: "130px 0" }}>
        <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
          <div data-reveal style={{ fontSize: 12, letterSpacing: "0.34em", color: "#8a8276", marginBottom: 64 }}>HOW WE WORK</div>

          <div className="rd-process-grid" data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginBottom: 120 }}>
            {process.map((p) => (
              <div key={p.n} style={{ padding: "0 32px 0 0", borderLeft: "1px solid #d3ccbe", paddingLeft: 28 }}>
                <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#a89f90", marginBottom: 28 }}>{p.n}</div>
                <h3 style={{ fontWeight: 400, fontSize: 20, letterSpacing: "0.01em", color: "#1a1813", marginBottom: 14 }}>{p.title}</h3>
                <p style={{ fontWeight: 300, fontSize: 14, lineHeight: 1.65, color: "#6f685c" }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div className="rd-stats-grid" data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderTop: "1px solid #d3ccbe" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ padding: "48px 32px 0 0" }}>
                <div style={{ fontWeight: 200, fontSize: "clamp(40px,4.5vw,68px)", lineHeight: 1, letterSpacing: "-0.02em", color: "#1a1813" }}>{s.num}</div>
                <div style={{ fontSize: 12, letterSpacing: "0.22em", color: "#8a8276", marginTop: 18 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS (real, from Fiverr) ===== */}
      <section id="reviews" className="rd-pad" style={{ background: "#0b0b0a", padding: "140px 0 130px" }}>
        <div className="rd-px" data-reveal style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 48, flexWrap: "wrap", marginBottom: 72 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "rgba(243,239,232,.5)", marginBottom: 24 }}>CLIENT REVIEWS</div>
            <h2 style={{ fontWeight: 200, fontSize: "clamp(30px,3.6vw,56px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: "#f5f2ec", maxWidth: 560 }}>Trusted by founders and<br />engineers worldwide.</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, justifyContent: "flex-end" }}>
              <span style={{ fontWeight: 200, fontSize: "clamp(44px,4.4vw,64px)", lineHeight: 1, color: "#f5f2ec" }}>4.9</span>
              <span style={{ fontSize: 18, letterSpacing: "0.1em", color: "#c9a96a" }}>★★★★★</span>
            </div>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "rgba(243,239,232,.55)", marginTop: 14 }}>27 REVIEWS · 26 FIVE-STAR</div>
            <a href={FIVERR_URL} target="_blank" rel="noopener noreferrer" className="ul-link" style={{ display: "inline-block", textDecoration: "none", color: "#f5f2ec", fontSize: 12, letterSpacing: "0.24em", fontWeight: 500, marginTop: 18 }}>VIEW FIVERR PROFILE →</a>
          </div>
        </div>

        <div className="rev-grid" data-reveal>
          {reviews.map((r) => (
            <div key={r.name} style={{ background: "#0b0b0a", padding: "40px 36px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 13, letterSpacing: "0.18em", color: "#c9a96a", marginBottom: 24 }}>★★★★★</div>
              <p style={{ fontWeight: 300, fontSize: 16, lineHeight: 1.65, color: "rgba(243,239,232,.86)", flex: 1 }}>{r.quote}</p>
              <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(243,239,232,.12)" }}>
                <div style={{ fontSize: 14, letterSpacing: "0.04em", color: "#f5f2ec" }}>{r.name}</div>
                <div style={{ fontSize: 12, letterSpacing: "0.06em", color: "rgba(243,239,232,.5)", marginTop: 6 }}>{r.country} &nbsp;·&nbsp; {r.tag}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rd-px" data-reveal style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px", marginTop: 44 }}>
          <p style={{ fontSize: 13, letterSpacing: "0.04em", color: "rgba(243,239,232,.45)", lineHeight: 1.6 }}>
            Verified reviews for Capistor&apos;s lead engineer, Shoaib Mustafa, on Fiverr.{" "}
            <a href={FIVERR_URL} target="_blank" rel="noopener noreferrer" className="ul-link" style={{ color: "rgba(243,239,232,.8)", textDecoration: "none" }}>Read all 27 →</a>
          </p>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="rd-pad" style={{ background: "#f3efe8", padding: "150px 0 130px" }}>
        <div className="rd-px" data-reveal style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "#8a8276", marginBottom: 40 }}>START A PROJECT</div>
          <div className="rd-contact-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 80, alignItems: "end" }}>
            <h2 style={{ fontWeight: 200, fontSize: "clamp(36px,5.2vw,84px)", lineHeight: 1.03, letterSpacing: "-0.02em", color: "#1a1813" }}>Tell us what<br />you want to build.</h2>
            <div style={{ paddingBottom: 14 }}>
              <p style={{ fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "#6f685c", marginBottom: 34 }}>Send the brief, the constraints, or just the idea. We&apos;ll come back with a path to a manufacturable product.</p>
              <a href="mailto:inquiry@capistor.com" className="ul-link" style={{ display: "inline-block", textDecoration: "none", color: "#1a1813", fontSize: "clamp(18px,1.8vw,26px)", fontWeight: 300, letterSpacing: "0.01em" }}>inquiry@capistor.com</a>
              <div style={{ marginTop: 18, fontSize: 14, letterSpacing: "0.06em", color: "#8a8276" }}>+971 508 726 178 &nbsp;·&nbsp; Silicon Oasis, Dubai</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: "#0b0b0a", padding: "70px 0 44px" }}>
        <div className="rd-px" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40, paddingBottom: 54, borderBottom: "1px solid rgba(243,239,232,.14)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/redesign/logo.png" alt="Capistor" style={{ width: 26, height: 26, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
              <span style={{ color: "#f5f2ec", fontWeight: 500, fontSize: 17, letterSpacing: "0.16em" }}>CAPISTOR</span>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="ul-link" style={{ textDecoration: "none", color: "rgba(243,239,232,.7)", fontSize: 12, letterSpacing: "0.2em" }}>{l.label}</a>
              ))}
              <a href={FIVERR_URL} target="_blank" rel="noopener noreferrer" className="ul-link" style={{ textDecoration: "none", color: "rgba(243,239,232,.7)", fontSize: 12, letterSpacing: "0.2em" }}>FIVERR</a>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, paddingTop: 28 }}>
            <span style={{ color: "rgba(243,239,232,.4)", fontSize: 12, letterSpacing: "0.12em" }}>© 2026 CAPISTOR — SILICON OASIS, DUBAI, UAE</span>
            <span style={{ color: "rgba(243,239,232,.4)", fontSize: 12, letterSpacing: "0.12em" }}>EMBEDDED SYSTEMS · PCB DESIGN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
