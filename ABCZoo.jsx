import { useState, useEffect, useRef } from "react";

const ALPHABET = [
  { letter: "A", animal: "Alligator", emoji: "🐊", color: "#FF6B6B" },
  { letter: "B", animal: "Bear", emoji: "🐻", color: "#FF9F43" },
  { letter: "C", animal: "Cat", emoji: "🐱", color: "#F9CA24" },
  { letter: "D", animal: "Dog", emoji: "🐶", color: "#6AB04C" },
  { letter: "E", animal: "Elephant", emoji: "🐘", color: "#22A6B3" },
  { letter: "F", animal: "Fox", emoji: "🦊", color: "#EB4D4B" },
  { letter: "G", animal: "Giraffe", emoji: "🦒", color: "#F0932B" },
  { letter: "H", animal: "Horse", emoji: "🐴", color: "#6C5CE7" },
  { letter: "I", animal: "Iguana", emoji: "🦎", color: "#00B894" },
  { letter: "J", animal: "Jaguar", emoji: "🐆", color: "#E17055" },
  { letter: "K", animal: "Kangaroo", emoji: "🦘", color: "#FDCB6E" },
  { letter: "L", animal: "Lion", emoji: "🦁", color: "#E84393" },
  { letter: "M", animal: "Monkey", emoji: "🐒", color: "#6AB04C" },
  { letter: "N", animal: "Nightingale", emoji: "🐦", color: "#74B9FF" },
  { letter: "O", animal: "Owl", emoji: "🦉", color: "#F9CA24" },
  { letter: "P", animal: "Penguin", emoji: "🐧", color: "#6C5CE7" },
  { letter: "Q", animal: "Quail", emoji: "🐔", color: "#EB4D4B" },
  { letter: "R", animal: "Rabbit", emoji: "🐰", color: "#FF9F43" },
  { letter: "S", animal: "Snake", emoji: "🐍", color: "#00B894" },
  { letter: "T", animal: "Tiger", emoji: "🐯", color: "#E17055" },
  { letter: "U", animal: "Unicorn", emoji: "🦄", color: "#A29BFE" },
  { letter: "V", animal: "Vulture", emoji: "🦅", color: "#636E72" },
  { letter: "W", animal: "Whale", emoji: "🐋", color: "#22A6B3" },
  { letter: "X", animal: "X-ray Fish", emoji: "🐟", color: "#E84393" },
  { letter: "Y", animal: "Yak", emoji: "🐃", color: "#F0932B" },
  { letter: "Z", animal: "Zebra", emoji: "🦓", color: "#6AB04C" },
];

const CONFETTI = ["⭐", "🌟", "✨", "🎉", "🎊", "💫", "🌈", "🎈"];
const HOME_EMOJIS = ["🐊", "🐻", "🐱", "🐶", "🐘"];

const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.82;
  u.pitch = 1.15;
  window.speechSynthesis.speak(u);
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildQuiz = () =>
  shuffle(ALPHABET)
    .slice(0, 10)
    .map((item) => {
      const type = Math.random() > 0.5 ? "L2A" : "A2L";
      const wrongs = shuffle(ALPHABET.filter((a) => a.letter !== item.letter)).slice(0, 3);
      const options = shuffle([...wrongs, item]);
      return { item, type, options };
    });

const Btn = ({ onClick, bg, color, border, fontSize = 17, padding = "13px 26px", width, children, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Baloo 2', cursive",
      fontWeight: 700,
      fontSize,
      background: bg,
      color,
      border: border || "none",
      borderRadius: 50,
      padding,
      cursor: "pointer",
      boxShadow: "0 5px 0 rgba(0,0,0,0.15)",
      transition: "transform 0.1s, box-shadow 0.1s",
      width,
      lineHeight: 1.2,
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </button>
);

// Each screen fills the viewport exactly; content scrolls inside
const Screen = ({ bg, children, scrollRef }) => (
  <div
    ref={scrollRef}
    style={{
      position: "fixed", inset: 0,
      background: bg,
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {children}
  </div>
);

function TraceCanvas({ letter, color, onBack }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 200px Georgia, serif";
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2 + 10);
    ctx.strokeStyle = `${color}44`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.setLineDash([]);
  };

  useEffect(() => { drawGuide(); }, [letter]);

  const getXY = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    if (e.touches)
      return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };

  const onStart = (e) => { e.preventDefault(); drawing.current = true; last.current = getXY(e, canvasRef.current); };
  const onMove = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getXY(e, canvas);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = `${color}66`;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    last.current = pos;
  };
  const onEnd = () => { drawing.current = false; };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
      <p style={{ margin: 0, color: "#999", fontSize: 17, fontFamily: "'Baloo 2', cursive" }}>
        ✏️ Trace the letter with your finger!
      </p>
      <canvas
        ref={canvasRef}
        width={320} height={280}
        style={{ border: `3px solid ${color}44`, borderRadius: 20, background: "#fafafa", touchAction: "none", width: "100%", cursor: "crosshair" }}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <Btn onClick={drawGuide} bg="#f0f0f0" color="#666" border="2px solid #ddd" fontSize={18} padding="14px 26px">🗑️ Clear</Btn>
        <Btn onClick={onBack} bg={color} color="#fff" fontSize={18} padding="14px 26px">✅ Done!</Btn>
      </div>
    </div>
  );
}

export default function ABCZoo() {
  const [screen, setScreen] = useState("home");
  const [idx, setIdx] = useState(0);
  const [tracing, setTracing] = useState(false);
  const [learned, setLearned] = useState(new Set());
  const [direction, setDirection] = useState(1);
  const [quiz, setQuiz] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [cardKey, setCardKey] = useState(0);
  const scrollRef = useRef(null);

  const cur = ALPHABET[idx];

  // Scroll to top on every screen change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [screen]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { height: 100%; overflow: hidden; }
      body { font-family:'Baloo 2',cursive; background:#f0f4ff; }
      button { -webkit-tap-highlight-color:transparent; font-family:'Baloo 2',cursive; }
      button:active { transform:translateY(3px) !important; box-shadow:0 2px 0 rgba(0,0,0,0.15) !important; }
      @keyframes slideR { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
      @keyframes slideL { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
      @keyframes popIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
      @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
      @keyframes floatUp { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 60%{transform:translateX(10px)} }
      @keyframes confUp { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-220px) rotate(720deg);opacity:0} }
      .slide-r { animation:slideR 0.3s ease; }
      .slide-l { animation:slideL 0.3s ease; }
      .pop-in { animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .bounce-anim { animation:bounce 0.45s ease; }
      .float { animation:floatUp 3s ease-in-out infinite; }
      .shake { animation:shake 0.4s ease; }
      .conf { position:fixed;font-size:28px;animation:confUp 1.6s ease-out forwards;z-index:9999;pointer-events:none;bottom:20%; }
      ::-webkit-scrollbar { width:0; height:0; }
    `;
    document.head.appendChild(style);

    // Patch viewport meta for proper mobile scaling
    let vm = document.querySelector('meta[name="viewport"]');
    if (!vm) { vm = document.createElement("meta"); vm.name = "viewport"; document.head.appendChild(vm); }
    vm.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  }, []);

  const nav = (dir) => {
    setDirection(dir);
    setTracing(false);
    setIdx((i) => (i + dir + 26) % 26);
    setCardKey((k) => k + 1);
  };

  const goToLetter = (i) => {
    setDirection(i > idx ? 1 : -1);
    setTracing(false);
    setIdx(i);
    setCardKey((k) => k + 1);
  };

  const startQuiz = () => {
    setQuiz(buildQuiz());
    setQIdx(0);
    setScore(0);
    setSelected(null);
    setCorrect(null);
    setScreen("quiz");
  };

  const toggleLearned = () => {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(cur.letter)) next.delete(cur.letter);
      else next.add(cur.letter);
      return next;
    });
  };

  const handleAnswer = (option) => {
    if (selected !== null) return;
    const q = quiz[qIdx];
    const isOk = option.letter === q.item.letter;
    setSelected(option.letter);
    setCorrect(q.item.letter);
    if (isOk) {
      setScore((s) => s + 1);
      setConfetti(
        Array.from({ length: 12 }, (_, i) => ({
          id: Date.now() + i,
          emoji: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
          left: `${5 + Math.random() * 90}%`,
          delay: `${Math.random() * 0.6}s`,
        }))
      );
      setTimeout(() => setConfetti([]), 2200);
    }
    setTimeout(() => {
      setSelected(null);
      setCorrect(null);
      if (qIdx + 1 >= quiz.length) setScreen("results");
      else setQIdx((i) => i + 1);
    }, 1400);
  };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <Screen bg="linear-gradient(155deg,#667eea 0%,#764ba2 100%)" scrollRef={scrollRef}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px", gap: 22 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              {HOME_EMOJIS.map((e, i) => (
                <span key={i} className="float" style={{ fontSize: "clamp(28px,8vw,42px)", animationDelay: `${i * 0.5}s` }}>{e}</span>
              ))}
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(46px,13vw,66px)", fontWeight: 800, margin: 0, textShadow: "0 4px 12px rgba(0,0,0,0.3)", letterSpacing: -1 }}>ABC Zoo!</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(16px,4.5vw,20px)", marginTop: 8 }}>Learn the alphabet with animals 🐾</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", borderRadius: 60, padding: "14px 32px", display: "flex", gap: 10, alignItems: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
            <span style={{ fontSize: "clamp(22px,6vw,30px)" }}>⭐</span>
            <span style={{ color: "#fff", fontSize: "clamp(17px,5vw,22px)", fontWeight: 700 }}>{learned.size} / 26 learned</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, maxWidth: 340 }}>
            {ALPHABET.map((a) => (
              <div key={a.letter} style={{ width: 11, height: 11, borderRadius: "50%", background: learned.has(a.letter) ? "#FECA57" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }} />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 340 }}>
            <Btn onClick={() => setScreen("learn")} bg="#FECA57" color="#333" fontSize="clamp(18px,5vw,23px)" padding="clamp(16px,4vw,20px) 28px" width="100%">📖 Learn Letters</Btn>
            <Btn onClick={startQuiz} bg="#FF6B9D" color="#fff" fontSize="clamp(18px,5vw,23px)" padding="clamp(16px,4vw,20px) 28px" width="100%">🎮 Take Quiz!</Btn>
            <Btn
              onClick={() => speak("A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. Q. R. S. T. U. V. W. X. Y. Z!")}
              bg="rgba(255,255,255,0.2)" color="#fff" fontSize="clamp(15px,4vw,19px)" padding="clamp(13px,3.5vw,16px) 28px" width="100%"
              style={{ border: "1px solid rgba(255,255,255,0.4)" }}>
              🎵 Sing the ABC!
            </Btn>
          </div>
        </div>
      </Screen>
    );
  }

  // ── LEARN ─────────────────────────────────────────────────────────────────
  if (screen === "learn") {
    const isLearned = learned.has(cur.letter);
    return (
      <Screen bg={`linear-gradient(160deg, ${cur.color}22 0%, #f0f4ff 60%)`} scrollRef={scrollRef}>
        {/* Header */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
          <Btn onClick={() => { setTracing(false); setScreen("home"); }} bg="rgba(255,255,255,0.9)" color="#444" border="1px solid #ddd" fontSize="clamp(14px,3.5vw,17px)" padding="11px 16px">← Home</Btn>
          <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 50, padding: "10px 18px", display: "flex", gap: 6, alignItems: "center", border: "1px solid #ddd" }}>
            <span style={{ fontSize: 20 }}>⭐</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{learned.size}/26</span>
          </div>
          <Btn onClick={startQuiz} bg={cur.color} color="#fff" fontSize="clamp(14px,3.5vw,17px)" padding="11px 16px">🎮 Quiz</Btn>
        </div>

        {/* ABC horizontal scroll strip */}
        <div style={{ flexShrink: 0, overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "0 16px 10px", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: 7, width: "max-content" }}>
            {ALPHABET.map((a, i) => (
              <button key={a.letter} onClick={() => goToLetter(i)}
                style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: i === idx ? cur.color : learned.has(a.letter) ? "#d4edda" : "#fff", color: i === idx ? "#fff" : "#444", fontWeight: 800, fontSize: 16, border: i === idx ? "none" : "2px solid #e0e0e0", cursor: "pointer", transition: "all 0.2s", boxShadow: i === idx ? `0 4px 0 ${cur.color}88` : "none" }}>
                {a.letter}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 20px", gap: 14 }}>
          <div key={cardKey} className={direction >= 0 ? "slide-r" : "slide-l"}
            style={{ background: "#fff", borderRadius: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", padding: "20px 18px", width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

            {!tracing ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <span style={{ fontSize: "clamp(90px,22vw,130px)", fontWeight: 800, color: cur.color, lineHeight: 1 }}>{cur.letter}</span>
                  <span style={{ fontSize: "clamp(72px,18vw,105px)", fontWeight: 800, color: `${cur.color}88`, lineHeight: 1 }}>{cur.letter.toLowerCase()}</span>
                </div>
                <div key={`emoji-${idx}`} className="pop-in" style={{ fontSize: "clamp(80px,20vw,105px)", lineHeight: 1 }}>{cur.emoji}</div>
                <div style={{ fontSize: "clamp(24px,6vw,30px)", fontWeight: 700, color: "#333" }}>{cur.animal}</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                  <Btn onClick={() => speak(`The letter ${cur.letter}! ${cur.letter} is for ${cur.animal}!`)} bg={cur.color} color="#fff" fontSize="clamp(16px,4vw,19px)" padding="14px 24px">🔊 Say it!</Btn>
                  <Btn onClick={() => setTracing(true)} bg="#f4f4f8" color="#555" border="2px solid #e0e0e0" fontSize="clamp(16px,4vw,19px)" padding="14px 24px">✏️ Trace it!</Btn>
                </div>

                <button
                  onClick={toggleLearned}
                  className={isLearned ? "bounce-anim" : ""}
                  style={{ fontWeight: 700, fontSize: "clamp(16px,4vw,19px)", background: isLearned ? "#2ED573" : "#fafafa", color: isLearned ? "#fff" : "#bbb", border: isLearned ? "none" : "2.5px dashed #ddd", borderRadius: 50, padding: "15px 0", cursor: "pointer", width: "100%", boxShadow: isLearned ? "0 5px 0 #1da855" : "none", transition: "all 0.2s" }}>
                  {isLearned ? "⭐ Learned! Great job!" : "Mark as Learned ⭐"}
                </button>
              </>
            ) : (
              <TraceCanvas letter={cur.letter} color={cur.color} onBack={() => setTracing(false)} />
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
            <Btn onClick={() => nav(-1)} bg="#fff" color="#444" border="2px solid #ddd" fontSize={28} padding="12px 22px">←</Btn>
            <span style={{ fontWeight: 700, color: "#777", fontSize: 18, minWidth: 60, textAlign: "center" }}>{idx + 1} / 26</span>
            <Btn onClick={() => nav(1)} bg={cur.color} color="#fff" fontSize={28} padding="12px 22px">→</Btn>
          </div>
        </div>
      </Screen>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz" && qIdx < quiz.length) {
    const q = quiz[qIdx];
    const isL2A = q.type === "L2A";
    const progress = (qIdx / quiz.length) * 100;

    return (
      <Screen bg="linear-gradient(155deg,#f093fb 0%,#f5576c 100%)" scrollRef={scrollRef}>
        {confetti.map((p) => (
          <span key={p.id} className="conf" style={{ left: p.left, animationDelay: p.delay }}>{p.emoji}</span>
        ))}

        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
          <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.2)" color="#fff" border="1px solid rgba(255,255,255,0.4)" fontSize="clamp(14px,3.5vw,17px)" padding="11px 16px">✕ Exit</Btn>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(18px,5vw,22px)" }}>Score: {score} ⭐</div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 50, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: "clamp(14px,3.5vw,17px)" }}>{qIdx + 1}/{quiz.length}</div>
        </div>

        <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.25)", borderRadius: 20, height: 14, margin: "0 16px", overflow: "hidden" }}>
          <div style={{ background: "#fff", borderRadius: 20, height: 14, width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px 20px" }}>
          <div className="pop-in" key={qIdx} style={{ background: "#fff", borderRadius: 28, boxShadow: "0 12px 50px rgba(0,0,0,0.2)", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, flex: 1 }}>
            <p style={{ color: "#999", fontSize: "clamp(15px,4vw,18px)", textAlign: "center", margin: 0, fontWeight: 600 }}>
              {isL2A ? "🔤 Which animal starts with this letter?" : "🐾 Which letter does this animal start with?"}
            </p>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isL2A ? "clamp(100px,26vw,130px)" : "clamp(80px,22vw,110px)", fontWeight: 800, color: "#333", lineHeight: 1 }}>
                {isL2A ? q.item.letter : q.item.emoji}
              </div>
              {!isL2A && <div style={{ fontSize: "clamp(18px,5vw,22px)", fontWeight: 700, color: "#666", marginTop: 6 }}>{q.item.animal}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", flex: 1 }}>
              {q.options.map((opt) => {
                let bg = "#f4f4f8", border = "2px solid #e8e8e8", textColor = "#333";
                if (selected !== null) {
                  if (opt.letter === correct) { bg = "#d4f7e4"; border = "2px solid #28a745"; textColor = "#155724"; }
                  else if (opt.letter === selected) { bg = "#fde8ea"; border = "2px solid #dc3545"; textColor = "#721c24"; }
                }
                const isWrong = selected !== null && opt.letter === selected && opt.letter !== correct;
                return (
                  <button key={opt.letter} onClick={() => handleAnswer(opt)} className={isWrong ? "shake" : ""}
                    style={{ fontFamily: "'Baloo 2',cursive", background: bg, color: textColor, border, borderRadius: 22, padding: "16px 8px", cursor: selected ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 5px 0 rgba(0,0,0,0.07)", transition: "background 0.2s, border 0.2s" }}>
                    {isL2A ? (
                      <><span style={{ fontSize: "clamp(40px,11vw,54px)" }}>{opt.emoji}</span><span style={{ fontSize: "clamp(12px,3vw,15px)", fontWeight: 700 }}>{opt.animal}</span></>
                    ) : (
                      <span style={{ fontSize: "clamp(50px,14vw,66px)", fontWeight: 800 }}>{opt.letter}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="pop-in" style={{ fontSize: "clamp(18px,5vw,24px)", fontWeight: 700, color: selected === correct ? "#28a745" : "#dc3545", textAlign: "center" }}>
                {selected === correct ? "🎉 Correct! Amazing!" : `❌ It was ${correct} for ${ALPHABET.find(a => a.letter === correct)?.animal}!`}
              </div>
            )}
          </div>
        </div>
      </Screen>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / (quiz.length || 1)) * 100);
    const starCount = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    const msg = pct >= 90 ? "You're a superstar! 🌟" : pct >= 60 ? "Great job! Keep it up! 💪" : "Good try! Practice makes perfect! 📚";
    return (
      <Screen bg="linear-gradient(155deg,#667eea 0%,#764ba2 100%)" scrollRef={scrollRef}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px", gap: 22 }}>
          <div className="bounce-anim" style={{ fontSize: "clamp(70px,20vw,90px)" }}>🏆</div>
          <h2 style={{ color: "#fff", fontSize: "clamp(32px,10vw,44px)", fontWeight: 800, margin: 0, textAlign: "center" }}>Quiz Complete!</h2>

          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 28, padding: "28px 40px", textAlign: "center", width: "100%", maxWidth: 340 }}>
            <div style={{ fontSize: "clamp(60px,18vw,80px)", fontWeight: 800, color: "#FECA57", lineHeight: 1 }}>{score}/{quiz.length}</div>
            <div style={{ fontSize: "clamp(32px,10vw,44px)", margin: "10px 0" }}>{"⭐".repeat(starCount)}</div>
            <div style={{ color: "rgba(255,255,255,0.92)", fontSize: "clamp(16px,4.5vw,20px)", fontWeight: 600 }}>{msg}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", maxWidth: 320 }}>
            <Btn onClick={startQuiz} bg="#FECA57" color="#333" fontSize="clamp(18px,5vw,22px)" padding="18px 28px" width="100%">🔄 Play Again!</Btn>
            <Btn onClick={() => setScreen("learn")} bg="rgba(255,255,255,0.2)" color="#fff" border="1px solid rgba(255,255,255,0.4)" fontSize="clamp(18px,5vw,22px)" padding="18px 28px" width="100%">📖 Keep Learning</Btn>
            <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.85)" border="1px solid rgba(255,255,255,0.25)" fontSize="clamp(15px,4vw,19px)" padding="14px 28px" width="100%">🏠 Home</Btn>
          </div>
        </div>
      </Screen>
    );
  }

  return null;
}
