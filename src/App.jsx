import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as math from "mathjs";

/* ── FONTS ──────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

/* ── GLOBAL STYLES ──────────────────────────────────────── */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080b14; }
  :root {
    --bg: #080b14; --surface: #0e1220; --surface2: #141928;
    --border: rgba(99,179,237,0.12); --accent: #38bdf8; --accent2: #818cf8;
    --accent3: #34d399; --red: #f87171; --text: #e2e8f0; --muted: #64748b;
  }
  .cf-root {
    min-height: 100vh; background: var(--bg); color: var(--text);
    font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden;
  }
  .cf-root::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% -10%, rgba(56,189,248,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 85% 110%, rgba(129,140,248,0.06) 0%, transparent 70%);
  }
  .cf-root > * { position: relative; z-index: 1; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; transition: all 0.25s ease; }
  .card:hover { border-color: rgba(56,189,248,0.3); box-shadow: 0 0 32px rgba(56,189,248,0.07); transform: translateY(-2px); }
  .btn-calc {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
    color: var(--text); font-family: 'DM Mono', monospace; font-weight: 500;
    cursor: pointer; transition: all 0.12s ease; display: flex; align-items: center;
    justify-content: center; position: relative; overflow: hidden;
  }
  .btn-calc:hover { background: #1e2638; border-color: rgba(56,189,248,0.35); color: var(--accent); box-shadow: 0 0 12px rgba(56,189,248,0.12); transform: translateY(-1px); }
  .btn-calc:active, .btn-calc.pressed { transform: scale(0.93); background: rgba(56,189,248,0.12); border-color: var(--accent); }
  .btn-calc.btn-op   { color: var(--accent); border-color: rgba(56,189,248,0.2); }
  .btn-calc.btn-eq   { background: linear-gradient(135deg, #0ea5e9, #6366f1); border: none; color: #fff; font-size: 22px; }
  .btn-calc.btn-eq:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(56,189,248,0.35); }
  .btn-calc.btn-clear { color: var(--red); border-color: rgba(248,113,113,0.2); }
  .btn-calc.btn-fn   { color: var(--accent2); }
  .calc-display {
    background: linear-gradient(160deg, #0a0e1a, #0d1525);
    border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px;
    min-height: 96px; display: flex; flex-direction: column;
    justify-content: flex-end; align-items: flex-end; gap: 6px;
    margin-bottom: 18px; position: relative; overflow: hidden;
  }
  .calc-display::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
  }
  .display-input  { font-family: 'DM Mono', monospace; font-size: 15px; color: var(--muted); word-break: break-all; text-align: right; max-width: 100%; }
  .display-result { font-family: 'DM Mono', monospace; font-size: 30px; font-weight: 500; color: var(--text); word-break: break-all; text-align: right; }
  .display-result.has-val { color: var(--accent); text-shadow: 0 0 20px rgba(56,189,248,0.4); }
  .display-result.error   { color: var(--red); font-size: 16px; }
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 10px; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
    padding: 8px 16px; margin-bottom: 28px; transition: all 0.2s;
  }
  .back-btn:hover { color: var(--accent); border-color: rgba(56,189,248,0.3); }
  .cf-input {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
    color: var(--text); font-family: 'DM Mono', monospace; font-size: 15px;
    padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.2s;
  }
  .cf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }
  .pill { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; background: rgba(56,189,248,0.1); color: var(--accent); border: 1px solid rgba(56,189,248,0.2); }
  .mat-cell {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    color: var(--text); font-family: 'DM Mono', monospace;
    text-align: center; outline: none; transition: border-color 0.15s; width: 100%; display: block;
  }
  .mat-cell:focus { border-color: var(--accent3); box-shadow: 0 0 0 2px rgba(52,211,153,0.12); }
  .math-kbd {
    background: #0c1120; border: 1px solid rgba(129,140,248,0.25); border-radius: 12px;
    padding: 10px; display: grid; gap: 5px;
  }
  .math-kbd-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    color: var(--text); font-family: 'DM Mono', monospace; font-size: 13px;
    cursor: pointer; transition: all 0.1s; padding: 7px 4px;
    display: flex; align-items: center; justify-content: center; min-height: 34px;
  }
  .math-kbd-btn:hover { background: rgba(129,140,248,0.15); border-color: rgba(129,140,248,0.4); color: #818cf8; }
  .math-kbd-btn:active { transform: scale(0.92); }
  .math-kbd-btn.kbd-red { color: var(--red); border-color: rgba(248,113,113,0.2); }
  .math-kbd-btn.kbd-red:hover { background: rgba(248,113,113,0.1); border-color: var(--red); }
  .math-kbd-btn.kbd-accent { color: var(--accent); border-color: rgba(56,189,248,0.2); }
  .math-kbd-btn.kbd-accent:hover { background: rgba(56,189,248,0.1); }
  .math-preview {
    font-family: 'DM Mono', monospace; font-size: 17px; color: var(--text);
    min-height: 26px; word-break: break-all; line-height: 1.6;
  }
  .math-preview sup { font-size: 0.62em; line-height: 0; position: relative; top: -0.5em; color: var(--accent2); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3045; border-radius: 4px; }
`;
document.head.appendChild(globalStyle);

/* ── MATH HELPERS ─────────────────────────────────────── */
const BASE_SCOPE = { e: Math.E, pi: Math.PI, π: Math.PI, E: Math.E };

function preprocess(expr) {
  return expr
    .replace(/×/g, "*").replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√\(/g, "sqrt(")
    .replace(/\|([^|]+)\|/g, "abs($1)")
    .replace(/(\d)([a-zA-Z(])/g, "$1*$2")
    .replace(/([a-zA-Z)])(\d)/g, "$1*$2")
    .replace(/\)\s*\(/g, ")*(");
}

function evalAt(expr, x) {
  try {
    const scope = { ...BASE_SCOPE, x };
    const r = math.evaluate(preprocess(expr), scope);
    if (r === null || r === undefined) return null;
    if (typeof r === "number") return isFinite(r) ? r : null;
    if (typeof r === "object") {
      const re = r.re !== undefined ? r.re : r.valueOf?.();
      if (typeof re === "number" && isFinite(re)) return re;
    }
    return null;
  } catch { return null; }
}

function formatResult(val) {
  if (typeof val !== "number") return String(val);
  if (!isFinite(val)) return val > 0 ? "∞" : "-∞";
  if (val === 0) return "0";
  const abs = Math.abs(val);
  if (abs >= 1e-9 && abs < 1e15) return parseFloat(val.toPrecision(12)).toString();
  return parseFloat(val.toPrecision(10)).toString();
}

function renderMathExpr(expr) {
  const nodes = []; let i = 0, buf = "", key = 0;
  const flush = () => { if (buf) { nodes.push(<span key={key++}>{buf}</span>); buf = ""; } };
  while (i < expr.length) {
    if (expr[i] === "^") {
      flush(); i++;
      let exp = "";
      if (expr[i] === "(") {
        let d = 0, j = i;
        while (j < expr.length) { if (expr[j]==="(") d++; else if (expr[j]===")") { d--; if (!d){j++;break;} } j++; }
        exp = expr.slice(i, j); i = j;
      } else {
        let j = i; if (expr[j]==="-") j++;
        while (j < expr.length && /[0-9a-zA-Z._]/.test(expr[j])) j++;
        exp = expr.slice(i, j); i = j;
      }
      nodes.push(<sup key={key++}>{exp}</sup>);
    } else { buf += expr[i]; i++; }
  }
  flush(); return nodes;
}

/* ── MATH KEYBOARD ────────────────────────────────────── */
const KBD_ROWS = [
  [{ label:"x",ins:"x"},{label:"^",ins:"^"},{label:"(",ins:"("},{label:")",ins:")"},{label:"π",ins:"pi"},{label:"e",ins:"e"},{label:"⌫",ins:"__del",cls:"kbd-red"}],
  [{ label:"sin",ins:"sin("},{label:"cos",ins:"cos("},{label:"tan",ins:"tan("},{label:"√",ins:"sqrt("},{label:"log",ins:"log("},{label:"ln",ins:"ln("},{label:"abs",ins:"abs("}],
  [{ label:"7",ins:"7"},{label:"8",ins:"8"},{label:"9",ins:"9"},{label:"+",ins:"+",cls:"kbd-accent"},{label:"eˣ",ins:"e^("},{label:"xⁿ",ins:"x^"},{label:"C",ins:"__clear",cls:"kbd-red"}],
  [{ label:"4",ins:"4"},{label:"5",ins:"5"},{label:"6",ins:"6"},{label:"−",ins:"-",cls:"kbd-accent"},{label:"asin",ins:"asin("},{label:"acos",ins:"acos("},{label:"atan",ins:"atan("}],
  [{ label:"1",ins:"1"},{label:"2",ins:"2"},{label:"3",ins:"3"},{label:"×",ins:"*",cls:"kbd-accent"},{label:"sinh",ins:"sinh("},{label:"cosh",ins:"cosh("},{label:"tanh",ins:"tanh("}],
  [{ label:"0",ins:"0"},{label:".",ins:"."},{label:"/",ins:"/"},{label:"÷",ins:"/",cls:"kbd-accent"},{label:"floor",ins:"floor("},{label:"ceil",ins:"ceil("},{label:"mod",ins:" mod "}],
];
function MathKeyboard({ inputRef, value, onChange }) {
  const handleKey = (ins) => {
    const el = inputRef?.current;
    if (!el) { if (ins==="__del") onChange(value.slice(0,-1)); else if (ins==="__clear") onChange(""); else onChange(value+ins); return; }
    const s = el.selectionStart, e2 = el.selectionEnd;
    if (ins==="__del") { const n=value.slice(0,Math.max(0,s-1))+value.slice(e2>s?e2:s); onChange(n); requestAnimationFrame(()=>{el.focus();el.setSelectionRange(Math.max(0,s-1),Math.max(0,s-1));}); }
    else if (ins==="__clear") { onChange(""); requestAnimationFrame(()=>el.focus()); }
    else { const n=value.slice(0,s)+ins+value.slice(e2); onChange(n); const p=s+ins.length; requestAnimationFrame(()=>{el.focus();el.setSelectionRange(p,p);}); }
  };
  return (
    <div className="math-kbd" style={{ gridTemplateColumns:"repeat(7,1fr)" }}>
      {KBD_ROWS.flat().map((btn,i)=>(
        <button key={i} className={`math-kbd-btn ${btn.cls||""}`} onMouseDown={e=>{e.preventDefault();handleKey(btn.ins);}}>{btn.label}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DESMOS-STYLE CANVAS GRAPHING ENGINE
══════════════════════════════════════════════════════════ */

const GRAPH_COLORS = ["#38bdf8","#818cf8","#34d399","#f472b6","#fb923c","#facc15","#a78bfa","#2dd4bf"];

// Find a "nice" grid step given the current pixels-per-unit
function niceStep(pixelsPerUnit) {
  const rawStep = 80 / pixelsPerUnit; // aim for ~80px between gridlines
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let nice;
  if (norm < 1.5) nice = 1;
  else if (norm < 3.5) nice = 2;
  else if (norm < 7.5) nice = 5;
  else nice = 10;
  return nice * mag;
}

function formatLabel(n) {
  if (Math.abs(n) < 1e-10) return "0";
  if (Math.abs(n) >= 1e5 || (Math.abs(n) < 0.001 && n !== 0))
    return n.toExponential(1);
  const s = parseFloat(n.toPrecision(6)).toString();
  return s;
}

// Compile expression into a fast function
function compileExpr(exprStr) {
  const processed = preprocess(exprStr);
  try {
    const compiled = math.compile(processed);
    return (x) => {
      try {
        const scope = { ...BASE_SCOPE, x };
        const r = compiled.evaluate(scope);
        if (r === null || r === undefined) return null;
        if (typeof r === "number") return isFinite(r) ? r : null;
        if (typeof r === "object" && r.re !== undefined) {
          const re = r.re;
          return typeof re === "number" && isFinite(re) ? re : null;
        }
        return null;
      } catch { return null; }
    };
  } catch { return () => null; }
}

function DesmosGraph({ expressions }) {
  const canvasRef = useRef(null);
  // viewport: cx,cy = math center of canvas, scale = pixels per math unit
  const vpRef = useRef({ cx: 0, cy: 0, scale: 60 });
  const [vp, setVp] = useState({ cx: 0, cy: 0, scale: 60 });
  const dragRef = useRef(null); // { startX, startY, startCx, startCy }
  const [mouseCoord, setMouseCoord] = useState(null);
  const animRef = useRef(null);

  // Convert math → canvas pixel
  const toPixel = useCallback((mx, my, w, h, v) => ({
    px: w / 2 + (mx - v.cx) * v.scale,
    py: h / 2 - (my - v.cy) * v.scale,
  }), []);

  // Convert canvas pixel → math
  const toMath = useCallback((px, py, w, h, v) => ({
    x: v.cx + (px - w / 2) / v.scale,
    y: v.cy - (py - h / 2) / v.scale,
  }), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const v = vpRef.current;

    // Clear
    ctx.fillStyle = "#080c18";
    ctx.fillRect(0, 0, W, H);

    const step = niceStep(v.scale);

    // --- Grid lines ---
    const xMin = v.cx - W / 2 / v.scale;
    const xMax = v.cx + W / 2 / v.scale;
    const yMin = v.cy - H / 2 / v.scale;
    const yMax = v.cy + H / 2 / v.scale;

    const startX = Math.ceil(xMin / step) * step;
    const startY = Math.ceil(yMin / step) * step;

    ctx.lineWidth = 1;

    // Sub-gridlines (faint)
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.beginPath();
    for (let gx = startX; gx <= xMax; gx += step) {
      const px = W / 2 + (gx - v.cx) * v.scale;
      ctx.moveTo(px, 0); ctx.lineTo(px, H);
    }
    for (let gy = startY; gy <= yMax; gy += step) {
      const py = H / 2 - (gy - v.cy) * v.scale;
      ctx.moveTo(0, py); ctx.lineTo(W, py);
    }
    ctx.stroke();

    // --- Axes ---
    const ox = W / 2 + (0 - v.cx) * v.scale;
    const oy = H / 2 - (0 - v.cy) * v.scale;

    // Axis glow
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(56,189,248,0.3)";
    ctx.strokeStyle = "rgba(56,189,248,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();
    ctx.restore();

    // --- Axis tick labels ---
    ctx.font = "10px DM Mono, monospace";
    ctx.fillStyle = "rgba(100,116,139,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let gx = startX; gx <= xMax; gx += step) {
      if (Math.abs(gx) < step * 0.01) continue;
      const px = W / 2 + (gx - v.cx) * v.scale;
      const labelY = Math.max(4, Math.min(H - 16, oy + 4));
      ctx.fillText(formatLabel(gx), px, labelY);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let gy = startY; gy <= yMax; gy += step) {
      if (Math.abs(gy) < step * 0.01) continue;
      const py = H / 2 - (gy - v.cy) * v.scale;
      const labelX = Math.max(30, Math.min(W - 4, ox - 4));
      ctx.fillText(formatLabel(gy), labelX, py);
    }

    // Origin label
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(100,116,139,0.6)";
    const olx = Math.max(30, Math.min(W - 4, ox - 4));
    const oly = Math.max(4, Math.min(H - 16, oy + 4));
    ctx.fillText("0", olx, oly);

    // --- Plot expressions ---
    const SAMPLES = W * 1.5; // sample at 1.5x pixel density for smoothness

    expressions.forEach((exp, ei) => {
      if (!exp.value.trim()) return;
      const fn = compileExpr(exp.value);
      const color = exp.color;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = color + "88";

      ctx.beginPath();
      let penDown = false;
      let prevY = null;

      for (let i = 0; i <= SAMPLES; i++) {
        const px = (i / SAMPLES) * W;
        const mx = v.cx + (px - W / 2) / v.scale;
        const my = fn(mx);

        if (my === null) {
          penDown = false;
          prevY = null;
          continue;
        }

        const py = H / 2 - (my - v.cy) * v.scale;

        // Discontinuity detection: if slope is too steep, lift pen
        let discontinuous = false;
        if (prevY !== null) {
          const dyPixels = Math.abs(py - prevY);
          if (dyPixels > H * 1.5) discontinuous = true;
        }

        if (!penDown || discontinuous) {
          ctx.moveTo(px, py);
          penDown = true;
        } else {
          ctx.lineTo(px, py);
        }
        prevY = py;
      }
      ctx.stroke();
      ctx.restore();

      // Expression label at right edge
      const labelX2 = W - 8;
      const midMx = v.cx + (labelX2 - W / 2) / v.scale;
      const midMy = fn(midMx);
      if (midMy !== null) {
        const labelPy = H / 2 - (midMy - v.cy) * v.scale;
        if (labelPy > 8 && labelPy < H - 8) {
          ctx.save();
          ctx.font = "bold 11px DM Mono, monospace";
          ctx.fillStyle = color;
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#080c18";
          ctx.fillText(exp.value.slice(0, 20), labelX2, labelPy - 3);
          ctx.restore();
        }
      }
    });

    // Crosshair at center
    ctx.strokeStyle = "rgba(56,189,248,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H);
    ctx.moveTo(0, H/2); ctx.lineTo(W, H/2);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [expressions]);

  // Redraw whenever vp or expressions change
  useEffect(() => { draw(); }, [vp, draw]);

  // Wheel zoom — zoom toward mouse position
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const v = vpRef.current;

    // Math coord under mouse before zoom
    const mathX = v.cx + (mx - W / 2) / v.scale;
    const mathY = v.cy - (my - H / 2) / v.scale;

    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.max(2, Math.min(v.scale * factor, 50000));

    // Adjust center so math point under mouse stays fixed
    const newCx = mathX - (mx - W / 2) / newScale;
    const newCy = mathY + (my - H / 2) / newScale;

    vpRef.current = { cx: newCx, cy: newCy, scale: newScale };
    setVp({ ...vpRef.current });
  }, []);

  // Pan
  const handleMouseDown = useCallback((e) => {
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startCx: vpRef.current.cx, startCy: vpRef.current.cy,
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Update coordinate display
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const v = vpRef.current;
    const W = canvas.width, H = canvas.height;
    const mx = v.cx + (px - W / 2) / v.scale;
    const my = v.cy - (py - H / 2) / v.scale;
    setMouseCoord({ x: mx, y: my });

    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const v2 = vpRef.current;
    vpRef.current = {
      ...v2,
      cx: dragRef.current.startCx - dx / v2.scale,
      cy: dragRef.current.startCy + dy / v2.scale,
    };
    setVp({ ...vpRef.current });
  }, []);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);
  const handleMouseLeave = useCallback(() => { dragRef.current = null; setMouseCoord(null); }, []);

  // Touch pan/zoom
  const touchRef = useRef(null);
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      touchRef.current = { type: "pan", x: e.touches[0].clientX, y: e.touches[0].clientY, cx: vpRef.current.cx, cy: vpRef.current.cy };
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchRef.current = { type: "pinch", dist: d, scale: vpRef.current.scale };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!touchRef.current) return;
    if (touchRef.current.type === "pan" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      const v = vpRef.current;
      vpRef.current = { ...v, cx: touchRef.current.cx - dx / v.scale, cy: touchRef.current.cy + dy / v.scale };
      setVp({ ...vpRef.current });
    } else if (touchRef.current.type === "pinch" && e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.max(2, Math.min(touchRef.current.scale * (d / touchRef.current.dist), 50000));
      vpRef.current = { ...vpRef.current, scale: newScale };
      setVp({ ...vpRef.current });
    }
  }, []);

  const handleTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  // Attach wheel with passive:false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleWheel, handleTouchMove]);

  // Resize observer — make canvas fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = rect.width  * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      canvas.style.width  = rect.width  + "px";
      canvas.style.height = rect.height + "px";
      draw();
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [draw]);

  const zoom = (dir) => {
    const factor = dir > 0 ? 1.4 : 1 / 1.4;
    vpRef.current = { ...vpRef.current, scale: Math.max(2, Math.min(vpRef.current.scale * factor, 50000)) };
    setVp({ ...vpRef.current });
  };

  const reset = () => {
    vpRef.current = { cx: 0, cy: 0, scale: 60 };
    setVp({ ...vpRef.current });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: 370, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(56,189,248,0.15)", background: "#080c18" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: dragRef.current ? "grabbing" : "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {[["＋", 1], ["－", -1]].map(([lbl, dir]) => (
          <button key={lbl} onClick={() => zoom(dir)} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(14,18,32,0.9)", border: "1px solid rgba(56,189,248,0.25)", color: "#38bdf8", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            {lbl}
          </button>
        ))}
        <button onClick={reset} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(14,18,32,0.9)", border: "1px solid rgba(56,189,248,0.15)", color: "var(--muted)", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", fontFamily: "DM Mono" }}>
          ⌂
        </button>
      </div>

      {/* Coordinate display */}
      {mouseCoord && (
        <div style={{ position: "absolute", bottom: 10, left: 12, fontFamily: "DM Mono", fontSize: 11, color: "rgba(100,116,139,0.9)", background: "rgba(8,12,24,0.7)", padding: "3px 8px", borderRadius: 6, backdropFilter: "blur(4px)", pointerEvents: "none" }}>
          ({parseFloat(mouseCoord.x.toPrecision(5))}, {parseFloat(mouseCoord.y.toPrecision(5))})
        </div>
      )}

      {/* Drag hint */}
      <div style={{ position: "absolute", top: 10, right: 10, fontFamily: "DM Mono", fontSize: 10, color: "rgba(100,116,139,0.5)", pointerEvents: "none" }}>
        drag · scroll to zoom
      </div>
    </div>
  );
}

/* ── GRAPHING PAGE ────────────────────────────────────── */
function ExprRow({ exp, onUpdate, onRemove, showRemove }) {
  const [showKbd, setShowKbd] = useState(false);
  const inputRef = useRef(null);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: exp.color, flexShrink: 0, boxShadow: `0 0 6px ${exp.color}88` }} />
        <input ref={inputRef} className="cf-input" value={exp.value}
          onChange={e => onUpdate(exp.id, e.target.value)}
          placeholder="e.g. sin(x), e^x, x^2-3"
          style={{ flex: 1, borderColor: exp.color + "55", padding: "8px 12px", fontSize: 14 }} />
        <button onClick={() => setShowKbd(v => !v)} title="Math keyboard"
          style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, cursor: "pointer", background: showKbd ? "rgba(129,140,248,0.2)" : "var(--surface2)", border: `1px solid ${showKbd ? "rgba(129,140,248,0.5)" : "var(--border)"}`, color: showKbd ? "#818cf8" : "var(--muted)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⌨</button>
        {showRemove && (
          <button onClick={() => onRemove(exp.id)} style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "none", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        )}
      </div>
      {showKbd && <div style={{ marginTop: 8, marginLeft: 16 }}><MathKeyboard inputRef={inputRef} value={exp.value} onChange={v => onUpdate(exp.id, v)} /></div>}
    </div>
  );
}

function Graphing({ setMode }) {
  const [expressions, setExpressions] = useState([
    { id: 1, value: "sin(x)", color: GRAPH_COLORS[0] },
    { id: 2, value: "cos(x)", color: GRAPH_COLORS[1] },
  ]);

  const update = (id, value) => setExpressions(e => e.map(ex => ex.id === id ? { ...ex, value } : ex));
  const remove = (id) => setExpressions(e => e.filter(ex => ex.id !== id));
  const add = () => {
    if (expressions.length >= 8) return;
    setExpressions(e => [...e, { id: Date.now(), value: "", color: GRAPH_COLORS[e.length % GRAPH_COLORS.length] }]);
  };

  const EXAMPLES = ["sin(x)", "cos(x)", "tan(x)", "x^2", "x^3-x", "e^x", "e^(-x^2)", "1/x", "sqrt(x)", "abs(x)", "log(x)", "floor(x)", "e^(i*x)"];

  return (
    <div>
      <BackBtn setMode={setMode} />
      <SectionTitle icon="∿" title="Graphing Calculator" color="#818cf8" />

      {/* Canvas graph */}
      <DesmosGraph expressions={expressions} />

      {/* Expression list */}
      <div style={{ marginTop: 14 }}>
        {expressions.map(exp => (
          <ExprRow key={exp.id} exp={exp} onUpdate={update} onRemove={remove} showRemove={expressions.length > 1} />
        ))}
        <button onClick={add} style={{ marginTop: 6, padding: "7px 14px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, color: "#818cf8", fontSize: 13, cursor: "pointer" }}>
          + Add function
        </button>
      </div>

      {/* Examples */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Quick examples:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => update(expressions[0].id, ex)}
              style={{ padding: "3px 9px", borderRadius: 7, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "DM Mono", fontSize: 11, cursor: "pointer" }}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [mode, setMode] = useState("home");
  return (
    <div className="cf-root" style={{ padding: "28px 20px", maxWidth: 560, margin: "0 auto" }}>
      {mode === "home"     && <Home setMode={setMode} />}
      {mode === "basic"    && <BasicCalc setMode={setMode} />}
      {mode === "graph"    && <Graphing setMode={setMode} />}
      {mode === "matrix"   && <Matrix setMode={setMode} />}
      {mode === "calculus" && <Calculus setMode={setMode} />}
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────── */
function Home({ setMode }) {
  const cards = [
    { name: "Basic Calc",  sub: "Arithmetic & trig",    icon: "⊞", mode: "basic",    accent: "#38bdf8" },
    { name: "Graphing",    sub: "Desmos-style plotter",  icon: "∿", mode: "graph",    accent: "#818cf8" },
    { name: "Matrix",      sub: "Up to 10×10 algebra",   icon: "⊡", mode: "matrix",   accent: "#34d399" },
    { name: "Calculus",    sub: "Derivatives & more",    icon: "∂", mode: "calculus", accent: "#f472b6" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#38bdf8 0%,#818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CalcFlow</span>
          <span className="pill">PRO</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Your complete mathematics toolkit</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {cards.map(c => (
          <button key={c.mode} onClick={() => setMode(c.mode)} className="card"
            style={{ cursor: "pointer", padding: "22px 20px", textAlign: "left", border: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ fontSize: 28, marginBottom: 12, color: c.accent, textShadow: `0 0 20px ${c.accent}44` }}>{c.icon}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── BASIC CALCULATOR ──────────────────────────────────── */
function BasicCalc({ setMode }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);
  const [pressed, setPressed] = useState(null);

  const evaluate = useCallback((expr) => {
    if (!expr) return;
    try {
      const val = math.evaluate(preprocess(expr), { ...BASE_SCOPE });
      const num = typeof val === "number" ? val : (val.valueOf ? val.valueOf() : val);
      setResult(typeof num === "number" && isFinite(num) ? formatResult(num) : String(num));
      setError(false);
    } catch { setResult("Error"); setError(true); }
  }, []);

  const handleBtn = useCallback((val) => {
    setPressed(val); setTimeout(() => setPressed(null), 120);
    if (val === "C")   { setInput(""); setResult(""); setError(false); return; }
    if (val === "⌫")   { setInput(p => p.slice(0, -1)); return; }
    if (val === "=")   { evaluate(input); return; }
    if (val === "+/-") { setInput(p => p.startsWith("-") ? p.slice(1) : p ? "-" + p : ""); return; }
    if (val === "%")   { try { setInput(p => String(parseFloat(p) / 100)); } catch {} return; }
    setInput(p => p + val);
  }, [input, evaluate]);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) handleBtn(k);
      else if (["+","-","*","/",".","(",")"].includes(k)) handleBtn(k);
      else if (k === "Enter" || k === "=") handleBtn("=");
      else if (k === "Backspace") handleBtn("⌫");
      else if (k === "Escape") handleBtn("C");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleBtn]);

  const layout = [
    ["C","+/-","%","÷"], ["7","8","9","×"], ["4","5","6","-"],
    ["1","2","3","+"], ["0",".","⌫","="],
  ];
  const cls = (b) => {
    let c = "btn-calc";
    if (["÷","×","-","+"].includes(b)) c += " btn-op";
    if (b === "=") c += " btn-eq"; if (b === "C") c += " btn-clear";
    if (b === pressed) c += " pressed";
    return c;
  };

  return (
    <div>
      <BackBtn setMode={setMode} />
      <SectionTitle icon="⊞" title="Basic Calculator" color="#38bdf8" />
      <div className="calc-display">
        <div className="display-input">
          <span className="math-preview">{input ? renderMathExpr(input) : <span style={{ color: "var(--muted)" }}>0</span>}</span>
        </div>
        <div className={`display-result ${error ? "error" : result ? "has-val" : ""}`}>{result || "—"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
        {layout.flat().map((b, i) => (
          <button key={i} className={cls(b)} onClick={() => handleBtn(b)} style={{ height: 64, fontSize: b.length > 1 ? 14 : 20 }}>{b}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {["sin(","cos(","tan(","√(","log(","ln(","π","e"].map((b, i) => (
          <button key={i} className={`btn-calc btn-fn ${pressed===b?"pressed":""}`}
            onClick={() => handleBtn(b === "π" ? "pi" : b)}
            style={{ height: 44, fontSize: 13 }}>{b}</button>
        ))}
      </div>
    </div>
  );
}

/* ── MATRIX ────────────────────────────────────────────── */
const MATRIX_OPS = [
  { id:"multiply",label:"A × B",single:false },{ id:"add",label:"A + B",single:false },
  { id:"subtract",label:"A − B",single:false },{ id:"det",label:"det(A)",single:true },
  { id:"inv",label:"A⁻¹",single:true },{ id:"transpose",label:"Aᵀ",single:true },
  { id:"power",label:"Aⁿ",single:true },{ id:"eigenvalues",label:"eig(A)",single:true },
  { id:"trace",label:"tr(A)",single:true },{ id:"rank",label:"rank(A)",single:true },
];
function makeEmpty(r, c) { return Array.from({length:r},(_,ri)=>Array.from({length:c},(_,ci)=>ri===ci?"1":"0")); }

function Matrix({ setMode }) {
  const [rows,setRows]=useState(3); const [cols,setCols]=useState(3);
  const [rowsB,setRowsB]=useState(3); const [colsB,setColsB]=useState(3);
  const [matA,setMatA]=useState(makeEmpty(3,3)); const [matB,setMatB]=useState(makeEmpty(3,3));
  const [op,setOp]=useState("multiply"); const [power,setPower]=useState("2");
  const [result,setResult]=useState(null); const [resultMeta,setResultMeta]=useState("matrix");
  const [error,setError]=useState("");
  const isSingle=MATRIX_OPS.find(o=>o.id===op)?.single;
  const resizeMat=(mat,r,c)=>Array.from({length:r},(_,i)=>Array.from({length:c},(_,j)=>mat[i]?.[j]??(i===j?"1":"0")));
  const resizeA=(r,c)=>{setRows(r);setCols(c);setMatA(p=>resizeMat(p,r,c));};
  const resizeB=(r,c)=>{setRowsB(r);setColsB(c);setMatB(p=>resizeMat(p,r,c));};
  const setCell=(setter,r,c,v)=>setter(p=>{const n=p.map(row=>[...row]);n[r][c]=v;return n;});
  const toMath=(mat)=>math.matrix(mat.map(row=>row.map(v=>parseFloat(v)||0)));
  const fmtCell=(v)=>{
    if(typeof v==="number") return formatResult(parseFloat(v.toPrecision(7)));
    if(v?.re!==undefined) return formatResult(parseFloat(v.re.toPrecision(6)));
    return String(v);
  };

  const compute=()=>{
    try {
      const A=toMath(matA); let res,meta="matrix";
      if(op==="multiply"){res=math.multiply(A,toMath(matB));}
      else if(op==="add"){res=math.add(A,toMath(matB));}
      else if(op==="subtract"){res=math.subtract(A,toMath(matB));}
      else if(op==="det"){res=math.det(A);meta="scalar";}
      else if(op==="inv"){res=math.inv(A);}
      else if(op==="transpose"){res=math.transpose(A);}
      else if(op==="power"){res=math.pow(A,parseInt(power)||2);}
      else if(op==="trace"){const a=A.toArray();res=a.reduce((s,r,i)=>s+(parseFloat(r[i])||0),0);meta="scalar";}
      else if(op==="rank"){
        const arr=A.toArray().map(r=>r.map(Number));let rank=0,lead=0,M=arr.map(r=>[...r]);
        const m=M.length,n2=M[0].length;
        for(let r=0;r<m;r++){if(lead>=n2)break;let i=r;while(Math.abs(M[i]?.[lead]??0)<1e-10){i++;if(i===m){i=r;lead++;if(lead===n2)break;}}if(lead>=n2)break;[M[i],M[r]]=[M[r],M[i]];const d=M[r][lead];if(Math.abs(d)>1e-10){M[r]=M[r].map(v=>v/d);rank++;}for(let j=0;j<m;j++){if(j!==r){const f=M[j][lead];M[j]=M[j].map((v,k)=>v-f*M[r][k]);}}lead++;}
        res=rank;meta="scalar";
      }
      else if(op==="eigenvalues"){const eigs=math.eigs(A);res=eigs.values.toArray?eigs.values.toArray():eigs.values;meta="list";}
      setResult(res?.toArray?res.toArray():res); setResultMeta(meta); setError("");
    } catch(e){setError(e.message||"Computation failed");setResult(null);}
  };

  const SizeBtn=({n,cur,onSel})=>(
    <button onClick={()=>onSel(n)} style={{width:26,height:26,borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"DM Mono",background:cur===n?"rgba(52,211,153,0.2)":"var(--surface2)",border:`1px solid ${cur===n?"rgba(52,211,153,0.5)":"var(--border)"}`,color:cur===n?"#34d399":"var(--muted)"}}>{n}</button>
  );

  const renderGrid=(mat,setter,label,color,r,c,onRR,onRC)=>{
    const cell=Math.max(26,Math.min(42,Math.floor(440/Math.max(c,2))));
    const fs=Math.max(10,Math.min(14,Math.floor(cell*0.38)));
    return(
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color,fontFamily:"DM Mono",fontWeight:500}}>{label} ({r}×{c})</span>
          <span style={{fontSize:11,color:"var(--muted)"}}>rows</span>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={r} onSel={onRR}/>)}</div>
          <span style={{fontSize:11,color:"var(--muted)"}}>cols</span>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={c} onSel={onRC}/>)}</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <div style={{display:"inline-grid",gap:3,gridTemplateColumns:`repeat(${c},${cell}px)`}}>
            {mat.map((row,ri)=>row.map((cell2,ci)=>(
              <input key={`${ri}-${ci}`} className="mat-cell" value={cell2} onChange={e=>setCell(setter,ri,ci,e.target.value)} style={{height:cell,fontSize:fs,borderColor:color+"33",padding:"1px"}}/>
            )))}
          </div>
        </div>
      </div>
    );
  };

  const renderResult=()=>{
    if(result===null||result===undefined) return null;
    if(resultMeta==="scalar") return <div style={{fontFamily:"DM Mono",fontSize:28,color:"#34d399"}}>{formatResult(typeof result==="number"?result:result)}</div>;
    if(resultMeta==="list"){
      const arr=Array.isArray(result)?result:[result];
      return <div style={{display:"flex",flexDirection:"column",gap:6}}>{arr.map((v,i)=>{const isC=v?.re!==undefined;const re=fmtCell(isC?v.re:v);const im=isC?v.im:0;return<div key={i} style={{fontFamily:"DM Mono",fontSize:15,color:"var(--text)"}}>λ{i+1} = {re}{isC&&Math.abs(im)>1e-10?` + ${formatResult(parseFloat(im.toPrecision(5)))}i`:""}</div>;})}</div>;
    }
    const arr=Array.isArray(result)?result:[];
    return(<div style={{overflowX:"auto"}}><div style={{display:"inline-grid",gap:4,gridTemplateColumns:`repeat(${arr[0]?.length||1},minmax(52px,auto))`}}>{arr.map((row,ri)=>(Array.isArray(row)?row:[row]).map((cell,ci)=>(<div key={`${ri}-${ci}`} style={{fontFamily:"DM Mono",fontSize:13,color:"var(--text)",padding:"5px 10px",background:"rgba(52,211,153,0.07)",borderRadius:6,textAlign:"right"}}>{fmtCell(cell)}</div>)))}</div></div>);
  };

  return(
    <div>
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="⊡" title="Matrix Operations" color="#34d399"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
        {MATRIX_OPS.map(o=>(<button key={o.id} onClick={()=>setOp(o.id)} style={{padding:"6px 12px",borderRadius:10,fontFamily:"DM Mono",fontSize:12,cursor:"pointer",background:op===o.id?"rgba(52,211,153,0.15)":"var(--surface2)",border:`1px solid ${op===o.id?"rgba(52,211,153,0.4)":"var(--border)"}`,color:op===o.id?"#34d399":"var(--muted)"}}>{o.label}</button>))}
      </div>
      {renderGrid(matA,setMatA,"Matrix A","#34d399",rows,cols,r=>resizeA(r,cols),c=>resizeA(rows,c))}
      {!isSingle&&renderGrid(matB,setMatB,"Matrix B","#38bdf8",rowsB,colsB,r=>resizeB(r,colsB),c=>resizeB(rowsB,c))}
      {op==="power"&&(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{color:"var(--muted)",fontSize:13}}>n =</span><input className="cf-input" type="number" value={power} onChange={e=>setPower(e.target.value)} style={{width:80}}/></div>)}
      <button onClick={compute} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,rgba(52,211,153,0.2),rgba(56,189,248,0.2))",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399",fontFamily:"DM Mono",fontSize:15,cursor:"pointer",fontWeight:500}}>Compute</button>
      {error&&<div style={{marginTop:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}
      {result!==null&&result!==undefined&&(<div style={{marginTop:14,padding:"16px",background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12}}><div style={{fontSize:11,color:"#34d399",marginBottom:10,fontFamily:"DM Mono"}}>RESULT</div>{renderResult()}</div>)}
    </div>
  );
}

/* ── CALCULUS ──────────────────────────────────────────── */
function Calculus({ setMode }) {
  const [input,setInput]=useState("x^3 + 2*x^2 - x");
  const [result,setResult]=useState("");
  const [op,setOp]=useState("derivative");
  const [variable,setVar]=useState("x");
  const [error,setError]=useState("");
  const [showKbd,setShowKbd]=useState(false);
  const inputRef=useRef(null);

  const compute=useCallback(()=>{
    try {
      let res;
      if(op==="derivative") res=math.derivative(input,variable).toString();
      else if(op==="simplify") res=math.simplify(input).toString();
      setResult(res);setError("");
    } catch{setError("Could not evaluate — check syntax");setResult("");}
  },[input,op,variable]);

  useEffect(()=>{
    const h=e=>{if(e.target.tagName==="INPUT")return;if(e.key==="Enter")compute();};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[compute]);

  const ops=[{id:"derivative",label:"d/dx Derivative"},{id:"simplify",label:"≡ Simplify"}];
  const examples=["x^3 - 2*x","sin(x)*cos(x)","e^x + ln(x)","x^4/4 - x^2"];

  return(
    <div>
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="∂" title="Calculus" color="#f472b6"/>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {ops.map(o=>(<button key={o.id} onClick={()=>setOp(o.id)} style={{flex:1,padding:"9px",borderRadius:10,fontFamily:"DM Mono",fontSize:13,cursor:"pointer",background:op===o.id?"rgba(244,114,182,0.15)":"var(--surface2)",border:`1px solid ${op===o.id?"rgba(244,114,182,0.4)":"var(--border)"}`,color:op===o.id?"#f472b6":"var(--muted)"}}>{o.label}</button>))}
      </div>
      <div style={{padding:"10px 14px",background:"var(--surface2)",borderRadius:10,marginBottom:8,minHeight:36}}>
        <span className="math-preview">{input?renderMathExpr(input):<span style={{color:"var(--muted)"}}>expression…</span>}</span>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <input ref={inputRef} className="cf-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&compute()} placeholder="e.g. x^2 + sin(x)" style={{flex:1}}/>
        <button onClick={()=>setShowKbd(v=>!v)} style={{width:40,flexShrink:0,borderRadius:10,cursor:"pointer",background:showKbd?"rgba(244,114,182,0.15)":"var(--surface2)",border:`1px solid ${showKbd?"rgba(244,114,182,0.4)":"var(--border)"}`,color:showKbd?"#f472b6":"var(--muted)",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>⌨</button>
      </div>
      {showKbd&&<div style={{marginBottom:12}}><MathKeyboard inputRef={inputRef} value={input} onChange={setInput}/></div>}
      {op==="derivative"&&(<div style={{marginBottom:14}}><div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>With respect to</div><input className="cf-input" value={variable} onChange={e=>setVar(e.target.value)} style={{width:80}}/></div>)}
      <button onClick={compute} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,rgba(244,114,182,0.2),rgba(129,140,248,0.2))",border:"1px solid rgba(244,114,182,0.3)",color:"#f472b6",fontFamily:"DM Mono",fontSize:15,cursor:"pointer",fontWeight:500,marginBottom:14}}>Compute ↵</button>
      {error&&<div style={{marginBottom:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}
      {result&&(<div style={{padding:"16px 20px",background:"rgba(244,114,182,0.05)",border:"1px solid rgba(244,114,182,0.2)",borderRadius:12,marginBottom:18}}><div style={{fontSize:11,color:"#f472b6",marginBottom:8,fontFamily:"DM Mono"}}>RESULT</div><div className="math-preview" style={{fontSize:20,color:"var(--text)"}}>{renderMathExpr(result)}</div></div>)}
      <div><div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>Examples</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{examples.map(ex=>(<button key={ex} onClick={()=>setInput(ex)} style={{padding:"5px 12px",borderRadius:8,background:"var(--surface2)",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"DM Mono",fontSize:12,cursor:"pointer"}}>{ex}</button>))}</div></div>
    </div>
  );
}

/* ── SHARED ──────────────────────────────────────────────── */
function BackBtn({ setMode }) { return <button className="back-btn" onClick={() => setMode("home")}>← Back</button>; }
function SectionTitle({ icon, title, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
      <span style={{ fontSize:22, color, textShadow:`0 0 16px ${color}66` }}>{icon}</span>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, letterSpacing:"-0.01em" }}>{title}</h2>
    </div>
  );
}
