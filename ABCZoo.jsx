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

const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.82; u.pitch = 1.15;
  window.speechSynthesis.speak(u);
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const buildQuiz = () =>
  shuffle(ALPHABET).slice(0, 10).map((item) => {
    const type = Math.random() > 0.5 ? "L2A" : "A2L";
    const wrongs = shuffle(ALPHABET.filter((a) => a.letter !== item.letter)).slice(0, 3);
    return { item, type, options: shuffle([...wrongs, item]) };
  });

// Big tap-friendly button
const Btn = ({ onClick, bg, color, border, children, style = {} }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Nunito', sans-serif", fontWeight: 800,
    fontSize: "5vw", background: bg, color, border: border || "none",
    borderRadius: "4vw", padding: "4vw 6vw", cursor: "pointer",
    boxShadow: "0 0.8vw 0 rgba(0,0,0,0.18)",
    transition: "transform 0.1s, box-shadow 0.1s",
    lineHeight: 1.2, display: "flex", alignItems: "center",
    justifyContent: "center", gap: "2vw",
    ...style,
  }}>{children}</button>
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
    ctx.font = "bold 180px Georgia, serif";
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2 + 10);
    ctx.strokeStyle = `${color}44`; ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.setLineDash([]);
  };

  useEffect(() => { drawGuide(); }, [letter]);

  const getXY = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };

  const onStart = (e) => { e.preventDefault(); drawing.current = true; last.current = getXY(e, canvasRef.current); };
  const onMove = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getXY(e, canvas);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color; ctx.lineWidth = 18; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = `${color}66`; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    last.current = pos;
  };
  const onEnd = () => { drawing.current = false; };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3vw", width: "100%" }}>
      <p style={{ color: "#999", fontSize: "4vw", fontWeight: 700 }}>✏️ Trace with your finger!</p>
      <canvas ref={canvasRef} width={340} height={300}
        style={{ border: `3px solid ${color}44`, borderRadius: "4vw", background: "#fafafa", touchAction: "none", width: "100%" }}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      />
      <div style={{ display: "flex", gap: "3vw" }}>
        <Btn onClick={drawGuide} bg="#f0f0f0" color="#666" border="2px solid #ddd">🗑️ Clear</Btn>
        <Btn onClick={onBack} bg={color} color="#fff">✅ Done!</Btn>
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
  const wrapRef = useRef(null);

  const cur = ALPHABET[idx];

  useEffect(() => {
    if (wrapRef.current) wrapRef.current.scrollTop = 0;
  }, [screen, idx]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      html { font-size: 16px; }
      html, body, #root { width:100%; height:100%; overflow:hidden; }
      body { font-family:'Nunito',sans-serif; background:#5c6bc0; }
      button { -webkit-tap-highlight-color:transparent; font-family:'Nunito',sans-serif; }
      button:active { transform:translateY(0.5vw) !important; box-shadow:0 0.2vw 0 rgba(0,0,0,0.18) !important; }
      @keyframes slideR { from{opacity:0;transform:translateX(8vw)} to{opacity:1;transform:translateX(0)} }
      @keyframes slideL { from{opacity:0;transform:translateX(-8vw)} to{opacity:1;transform:translateX(0)} }
      @keyframes popIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
      @keyframes bounceKey { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
      @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2vw)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3vw)} 75%{transform:translateX(3vw)} }
      @keyframes confUp { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-40vw) rotate(720deg);opacity:0} }
      .slide-r { animation:slideR 0.28s ease; }
      .slide-l { animation:slideL 0.28s ease; }
      .pop-in { animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .bounce-k { animation:bounceKey 0.4s ease; }
      .float { animation:floatUp 3s ease-in-out infinite; }
      .shake { animation:shake 0.35s ease; }
      .conf { position:fixed; font-size:7vw; animation:confUp 1.5s ease-out forwards; z-index:9999; pointer-events:none; bottom:20%; }
      ::-webkit-scrollbar { display:none; }
    `;
    document.head.appendChild(s);
    let vm = document.querySelector('meta[name="viewport"]');
    if (!vm) { vm = document.createElement("meta"); vm.name = "viewport"; document.head.appendChild(vm); }
    vm.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  }, []);

  const nav = (dir) => {
    setDirection(dir); setTracing(false);
    setIdx((i) => (i + dir + 26) % 26);
    setCardKey((k) => k + 1);
  };

  const goToLetter = (i) => {
    setDirection(i > idx ? 1 : -1); setTracing(false);
    setIdx(i); setCardKey((k) => k + 1);
  };

  const startQuiz = () => {
    setQuiz(buildQuiz()); setQIdx(0); setScore(0);
    setSelected(null); setCorrect(null); setScreen("quiz");
  };

  const toggleLearned = () => {
    setLearned((p) => { const n = new Set(p); n.has(cur.letter) ? n.delete(cur.letter) : n.add(cur.letter); return n; });
  };

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    const q = quiz[qIdx];
    const ok = opt.letter === q.item.letter;
    setSelected(opt.letter); setCorrect(q.item.letter);
    if (ok) {
      setScore((s) => s + 1);
      setConfetti(Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        emoji: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
        left: `${5 + Math.random() * 88}%`,
        delay: `${Math.random() * 0.5}s`,
      })));
      setTimeout(() => setConfetti([]), 2000);
    }
    setTimeout(() => {
      setSelected(null); setCorrect(null);
      if (qIdx + 1 >= quiz.length) setScreen("results");
      else setQIdx((i) => i + 1);
    }, 1400);
  };

  // Shared full-screen wrapper
  const Wrap = ({ bg, children }) => (
    <div ref={wrapRef} style={{
      position: "fixed", inset: 0, background: bg,
      display: "flex", flexDirection: "column",
      overflowY: "auto", WebkitOverflowScrolling: "touch",
    }}>{children}</div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <Wrap bg="linear-gradient(160deg,#667eea 0%,#764ba2 100%)">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", padding: "6vw 8vw" }}>

        {/* Animals + title */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "3vw", marginBottom: "2vw" }}>
            {["🐊","🐻","🐱","🐶","🐘"].map((e, i) => (
              <span key={i} className="float" style={{ fontSize: "10vw", animationDelay: `${i * 0.5}s` }}>{e}</span>
            ))}
          </div>
          <div style={{ color: "#fff", fontSize: "16vw", fontWeight: 900, lineHeight: 1, textShadow: "0 1vw 3vw rgba(0,0,0,0.25)" }}>ABC Zoo!</div>
          <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "5vw", fontWeight: 700, marginTop: "2vw" }}>Learn the alphabet with animals 🐾</div>
        </div>

        {/* Stars */}
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: "10vw", padding: "3vw 8vw", display: "flex", gap: "3vw", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
          <span style={{ fontSize: "8vw" }}>⭐</span>
          <span style={{ color: "#fff", fontSize: "6vw", fontWeight: 800 }}>{learned.size} / 26 learned</span>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2vw", maxWidth: "90vw" }}>
          {ALPHABET.map((a) => (
            <div key={a.letter} style={{ width: "3vw", height: "3vw", borderRadius: "50%", background: learned.has(a.letter) ? "#FECA57" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4vw", width: "100%" }}>
          <Btn onClick={() => setScreen("learn")} bg="#FECA57" color="#333" style={{ width: "100%", fontSize: "6vw", padding: "5vw" }}>📖 Learn Letters</Btn>
          <Btn onClick={startQuiz} bg="#FF6B9D" color="#fff" style={{ width: "100%", fontSize: "6vw", padding: "5vw" }}>🎮 Take Quiz!</Btn>
          <Btn onClick={() => speak("A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. Q. R. S. T. U. V. W. X. Y. Z!")}
            bg="rgba(255,255,255,0.18)" color="#fff" style={{ width: "100%", fontSize: "5vw", padding: "4vw", border: "1px solid rgba(255,255,255,0.4)" }}>
            🎵 Sing the ABC!
          </Btn>
        </div>
      </div>
    </Wrap>
  );

  // ── LEARN ─────────────────────────────────────────────────────────────────
  if (screen === "learn") {
    const isLearned = learned.has(cur.letter);
    return (
      <Wrap bg={`linear-gradient(160deg,${cur.color}33 0%,#f0f4ff 55%)`}>
        {/* Header */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3vw 4vw" }}>
          <Btn onClick={() => { setTracing(false); setScreen("home"); }} bg="rgba(255,255,255,0.92)" color="#444" border="1px solid #ddd" style={{ fontSize: "4.5vw", padding: "2.5vw 4vw" }}>← Home</Btn>
          <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: "8vw", padding: "2.5vw 5vw", display: "flex", gap: "2vw", alignItems: "center", border: "1px solid #ddd", fontSize: "5vw", fontWeight: 800 }}>
            ⭐ {learned.size}/26
          </div>
          <Btn onClick={startQuiz} bg={cur.color} color="#fff" style={{ fontSize: "4.5vw", padding: "2.5vw 4vw" }}>🎮 Quiz</Btn>
        </div>

        {/* ABC strip */}
        <div style={{ flexShrink: 0, overflowX: "auto", padding: "0 4vw 3vw", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: "2vw", width: "max-content" }}>
            {ALPHABET.map((a, i) => (
              <button key={a.letter} onClick={() => goToLetter(i)} style={{
                width: "11vw", height: "11vw", borderRadius: "3vw", flexShrink: 0,
                background: i === idx ? cur.color : learned.has(a.letter) ? "#d4edda" : "#fff",
                color: i === idx ? "#fff" : "#444", fontWeight: 900, fontSize: "4.5vw",
                border: i === idx ? "none" : "2px solid #ddd", cursor: "pointer",
                boxShadow: i === idx ? `0 1vw 0 ${cur.color}88` : "none",
              }}>{a.letter}</button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4vw 4vw", gap: "3vw" }}>
          <div key={cardKey} className={direction >= 0 ? "slide-r" : "slide-l"}
            style={{ background: "#fff", borderRadius: "6vw", boxShadow: "0 3vw 10vw rgba(0,0,0,0.13)", padding: "5vw", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "3vw" }}>

            {!tracing ? (<>
              {/* Big letters */}
              <div style={{ display: "flex", alignItems: "center", gap: "5vw" }}>
                <span style={{ fontSize: "30vw", fontWeight: 900, color: cur.color, lineHeight: 1 }}>{cur.letter}</span>
                <span style={{ fontSize: "24vw", fontWeight: 900, color: `${cur.color}88`, lineHeight: 1 }}>{cur.letter.toLowerCase()}</span>
              </div>

              {/* Emoji + name */}
              <div key={`e${idx}`} className="pop-in" style={{ fontSize: "28vw", lineHeight: 1 }}>{cur.emoji}</div>
              <div style={{ fontSize: "8vw", fontWeight: 800, color: "#333" }}>{cur.animal}</div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "3vw", width: "100%" }}>
                <Btn onClick={() => speak(`The letter ${cur.letter}! ${cur.letter} is for ${cur.animal}!`)}
                  bg={cur.color} color="#fff" style={{ flex: 1, fontSize: "5vw", padding: "4vw 2vw" }}>🔊 Say it!</Btn>
                <Btn onClick={() => setTracing(true)}
                  bg="#f4f4f8" color="#555" border="2px solid #e0e0e0" style={{ flex: 1, fontSize: "5vw", padding: "4vw 2vw" }}>✏️ Trace!</Btn>
              </div>

              {/* Learned */}
              <button onClick={toggleLearned} className={isLearned ? "bounce-k" : ""}
                style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: "5.5vw", background: isLearned ? "#2ED573" : "#fafafa", color: isLearned ? "#fff" : "#bbb", border: isLearned ? "none" : "2.5px dashed #ddd", borderRadius: "10vw", padding: "4vw 0", cursor: "pointer", width: "100%", boxShadow: isLearned ? "0 0.8vw 0 #1da855" : "none", transition: "all 0.2s" }}>
                {isLearned ? "⭐ Learned! Great job!" : "Mark as Learned ⭐"}
              </button>
            </>) : (
              <TraceCanvas letter={cur.letter} color={cur.color} onBack={() => setTracing(false)} />
            )}
          </div>

          {/* Nav arrows */}
          <div style={{ display: "flex", gap: "5vw", alignItems: "center" }}>
            <Btn onClick={() => nav(-1)} bg="#fff" color="#444" border="2px solid #ddd" style={{ fontSize: "7vw", padding: "3vw 5vw" }}>←</Btn>
            <span style={{ fontWeight: 800, color: "#777", fontSize: "5vw", minWidth: "14vw", textAlign: "center" }}>{idx + 1} / 26</span>
            <Btn onClick={() => nav(1)} bg={cur.color} color="#fff" style={{ fontSize: "7vw", padding: "3vw 5vw" }}>→</Btn>
          </div>
        </div>
      </Wrap>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz" && qIdx < quiz.length) {
    const q = quiz[qIdx];
    const isL2A = q.type === "L2A";
    const pct = (qIdx / quiz.length) * 100;

    return (
      <Wrap bg="linear-gradient(155deg,#f093fb 0%,#f5576c 100%)">
        {confetti.map((p) => <span key={p.id} className="conf" style={{ left: p.left, animationDelay: p.delay }}>{p.emoji}</span>)}

        {/* Header */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3vw 4vw" }}>
          <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.2)" color="#fff" border="1px solid rgba(255,255,255,0.4)" style={{ fontSize: "4.5vw", padding: "2.5vw 4vw" }}>✕ Exit</Btn>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: "6vw" }}>Score: {score} ⭐</span>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: "8vw", padding: "2.5vw 5vw", color: "#fff", fontWeight: 800, fontSize: "4.5vw" }}>{qIdx + 1}/{quiz.length}</div>
        </div>

        {/* Progress bar */}
        <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.25)", borderRadius: "3vw", height: "3vw", margin: "0 4vw", overflow: "hidden" }}>
          <div style={{ background: "#fff", borderRadius: "3vw", height: "100%", width: `${pct}%`, transition: "width 0.5s ease" }} />
        </div>

        {/* Question card */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "3vw 4vw 4vw" }}>
          <div className="pop-in" key={qIdx} style={{ background: "#fff", borderRadius: "6vw", boxShadow: "0 3vw 12vw rgba(0,0,0,0.2)", padding: "5vw 4vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "3vw", flex: 1 }}>

            <p style={{ color: "#aaa", fontSize: "4.5vw", textAlign: "center", fontWeight: 700 }}>
              {isL2A ? "🔤 Which animal starts with this letter?" : "🐾 Which letter does this animal start with?"}
            </p>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isL2A ? "28vw" : "22vw", fontWeight: 900, color: "#333", lineHeight: 1 }}>
                {isL2A ? q.item.letter : q.item.emoji}
              </div>
              {!isL2A && <div style={{ fontSize: "6vw", fontWeight: 800, color: "#666", marginTop: "1vw" }}>{q.item.animal}</div>}
            </div>

            {/* Answer grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3vw", width: "100%", flex: 1 }}>
              {q.options.map((opt) => {
                let bg = "#f4f4f8", border = "2px solid #e8e8e8", tc = "#333";
                if (selected !== null) {
                  if (opt.letter === correct) { bg = "#d4f7e4"; border = "2px solid #28a745"; tc = "#155724"; }
                  else if (opt.letter === selected) { bg = "#fde8ea"; border = "2px solid #dc3545"; tc = "#721c24"; }
                }
                return (
                  <button key={opt.letter} onClick={() => handleAnswer(opt)}
                    className={selected && opt.letter === selected && opt.letter !== correct ? "shake" : ""}
                    style={{ fontFamily: "'Nunito',sans-serif", background: bg, color: tc, border, borderRadius: "5vw", padding: "3vw 2vw", cursor: selected ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2vw", boxShadow: "0 1.5vw 0 rgba(0,0,0,0.08)", transition: "background 0.2s" }}>
                    {isL2A
                      ? <><span style={{ fontSize: "12vw" }}>{opt.emoji}</span><span style={{ fontSize: "3.5vw", fontWeight: 800 }}>{opt.animal}</span></>
                      : <span style={{ fontSize: "16vw", fontWeight: 900 }}>{opt.letter}</span>
                    }
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="pop-in" style={{ fontSize: "6vw", fontWeight: 800, color: selected === correct ? "#28a745" : "#dc3545", textAlign: "center" }}>
                {selected === correct ? "🎉 Correct! Amazing!" : `❌ It was ${correct} for ${ALPHABET.find(a => a.letter === correct)?.animal}!`}
              </div>
            )}
          </div>
        </div>
      </Wrap>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / (quiz.length || 1)) * 100);
    const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    const msg = pct >= 90 ? "You're a superstar! 🌟" : pct >= 60 ? "Great job! Keep it up! 💪" : "Good try! Practice more! 📚";
    return (
      <Wrap bg="linear-gradient(155deg,#667eea 0%,#764ba2 100%)">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "6vw 8vw" }}>
          <div className="bounce-k" style={{ fontSize: "25vw" }}>🏆</div>
          <div style={{ color: "#fff", fontSize: "11vw", fontWeight: 900, textAlign: "center" }}>Quiz Complete!</div>

          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "6vw", padding: "6vw 10vw", textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: "20vw", fontWeight: 900, color: "#FECA57", lineHeight: 1 }}>{score}/{quiz.length}</div>
            <div style={{ fontSize: "12vw", margin: "2vw 0" }}>{"⭐".repeat(stars)}</div>
            <div style={{ color: "rgba(255,255,255,0.92)", fontSize: "5.5vw", fontWeight: 700 }}>{msg}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4vw", width: "100%" }}>
            <Btn onClick={startQuiz} bg="#FECA57" color="#333" style={{ width: "100%", fontSize: "6vw", padding: "5vw" }}>🔄 Play Again!</Btn>
            <Btn onClick={() => setScreen("learn")} bg="rgba(255,255,255,0.2)" color="#fff" style={{ width: "100%", fontSize: "6vw", padding: "5vw", border: "1px solid rgba(255,255,255,0.4)" }}>📖 Keep Learning</Btn>
            <Btn onClick={() => setScreen("home")} bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.85)" style={{ width: "100%", fontSize: "5vw", padding: "4vw", border: "1px solid rgba(255,255,255,0.25)" }}>🏠 Home</Btn>
          </div>
        </div>
      </Wrap>
    );
  }

  return null;
}
