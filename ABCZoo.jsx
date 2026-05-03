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
      ...style,
    }}
  >
    {children}
  </button>
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
    // dotted border guide
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
    ctx.lineWidth = 16;
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
        width={320} height={300}
        style={{ border: `3px solid ${color}44`, borderRadius: 20, background: "#fafafa", touchAction: "none", width: "100%", maxWidth: 340, cursor: "crosshair" }}
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

  const cur = ALPHABET[idx];

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap');
      * { box-sizing: border-box; }
      body, html { margin:0; padding:0; font-family:'Baloo 2',cursive; background:#f0f4ff; }
      button { -webkit-tap-highlight-color:transparent; }
      button:active { transform:translateY(3px) !important; box-shadow:0 2px 0 rgba(0,0,0,0.15) !important; }
      @keyframes slideR { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
      @keyframes slideL { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
      @keyframes popIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
      @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
      @keyframes floatUp { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 60%{transform:translateX(10px)} }
      @keyframes confUp { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-220px) rotate(720deg);opacity:0} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      .slide-r { animation:slideR 0.3s ease; }
      .slide-l { animation:slideL 0.3s ease; }
      .pop-in { animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .bounce-anim { animation:bounce 0.45s ease; }
      .float { animation:floatUp 3s ease-in-out infinite; }
      .shake { animation:shake 0.4s ease; }
      .conf { position:fixed;font-size:26px;animation:confUp 1.6s ease-out forwards;z-index:9999;pointer-events:none;bottom:15%; }
      .pulse { animation:pulse 1.5s ease-in-out infinite; }
      ::-webkit-scrollbar { width:0; }
    `;
    document.head.appendChild(style);
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
        Array.from({ length: 10 }, (_, i) => ({
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
    }, 1300);
  };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#667eea 0%,#764ba2 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 22 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            {HOME_EMOJIS.map((e, i) => (
              <span key={i} className="float" style={{ fontSize: 40, animationDelay: `${i * 0.5}s` }}>{e}</span>
            ))}
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(48px, 14vw, 64px)", fontWeight: 800, margin: 0, textShadow: "0 4px 12px rgba(0,0,0,0.3)", letterSpacing: -1 }}>ABC Zoo!</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(17px, 4.5vw, 20px)", margin: "8px 0 0" }}>Learn the alphabet with animals 🐾</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", borderRadius: 60, padding: "14px 32px", display: "flex", gap: 10, alignItems: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
          <span style={{ fontSize: 30 }}>⭐</span>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{learned.size} / 26 learned</span>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5, maxWidth: 340 }}>
          {ALPHABET.map((a) => (
            <div key={a.letter} style={{ width: 10, height: 10, borderRadius: "50%", background: learned.has(a.letter) ? "#FECA57" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 340 }}>
          <Btn onClick={() => setScreen("learn")} bg="#FECA57" color="#333" fontSize={23} padding="20px 28px" width="100%">📖 Learn Letters</Btn>
          <Btn onClick={startQuiz} bg="#FF6B9D" color="#fff" fontSize={23} padding="20px 28px" width="100%">🎮 Take Quiz!</Btn>
          <Btn onClick={() => speak("A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. Q. R. S. T. U. V. W. X. Y. Z!")}
            bg="rgba(255,255,255,0.2)" color="#fff" fontSize={19} padding="16px 28px" width="100%" style={{ border: "1px solid rgba(255,255,255,0.4)" }}>
            🎵 Sing the ABC!
          </Btn>
        </div>
      </div>
    );
  }

  // ── LEARN ─────────────────────────────────────────────────────────────────
  if (screen === "learn") {
    const isLearned = learned.has(cur.letter);
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${cur.color}22 0%, #f0f4ff 60%)`, display: "flex", flexDirection: "column", paddingBottom: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
          <Btn onClick={() => { setTracing(false); setScreen("home"); }} bg="rgba(255,255,255,0.9)" color="#444" border="1px solid #ddd" fontSize={17} padding="11px 18px">← Home</Btn>
          <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 50, padding: "10px 20px", display: "flex", gap: 6, alignItems: "center", border: "1px solid #ddd" }}>
            <span style={{ fontSize: 20 }}>⭐</span><span style={{ fontWeight: 700, fontSize: 18 }}>{learned.size}/26</span>
          </div>
          <Btn onClick={startQuiz} bg={cur.color} color="#fff" fontSize={17} padding="11px 18px">🎮 Quiz</Btn>
        </div>

        {/* ABC Strip - horizontal scroll */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "4px 16px 10px", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: 7, width: "max-content" }}>
            {ALPHABET.map((a, i) => (
              <button key={a.letter} onClick={() => goToLetter(i)}
                style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: i === idx ? cur.color : learned.has(a.letter) ? "#d4edda" : "#fff", color: i === idx ? "#fff" : "#444", fontWeight: 800, fontSize: 16, border: i === idx ? "none" : "2px solid #e0e0e0", cursor: "pointer", fontFamily: "'Baloo 2',cursive", transition: "all 0.2s", boxShadow: i === idx ? `0 4px 0 ${cur.color}88` : "none" }}>
                {a.letter}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", gap: 14 }}>
          <div key={cardKey} className={direction >= 0 ? "slide-r" : "slide-l"}
            style={{ background: "#fff", borderRadius: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", padding: "22px 20px", width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

            {!tracing ? (
              <>
                {/* Letters */}
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <span style={{ fontSize: "clamp(110px, 28vw, 140px)", fontWeight: 800, color: cur.color, lineHeight: 1 }}>{cur.letter}</span>
                  <span style={{ fontSize: "clamp(88px, 22vw, 115px)", fontWeight: 800, color: `${cur.color}88`, lineHeight: 1 }}>{cur.letter.toLowerCase()}</span>
                </div>

                {/* Animal */}
                <div key={`emoji-${idx}`} className="pop-in" style={{ fontSize: "clamp(90px, 24vw, 115px)", lineHeight: 1 }}>{cur.emoji}</div>
                <div style={{ fontSize: "clamp(26px, 7vw, 32px)", fontWeight: 700, color: "#333", letterSpacing: -0.5 }}>{cur.animal}</div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
                  <Btn onClick={() => speak(`The letter ${cur.letter}! ${cur.letter} is for ${cur.animal}!`)} bg={cur.color} color="#fff" fontSize={18} padding="15px 26px">🔊 Say it!</Btn>
                  <Btn onClick={() => setTracing(true)} bg="#f4f4f8" color="#555" border="2px solid #e0e0e0" fontSize={18} padding="15px 26px">✏️ Trace it!</Btn>
                </div>

                {/* Learned button */}
                <button
                  onClick={toggleLearned}
                  className={isLearned ? "bounce-anim" : ""}
                  style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 19, background: isLearned ? "#2ED573" : "#fafafa", color: isLearned ? "#fff" : "#bbb", border: isLearned ? "none" : "2.5px dashed #ddd", borderRadius: 50, padding: "16px 0", cursor: "pointer", width: "100%", boxShadow: isLearned ? "0 5px 0 #1da855" : "none", transition: "all 0.2s" }}>
                  {isLearned ? "⭐ Learned! Great job!" : "Mark as Learned ⭐"}
                </button>
              </>
            ) : (
              <TraceCanvas letter={cur.letter} color={cur.color} onBack={() => setTracing(false)} />
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Btn onClick={() => nav(-1)} bg="#fff" color="#444" border="2px solid #ddd" fontSize={28} padding="13px 22px">←</Btn>
            <span style={{ fontWeight: 700, color: "#777", fontSize: 18, minWidth: 64, textAlign: "center" }}>{idx + 1} / 26</span>
            <Btn onClick={() => nav(1)} bg={cur.color} color="#fff" fontSize={28} padding="13px 22px">→</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz" && qIdx < quiz.length) {
    const q = quiz[qIdx];
    const isL2A = q.type === "L2A";
    const progress = (qIdx / quiz.length) * 100;

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#f093fb 0%,#f5576c 100%)", display: "flex", flexDirection: "column", padding: "18px 16px", gap: 14 }}>
        {/* Confetti */}
        {confetti.map((p) => (
          <span key={p.id} className="conf" style={{ left: p.left, animationDelay: p.delay }}>{p.emoji}</span>
        ))}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.2)" color="#fff" border="1px solid rgba(255,255,255,0.4)" fontSize={17} padding="11px 18px">✕ Exit</Btn>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Score: {score} ⭐</div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 50, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 17 }}>{qIdx + 1}/{quiz.length}</div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, height: 14, overflow: "hidden" }}>
          <div style={{ background: "#fff", borderRadius: 20, height: 14, width: `${progress}%`, transition: "width 0.5s ease" }} />
        </div>

        {/* Question card */}
        <div className="pop-in" key={qIdx} style={{ background: "#fff", borderRadius: 28, boxShadow: "0 12px 50px rgba(0,0,0,0.2)", padding: "26px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flex: 1 }}>
          <p style={{ color: "#999", fontSize: 17, textAlign: "center", margin: 0, fontWeight: 600 }}>
            {isL2A ? "🔤 Which animal starts with this letter?" : "🐾 Which letter does this animal start with?"}
          </p>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isL2A ? "clamp(110px,30vw,140px)" : "clamp(90px,24vw,115px)", fontWeight: 800, color: "#333", lineHeight: 1 }}>
              {isL2A ? q.item.letter : q.item.emoji}
            </div>
            {!isL2A && <div style={{ fontSize: 22, fontWeight: 700, color: "#666", marginTop: 6 }}>{q.item.animal}</div>}
          </div>

          {/* Answer grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%" }}>
            {q.options.map((opt) => {
              let bg = "#f4f4f8", border = "2px solid #e8e8e8", textColor = "#333";
              if (selected !== null) {
                if (opt.letter === correct) { bg = "#d4f7e4"; border = "2px solid #28a745"; textColor = "#155724"; }
                else if (opt.letter === selected) { bg = "#fde8ea"; border = "2px solid #dc3545"; textColor = "#721c24"; }
              }
              const isWrong = selected !== null && opt.letter === selected && opt.letter !== correct;
              return (
                <button key={opt.letter} onClick={() => handleAnswer(opt)} className={isWrong ? "shake" : ""}
                  style={{ fontFamily: "'Baloo 2',cursive", background: bg, color: textColor, border, borderRadius: 22, padding: "18px 8px", cursor: selected ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 5px 0 rgba(0,0,0,0.07)", transition: "background 0.2s, border 0.2s", minHeight: 100 }}>
                  {isL2A ? (
                    <><span style={{ fontSize: 48 }}>{opt.emoji}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{opt.animal}</span></>
                  ) : (
                    <span style={{ fontSize: 60, fontWeight: 800 }}>{opt.letter}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {selected !== null && (
            <div className="pop-in" style={{ fontSize: 24, fontWeight: 700, color: selected === correct ? "#28a745" : "#dc3545", textAlign: "center" }}>
              {selected === correct ? "🎉 Correct! Amazing!" : `❌ It was ${correct} for ${ALPHABET.find(a => a.letter === correct)?.animal}!`}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / (quiz.length || 1)) * 100);
    const starCount = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    const msg = pct >= 90 ? "You're a superstar! 🌟" : pct >= 60 ? "Great job! Keep it up! 💪" : "Good try! Practice makes perfect! 📚";
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(155deg,#667eea 0%,#764ba2 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 22 }}>
        <div className="bounce-anim" style={{ fontSize: 90 }}>🏆</div>
        <h2 style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: 0, textAlign: "center" }}>Quiz Complete!</h2>

        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 28, padding: "30px 40px", textAlign: "center", width: "100%", maxWidth: 340 }}>
          <div style={{ fontSize: 78, fontWeight: 800, color: "#FECA57", lineHeight: 1 }}>{score}/{quiz.length}</div>
          <div style={{ fontSize: 42, margin: "10px 0" }}>{"⭐".repeat(starCount)}</div>
          <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 20, fontWeight: 600 }}>{msg}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", maxWidth: 320 }}>
          <Btn onClick={startQuiz} bg="#FECA57" color="#333" fontSize={22} padding="19px 28px" width="100%">🔄 Play Again!</Btn>
          <Btn onClick={() => setScreen("learn")} bg="rgba(255,255,255,0.2)" color="#fff" border="1px solid rgba(255,255,255,0.4)" fontSize={22} padding="19px 28px" width="100%">📖 Keep Learning</Btn>
          <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.85)" border="1px solid rgba(255,255,255,0.25)" fontSize={19} padding="15px 28px" width="100%">🏠 Home</Btn>
        </div>
      </div>
    );
  }

  return null;
}
