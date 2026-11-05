/* eslint-disable @next/next/no-img-element */
// app/page.tsx — Next.js (App Router) + Tailwind CSS v3
// ภาพอยู่ที่ public/cbot/*  (hero.jpg, banner.jpg, poster.jpg และ sprite ของ C-BOT ที่ตัดแล้ว)

import { Kanit, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const kanit = Kanit({ subsets: ["thai", "latin"], weight: ["500", "700", "800"], style: ["normal", "italic"], variable: "--f-kanit" });
const body = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--f-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono" });

const css = `
.fd{font-family:var(--f-kanit),sans-serif;font-style:italic;font-weight:800}
.fm{font-family:var(--f-mono),monospace}
.scan{position:relative}
.scan::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px)}
.gridbg{background-color:#040a1c;background-image:linear-gradient(rgba(56,189,248,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.05) 1px,transparent 1px);background-size:44px 44px}
.cut{clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,26px 100%,0 calc(100% - 26px))}
.scan{position:relative}
.scan::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 3px)}
.cut2{clip-path:polygon(26px 0,100% 0,100% calc(100% - 26px),calc(100% - 26px) 100%,0 100%,0 26px)}
.glow{text-shadow:3px 3px 0 #facc15,-2px -1px 0 #22d3ee}
.stroke{color:transparent;-webkit-text-stroke:1.5px rgba(34,211,238,.55)}
.stroke-y{color:transparent;-webkit-text-stroke:1.5px rgba(250,204,21,.45)}
.slice{transform:translateY(var(--y));transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.slice:has(.sl:hover){transform:translateY(calc(var(--y) - 3%)) scale(1.025);z-index:6!important}
.sl{transition:filter .3s}.sl:hover{filter:brightness(1.12) saturate(1.15)}
.pn{transition:transform .4s cubic-bezier(.2,.8,.2,1),filter .3s}.pn:hover{transform:translateY(-10px) scale(1.02);filter:brightness(1.1);z-index:8!important}
.mode{transform:skewX(-3deg);transition:transform .35s cubic-bezier(.2,.8,.2,1),filter .35s}
.mode:hover{transform:skewX(-3deg) translateY(-14px) scale(1.04);filter:brightness(1.15);z-index:3}
.msp{transform:translateX(-50%) skewX(3deg);transition:transform .35s}
.mode:hover .msp{transform:translateX(-50%) skewX(3deg) scale(1.12) translateY(-6px)}
.stepbox{transform:skewX(-8deg);transition:transform .25s,filter .25s}
.stepbox:hover{transform:skewX(-8deg) translateY(-6px);filter:brightness(1.2)}
.lesson{transition:transform .3s,filter .3s}.lesson:hover{transform:translateY(-6px);filter:brightness(1.12)}
.lsp{transition:transform .35s}.lesson:hover .lsp{transform:scale(1.12) rotate(-3deg)}
.lnum{transition:transform .5s}.lesson:hover .lnum{transform:translateX(12px)}
.hot{transition:transform .25s,box-shadow .25s,background .25s}
.hot:hover{transform:translateY(-4px);background:rgba(255,255,255,.14);box-shadow:0 0 26px rgba(34,211,238,.75)}
.bh .bsp{transition:transform .5s cubic-bezier(.2,.8,.2,1)}.bh:hover .bsp{transform:translateX(-50%) translateY(-2.5%) scale(1.04)}
.bh .bt{transition:transform .5s cubic-bezier(.2,.8,.2,1)}.bh:hover .bt{transform:translateX(-1.5%)}
.bh .bw{transition:transform .3s}.bh:hover .bw{transform:rotate(-3deg) scale(1.06)}
a:focus-visible,button:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
.hazard{background:repeating-linear-gradient(135deg,#facc15 0 14px,#111 14px 28px)}
`;

const tag = "fm text-[11px] tracking-[0.3em] text-cyan-300";

function Title({ no, children, sub }: { no: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-10 text-center">
      <p className={tag}>// {no}</p>
      <h2 className="fd glow mt-3 text-4xl text-white md:text-5xl">{children}</h2>
      {sub && <p className="mt-3 text-sm text-blue-100/70">{sub}</p>}
    </div>
  );
}

const missions = [
  { n: "01", en: "LEARN", th: "เรียนพื้นฐานทีละบท", ab: "EXPLAIN", pos: "100% 22%", size: "175% auto", c: "cyan" },
  { n: "02", en: "CODE", th: "ลงมือเขียนโค้ดจริง", ab: "DEBUG", pos: "100% 68%", size: "175% auto", c: "yellow" },
  { n: "03", en: "CREATE", th: "สร้างโปรเจกต์ของตัวเอง", ab: "LEVEL UP", pos: "100% 92%", size: "140% auto", c: "cyan" },
];

const modes = [
  { n: "01", t: "EXPLAIN", d: "อธิบายโค้ดทีละบรรทัด", img: "ex_smile", bg: "linear-gradient(#2f7bff,#0b2a7a)", tc: "text-white" },
  { n: "02", t: "THINK", d: "คิดก่อนเขียน แตกปัญหาให้เล็ก", img: "ex_think", bg: "linear-gradient(#22d3ee,#0b3a7a)", tc: "text-white" },
  { n: "03", t: "DEBUG", d: "เจอ Error ไม่ต้องกลัว", img: "ex_angry", bg: "linear-gradient(#facc15,#4a3b10)", tc: "text-yellow-300" },
  { n: "04", t: "BUILD", d: "ลงมือเขียนเองทุกบท", img: "ch_laptop", bg: "linear-gradient(#5b3df0,#1a1060)", tc: "text-white" },
  { n: "05", t: "LEVEL UP", d: "ผ่านด่านแล้วฉลองด้วยกัน", img: "ch_jump", bg: "linear-gradient(#1d6fff,#06163f)", tc: "text-white" },
];

const steps = [
  { n: "01 · SOURCE", t: "main.c", d: "โค้ดที่คุณเขียน", bg: "#0b1d4d" },
  { n: "02 · PREPROCESS", t: "#include", d: "ขยายคำสั่ง # ก่อน", bg: "#0d2c78" },
  { n: "03 · COMPILE", t: "แปลงโค้ด", d: "เป็นภาษาเครื่อง", bg: "#1146c8" },
  { n: "04 · LINK", t: "รวมไลบรารี", d: "เชื่อมทุกชิ้นเข้าด้วยกัน", bg: "#1f7bff" },
  { n: "05 · RUN", t: "./main", d: "รันโปรแกรมได้เลย", bg: "linear-gradient(#ffd84a,#f5b50a)", dark: true },
];

const lessons = [
  { t: "Hello, World", th: "เริ่มต้นและคอมไพล์", code: 'printf("Hello");', img: "ex_smile", bg: "linear-gradient(100deg,#1a3fc7,#2f7bff)" },
  { t: "Variables", th: "ตัวแปรและชนิดข้อมูล", code: "int age = 20;", img: "ex_neutral", bg: "linear-gradient(100deg,#1f8bff,#2ec4ff)" },
  { t: "Operators", th: "ตัวดำเนินการ", code: "a + b * 2", img: "ex_conf", bg: "linear-gradient(100deg,#5b3df0,#3d2bb5)" },
  { t: "if / else", th: "เงื่อนไข", code: "if (x > 0)", img: "ch_laptop", bg: "linear-gradient(100deg,#0d3fa8,#1763e8)" },
  { t: "Loops", th: "วนซ้ำ", code: "for (i=0;i<5;i++)", img: "ch_jump", bg: "linear-gradient(100deg,#ffd84a,#f5b50a)", dark: true },
  { t: "Functions", th: "ฟังก์ชัน", code: "int add(int a, int b)", img: "ch_laptop", bg: "linear-gradient(100deg,#1146c8,#1f7bff)" },
  { t: "Arrays", th: "อาร์เรย์", code: "int a[5] = {1,2,3};", img: "front", bg: "linear-gradient(100deg,#22b8f5,#1d8be8)", tall: true },
  { t: "Strings", th: "สตริง", code: 'char s[] = "C";', img: "ch_sleep", bg: "linear-gradient(100deg,#5b3df0,#4a2fd0)" },
  { t: "Pointers", th: "พอยน์เตอร์", code: "int *p = &x;", img: "ex_angry", bg: "linear-gradient(100deg,#0d3fa8,#1763e8)", boss: true },
  { t: "Structs", th: "โครงสร้างข้อมูล", code: "struct Point { int x; };", img: "ch_jump", bg: "linear-gradient(100deg,#2f7bff,#6a45f0)" },
];

export default function Page() {
  return (
    <main className={`${kanit.variable} ${body.variable} ${mono.variable} gridbg overflow-x-hidden text-white`} style={{ fontFamily: "var(--f-body),sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
     {/* NAV */}
<header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-white px-6 py-5 shadow-[0_4px_24px_rgba(10,40,120,0.18)] md:px-10 md:py-6">
  <div className="flex items-center gap-3">
   <div className="flex items-center gap-3">
  <img src="/cbot/logo.png" alt="CodeLearn" className="h-12 w-auto" />
  <div className="leading-none">
    <p className="fd text-base not-italic text-[#06143f]">CODE<span className="text-blue-600">LEARN</span></p>
    <p className="fm mt-1 text-[8px] tracking-[0.25em] text-slate-500">LEARN · CODE · CREATE</p>
  </div>
</div>
   
  </div>
  <nav className="hidden items-center gap-7 text-xs md:flex">
    {/* {[["#", "หน้าแรก"], ...].map(...)} */}
   <Link
  href="/Login"
  className="group relative inline-flex w-36 items-center justify-center overflow-hidden rounded-full border-2 border-[#1D4ED8] px-6 py-3 text-[18px] font-bold text-[#1D4ED8] transition-colors duration-500 hover:text-white"
>
  <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[#1D4ED8] transition-transform duration-500 ease-out group-hover:scale-[25]" />
  <span className="relative z-10">Login</span>
</Link>
  </nav>
</header>

      {/* HERO */}
      <section className="relative">
        <div className="relative w-full" style={{ clipPath: "polygon(0 0,100% 0,100% 90%,0 100%)" }}>
          <img src="/cbot/hero.jpg" alt="CodeLearn เรียนรู้ภาษา C" className="block w-full" />
          {[["4.6%", "69%", "9%", "14%", "#path"], ["15.4%", "69%", "9%", "14%", "#topics"], ["26%", "69%", "9%", "14%", "#cta"]].map(([l, t, w, h, href]) => (
            <a key={l} href={href} aria-label="เมนูลัด" className="hot absolute rounded-2xl" style={{ left: l, top: t, width: w, height: h }} />
          ))}
       <Link className="hero-start" href="/Login" aria-label="Start Learning">
          <Image
            src="/cbot/start-learning-btn.png"
            alt="Start Learning"
            width={422}
            height={106}
            priority
            className="hero-start__img"
          />
        </Link>
        </div>
      </section>

      {/* 01 C-BOT */}
      <section className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className={tag}>// 01 · UNIT-C · ONLINE</p>
          <h1 className="fd mt-6 text-7xl leading-none md:text-8xl" style={{ textShadow: "4px 4px 0 #0a58ff, -1px -1px 0 #facc15" }}>C-BOT</h1>
          <p className="fd mt-4 text-2xl text-cyan-300">ผู้ช่วยสอนภาษา C ของคุณ</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/75">เพื่อนร่วมทางที่คอยอธิบาย ชวนคิด ช่วยดีบัก และฉลองให้ทุกครั้งที่คุณเขียนโปรแกรมผ่าน</p>
          <div className="fm mt-6 flex gap-3 text-[10px] tracking-widest">
            <span className="border-b border-cyan-400 px-3 py-2 text-cyan-300 transition hover:bg-cyan-400/15 hover:-translate-y-0.5">EXPLAIN</span>
            <span className="border-b border-cyan-400 px-3 py-2 text-cyan-300 transition hover:bg-cyan-400/15 hover:-translate-y-0.5">DEBUG</span>
            <span className="border-b border-yellow-400 px-3 py-2 text-yellow-300 transition hover:bg-yellow-400/15 hover:-translate-y-0.5">LEVEL UP</span>
          </div>
        </div>
        <div className="group relative mx-auto w-full max-w-[340px] transition duration-500 hover:-translate-y-2 hover:-rotate-1">
          <div className="absolute -left-3 -top-3 h-10 w-10 border-l-2 border-t-2 border-yellow-300" />
          <div className="absolute -bottom-3 -right-3 h-10 w-10 border-b-2 border-r-2 border-yellow-300" />
          <div className="absolute inset-0 translate-x-3 translate-y-3 bg-blue-600 shadow-[0_0_40px_#1d6fff] transition duration-500 group-hover:translate-x-5 group-hover:translate-y-5" />
          <img src="/cbot/poster.jpg" alt="C/CODE programming mascot" className="relative block w-full" />
          <span className="fm absolute -right-4 top-14 bg-[#06122e] px-3 py-1.5 text-[10px] text-cyan-300 ring-1 ring-cyan-400">▸ HELLO, C!</span>
          <span className="fm absolute -left-8 bottom-24 bg-[#06122e] px-3 py-1.5 text-[10px] text-yellow-300 ring-1 ring-yellow-400">▸ CODE · LEARN · CREATE</span>
        </div>
      </section>

      {/* 02 IN ACTION */}
      <section className="mx-auto max-w-[1180px] px-6 pb-24">
        <Title no="02 · IN ACTION" sub="ผ่านด่านทีละบท ลงมือเขียนได้จริง มี C-Bot คอยช่วยตลอดทาง">
          เรียนภาษา C <span className="text-cyan-300">แบบเล่นเกม</span>
        </Title>
        <div className="relative mx-auto aspect-video w-full">
          {[0, 1, 2, 3, 4].map((i) => {
            const sl = 3.2, x0 = i * 20, x1 = (i + 1) * 20;
            const a = i === 0 ? 0 : x0 + sl, b = i === 4 ? 100 : x1 + sl - 0.5, c = i === 4 ? 100 : x1 - 0.5, d = i === 0 ? 0 : x0;
            const off = [0, 2.5, 0, 1.8, 0.8][i];
            return (
              <div key={i} className="slice pointer-events-none absolute inset-0" style={{ ["--y" as string]: `${off}%`, zIndex: i === 2 ? 3 : 1, filter: "drop-shadow(0 0 14px rgba(34,211,238,.5))" }}>
                <div className="sl pointer-events-auto absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/cbot/banner.jpg)", clipPath: `polygon(${a}% 0,${b}% 0,${c}% 100%,${d}% 100%)` }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* 03 MISSION */}
      <section id="path" className="mx-auto max-w-[1180px] px-6 pb-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className={tag}>// 03 · MISSION BRIEF</p>
            <h2 className="fd mt-3 text-4xl md:text-5xl">เรียน · เขียน · <span className="text-yellow-300">สร้าง</span></h2>
          </div>
          <p className="hidden max-w-xs text-sm text-blue-100/70 md:block">สามขั้นสู่การเป็นนักพัฒนาภาษา C และ C-Bot อยู่ด้วยทุกขั้น</p>
        </div>
        <div className="space-y-4">
          {missions.map((m) => (
            <div key={m.n} className="group scan cut2 relative h-[150px] overflow-hidden md:h-[200px]">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "linear-gradient(90deg,rgba(4,10,28,.85),rgba(4,10,28,.2) 55%,transparent),url(/cbot/" + (m.n === "03" ? "banner" : "hero") + ".jpg)", backgroundSize: "auto, " + m.size, backgroundPosition: "0 0, " + m.pos, backgroundRepeat: "no-repeat" }} />
              <span className={`fd absolute bottom-0 left-6 text-[120px] leading-[0.8] transition duration-500 group-hover:translate-x-4 group-hover:opacity-100 md:text-[170px] ${m.c === "yellow" ? "stroke-y" : "stroke"}`}>{m.en}</span>
              <div className="absolute left-8 top-1/2 z-10 -translate-y-1/2 border border-cyan-400/50 bg-[#06122e]/85 px-5 py-3 transition duration-300 group-hover:border-cyan-300 group-hover:bg-[#0a1f5c]">
                <p className={`fm text-[9px] tracking-widest ${m.c === "yellow" ? "text-yellow-300" : "text-cyan-300"}`}>C-BOT · MODE {m.n}</p>
                <p className="fd text-2xl">{m.en}</p>
                <p className="text-[11px] text-blue-100/80">{m.th}</p>
              </div>
              <span className={`fm absolute bottom-5 right-8 z-10 border bg-[#06122e]/85 px-3 py-1.5 text-[9px] tracking-widest transition duration-300 group-hover:-translate-y-1 ${m.c === "yellow" ? "border-yellow-400 text-yellow-300" : "border-cyan-400 text-cyan-300"}`}>ABILITY · {m.ab}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 04 MODES */}
      <section className="mx-auto max-w-[1100px] px-6 pb-24">
        <Title no="04 · C-BOT MODES" sub="C-Bot เปลี่ยนท่าตามสถานการณ์ในการเขียนโค้ดของคุณ">
          5 โหมด <span className="text-cyan-300">5 อารมณ์</span>
        </Title>
        <div className="flex justify-center">
          {modes.map((m, i) => (
            <div key={m.t} className="mode relative h-[360px] flex-1 cursor-pointer overflow-hidden" style={{ background: m.bg, marginTop: [0, 8, 0, 10, 0][i], marginLeft: i ? 4 : 0 }}>
              <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[18px] border-x-transparent border-t-[#050b1c]/80" />
              <img src={`/cbot/${m.img}.png`} alt={m.t} className="msp absolute left-1/2 top-8 h-[190px] object-contain" />
              <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#050b1c] via-[#050b1c]/85 to-transparent" />
              <div className="absolute inset-x-4 bottom-5" style={{ transform: "skewX(3deg)" }}>
                <p className="fm text-[9px] tracking-widest text-blue-200/80">{m.n} ▸ MODE</p>
                <p className={`fd text-2xl ${m.tc}`}>{m.t}</p>
                <p className="mt-1 text-[11px] text-blue-100/80">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 PROFILE */}
      <section className="mx-auto max-w-[920px] px-6 pb-24">
        <p className={`${tag} mb-8 text-center`}>// 05 · PROFILE</p>
        <div className="scan cut relative h-[440px] overflow-hidden md:h-[480px]" style={{ background: "linear-gradient(#c3d8ff,#4a86ff)" }}>
          <div className="absolute left-1/2 top-[48%] h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 bg-[#ffd33d]" style={{ clipPath: "polygon(50% 0,60% 30%,95% 15%,72% 45%,100% 55%,68% 65%,85% 98%,52% 75%,30% 100%,34% 68%,0 62%,30% 45%,8% 18%,40% 30%)" }} />
          <img src="/cbot/main.png" alt="C-BOT" className="absolute left-1/2 top-4 z-10 h-[92%] -translate-x-1/2 object-contain" />
          <h3 className="fd absolute left-8 top-5 z-20 text-6xl text-[#07133d] md:text-7xl" style={{ textShadow: "3px 3px 0 #fff" }}>C-BOT</h3>
          <p className="fd absolute left-9 top-[100px] z-20 -skew-x-6 bg-[#07133d] px-4 py-1.5 text-sm text-yellow-300 md:top-[112px]">เรียนภาษา C ไปกับฉัน</p>
          <div className="absolute left-8 top-[200px] z-20 hidden w-[140px] border-2 border-[#07133d] bg-white text-[#07133d] md:block">
            <p className="fm bg-[#07133d] px-2 py-1 text-[8px] text-white">C-BOT · UNIT-C</p>
            {[["ROLE", "MENTOR"], ["LANG", "C"], ["SKILL", "DEBUG"]].map(([a, b]) => (
              <p key={a} className="fm flex justify-between border-t px-2 py-0.5 text-[8px]"><span className="text-blue-800/70">{a}</span><b>{b}</b></p>
            ))}
          </div>
          <div className="absolute right-8 top-[210px] z-20 hidden w-[150px] bg-[#06122e] md:block">
            <p className="fm border-b border-white/10 px-2 py-1 text-[8px] text-blue-200">● ● ● main.c</p>
            <pre className="fm px-2 py-2 text-[8px] leading-4 text-cyan-200">{`int main() {\n  printf("Hello, C!");\n  return 0;\n}`}</pre>
          </div>
          <div className="absolute right-6 top-5 z-20 grid h-[84px] w-[84px] place-items-center bg-[#0a1f5c] text-center" style={{ clipPath: "polygon(50% 0,60% 18%,82% 8%,80% 30%,100% 38%,84% 54%,96% 76%,72% 74%,66% 100%,50% 84%,34% 100%,28% 74%,4% 76%,16% 54%,0 38%,20% 30%,18% 8%,40% 18%)" }}>
            <p className="fm text-[8px] text-cyan-300">NEW<br /><span className="fd text-sm text-yellow-300">LESSON<br />01</span></p>
          </div>
          <div className="absolute bottom-6 left-8 z-20 max-w-[220px]">
            <p className="fd text-3xl leading-tight text-[#07133d]">เขียนโค้ด<br />ให้สนุก</p>
            <p className="mt-1 text-[11px] text-[#07133d]/70">เรียนรู้ทีละขั้น ผิดได้ ลองใหม่ได้ แล้วเก่งขึ้นทุกวัน</p>
          </div>
          <span className="fd absolute bottom-8 right-8 z-20 rotate-[-4deg] bg-yellow-300 px-4 py-2 text-sm text-[#07133d] ring-2 ring-[#07133d]">HELLO, C!</span>
          <span className="fm absolute bottom-3 right-8 z-20 text-[8px] tracking-widest text-[#07133d]">CODE · LEARN · CREATE</span>
        </div>
      </section>

      {/* COLLAGE */}
      <section className="mx-auto mb-20 max-w-[1180px] px-6">
        <div className="relative w-full aspect-[3.1/1]">
          <div className="pn absolute left-0 top-[6%] h-[94%] w-[40%]" style={{ filter: "drop-shadow(0 0 16px rgba(34,211,238,.5))" }}>
            <img src="/cbot/banner.jpg" alt="" className="h-full w-full object-cover object-left" style={{ clipPath: "polygon(0 24%,100% 0,86% 100%,36% 100%,0 66%)" }} />
          </div>
          <div className="pn absolute left-[32%] top-[-4%] z-[2] h-[104%] w-[29%]" style={{ filter: "drop-shadow(0 0 16px rgba(34,211,238,.5))" }}>
            <img src="/cbot/poster.jpg" alt="" className="h-full w-full object-cover" style={{ objectPosition: "50% 34%", clipPath: "polygon(9% 0,100% 5%,100% 100%,0 100%)" }} />
          </div>
          <div className="pn absolute left-[58%] top-0 h-[54%] w-[40%]" style={{ filter: "drop-shadow(0 0 16px rgba(34,211,238,.5))" }}>
            <img src="/cbot/banner.jpg" alt="" className="h-full w-full object-cover" style={{ objectPosition: "88% 12%", clipPath: "polygon(5% 0,100% 0,100% 100%,0 100%)" }} />
          </div>
          <div className="pn absolute left-[62%] top-[50%] h-[50%] w-[31%]" style={{ filter: "drop-shadow(0 0 16px rgba(34,211,238,.5))" }}>
            <img src="/cbot/expr.jpg" alt="" className="h-full w-full object-cover" style={{ clipPath: "polygon(0 0,100% 7%,100% 100%,0 100%)" }} />
          </div>
          <div className="absolute bottom-0 left-[20%] z-[3] h-[58%] w-[13%] bg-cyan-400" style={{ clipPath: "polygon(0 100%,100% 100%,100% 0)" }} />
          <img src="/cbot/ch_jump.png" alt="" className="pointer-events-none absolute bottom-0 left-[22%] z-[4] h-[40%] object-contain" />
          <p className="fd stroke pointer-events-none absolute -bottom-[12%] left-[3%] z-[4] text-[clamp(30px,6.2vw,76px)] leading-[0.95]">CODE<br />LEARN<br />CREATE</p>
        </div>
      </section>

      {/* 06 START */}
      <section className="px-6 pb-28 pt-16 md:pt-24">
        <Title no="06 · START HERE" sub="เลือกด่านแรก แล้วให้ C-Bot พาไปต่อ">
          ภารกิจของคุณ<span className="text-yellow-300">เริ่มที่นี่</span>
        </Title>
      </section>

      {/* 07 BUG HUNTER */}
      <section className="mx-auto max-w-[1000px] px-6 pb-28">
        <p className={`${tag} text-center`}>// 07 · BUG HUNTER</p>
        <p className="mb-8 mt-3 text-center text-sm text-blue-100/80">เจอ Error ไม่ใช่เรื่องน่าอาย เรียนรู้จากบั๊กทีละตัวไปพร้อม C-Bot</p>
        <div style={{ containerType: "inline-size" }}>
          <div className="bh scan cut relative aspect-[710/500] w-full overflow-hidden bg-[#e9eff9] text-[#06143f]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 710 500" preserveAspectRatio="none">
              <line x1="165" y1="0" x2="300" y2="330" stroke="#facc15" strokeWidth="7" />
              <line x1="710" y1="228" x2="390" y2="372" stroke="#22d3ee" strokeWidth="9" />
              <line x1="0" y1="330" x2="300" y2="420" stroke="#22d3ee" strokeWidth="6" />
              <line x1="0" y1="440" x2="360" y2="372" stroke="#1d5df0" strokeWidth="8" />
              <line x1="710" y1="268" x2="400" y2="400" stroke="#1d5df0" strokeWidth="6" />
              <line x1="400" y1="370" x2="710" y2="440" stroke="#facc15" strokeWidth="8" />
              <line x1="0" y1="62" x2="560" y2="500" stroke="#06143f" strokeWidth="5" />
            </svg>
            <p className="fm absolute left-[3%] top-[4%] text-[1.5cqw] tracking-widest" style={{ fontSize: "1.6cqw" }}>CODELEARN</p>
            <span className="absolute left-1/2 top-[3%] grid -translate-x-1/2 place-items-center bg-blue-700 font-bold text-white" style={{ width: "4.6cqw", height: "4.6cqw", fontSize: "2.4cqw", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>C</span>
            <p className="fd absolute right-[3%] top-[3%] text-blue-800" style={{ fontSize: "3cqw" }}>LV.07</p>
            <h3 className="bt absolute left-[3%] top-[9%] font-black" style={{ fontFamily: "var(--f-kanit),sans-serif", fontSize: "15.5cqw", lineHeight: 0.84, letterSpacing: "-0.02em" }}>
              BUG<br /><span className="text-[#1659e8]">HUNTERS</span>
            </h3>
            <img src="/cbot/front.png" alt="C-BOT" className="bsp absolute bottom-[0%] left-[52%] z-10 -translate-x-1/2 object-contain drop-shadow-[0_10px_18px_rgba(10,40,120,.4)]" style={{ height: "88%" }} />
            <p className="fd bt absolute left-[3%]" style={{ top: "52%", fontSize: "5cqw", lineHeight: 1 }}>นักล่าบั๊ก</p>
            <p className="bt absolute left-[3%] font-bold" style={{ top: "63%", fontSize: "2.6cqw" }}>MEET</p>
            <p className="fd bt absolute left-[3%] text-[#1659e8]" style={{ top: "67.5%", fontSize: "8.2cqw", lineHeight: 1 }}>C-BOT</p>
            <span className="fm absolute z-20 bg-[#06143f] text-white [writing-mode:vertical-rl]" style={{ left: "33%", top: "36%", padding: "1cqw .4cqw", fontSize: "1.2cqw", letterSpacing: ".2em" }}>NULL POINTER</span>
            <span className="fm absolute z-20 bg-[#1659e8] text-white [writing-mode:vertical-rl]" style={{ left: "67.5%", top: "27%", padding: "1cqw .4cqw", fontSize: "1.2cqw", letterSpacing: ".2em" }}>SEGFAULT</span>
            <span className="fd absolute z-20 bg-[#06143f] text-white" style={{ right: "3%", top: "38%", padding: ".5cqw 2cqw", fontSize: "2.8cqw" }}>C-BOT</span>
            <p className="bw fd absolute z-20 text-[#1659e8]" style={{ left: "49%", bottom: "7%", fontSize: "8cqw", lineHeight: 1 }}>WANTED</p>
            <p className="fm absolute z-20 bg-[#06143f] text-yellow-300" style={{ left: "58%", bottom: "4%", padding: ".3cqw 1cqw", fontSize: "1.2cqw" }}>BUGS · DEAD OR ALIVE</p>
            <p className="fm absolute text-right" style={{ right: "3%", bottom: "3%", fontSize: "1.2cqw", lineHeight: 1.6 }}>SEGFAULT<br />MEMORY LEAK<br />INFINITE LOOP<br />OFF-BY-ONE</p>
            <p className="fd absolute bg-[#06143f] text-white" style={{ left: "3%", bottom: "4%", padding: "1cqw 1.6cqw", fontSize: "1.9cqw", lineHeight: 1.15 }}>ENTIRE<br />PROGRAM</p>
          </div>
        </div>
      </section>

      {/* 08 COMPILE */}
      <section className="mx-auto max-w-[1180px] px-6 pb-28">
        <p className={tag}>// 08 · COMPILE</p>
        <h2 className="fd mt-3 text-4xl md:text-5xl">จากโค้ด <span className="text-cyan-300">สู่โปรแกรม</span></h2>
        <p className="mt-2 text-sm text-blue-100/70">คอมไพเลอร์ gcc แปลงไฟล์ .c ของคุณให้กลายเป็นโปรแกรมที่รันได้</p>
        <div className="mt-10 grid items-center gap-8 md:grid-cols-[170px_1fr]">
          <div className="mx-auto h-[300px] drop-shadow-[0_0_28px_rgba(34,211,238,.6)]"><img src="/cbot/side.png" alt="" className="h-full object-contain" /></div>
          <div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {steps.map((s) => (
                <div key={s.t}>
                  <div className="stepbox h-[66px] cursor-pointer border border-cyan-400/20 px-3 py-2" style={{ background: s.bg, color: s.dark ? "#1a1300" : "#fff" }}>
                    <p className="fm text-[8px] tracking-widest" style={{ color: s.dark ? "#4a3b00" : "#7dd3fc" }}>{s.n}</p>
                    <p className="fd text-lg">{s.t}</p>
                  </div>
                  <p className="mt-2 text-[11px] text-blue-100/70">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border border-cyan-400/20 bg-[#040b1f]">
              <p className="fm border-b border-cyan-400/20 px-4 py-2 text-[10px] text-blue-200"><span className="text-red-400">●</span> <span className="text-yellow-300">●</span> <span className="text-green-400">●</span>&nbsp; terminal</p>
              <pre className="fm space-y-1 px-5 py-4 text-xs leading-7"><span className="text-cyan-300">$</span> gcc main.c -o main{"\n"}<span className="text-cyan-300">$</span> ./main{"\n"}<span className="text-yellow-300">Hello, C!</span></pre>
            </div>
          </div>
        </div>
      </section>

      {/* 09 HELLO C */}
      <section className="mx-auto max-w-[1180px] px-6 pb-28">
        <div className="scan cut2 relative h-[390px] overflow-hidden" style={{ background: "linear-gradient(120deg,#2a6cff,#2fb7ff 60%,#4be0ff)" }}>
          <span className="fd absolute left-10 top-24 select-none text-[170px] leading-none text-white/15">PRINT</span>
          <p className="fm absolute left-8 top-5 text-[10px] tracking-[0.3em] text-white/80">// 09 · FIRST PROGRAM</p>
          <h3 className="fd absolute left-8 top-10 text-6xl">HELLO, C!</h3>
          <p className="absolute left-8 top-[110px] text-sm text-white/85">โปรแกรมแรกของคุณ ใช้แค่ 5 บรรทัด</p>
          <div className="absolute left-8 top-[150px] z-10 w-[290px] bg-[#06122e] shadow-xl">
            <p className="fm border-b border-white/10 px-3 py-1.5 text-[9px] text-blue-200"><span className="text-red-400">●</span> <span className="text-yellow-300">●</span> <span className="text-green-400">●</span> main.c</p>
            <pre className="fm px-3 py-3 text-[10px] leading-5 text-cyan-200">{`#include <stdio.h>\nint main() {\n  printf("Hello, C!");\n  return 0;\n}`}</pre>
          </div>
          <p className="fm absolute bottom-6 left-8 bg-[#06122e] px-4 py-2 text-[11px] text-cyan-300">&gt; Hello, C!</p>
          <span className="fm absolute right-20 top-5 rounded-full bg-[#06122e] px-4 py-1.5 text-[9px] text-cyan-300">● RUN</span>
          <div className="absolute right-6 top-0 h-[150px] w-[170px] bg-[#ffd84a]" style={{ clipPath: "polygon(30% 0,100% 0,100% 100%,0 70%)" }} />
          <img src="/cbot/ch_laptop.png" alt="" className="absolute bottom-3 right-[18%] z-10 h-[300px] object-contain md:right-[16%]" />
          <span className="fm absolute right-[34%] top-[110px] z-10 bg-white px-2 py-1 text-[10px] text-[#06122e] shadow-[2px_2px_0_#06122e]">int main()</span>
          <span className="fm absolute right-[9%] top-[225px] z-10 bg-[#ffd84a] px-2 py-1 text-[10px] text-[#06122e] shadow-[2px_2px_0_#06122e]">return 0;</span>
          <span className="fm absolute bottom-6 right-[27%] z-20 bg-white px-2 py-1 text-[10px] text-[#06122e] shadow-[2px_2px_0_#06122e]">#include</span>
        </div>
      </section>

      {/* 10 TOPICS */}
      <section id="topics" className="mx-auto max-w-[1180px] px-6 pb-28">
        <Title no="10 · TOPICS" sub="จากบรรทัดแรกถึงโครงสร้างข้อมูล เรียนครบในเส้นทางเดียว">
          10 หัวข้อ <span className="text-cyan-300">ที่ต้องรู้</span>
        </Title>
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((l, i) => (
            <div key={l.t} className="lesson scan cut relative h-[130px] cursor-pointer overflow-hidden md:h-[140px]" style={{ background: l.bg, color: l.dark ? "#1a1300" : "#fff" }}>
              <span className="lnum fd absolute -bottom-3 left-5 text-[110px] leading-none" style={{ color: "transparent", WebkitTextStroke: `1.5px ${l.dark ? "rgba(26,19,0,.2)" : "rgba(255,255,255,.22)"}` }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="absolute left-5 top-3">
                <p className="fm text-[8px] tracking-widest" style={{ opacity: 0.8 }}>LESSON {String(i + 1).padStart(2, "0")}{l.boss && <span className="text-yellow-300"> · BOSS</span>}</p>
                <p className={`fd text-3xl ${l.boss ? "text-yellow-300" : ""}`}>{l.t}</p>
                <p className="text-[11px]" style={{ opacity: 0.85 }}>{l.th}</p>
                <code className="fm mt-2 inline-block bg-[#06122e]/85 px-2 py-1 text-[10px] text-yellow-300">{l.code}</code>
              </div>
              <img src={`/cbot/${l.img}.png`} alt="" className={`lsp absolute right-4 object-contain ${l.tall ? "bottom-0 h-[135px]" : "bottom-2 h-[110px]"}`} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="hazard h-3" />
        <div className="scan flex flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center md:px-14" style={{ background: "linear-gradient(90deg,#1a4fe8,#2a86ff 60%,#3fd8ff)" }}>
          <div>
            <h2 className="fd text-3xl md:text-4xl">พร้อมเริ่มภารกิจแรกหรือยัง?</h2>
            <p className="mt-2 text-sm text-white/85">ไม่กี่นาทีก็พิมพ์ Hello, C! ได้แล้ว</p>
          </div>
          <a href="#topics" className="cut group z-10 bg-[#06122e] px-8 py-4 text-sm font-bold shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#06122e]">เริ่มเรียนบทแรก <span className="inline-block text-cyan-300 transition group-hover:translate-x-1.5">→</span></a>
        </div>
        <footer className="flex flex-col items-center justify-between gap-3 bg-[#040a1c] px-6 py-6 md:flex-row md:px-14">
          <div className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded border border-cyan-300 text-xs font-bold">C</span><span className="fd text-sm not-italic">CODE<span className="text-cyan-300">LEARN</span></span></div>
          <p className="fm text-[9px] tracking-widest text-blue-200/60">© 2026 CODELEARN · C PROGRAMMING · LEARN · CODE · CREATE</p>
          <a href="#" className="fm text-[9px] tracking-widest text-cyan-300 transition hover:-translate-y-1 hover:text-white">BACK TO TOP ↑</a>
        </footer>
      </section>
    </main>
  );
}
