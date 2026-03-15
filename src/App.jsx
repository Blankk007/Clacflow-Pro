import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as math from "mathjs";
import * as THREE from "three";

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

  /* ── Tailwind preflight reset fix — restore color inheritance ── */
  .cf-root { color: var(--text); }
  .cf-root button { color: inherit; font-family: inherit; background: transparent; border: none; }
  .cf-root a { color: inherit; }

  /* ── DARK MODE (default) ── */
  :root {
    --bg: #080b14; --surface: #0e1220; --surface2: #141928;
    --border: rgba(99,179,237,0.12); --border2: rgba(99,179,237,0.06);
    --accent: #38bdf8; --accent2: #818cf8; --accent3: #34d399;
    --red: #f87171; --text: #e2e8f0; --muted: #64748b;
    --shadow-glow: rgba(56,189,248,0.08);
    --hdr-bg: rgba(8,11,20,0.92);
    --kbd-bg: #0c1120;
    --display-bg: linear-gradient(160deg,#0a0e1a,#0d1525);
    --mode: dark;
  }

  /* ── LIGHT MODE ── */
  .light {
    --bg: #f8faff; --surface: #ffffff; --surface2: #eef2ff;
    --border: rgba(79,107,200,0.22); --border2: rgba(79,107,200,0.10);
    --accent: #0369a1; --accent2: #5b21b6; --accent3: #047857;
    --red: #b91c1c; --text: #0f172a; --sub-text: #1e293b; --muted: #475569;
    --shadow-glow: rgba(3,105,161,0.12);
    --hdr-bg: rgba(248,250,255,0.95);
    --kbd-bg: #e8edff;
    --display-bg: linear-gradient(160deg,#e2eaff,#d5dfff);
    --result-muted: rgba(30,41,59,0.6);
  }
  .light body { background:#f8faff; }
  .light .cf-root { background:var(--bg); }
  .light .cf-root::before {
    background: radial-gradient(ellipse 60% 40% at 20% -10%, rgba(79,107,200,0.10) 0%, transparent 70%),
                radial-gradient(ellipse 50% 50% at 85% 110%, rgba(91,33,182,0.07) 0%, transparent 70%);
  }
  /* Buttons */
  .light .btn-calc { background:#fff; color:var(--text); border-color:rgba(79,107,200,0.25); }
  .light .btn-calc:hover { background:#eff4ff; border-color:var(--accent); color:var(--accent); box-shadow:0 0 10px rgba(3,105,161,0.10); }
  .light .btn-calc:active,.light .btn-calc.pressed { background:rgba(3,105,161,0.10); border-color:var(--accent); }
  .light .btn-calc.btn-op { color:var(--accent); border-color:rgba(3,105,161,0.3); }
  .light .btn-calc.btn-fn { color:var(--accent2); border-color:rgba(91,33,182,0.2); }
  .light .btn-calc.btn-clear { color:var(--red); border-color:rgba(185,28,28,0.2); }
  .light .btn-calc.btn-eq { background:linear-gradient(135deg,#0369a1,#5b21b6); border:none; color:#fff; }
  /* Display */
  .light .calc-display { background:var(--display-bg); border-color:rgba(79,107,200,0.25); }
  .light .calc-display::before { background:linear-gradient(90deg,transparent,rgba(3,105,161,0.35),transparent); }
  /* Cards */
  .light .card { background:#fff; border-color:rgba(79,107,200,0.18); box-shadow:0 1px 4px rgba(0,0,0,0.06); }
  .light .card:hover { border-color:rgba(3,105,161,0.4); box-shadow:0 4px 16px rgba(3,105,161,0.12); }
  /* Inputs */
  .light .cf-input { background:#fff; color:var(--text); border-color:rgba(79,107,200,0.25); }
  .light .cf-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(3,105,161,0.10); }
  /* Keyboard */
  .light .math-kbd { background:var(--kbd-bg); border-color:rgba(91,33,182,0.2); }
  .light .math-kbd-btn { background:#fff; color:var(--text); border-color:rgba(79,107,200,0.2); }
  .light .math-kbd-btn:hover { background:#eff0ff; border-color:rgba(91,33,182,0.4); color:var(--accent2); }
  .light .math-kbd-btn.kbd-red { color:var(--red); }
  .light .math-kbd-btn.kbd-accent { color:var(--accent); }
  /* Math renderer */
  .light .math-display { color:var(--text); }
  .light .math-var { color:#1e40af; font-style:italic; }
  .light .math-num { color:var(--accent); }
  .light .math-const { color:var(--accent3); }
  .light .math-fn { color:#1e3a5f; }
  .light .math-op { color:#475569; }
  /* Matrix cell */
  .light .mat-cell { background:#fff; color:var(--text); border-color:rgba(79,107,200,0.25); }
  .light .mat-cell:focus { border-color:var(--accent3); }
  /* Back btn */
  .light .cf-header-back { background:#fff; color:var(--muted); border-color:rgba(79,107,200,0.25); }
  .light .cf-header-back:hover { color:var(--accent); border-color:var(--accent); background:#eff4ff; }
  .light .theme-btn { background:#fff; border-color:rgba(79,107,200,0.25); color:var(--muted); }
  .light .theme-btn:hover { color:var(--accent); border-color:var(--accent); }
  /* Scrollbar */
  .light ::-webkit-scrollbar-thumb { background:#c7d0ee; }
  /* Step result muted text */
  .light .step-muted { color:rgba(30,41,59,0.65) !important; }
  /* Display text in light mode */
  .light .display-input { color:#475569; }
  .light .display-result { color:var(--text); }
  .light .display-result.has-val { color:var(--accent); text-shadow:0 0 16px rgba(3,105,161,0.25); }
  /* Light mode extras */

  /* ── BASE ── */
  .cf-root {
    min-height: 100vh; background: var(--bg); color: var(--text);
    font-family: 'DM Sans', sans-serif; position: relative; overflow-x: hidden;
  }
  .cf-root::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background: radial-gradient(ellipse 60% 40% at 20% -10%, rgba(56,189,248,0.07) 0%, transparent 70%),
                radial-gradient(ellipse 50% 50% at 85% 110%, rgba(129,140,248,0.06) 0%, transparent 70%);
  }
  .cf-root > * { position: relative; z-index: 1; }

  /* ── BOTTOM NAV BAR ── */
  .cf-header {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    z-index: 200; display: flex; align-items: center; gap: 12px;
    background: var(--hdr-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border); border-radius: 100px;
    padding: 10px 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  .cf-header-back {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 50%; color: var(--muted); cursor: pointer;
    width: 34px; height: 34px; flex-shrink: 0; transition: all 0.18s;
  }
  .cf-header-back:hover { color: var(--accent); border-color: var(--accent); background: var(--surface); }
  .cf-header-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    letter-spacing: -0.01em; color: var(--text);
  }
  .theme-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; flex-shrink: 0;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 50%; color: var(--muted); cursor: pointer;
    transition: all 0.18s;
  }
  .theme-btn:hover { color: var(--accent); border-color: var(--accent); background: var(--surface); transform: rotate(20deg); }

  /* ── CONTENT AREA ── */
  .cf-content {
    padding: 20px 16px 130px;
    max-width: 600px;
    margin: 0 auto;
  }

  /* ── CARDS ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; transition: all 0.25s ease;
  }
  .card:hover {
    border-color: rgba(56,189,248,0.3);
    box-shadow: 0 0 32px var(--shadow-glow);
    transform: translateY(-2px);
  }

  /* ── CALC BUTTONS ── */
  .btn-calc {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
    color: var(--text); font-family: 'DM Mono', monospace; font-weight: 500;
    cursor: pointer; transition: all 0.12s ease;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .btn-calc:hover { background: #1e2638; border-color: rgba(56,189,248,0.35); color: var(--accent); box-shadow: 0 0 12px rgba(56,189,248,0.12); transform: translateY(-1px); }
  .btn-calc:active, .btn-calc.pressed { transform: scale(0.93); background: rgba(56,189,248,0.12); border-color: var(--accent); }
  .btn-calc.btn-op   { color: var(--accent); border-color: rgba(56,189,248,0.2); }
  .btn-calc.btn-eq   { background: linear-gradient(135deg,#0ea5e9,#6366f1); border: none; color: #fff; font-size: 22px; }
  .btn-calc.btn-eq:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(56,189,248,0.35); }
  .btn-calc.btn-clear { color: var(--red); border-color: rgba(248,113,113,0.2); }
  .btn-calc.btn-fn   { color: var(--accent2); }

  /* ── DISPLAY ── */
  .calc-display {
    background: var(--display-bg); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 16px; min-height: 90px;
    display: flex; flex-direction: column; justify-content: flex-end;
    align-items: flex-end; gap: 6px; margin-bottom: 14px; position: relative; overflow: hidden;
  }
  .calc-display::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent);
  }

  /* ── BACK BTN (legacy, still used inside pages without header) ── */
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; color: var(--muted); font-family: 'DM Sans',sans-serif;
    font-size: 14px; cursor: pointer; padding: 8px 16px; margin-bottom: 28px; transition: all 0.2s;
  }
  .back-btn:hover { color: var(--accent); border-color: rgba(56,189,248,0.3); }

  /* ── INPUTS ── */
  .cf-input {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text); font-family: 'DM Mono',monospace;
    font-size: 15px; padding: 10px 14px; width: 100%; outline: none; transition: border-color 0.2s;
  }
  .cf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }

  /* ── MISC ── */
  .pill {
    display: inline-block; padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.05em;
    background: rgba(56,189,248,0.1); color: var(--accent); border: 1px solid rgba(56,189,248,0.2);
  }
  .mat-cell {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    color: var(--text); font-family: 'DM Mono',monospace; text-align: center;
    outline: none; transition: border-color 0.15s; width: 100%; display: block;
  }
  .mat-cell:focus { border-color: var(--accent3); box-shadow: 0 0 0 2px rgba(52,211,153,0.12); }

  /* ── KEYBOARD ── */
  .math-kbd { background: var(--kbd-bg); border: 1px solid rgba(129,140,248,0.25); border-radius: 12px; padding: 8px; display: grid; gap: 4px; }
  .math-kbd-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 7px;
    color: var(--text); font-family: 'DM Mono',monospace; font-size: 12px; cursor: pointer;
    transition: all 0.1s; padding: 6px 3px; display: flex; align-items: center;
    justify-content: center; min-height: 32px;
  }
  .math-kbd-btn:hover { background: rgba(129,140,248,0.15); border-color: rgba(129,140,248,0.4); color: #818cf8; }
  .math-kbd-btn:active { transform: scale(0.92); }
  .math-kbd-btn.kbd-red { color: var(--red); border-color: rgba(248,113,113,0.2); }
  .math-kbd-btn.kbd-red:hover { background: rgba(248,113,113,0.1); border-color: var(--red); }
  .math-kbd-btn.kbd-accent { color: var(--accent); border-color: rgba(56,189,248,0.2); }
  .math-kbd-btn.kbd-accent:hover { background: rgba(56,189,248,0.1); }

  /* ── MATH PREVIEW ── */
  .math-preview { font-family: 'DM Mono',monospace; font-size: 17px; color: var(--text); min-height: 26px; word-break: break-all; line-height: 1.6; }
  .math-preview sup { font-size: 0.62em; line-height: 0; position: relative; top: -0.5em; color: var(--accent2); }
  .math-display { display: inline-flex; align-items: center; flex-wrap: wrap; font-family: Georgia,'Times New Roman',serif; user-select: text; }
  .math-var  { font-style: italic; color: var(--text); }
  .math-num  { color: var(--accent); }
  .math-const{ color: var(--accent3); font-style: normal; }
  .math-fn   { font-style: normal; color: var(--text); letter-spacing: 0.02em; }
  .math-op   { color: var(--muted); }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3045; border-radius: 4px; }

  /* ── MOBILE ── */
  @media (max-width: 480px) {
    .cf-content { padding: 14px 12px 130px; }
    .cf-header { padding: 7px 12px; gap: 8px; }
    .cf-header-title { font-size: 13px; }
    .cf-header-back { width: 28px; height: 28px; }
    .theme-btn { width: 28px; height: 28px; }
    .btn-calc { border-radius: 8px; }
    .math-kbd-btn { min-height: 30px; font-size: 11px; }
    .cf-input { font-size: 14px; padding: 9px 12px; }
  }
  @media (max-width: 360px) {
    .math-kbd-btn { min-height: 26px; font-size: 10px; padding: 4px 2px; }
  }
`;
document.head.appendChild(globalStyle);

/* ── MATH HELPERS ─────────────────────────────────────── */
const BASE_SCOPE = {
  e: Math.E, pi: Math.PI, π: Math.PI, E: Math.E,
  // Physics & chemistry constants
  NA: 6.02214076e23,    // Avogadro
  kb: 1.380649e-23,     // Boltzmann
  G:  6.67430e-11,      // Gravitational
  c:  299792458,        // Speed of light
  h:  6.62607015e-34,   // Planck
  R:  8.314462618,      // Gas constant
  F:  96485.33212,      // Faraday
  me: 9.1093837015e-31, // Electron mass
  mp: 1.67262192369e-27,// Proton mass
  qe: 1.602176634e-19,  // Elementary charge
};

/* ── ERROR BOUNDARY ─────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:32,color:"#f87171",fontFamily:"DM Mono",fontSize:13,background:"#0a0f1e",minHeight:"100vh"}}>
        <div style={{marginBottom:8,fontSize:16,fontWeight:700}}>⚠ App Error</div>
        <div style={{color:"#94a3b8",marginBottom:16}}>{this.state.error.message}</div>
        <button onClick={()=>this.setState({error:null})} style={{padding:"8px 16px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",borderRadius:8,cursor:"pointer"}}>Retry</button>
      </div>
    );
    return this.props.children;
  }
}

function preprocess(expr) {
  return expr
    .replace(/×/g,"*").replace(/÷/g,"/")
    .replace(/π/g,"pi").replace(/√\(/g,"sqrt(")
    .replace(/\|([^|]+)\|/g,"abs($1)")
    .replace(/\bln\(/g,"log(")          // mathjs uses log() for natural log
    .replace(/(\d)([a-zA-Z(])/g,"$1*$2")
    .replace(/([a-zA-Z)])(\d)/g,"$1*$2")
    .replace(/\)\s*\(/g,")*(" );
}

// For mathjs derivative — convert ln( to log( since mathjs uses log() for natural log
function preprocessForDerivative(expr) {
  return preprocess(expr).replace(/\bln\(/g, 'log(');
}
// Convert log( back to ln( for display
function deprocessDerivative(expr) {
  return expr.replace(/\blog\(/g, 'ln(');
}

function evalAt(expr, x) {
  try {
    const r = math.evaluate(preprocess(expr), { ...BASE_SCOPE, x });
    if (!r && r !== 0) return null;
    if (typeof r === "number") return isFinite(r) ? r : null;
    if (typeof r === "object") {
      const re = r.re !== undefined ? r.re : r.valueOf?.();
      return (typeof re === "number" && isFinite(re)) ? re : null;
    }
    return null;
  } catch { return null; }
}

function evalAt2D(expr, x, y) {
  try {
    const r = math.evaluate(preprocess(expr), { ...BASE_SCOPE, x, y });
    if (typeof r === "number" && isFinite(r)) return r;
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

/* ── MATH RENDERER ──────────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex?.startsWith('#')) return '100,116,139';
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

let _mk = 0;
function _mjsx(node) {
  if (!node) return null;
  const key = _mk++;

  const Par = (c) => <span key={_mk++}><span style={{color:'rgba(100,116,139,0.75)'}}>&#40;</span>{c}<span style={{color:'rgba(100,116,139,0.75)'}}>&#41;</span></span>;

  if (node.type==='ConstantNode') {
    const s = typeof node.value==='number' ? parseFloat(node.value.toPrecision(10)).toString() : String(node.value);
    return <span key={key} className="math-num">{s}</span>;
  }

  if (node.type==='SymbolNode') {
    const M={pi:'π',Infinity:'∞',inf:'∞'}; const sym=M[node.name]??node.name;
    return <span key={key} className={['pi','e','Infinity','inf','i'].includes(node.name)?'math-const':'math-var'}>{sym}</span>;
  }

  if (node.type==='OperatorNode') {
    const {fn,op,args}=node;
    if (fn==='unaryMinus') {
      const a=args[0]; const nP=a.type==='OperatorNode'&&(a.fn==='add'||a.fn==='subtract');
      return <span key={key} style={{display:'inline-flex',alignItems:'center'}}><span className="math-op">−</span>{nP?Par(_mjsx(a)):_mjsx(a)}</span>;
    }
    if (fn==='unaryPlus') return _mjsx(args[0]);
    if (fn==='pow') {
      const [base,expo]=args; const bNP=base.type==='OperatorNode';
      return <span key={key} style={{display:'inline-flex',alignItems:'flex-start',lineHeight:1}}>
        {bNP?Par(_mjsx(base)):_mjsx(base)}
        <sup style={{fontSize:'0.6em',lineHeight:1,color:'var(--accent2)',marginTop:'2px',fontFamily:'Georgia,serif'}}>{_mjsx(expo)}</sup>
      </span>;
    }
    if (fn==='divide') {
      // Use proper vertical fraction — but wrap in a span with middle alignment
      return <span key={key} style={{display:'inline-flex',alignItems:'center',margin:'0 3px'}}>
        <span style={{display:'inline-flex',flexDirection:'column',alignItems:'center',verticalAlign:'middle',lineHeight:1.2}}>
          <span style={{borderBottom:'1.5px solid rgba(226,232,240,0.3)',paddingBottom:'1px',paddingLeft:'4px',paddingRight:'4px',textAlign:'center',whiteSpace:'nowrap'}}>{_mjsx(args[0])}</span>
          <span style={{paddingTop:'1px',paddingLeft:'4px',paddingRight:'4px',textAlign:'center',whiteSpace:'nowrap'}}>{_mjsx(args[1])}</span>
        </span>
      </span>;
    }
    if (fn==='multiply') {
      const [l,r]=args;
      const lNP=l.type==='OperatorNode'&&(l.fn==='add'||l.fn==='subtract');
      const rNP=r.type==='OperatorNode'&&(r.fn==='add'||r.fn==='subtract');
      const lP=lNP?Par(_mjsx(l)):_mjsx(l); const rP=rNP?Par(_mjsx(r)):_mjsx(r);
      const dot=l.type==='ConstantNode'&&r.type==='ConstantNode';
      return <span key={key} style={{display:'inline-flex',alignItems:'center'}}>{lP}{dot&&<span className="math-op" style={{margin:'0 2px'}}>·</span>}{rP}</span>;
    }
    if (fn==='add') {
      const [l,r]=args;
      if (r.type==='OperatorNode'&&r.fn==='unaryMinus')
        return <span key={key} style={{display:'inline-flex',alignItems:'center',flexWrap:'wrap'}}>{_mjsx(l)}<span className="math-op" style={{margin:'0 5px'}}>−</span>{_mjsx(r.args[0])}</span>;
      return <span key={key} style={{display:'inline-flex',alignItems:'center',flexWrap:'wrap'}}>{_mjsx(l)}<span className="math-op" style={{margin:'0 5px'}}>+</span>{_mjsx(r)}</span>;
    }
    if (fn==='subtract') {
      const [l,r]=args; const rNP=r.type==='OperatorNode'&&(r.fn==='add'||r.fn==='subtract');
      return <span key={key} style={{display:'inline-flex',alignItems:'center',flexWrap:'wrap'}}>{_mjsx(l)}<span className="math-op" style={{margin:'0 5px'}}>−</span>{rNP?Par(_mjsx(r)):_mjsx(r)}</span>;
    }
    return <span key={key} style={{display:'inline-flex',alignItems:'center',gap:'3px'}}>{_mjsx(args[0])}<span className="math-op">{op}</span>{args[1]&&_mjsx(args[1])}</span>;
  }

  if (node.type==='FunctionNode') {
    const {name,args}=node;
    const FNM={sin:'sin',cos:'cos',tan:'tan',asin:'arcsin',acos:'arccos',atan:'arctan',
      sinh:'sinh',cosh:'cosh',tanh:'tanh',asinh:'arcsinh',acosh:'arccosh',atanh:'arctanh',
      log:'ln',log10:'log',ln:'ln',exp:'exp',round:'round',sign:'sgn'};
    if (name==='sqrt') return <span key={key} style={{display:'inline-flex',alignItems:'center'}}><span style={{fontSize:'1.25em',lineHeight:1,fontWeight:300,marginRight:'1px'}}>√</span><span style={{borderTop:'1.5px solid rgba(226,232,240,0.35)',paddingTop:'1px',paddingLeft:'2px',paddingRight:'4px'}}>{_mjsx(args[0])}</span></span>;
    if (name==='abs') return <span key={key}><span style={{color:'rgba(100,116,139,0.75)'}}>|</span>{_mjsx(args[0])}<span style={{color:'rgba(100,116,139,0.75)'}}>|</span></span>;
    if (name==='ceil') return <span key={key}><span style={{color:'rgba(100,116,139,0.75)'}}>⌈</span>{_mjsx(args[0])}<span style={{color:'rgba(100,116,139,0.75)'}}>⌉</span></span>;
    if (name==='floor') return <span key={key}><span style={{color:'rgba(100,116,139,0.75)'}}>⌊</span>{_mjsx(args[0])}<span style={{color:'rgba(100,116,139,0.75)'}}>⌋</span></span>;
    const dn=FNM[name]??name;
    return <span key={key} style={{display:'inline-flex',alignItems:'center'}}>
      <span className="math-fn">{dn}</span>
      <span style={{color:'rgba(100,116,139,0.75)'}}>&#40;</span>
      {args.map((a,i)=><React.Fragment key={i}>{i>0&&<span className="math-op">,&thinsp;</span>}{_mjsx(a)}</React.Fragment>)}
      <span style={{color:'rgba(100,116,139,0.75)'}}>&#41;</span>
    </span>;
  }

  if (node.type==='ParenthesisNode') return Par(_mjsx(node.content));
  return <span key={key} className="math-op">{node.toString?.()??String(node)}</span>;
}

function MathDisplay({ expr, size="md", style={} }) {
  if (!expr?.trim()) return null;
  const fs = {sm:13,md:18,lg:22,xl:28}[size]??18;
  try {
    _mk = 0;
    const node = math.parse(preprocess(String(expr)));
    return <span className="math-display" style={{fontSize:fs,lineHeight:2.1,...style}}>{_mjsx(node)}</span>;
  } catch {
    return <span style={{fontFamily:'DM Mono,monospace',fontSize:Math.max(12,fs-3),color:'var(--muted)',...style}}>{expr}</span>;
  }
}

// Legacy compatibility
function renderMathExpr(expr) { return <MathDisplay expr={expr}/>; }

/* ── MATH KEYBOARD ────────────────────────────────────── */
const KBD_ROWS = [
  [{label:"x",ins:"x"},{label:"y",ins:"y"},{label:"^",ins:"^"},{label:"(",ins:"("},{label:")",ins:")"},{label:"π",ins:"pi"},{label:"e",ins:"e"},{label:"⌫",ins:"__del",cls:"kbd-red"}],
  [{label:"sin",ins:"sin("},{label:"cos",ins:"cos("},{label:"tan",ins:"tan("},{label:"√",ins:"sqrt("},{label:"log",ins:"log("},{label:"ln",ins:"ln("},{label:"abs",ins:"abs("},{label:"C",ins:"__clear",cls:"kbd-red"}],
  [{label:"7",ins:"7"},{label:"8",ins:"8"},{label:"9",ins:"9"},{label:"+",ins:"+",cls:"kbd-accent"},{label:"eˣ",ins:"e^("},{label:"xⁿ",ins:"x^"},{label:"x²",ins:"x^2"},{label:"x²+y²",ins:"x^2+y^2"}],
  [{label:"4",ins:"4"},{label:"5",ins:"5"},{label:"6",ins:"6"},{label:"−",ins:"-",cls:"kbd-accent"},{label:"asin",ins:"asin("},{label:"acos",ins:"acos("},{label:"atan",ins:"atan("},{label:"atan2",ins:"atan2("}],
  [{label:"1",ins:"1"},{label:"2",ins:"2"},{label:"3",ins:"3"},{label:"×",ins:"*",cls:"kbd-accent"},{label:"sinh",ins:"sinh("},{label:"cosh",ins:"cosh("},{label:"tanh",ins:"tanh("},{label:"exp",ins:"exp("}],
  [{label:"0",ins:"0"},{label:".",ins:"."},{label:"/",ins:"/"},{label:"÷",ins:"/",cls:"kbd-accent"},{label:"floor",ins:"floor("},{label:"ceil",ins:"ceil("},{label:"round",ins:"round("},{label:"mod",ins:" mod "}],
];

// Constants organized by category
const CONST_ROWS = {
  Math: [
    {label:"π",ins:"pi",desc:"3.14159…"},
    {label:"e",ins:"e",desc:"2.71828…"},
    {label:"φ",ins:"1.6180339887",desc:"Golden ratio"},
    {label:"√2",ins:"sqrt(2)",desc:"1.41421…"},
    {label:"√3",ins:"sqrt(3)",desc:"1.73205…"},
    {label:"ln2",ins:"ln(2)",desc:"0.69315…"},
    {label:"∞",ins:"Infinity",desc:"Infinity"},
  ],
  Physics: [
    {label:"c",ins:"c",desc:"Speed of light"},
    {label:"G",ins:"G",desc:"Gravitational const"},
    {label:"h",ins:"h",desc:"Planck const"},
    {label:"kB",ins:"kb",desc:"Boltzmann const"},
    {label:"R",ins:"R",desc:"Gas constant"},
    {label:"NA",ins:"NA",desc:"Avogadro number"},
    {label:"F",ins:"F",desc:"Faraday const"},
  ],
  Chem: [
    {label:"NA",ins:"NA",desc:"6.022×10²³"},
    {label:"R",ins:"R",desc:"8.314 J/mol·K"},
    {label:"F",ins:"F",desc:"96485 C/mol"},
    {label:"me",ins:"me",desc:"Electron mass"},
    {label:"mp",ins:"mp",desc:"Proton mass"},
    {label:"qe",ins:"qe",desc:"Electron charge"},
    {label:"kB",ins:"kb",desc:"1.38×10⁻²³ J/K"},
  ],
};

function MathKeyboard({ inputRef, value, onChange }) {
  const [tab, setTab] = React.useState("Keys");
  const [pressed, setPressed] = React.useState(null);

  const handleKey = (ins) => {
    setPressed(ins); setTimeout(()=>setPressed(null), 120);
    const el = inputRef?.current;
    if (!el) { if (ins==="__del") onChange(value.slice(0,-1)); else if (ins==="__clear") onChange(""); else onChange(value+ins); return; }
    const s = el.selectionStart, e2 = el.selectionEnd;
    if (ins==="__del") { const n=value.slice(0,Math.max(0,s-1))+value.slice(e2>s?e2:s); onChange(n); requestAnimationFrame(()=>{el.focus();el.setSelectionRange(Math.max(0,s-1),Math.max(0,s-1));}); }
    else if (ins==="__clear") { onChange(""); requestAnimationFrame(()=>el.focus()); }
    else { const n=value.slice(0,s)+ins+value.slice(e2); onChange(n); const p=s+ins.length; requestAnimationFrame(()=>{el.focus();el.setSelectionRange(p,p);}); }
  };

  // Determine button style by type
  const getBtnStyle = (btn, isActive) => {
    const ins = btn.ins;
    const label = btn.label;
    const isNum = /^[0-9.]$/.test(label);
    const isOp = btn.cls === "kbd-accent";
    const isDel = ins === "__del";
    const isClear = ins === "__clear";
    const isVar = ["x","y","π","e"].includes(label) || ins==="pi";
    const isFn = !isNum && !isOp && !isDel && !isClear && !isVar && label !== "^";
    const isPow = label === "^";

    if (isDel) return {
      background: isActive ? "rgba(251,146,60,0.3)" : "rgba(251,146,60,0.1)",
      border: "1px solid rgba(251,146,60,0.3)", color: "#fb923c",
      boxShadow: isActive ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isClear) return {
      background: isActive ? "rgba(248,113,113,0.3)" : "rgba(248,113,113,0.1)",
      border: "1px solid rgba(248,113,113,0.3)", color: "#f87171",
      boxShadow: isActive ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isOp) return {
      background: isActive ? "rgba(56,189,248,0.25)" : "rgba(56,189,248,0.1)",
      border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", fontWeight: 600,
      boxShadow: isActive ? "none" : "0 2px 8px rgba(56,189,248,0.1)",
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isVar) return {
      background: isActive ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.09)",
      border: "1px solid rgba(52,211,153,0.28)", color: "#34d399", fontWeight: 600,
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isFn || isPow) return {
      background: isActive ? "rgba(129,140,248,0.25)" : "rgba(129,140,248,0.09)",
      border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8",
      transform: isActive ? "scale(0.93)" : undefined,
    };
    // Numbers & dot
    return {
      background: isActive ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.055)",
      border: "1px solid rgba(255,255,255,0.09)", color: "var(--text)", fontWeight: 500,
      boxShadow: isActive ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
      transform: isActive ? "scale(0.93)" : "translateY(-1px)",
    };
  };

  const tabs = ["Keys","Math","Physics","Chem"];

  return (
    <div>
      {/* Tab bar */}
      <div style={{display:"flex",gap:5,marginBottom:8}}>
        {tabs.map(t=>(
          <button key={t} onMouseDown={e=>{e.preventDefault();setTab(t);}}
            style={{padding:"5px 13px",borderRadius:10,fontFamily:"DM Mono",fontSize:11,cursor:"pointer",
              background:tab===t?"rgba(129,140,248,0.2)":"var(--surface2)",
              border:`1px solid ${tab===t?"rgba(129,140,248,0.5)":"var(--border)"}`,
              color:tab===t?"#818cf8":"var(--muted)",transition:"all 0.15s"}}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Keys" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:5,
          background:"var(--kbd-bg)",border:"1px solid rgba(129,140,248,0.2)",
          borderRadius:14,padding:8}}>
          {KBD_ROWS.flat().map((btn,i)=>{
            const isActive = pressed === btn.ins;
            const s = getBtnStyle(btn, isActive);
            return (
              <button key={i}
                onMouseDown={e=>{e.preventDefault();handleKey(btn.ins);}}
                style={{
                  ...s,
                  height: "clamp(34px,8vw,46px)",
                  borderRadius: 10,
                  fontFamily: "DM Mono, monospace",
                  fontSize: btn.label.length > 3 ? 9 : btn.label.length > 2 ? 10 : 12,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.1s, transform 0.1s, box-shadow 0.1s",
                  userSelect: "none",
                }}>
                {btn.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,
          background:"var(--kbd-bg)",border:"1px solid rgba(129,140,248,0.2)",
          borderRadius:14,padding:8}}>
          {(CONST_ROWS[tab]||[]).map((c,i)=>(
            <button key={i}
              onMouseDown={e=>{e.preventDefault();handleKey(c.ins);}}
              style={{
                height: 52, borderRadius: 10, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                background: pressed===c.ins ? "rgba(129,140,248,0.25)" : "rgba(129,140,248,0.09)",
                border: "1px solid rgba(129,140,248,0.25)",
                transform: pressed===c.ins ? "scale(0.93)" : "translateY(-1px)",
                transition: "all 0.1s", userSelect: "none",
              }}>
              <span style={{fontFamily:"DM Mono",fontSize:15,fontWeight:700,color:"#818cf8"}}>{c.label}</span>
              <span style={{fontFamily:"DM Mono",fontSize:8,color:"var(--muted)",textAlign:"center",lineHeight:1.2,padding:"0 2px"}}>{c.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2D CANVAS GRAPHING ENGINE
══════════════════════════════════════════════════════════ */
const GRAPH_COLORS = ["#38bdf8","#818cf8","#34d399","#f472b6","#fb923c","#facc15","#a78bfa","#2dd4bf"];

function niceStep(ppu) {
  const raw = 80/ppu, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw/mag;
  return (n<1.5?1:n<3.5?2:n<7.5?5:10)*mag;
}
function formatLabel(n) {
  if (Math.abs(n)<1e-10) return "0";
  if (Math.abs(n)>=1e5||(Math.abs(n)<0.001&&n!==0)) return n.toExponential(1);
  return parseFloat(n.toPrecision(6)).toString();
}
function compileExpr(exprStr) {
  try {
    const c = math.compile(preprocess(exprStr));
    return (x) => {
      try {
        const r = c.evaluate({...BASE_SCOPE,x});
        if (!r && r!==0) return null;
        if (typeof r==="number") return isFinite(r)?r:null;
        if (typeof r==="object"&&r.re!==undefined) return isFinite(r.re)?r.re:null;
        return null;
      } catch { return null; }
    };
  } catch { return ()=>null; }
}

function DesmosGraph({ expressions }) {
  const canvasRef = useRef(null);
  const vpRef = useRef({cx:0,cy:0,scale:60});
  const [vp,setVp] = useState({cx:0,cy:0,scale:60});
  const dragRef = useRef(null);
  const [mouseCoord,setMouseCoord] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;   // CSS pixels
    const H = canvas.height / dpr;  // CSS pixels
    const v = vpRef.current;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle="#080c18"; ctx.fillRect(0,0,W,H);
    const step=niceStep(v.scale);
    const xMin=v.cx-W/2/v.scale, xMax=v.cx+W/2/v.scale;
    const yMin=v.cy-H/2/v.scale, yMax=v.cy+H/2/v.scale;
    const sx=Math.ceil(xMin/step)*step, sy=Math.ceil(yMin/step)*step;
    ctx.strokeStyle="rgba(255,255,255,0.035)"; ctx.lineWidth=1; ctx.beginPath();
    for(let gx=sx;gx<=xMax;gx+=step){const px=W/2+(gx-v.cx)*v.scale;ctx.moveTo(px,0);ctx.lineTo(px,H);}
    for(let gy=sy;gy<=yMax;gy+=step){const py=H/2-(gy-v.cy)*v.scale;ctx.moveTo(0,py);ctx.lineTo(W,py);}
    ctx.stroke();
    const ox=W/2+(0-v.cx)*v.scale, oy=H/2-(0-v.cy)*v.scale;
    ctx.save(); ctx.shadowBlur=6; ctx.shadowColor="rgba(56,189,248,0.3)";
    ctx.strokeStyle="rgba(56,189,248,0.6)"; ctx.lineWidth=1.5; ctx.beginPath();
    ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke();ctx.restore();
    const isMobile = W < 400;
    const axisFontSize = isMobile ? 13 : 10;
    ctx.font=`${axisFontSize}px DM Mono,monospace`; ctx.fillStyle="rgba(100,116,139,0.9)";
    ctx.textAlign="center"; ctx.textBaseline="top";
    for(let gx=sx;gx<=xMax;gx+=step){if(Math.abs(gx)<step*0.01)continue;const px=W/2+(gx-v.cx)*v.scale;ctx.fillText(formatLabel(gx),px,Math.max(4,Math.min(H-16,oy+4)));}
    ctx.textAlign="right"; ctx.textBaseline="middle";
    for(let gy=sy;gy<=yMax;gy+=step){if(Math.abs(gy)<step*0.01)continue;const py=H/2-(gy-v.cy)*v.scale;ctx.fillText(formatLabel(gy),Math.max(30,Math.min(W-4,ox-4)),py);}
    const SAMPLES=W*1.5;
    expressions.forEach((exp,ei)=>{
      if(!exp.value.trim())return;
      const fn=compileExpr(exp.value);
      ctx.save(); ctx.strokeStyle=exp.color; ctx.lineWidth=2.2; ctx.lineJoin="round"; ctx.lineCap="round";
      ctx.shadowBlur=8; ctx.shadowColor=exp.color+"88"; ctx.beginPath();
      let penDown=false, prevPy=null;
      for(let i=0;i<=SAMPLES;i++){
        const px=(i/SAMPLES)*W, mx=v.cx+(px-W/2)/v.scale, my=fn(mx);
        if(my===null){penDown=false;prevPy=null;continue;}
        const py=H/2-(my-v.cy)*v.scale;
        const disc=prevPy!==null&&Math.abs(py-prevPy)>H*1.5;
        if(!penDown||disc){ctx.moveTo(px,py);penDown=true;}else{ctx.lineTo(px,py);}
        prevPy=py;
      }
      ctx.stroke(); ctx.restore();
      const lx=W-8, lmx=v.cx+(lx-W/2)/v.scale, lmy=fn(lmx);
      if(lmy!==null){const lpy=H/2-(lmy-v.cy)*v.scale;if(lpy>8&&lpy<H-8){ctx.save();ctx.font="bold 11px DM Mono,monospace";ctx.fillStyle=exp.color;ctx.textAlign="right";ctx.textBaseline="bottom";ctx.shadowBlur=4;ctx.shadowColor="#080c18";ctx.fillText(exp.value.slice(0,20),lx,lpy-3);ctx.restore();}}
    });
    ctx.restore(); // pop dpr scale
  },[expressions]);

  useEffect(()=>{draw();},[vp,draw]);

  const handleWheel=useCallback((e)=>{
    e.preventDefault();
    const canvas=canvasRef.current; if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const W=rect.width, H=rect.height, v=vpRef.current;
    const mathX=v.cx+(mx-W/2)/v.scale, mathY=v.cy-(my-H/2)/v.scale;
    const factor=e.deltaY<0?1.12:1/1.12;
    const ns=Math.max(2,Math.min(v.scale*factor,50000));
    vpRef.current={cx:mathX-(mx-W/2)/ns, cy:mathY+(my-H/2)/ns, scale:ns};
    setVp({...vpRef.current});
  },[]);

  const handleMouseDown=useCallback((e)=>{dragRef.current={startX:e.clientX,startY:e.clientY,startCx:vpRef.current.cx,startCy:vpRef.current.cy};},[]);
  const handleMouseMove=useCallback((e)=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const px=e.clientX-rect.left, py=e.clientY-rect.top;
    const v=vpRef.current,W=rect.width,H=rect.height;
    setMouseCoord({x:v.cx+(px-W/2)/v.scale, y:v.cy-(py-H/2)/v.scale});
    if(!dragRef.current)return;
    const dx=e.clientX-dragRef.current.startX, dy=e.clientY-dragRef.current.startY;
    vpRef.current={...v,cx:dragRef.current.startCx-dx/v.scale,cy:dragRef.current.startCy+dy/v.scale};
    setVp({...vpRef.current});
  },[]);
  const handleMouseUp=useCallback(()=>{dragRef.current=null;},[]);
  const handleMouseLeave=useCallback(()=>{dragRef.current=null;setMouseCoord(null);},[]);

  const touchRef=useRef(null);
  const handleTouchStart=useCallback((e)=>{
    if(e.touches.length===1){touchRef.current={type:"pan",x:e.touches[0].clientX,y:e.touches[0].clientY,cx:vpRef.current.cx,cy:vpRef.current.cy};}
    else if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);touchRef.current={type:"pinch",dist:d,scale:vpRef.current.scale};}
  },[]);
  const handleTouchMove=useCallback((e)=>{
    e.preventDefault();if(!touchRef.current)return;
    if(touchRef.current.type==="pan"&&e.touches.length===1){const dx=e.touches[0].clientX-touchRef.current.x,dy=e.touches[0].clientY-touchRef.current.y;const v=vpRef.current;vpRef.current={...v,cx:touchRef.current.cx-dx/v.scale,cy:touchRef.current.cy+dy/v.scale};setVp({...vpRef.current});}
    else if(touchRef.current.type==="pinch"&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);const ns=Math.max(2,Math.min(vpRef.current.scale*(d/touchRef.current.dist),50000));vpRef.current={...vpRef.current,scale:ns};setVp({...vpRef.current});}
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    canvas.addEventListener("wheel",handleWheel,{passive:false});
    canvas.addEventListener("touchmove",handleTouchMove,{passive:false});
    return()=>{canvas.removeEventListener("wheel",handleWheel);canvas.removeEventListener("touchmove",handleTouchMove);};
  },[handleWheel,handleTouchMove]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ro=new ResizeObserver(()=>{
      const rect=canvas.parentElement.getBoundingClientRect();
      canvas.width=rect.width*(window.devicePixelRatio||1);
      canvas.height=rect.height*(window.devicePixelRatio||1);
      canvas.style.width=rect.width+"px"; canvas.style.height=rect.height+"px";
      draw();
    });
    ro.observe(canvas.parentElement);
    return()=>ro.disconnect();
  },[draw]);

  const zoom=(dir)=>{vpRef.current={...vpRef.current,scale:Math.max(2,Math.min(vpRef.current.scale*(dir>0?1.4:1/1.4),50000))};setVp({...vpRef.current});};
  const reset=()=>{vpRef.current={cx:0,cy:0,scale:60};setVp({...vpRef.current});};

  return (
    <div style={{position:"relative",width:"100%",height:370,borderRadius:14,overflow:"hidden",border:"1px solid rgba(56,189,248,0.15)",background:"#080c18"}}>
      <canvas ref={canvasRef} style={{display:"block",cursor:"crosshair"}} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={()=>{touchRef.current=null;}}/>
      <div style={{position:"absolute",bottom:12,right:12,display:"flex",flexDirection:"column",gap:4}}>
        {[["＋",1],["－",-1]].map(([l,d])=>(<button key={l} onClick={()=>zoom(d)} style={{width:32,height:32,borderRadius:8,background:"rgba(14,18,32,0.9)",border:"1px solid rgba(56,189,248,0.25)",color:"#38bdf8",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>{l}</button>))}
        <button onClick={reset} style={{width:32,height:32,borderRadius:8,background:"rgba(14,18,32,0.9)",border:"1px solid rgba(56,189,248,0.15)",color:"var(--muted)",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",fontFamily:"DM Mono"}}>⌂</button>
      </div>
      {mouseCoord&&<div style={{position:"absolute",bottom:10,left:12,fontFamily:"DM Mono",fontSize:11,color:"rgba(100,116,139,0.9)",background:"rgba(8,12,24,0.7)",padding:"3px 8px",borderRadius:6,backdropFilter:"blur(4px)",pointerEvents:"none"}}>({parseFloat(mouseCoord.x.toPrecision(5))}, {parseFloat(mouseCoord.y.toPrecision(5))})</div>}
      <div style={{position:"absolute",top:10,right:10,fontFamily:"DM Mono",fontSize:10,color:"rgba(100,116,139,0.5)",pointerEvents:"none"}}>drag · scroll to zoom</div>    </div>
  );
}

function ExprRow({ exp, onUpdate, onRemove, showRemove }) {
  const [showKbd,setShowKbd]=useState(false);
  const inputRef=useRef(null);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:exp.color,flexShrink:0,boxShadow:`0 0 6px ${exp.color}88`}}/>
        <input ref={inputRef} className="cf-input" value={exp.value} onChange={e=>onUpdate(exp.id,e.target.value)} placeholder="e.g. sin(x), e^x, x^2-3" style={{flex:1,borderColor:exp.color+"55",padding:"8px 12px",fontSize:14}}/>
        <button onClick={()=>setShowKbd(v=>!v)} title="Math keyboard" style={{width:34,height:34,borderRadius:8,flexShrink:0,cursor:"pointer",background:showKbd?"rgba(129,140,248,0.2)":"var(--surface2)",border:`1px solid ${showKbd?"rgba(129,140,248,0.5)":"var(--border)"}`,color:showKbd?"#818cf8":"var(--muted)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>⌨</button>
        {showRemove&&<button onClick={()=>onRemove(exp.id)} style={{width:34,height:34,borderRadius:8,flexShrink:0,background:"none",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
      </div>
      {exp.value.trim()&&(
        <div style={{marginLeft:22,marginTop:4,padding:"5px 12px",background:"rgba(0,0,0,0.2)",borderRadius:8,borderLeft:`2px solid ${exp.color}66`,display:"flex",alignItems:"center",minHeight:32,overflowX:"auto"}}>
          <MathDisplay expr={exp.value} size="sm" style={{color:exp.color}}/>
        </div>
      )}
      {showKbd&&<div style={{marginTop:8,marginLeft:16}}><MathKeyboard inputRef={inputRef} value={exp.value} onChange={v=>onUpdate(exp.id,v)}/></div>}
    </div>
  );
}

function Graphing({ setMode }) {
  const [expressions,setExpressions]=useState([{id:1,value:"sin(x)",color:GRAPH_COLORS[0]},{id:2,value:"cos(x)",color:GRAPH_COLORS[1]}]);
  const update=(id,v)=>setExpressions(e=>e.map(ex=>ex.id===id?{...ex,value:v}:ex));
  const remove=(id)=>setExpressions(e=>e.filter(ex=>ex.id!==id));
  const add=()=>{if(expressions.length>=8)return;setExpressions(e=>[...e,{id:Date.now(),value:"",color:GRAPH_COLORS[e.length%GRAPH_COLORS.length]}]);};
  const EXAMPLES=["sin(x)","cos(x)","tan(x)","x^2","x^3-x","e^x","e^(-x^2)","1/x","sqrt(x)","abs(x)","log(x)","floor(x)","e^(i*x)"];
  return (
    <div>
      <DesmosGraph expressions={expressions}/>
      <div style={{marginTop:14}}>
        {expressions.map(exp=>(<ExprRow key={exp.id} exp={exp} onUpdate={update} onRemove={remove} showRemove={expressions.length>1}/>))}
        <button onClick={add} style={{marginTop:6,padding:"7px 14px",background:"rgba(129,140,248,0.1)",border:"1px solid rgba(129,140,248,0.25)",borderRadius:10,color:"#818cf8",fontSize:13,cursor:"pointer"}}>+ Add function</button>
      </div>
      <div style={{marginTop:14}}>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>Quick examples:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {EXAMPLES.map(ex=>(<button key={ex} onClick={()=>update(expressions[0].id,ex)} style={{padding:"3px 9px",borderRadius:7,background:"var(--surface2)",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"DM Mono",fontSize:11,cursor:"pointer"}}>{ex}</button>))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3D SURFACE ENGINE — THREE.JS WebGL RENDERER
══════════════════════════════════════════════════════════ */

// Build a 3D surface BufferGeometry + ShaderMaterial from z=f(x,y)
function buildSurface3D(exprStr, xMin, xMax, yMin, yMax, N) {
  // Compile once for performance
  let compiledFn;
  try {
    const c = math.compile(preprocess(exprStr));
    compiledFn = (x, y) => {
      try {
        const r = c.evaluate({ ...BASE_SCOPE, x, y });
        return typeof r === "number" && isFinite(r) ? r : null;
      } catch { return null; }
    };
  } catch { compiledFn = () => null; }

  // Evaluate grid
  const total = (N + 1) * (N + 1);
  const zVals = new Array(total);
  let zMin = Infinity, zMax = -Infinity;

  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const x = xMin + (i / N) * (xMax - xMin);
      const y = yMin + (j / N) * (yMax - yMin);
      const z = compiledFn(x, y);
      zVals[i * (N + 1) + j] = z;
      if (z !== null) { zMin = Math.min(zMin, z); zMax = Math.max(zMax, z); }
    }
  }
  if (!isFinite(zMin)) { zMin = -1; zMax = 1; }

  // Build positions — mapping: THREE(x, z_math, y_math)
  const positions = new Float32Array(total * 3);
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const idx = i * (N + 1) + j;
      const x = xMin + (i / N) * (xMax - xMin);
      const y = yMin + (j / N) * (yMax - yMin);
      const z = zVals[idx] !== null ? zVals[idx] : zMin;
      positions[idx * 3]     = x;
      positions[idx * 3 + 1] = z;  // THREE Y = math Z height
      positions[idx * 3 + 2] = y;  // THREE Z = math Y
    }
  }

  // Indices — skip triangles with null vertices (holes)
  const idxArr = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const a = i*(N+1)+j, b=a+1, c=(i+1)*(N+1)+j, d=c+1;
      const ok = idx => zVals[idx] !== null;
      if (ok(a)&&ok(b)&&ok(c)) idxArr.push(a,b,c);
      if (ok(b)&&ok(d)&&ok(c)) idxArr.push(b,d,c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (idxArr.length > 0) geom.setIndex(idxArr);
  geom.computeVertexNormals();

  // Shader with height-based gradient + Phong lighting
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uZMin: { value: zMin },
      uZMax: { value: zMax },
    },
    vertexShader: `
      uniform float uZMin;
      uniform float uZMax;
      varying float vT;
      varying vec3  vN;
      varying vec3  vPos;
      void main() {
        vT   = clamp((position.y - uZMin) / max(uZMax - uZMin, 0.0001), 0.0, 1.0);
        vN   = normalize(normalMatrix * normal);
        vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float vT;
      varying vec3  vN;
      varying vec3  vPos;
      vec3 pal(float t) {
        if (t < 0.2)  return mix(vec3(0.14,0.04,0.86), vec3(0.04,0.50,1.00), t*5.0);
        if (t < 0.45) return mix(vec3(0.04,0.50,1.00), vec3(0.05,0.95,0.55), (t-0.2)*4.0);
        if (t < 0.70) return mix(vec3(0.05,0.95,0.55), vec3(1.00,0.88,0.06), (t-0.45)*4.0);
                      return mix(vec3(1.00,0.88,0.06), vec3(1.00,0.10,0.06), (t-0.70)*3.33);
      }
      void main() {
        vec3 col  = pal(vT);
        vec3 L1   = normalize(vec3(2.0, 5.0, 3.0));
        vec3 L2   = normalize(vec3(-1.5, -2.0, -2.0));
        vec3 V    = normalize(-vPos);
        vec3 N2   = normalize(vN);
        float d1  = max(dot(N2, L1), 0.0);
        float d2  = max(dot(N2, L2), 0.0) * 0.25;
        float spec= pow(max(dot(reflect(-L1, N2), V), 0.0), 40.0) * 0.18;
        float rim = pow(1.0 - max(dot(N2, V), 0.0), 3.0) * 0.12;
        float lum = 0.28 + d1*0.55 + d2 + spec + rim;
        gl_FragColor = vec4(col * lum, 0.94);
      }
    `,
  });

  const mesh = new THREE.Mesh(geom, mat);

  // Parametric grid lines (every ~N/10 row and column — cleaner than WireframeGeometry)
  const gridStep = Math.max(1, Math.floor(N / 10));
  const lineVerts = [];
  for (let i = 0; i <= N; i += gridStep) {
    for (let j = 0; j < N; j++) {
      const a = i*(N+1)+j, b = a+1;
      if (zVals[a]===null||zVals[b]===null) continue;
      lineVerts.push(
        xMin+(i/N)*(xMax-xMin), zVals[a], yMin+(j/N)*(yMax-yMin),
        xMin+(i/N)*(xMax-xMin), zVals[b], yMin+((j+1)/N)*(yMax-yMin)
      );
    }
  }
  for (let j = 0; j <= N; j += gridStep) {
    for (let i = 0; i < N; i++) {
      const a = i*(N+1)+j, c = (i+1)*(N+1)+j;
      if (zVals[a]===null||zVals[c]===null) continue;
      lineVerts.push(
        xMin+(i/N)*(xMax-xMin), zVals[a], yMin+(j/N)*(yMax-yMin),
        xMin+((i+1)/N)*(xMax-xMin), zVals[c], yMin+(j/N)*(yMax-yMin)
      );
    }
  }
  const lGeom = new THREE.BufferGeometry();
  lGeom.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0x0a1828, transparent: true, opacity: 0.22 });
  const lines = new THREE.LineSegments(lGeom, lMat);

  const group = new THREE.Group();
  group.add(mesh);
  group.add(lines);
  group.userData = { zMin, zMax };
  return group;
}

/* ── GRAPH3D CANVAS COMPONENT ─────────────────────────── */
function Graph3D({ expressions, xMin, xMax, yMin, yMax, resolution }) {
  const mountRef    = useRef(null);
  const overlayRef  = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);
  const surfGrpRef  = useRef(null);
  const rafRef      = useRef(null);
  const orbitRef    = useRef({ theta: 0.6, phi: 1.05, radius: 20 });
  const targetRef   = useRef({ x: 0, y: 0, z: 0 });
  const dragRef     = useRef(null);
  const touchRef    = useRef(null);

  // Update camera position from orbit state
  const updateCam = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const { theta, phi, radius } = orbitRef.current;
    const { x: tx, y: ty, z: tz } = targetRef.current;
    cam.position.set(
      tx + radius * Math.sin(phi) * Math.cos(theta),
      ty + radius * Math.cos(phi),
      tz + radius * Math.sin(phi) * Math.sin(theta)
    );
    cam.lookAt(tx, ty, tz);
  }, []);

  // ── Scene setup (runs once) ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = container.clientWidth || 520;
    const H = container.clientHeight || 420;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x080c18, 1);
    renderer.domElement.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 2000);
    cameraRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dl1 = new THREE.DirectionalLight(0xffffff, 0.75);
    dl1.position.set(6, 12, 8); scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x6090ff, 0.2);
    dl2.position.set(-5, -3, -6); scene.add(dl2);

    // Axes: x=red, y(THREE)=f(x,y) height=cyan, z(THREE)=math_y=green
    const axLen = 7;
    const makeAxis = (dir, col) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), dir]);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: col }));
    };
    scene.add(makeAxis(new THREE.Vector3( axLen,0,0), 0xf87171)); // +x red
    scene.add(makeAxis(new THREE.Vector3(-axLen,0,0), 0x7a3838)); // -x dim
    scene.add(makeAxis(new THREE.Vector3(0, axLen,0), 0x38bdf8)); // +z(height) cyan
    scene.add(makeAxis(new THREE.Vector3(0,-axLen,0), 0x1a5060)); // -z dim
    scene.add(makeAxis(new THREE.Vector3(0,0, axLen), 0x34d399)); // +y(math) green
    scene.add(makeAxis(new THREE.Vector3(0,0,-axLen), 0x1a5038)); // -y dim

    // Arrowhead cones at axis tips
    const arrowGeo = new THREE.CylinderGeometry(0, 0.12, 0.35, 8);
    [[new THREE.Vector3(axLen,0,0), new THREE.Vector3(0,0,1), -Math.PI/2, 0xf87171],
     [new THREE.Vector3(0,axLen,0), new THREE.Vector3(1,0,0), 0, 0x38bdf8],
     [new THREE.Vector3(0,0,axLen), new THREE.Vector3(1,0,0), Math.PI/2, 0x34d399]
    ].forEach(([pos, axis, angle, col]) => {
      const cone = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: col }));
      cone.position.copy(pos);
      cone.rotateOnAxis(axis, angle);
      scene.add(cone);
    });

    // Floor grid
    const grid = new THREE.GridHelper(16, 16, 0x0d2a48, 0x071828);
    grid.position.y = -5;
    scene.add(grid);

    // Surface group
    const surfGrp = new THREE.Group();
    scene.add(surfGrp);
    surfGrpRef.current = surfGrp;

    // Sync target to domain center
    targetRef.current = { x: (xMin+xMax)/2, y: 0, z: (yMin+yMax)/2 };
    updateCam();

    // Overlay canvas size sync
    const syncOverlay = () => {
      const ov = overlayRef.current;
      if (!ov) return;
      ov.width  = container.clientWidth  * dpr;
      ov.height = container.clientHeight * dpr;
      ov.style.width  = container.clientWidth  + "px";
      ov.style.height = container.clientHeight + "px";
    };
    syncOverlay();

    // Draw 2D overlay labels
    const drawOverlay = () => {
      const ov = overlayRef.current;
      if (!ov) return;
      const ctx = ov.getContext("2d");
      const W2 = ov.width, H2 = ov.height;
      const w = W2/dpr, h = H2/dpr;
      ctx.clearRect(0,0,W2,H2);
      ctx.save(); ctx.scale(dpr,dpr);

      const proj = (x,y,z) => {
        const v = new THREE.Vector3(x,y,z); v.project(camera);
        return { px:(v.x*0.5+0.5)*w, py:(-v.y*0.5+0.5)*h, ok:v.z<1.0 };
      };

      ctx.font = "bold 13px DM Mono,monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowBlur = 4; ctx.shadowColor = "#050810";
      const AXIS_LABELS = [
        { p: proj(axLen+0.7,0,0),     text:"x",       col:"#f87171" },
        { p: proj(0,axLen+0.7,0),     text:"f(x,y)",  col:"#38bdf8" },
        { p: proj(0,0,axLen+0.7),     text:"y",       col:"#34d399" },
      ];
      AXIS_LABELS.forEach(({p,text,col})=>{
        if(!p.ok) return;
        ctx.fillStyle = col;
        ctx.fillText(text, p.px, p.py);
      });
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      drawOverlay();
    };
    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      const W3 = container.clientWidth, H3 = container.clientHeight;
      camera.aspect = W3/H3; camera.updateProjectionMatrix();
      renderer.setSize(W3,H3);
      syncOverlay();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []); // run once

  // ── Rebuild surfaces when expressions/range/res change ──
  useEffect(() => {
    const grp = surfGrpRef.current;
    if (!grp) return;

    // Dispose old
    while (grp.children.length) {
      const child = grp.children[0];
      grp.remove(child);
      child.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose()); }
      });
    }

    // Build new
    let avgY = 0, cnt = 0;
    expressions.forEach(exp => {
      if (!exp.value.trim()) return;
      try {
        const surf = buildSurface3D(exp.value, xMin, xMax, yMin, yMax, resolution);
        grp.add(surf);
        avgY += (surf.userData.zMin + surf.userData.zMax) / 2;
        cnt++;
      } catch(e) { console.warn("3D surface build error:", e); }
    });

    // Center orbit target on surface centroid
    targetRef.current = { x:(xMin+xMax)/2, y: cnt>0 ? avgY/cnt : 0, z:(yMin+yMax)/2 };
    updateCam();
  }, [expressions, xMin, xMax, yMin, yMax, resolution, updateCam]);

  // ── Mouse orbit / pan ──
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current = {
      x: e.clientX, y: e.clientY,
      theta: orbitRef.current.theta, phi: orbitRef.current.phi,
      isPan: e.shiftKey || e.button === 2,
      tx: targetRef.current.x, ty: targetRef.current.y, tz: targetRef.current.z,
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x, dy = e.clientY - dragRef.current.y;
    if (dragRef.current.isPan) {
      const s = orbitRef.current.radius * 0.001;
      targetRef.current.x = dragRef.current.tx - dx * s;
      targetRef.current.y = dragRef.current.ty + dy * s;
    } else {
      orbitRef.current.theta = dragRef.current.theta + dx * 0.007;
      orbitRef.current.phi   = Math.max(0.05, Math.min(Math.PI-0.05, dragRef.current.phi + dy*0.007));
    }
    updateCam();
  }, [updateCam]);

  const handleMouseUp    = useCallback(() => { dragRef.current = null; }, []);
  const handleMouseLeave = useCallback(() => { dragRef.current = null; }, []);

  // ── Wheel zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    orbitRef.current.radius = Math.max(2, Math.min(120, orbitRef.current.radius * (e.deltaY > 0 ? 1.1 : 0.9)));
    updateCam();
  }, [updateCam]);

  // ── Touch ──
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      touchRef.current = { type:"orbit", x:e.touches[0].clientX, y:e.touches[0].clientY, theta:orbitRef.current.theta, phi:orbitRef.current.phi };
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      touchRef.current = { type:"pinch", dist:d, radius:orbitRef.current.radius };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!touchRef.current) return;
    if (touchRef.current.type==="orbit" && e.touches.length===1) {
      const dx=e.touches[0].clientX-touchRef.current.x, dy=e.touches[0].clientY-touchRef.current.y;
      orbitRef.current.theta = touchRef.current.theta + dx*0.007;
      orbitRef.current.phi   = Math.max(0.05,Math.min(Math.PI-0.05, touchRef.current.phi+dy*0.007));
      updateCam();
    } else if (touchRef.current.type==="pinch" && e.touches.length===2) {
      const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      orbitRef.current.radius = Math.max(2,Math.min(120, touchRef.current.radius*(touchRef.current.dist/d)));
      updateCam();
    }
  }, [updateCam]);

  // Attach passive:false listeners
  useEffect(() => {
    const c = mountRef.current; if (!c) return;
    c.addEventListener("wheel",        handleWheel,      { passive:false });
    c.addEventListener("touchstart",   handleTouchStart, { passive:false });
    c.addEventListener("touchmove",    handleTouchMove,  { passive:false });
    return () => {
      c.removeEventListener("wheel",      handleWheel);
      c.removeEventListener("touchstart", handleTouchStart);
      c.removeEventListener("touchmove",  handleTouchMove);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  const zoom = (dir) => { orbitRef.current.radius=Math.max(2,Math.min(120,orbitRef.current.radius*(dir>0?0.8:1.25))); updateCam(); };
  const resetView = () => { orbitRef.current={theta:0.6,phi:1.05,radius:20}; updateCam(); };

  return (
    <div ref={mountRef}
      style={{ position:"relative", width:"100%", height:420, borderRadius:14, overflow:"hidden", border:"1px solid rgba(56,189,248,0.18)", cursor:dragRef.current?"grabbing":"grab", background:"#080c18", touchAction:"none", userSelect:"none" }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
      onTouchEnd={()=>{touchRef.current=null;}}
      onContextMenu={e=>e.preventDefault()}
    >
      {/* 2D label overlay */}
      <canvas ref={overlayRef} style={{ position:"absolute", top:0, left:0, pointerEvents:"none", zIndex:2 }}/>

      {/* Zoom buttons */}
      <div style={{ position:"absolute", bottom:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:3 }}>
        {[["＋",1],["－",-1]].map(([l,d])=>(
          <button key={l} onClick={()=>zoom(d)} style={{ width:32,height:32,borderRadius:8,background:"rgba(14,18,32,0.92)",border:"1px solid rgba(56,189,248,0.28)",color:"#38bdf8",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)" }}>{l}</button>
        ))}
        <button onClick={resetView} style={{ width:32,height:32,borderRadius:8,background:"rgba(14,18,32,0.92)",border:"1px solid rgba(56,189,248,0.15)",color:"var(--muted)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",fontFamily:"DM Mono" }}>⌂</button>
      </div>

      {/* Axis legend */}
      <div style={{ position:"absolute", top:10, left:12, display:"flex", gap:10, zIndex:3, fontFamily:"DM Mono", fontSize:11, background:"rgba(8,12,24,0.7)", padding:"5px 12px", borderRadius:8, backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{color:"#f87171"}}>● x</span>
        <span style={{color:"#34d399"}}>● y</span>
        <span style={{color:"#38bdf8"}}>● z=f(x,y)</span>
      </div>

      {/* Controls hint */}
      <div style={{ position:"absolute", bottom:10, left:12, fontFamily:"DM Mono", fontSize:10, color:"rgba(100,116,139,0.55)", pointerEvents:"none", zIndex:3 }}>
        drag to rotate · scroll to zoom · shift+drag to pan
      </div>
    </div>
  );
}

/* ── 3D EXPRESSION ROW ────────────────────────────────── */
function ExprRow3D({ exp, onUpdate, onRemove, showRemove }) {
  const [showKbd, setShowKbd] = useState(false);
  const inputRef = useRef(null);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#818cf8", boxShadow:"0 0 6px #818cf888", flexShrink:0 }}/>
        <input ref={inputRef} className="cf-input" value={exp.value}
          onChange={e => onUpdate(exp.id, e.target.value)}
          placeholder="e.g. sin(sqrt(x^2+y^2)), x^2-y^2, e^(-(x^2+y^2))"
          style={{ flex:1, borderColor:"rgba(129,140,248,0.4)", padding:"8px 12px", fontSize:14 }}/>
        <button onClick={() => setShowKbd(v=>!v)} title="Math keyboard"
          style={{ width:34,height:34,borderRadius:8,flexShrink:0,cursor:"pointer", background:showKbd?"rgba(129,140,248,0.2)":"var(--surface2)", border:`1px solid ${showKbd?"rgba(129,140,248,0.5)":"var(--border)"}`, color:showKbd?"#818cf8":"var(--muted)", fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>⌨</button>
        {showRemove && (
          <button onClick={() => onRemove(exp.id)}
            style={{ width:34,height:34,borderRadius:8,flexShrink:0,background:"none",border:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        )}
      </div>
      {exp.value.trim()&&(
        <div style={{marginLeft:22,marginTop:4,padding:"5px 12px",background:"rgba(0,0,0,0.2)",borderRadius:8,borderLeft:"2px solid rgba(129,140,248,0.4)",display:"flex",alignItems:"center",minHeight:32,overflowX:"auto"}}>
          <MathDisplay expr={exp.value} size="sm" style={{color:"#818cf8"}}/>
        </div>
      )}
      {showKbd && (
        <div style={{ marginTop:8, marginLeft:16 }}>
          <MathKeyboard inputRef={inputRef} value={exp.value} onChange={v => onUpdate(exp.id, v)}/>
        </div>
      )}
    </div>
  );
}

/* ── 3D GRAPHING PAGE ─────────────────────────────────── */
function Graphing3D({ setMode }) {
  const [expressions, setExpressions] = useState([{ id:1, value:"sin(sqrt(x^2+y^2))" }]);
  const [xMin, setXMin] = useState(-5); const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5); const [yMax, setYMax] = useState(5);
  const [resolution, setResolution] = useState(60);

  const update = (id,v) => setExpressions(e=>e.map(ex=>ex.id===id?{...ex,value:v}:ex));
  const remove = (id) => setExpressions(e=>e.filter(ex=>ex.id!==id));
  const add    = () => { if(expressions.length>=4)return; setExpressions(e=>[...e,{id:Date.now(),value:""}]); };

  const EXAMPLES = [
    "sin(sqrt(x^2+y^2))",
    "x^2 - y^2",
    "e^(-(x^2+y^2))",
    "sin(x)*cos(y)",
    "x*y",
    "cos(x+y)",
    "1/(x^2+y^2+0.5)",
    "sqrt(abs(x*y))",
    "x^2+y^2",
    "sin(x^2+y^2)",
  ];

  return (
    <div>

      {/* Canvas */}
      <Graph3D expressions={expressions} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} resolution={resolution}/>

      {/* Expression inputs */}
      <div style={{ marginTop:14 }}>
        {expressions.map(exp => (
          <ExprRow3D key={exp.id} exp={exp} onUpdate={update} onRemove={remove} showRemove={expressions.length>1}/>
        ))}
        {expressions.length < 4 && (
          <button onClick={add} style={{ marginTop:6, padding:"7px 14px", background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.25)", borderRadius:10, color:"#818cf8", fontSize:13, cursor:"pointer" }}>
            + Add surface
          </button>
        )}
      </div>

      {/* Domain & resolution controls */}
      <div style={{ marginTop:14, padding:"12px 14px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12 }}>
        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:10, fontFamily:"DM Mono" }}>DOMAIN &amp; RESOLUTION</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:10 }}>
          {[["x min",xMin,setXMin],["x max",xMax,setXMax],["y min",yMin,setYMin],["y max",yMax,setYMax]].map(([label,val,setter])=>(
            <div key={label}>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:3}}>{label}</div>
              <input type="number" className="cf-input" value={val} onChange={e=>setter(+e.target.value)} style={{padding:"6px 8px",fontSize:13}}/>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>Resolution:</span>
          {[[30,"Low"],[60,"Med"],[100,"High"]].map(([res,label])=>(
            <button key={res} onClick={()=>setResolution(res)} style={{ padding:"5px 12px", borderRadius:8, fontFamily:"DM Mono", fontSize:12, cursor:"pointer", background:resolution===res?"rgba(129,140,248,0.2)":"var(--surface2)", border:`1px solid ${resolution===res?"rgba(129,140,248,0.45)":"var(--border)"}`, color:resolution===res?"#818cf8":"var(--muted)" }}>{label}</button>
          ))}
          <button onClick={()=>{setXMin(-5);setXMax(5);setYMin(-5);setYMax(5);setResolution(60);}} style={{ marginLeft:"auto", padding:"5px 10px", borderRadius:8, background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--muted)", fontSize:11, cursor:"pointer", fontFamily:"DM Mono" }}>Reset</button>
        </div>
      </div>

      {/* Examples */}
      <div style={{ marginTop:14 }}>
        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:6 }}>Quick examples:</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {EXAMPLES.map(ex=>(
            <button key={ex} onClick={()=>update(expressions[0].id,ex)} style={{ padding:"3px 9px", borderRadius:7, background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--muted)", fontFamily:"DM Mono", fontSize:11, cursor:"pointer" }}>{ex}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP — with sticky header, theme toggle, universal back
══════════════════════════════════════════════════════════ */
const PAGE_META = {
  home:     { title:"CalcFlow Pro",     icon:null },
  basic:    { title:"Basic Calculator", icon:"⊞",  color:"#38bdf8" },
  graph:    { title:"2D Graphing",       icon:"∿",  color:"#818cf8" },
  graph3d:  { title:"3D Surface Graph", icon:"⬡",  color:"#818cf8" },
  matrix:   { title:"Matrix Operations",icon:"⊡",  color:"#34d399" },
  calculus: { title:"Calculus",          icon:"∂",  color:"#f472b6" },
};

export { ErrorBoundary };
export default function App() {
  const [mode, setMode]   = useState("home");
  const [dark, setDark]   = useState(true);
  const meta = PAGE_META[mode] || PAGE_META.home;

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    document.body.style.background = dark ? "#080b14" : "#f0f4ff";
  }, [dark]);

  const goHome = () => setMode("home");

  // Icon-only theme toggle button
  const ThemeToggle = () => (
    <button className="theme-btn" onClick={() => setDark(d=>!d)} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      }
    </button>
  );

  return (
    <div className={`cf-root${dark ? "" : " light"}`}>

      {/* ── BOTTOM PILL NAV (sub-pages only) ── */}
      {mode !== "home" && (
        <header className="cf-header">
          <button className="cf-header-back" onClick={goHome} title="Home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18V12"/>
            </svg>
          </button>
          <span className="cf-header-title">
            {meta.icon && <span style={{color:meta.color,marginRight:5}}>{meta.icon}</span>}
            {meta.title}
          </span>
          <ThemeToggle/>
        </header>
      )}
      {mode === "home" && (
        <div style={{position:"fixed",bottom:20,right:20,zIndex:200}}>
          <ThemeToggle/>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <div className="cf-content">
        {/* Back button at top of every sub-page */}
        {mode !== "home" && (
          <button onClick={goHome}
            style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 18px",
              marginBottom:20,background:"var(--surface2)",border:"1px solid var(--border)",
              borderRadius:100,color:"var(--muted)",cursor:"pointer",fontSize:13,
              fontFamily:"'DM Sans',sans-serif",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.color="var(--accent)";e.currentTarget.style.borderColor="var(--accent)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="var(--muted)";e.currentTarget.style.borderColor="var(--border)";}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        )}
        {mode==="home"     && <Home setMode={setMode}/>}
        {mode==="basic"    && <BasicCalc setMode={setMode}/>}
        {mode==="graph"    && <Graphing setMode={setMode}/>}
        {mode==="graph3d"  && <Graphing3D setMode={setMode}/>}
        {mode==="matrix"   && <Matrix setMode={setMode}/>}
        {mode==="calculus" && <Calculus setMode={setMode}/>}
      </div>
    </div>
  );
}

/* ── SHARED ──────────────────────────────────────────────── */
// BackBtn kept for any remaining usages but now hidden since header handles it
function BackBtn({ setMode }) { return null; }

function SectionTitle({ icon, title, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <span style={{fontSize:20,color,textShadow:`0 0 16px ${color}66`}}>{icon}</span>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,letterSpacing:"-0.01em"}}>{title}</h2>
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────── */
function Home({ setMode }) {
  const cards = [
    { name:"Basic Calc",    sub:"Arithmetic & functions",     icon:"⊞", mode:"basic",   accent:"#38bdf8" },
    { name:"2D Graphing",   sub:"Real-time function plotter", icon:"∿", mode:"graph",   accent:"#818cf8" },
    { name:"Matrix",        sub:"Up to 10×10 algebra",        icon:"⊡", mode:"matrix",  accent:"#34d399" },
    { name:"Calculus",      sub:"Derivatives & integrals",    icon:"∂", mode:"calculus",accent:"#f472b6" },
  ];
  return (
    <div>
      {/* Hero heading */}
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <span style={{
            fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800,
            letterSpacing:"-0.03em",
            background:"linear-gradient(135deg,#38bdf8 0%,#818cf8 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>CalcFlow</span>
          <span style={{
            display:"inline-flex", alignItems:"center",
            background:"rgba(56,189,248,0.12)", color:"var(--accent)",
            border:"1px solid rgba(56,189,248,0.3)", borderRadius:8,
            fontFamily:"'DM Mono',monospace", fontWeight:600, fontSize:12,
            letterSpacing:"0.08em", padding:"3px 10px",
          }}>PRO</span>
        </div>
        <p style={{color:"var(--muted)",fontSize:14,letterSpacing:"0.01em"}}>Your complete mathematics toolkit</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        {cards.map(c=>(
          <button key={c.mode} onClick={()=>setMode(c.mode)} className="card"
            style={{ cursor:"pointer", padding:"18px 16px", textAlign:"left", border:"1px solid var(--border)", background:"var(--surface)", width:"100%" }}>
            <div style={{ fontSize:26, marginBottom:10, color:c.accent, textShadow:`0 0 20px ${c.accent}44` }}>{c.icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:3, color:"var(--text)" }}>{c.name}</div>
            <div style={{ fontSize:11, color:"var(--muted)", lineHeight:1.4 }}>{c.sub}</div>
          </button>
        ))}
      </div>

      {/* 3D Graph featured */}
      <button onClick={()=>setMode("graph3d")} className="card"
        style={{ width:"100%", cursor:"pointer", padding:"18px 20px", textAlign:"left", border:"1px solid rgba(129,140,248,0.28)", background:"linear-gradient(135deg,rgba(129,140,248,0.07),rgba(56,189,248,0.04))" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28, textShadow:"0 0 24px #818cf877", color:"#818cf8" }}>⬡</span>
          <div style={{flex:1}}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#818cf8", marginBottom:3 }}>3D Surface Graph</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Plot z = f(x,y) · orbit controls · height-gradient shading</div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ── BASIC CALCULATOR ──────────────────────────────────── */
function BasicCalc({ setMode }) {
  const [input,setInput]   = useState("");
  const [result,setResult] = useState("");
  const [error,setError]   = useState(false);
  const [pressed,setPressed] = useState(null);
  const [showConst, setShowConst] = useState(false);

  const evaluate = useCallback((expr) => {
    if (!expr) return;
    try {
      const val = math.evaluate(preprocess(expr), { ...BASE_SCOPE });
      if (val && typeof val === "object" && val.re !== undefined) {
        const re = val.re, im = val.im;
        const reNZ = Math.abs(re) > 1e-12, imNZ = Math.abs(im) > 1e-12;
        if (!reNZ && !imNZ) { setResult("0"); }
        else if (!imNZ) { setResult(formatResult(re)); }
        else if (!reNZ) { setResult(formatResult(im) + "i"); }
        else { setResult(formatResult(re) + (im > 0 ? " + " : " − ") + formatResult(Math.abs(im)) + "i"); }
        setError(false); return;
      }
      if (val && typeof val === "object" && val.toArray) { setResult("[matrix]"); setError(false); return; }
      const num = typeof val === "number" ? val : (val?.valueOf ? val.valueOf() : NaN);
      if (typeof num === "number" && isFinite(num)) { setResult(formatResult(num)); }
      else if (num === Infinity || num === -Infinity) { setResult(num > 0 ? "∞" : "-∞"); }
      else { setResult(String(val)); }
      setError(false);
    } catch { setResult("Syntax Error"); setError(true); }
  }, []);

  const handleBtn = useCallback((val) => {
    setPressed(val); setTimeout(() => setPressed(null), 120);
    if (val === "C")   { setInput(""); setResult(""); setError(false); return; }
    if (val === "⌫")   { setInput(p => p.slice(0,-1)); return; }
    if (val === "=")   { evaluate(input); return; }
    if (val === "+/-") { setInput(p => p.startsWith("-") ? p.slice(1) : p ? "-"+p : ""); return; }
    if (val === "%")   { try { setInput(p => String(parseFloat(p)/100)); } catch {} return; }
    setInput(p => p + val);
  }, [input, evaluate]);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) handleBtn(k);
      else if (["+","-","*","/",".","(",")"].includes(k)) handleBtn(k);
      else if (k==="Enter"||k==="=") handleBtn("=");
      else if (k==="Backspace") handleBtn("⌫");
      else if (k==="Escape") handleBtn("C");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleBtn]);

  const layout = [
    ["C","(",")","÷"],
    ["7","8","9","×"],
    ["4","5","6","−"],
    ["1","2","3","+"],
    ["0",".","⌫","="],
  ];

  // Beautiful button style
  const btnStyle = (b) => {
    const isOp = ["÷","×","−","+"].includes(b);
    const isEq = b === "=";
    const isClear = b === "C";
    const isFn = ["(",")"].includes(b);
    const isNum = /^[0-9.]$/.test(b);
    const isActive = pressed === b;

    if (isEq) return {
      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
      border: "none", color: "#fff", fontSize: 24, fontWeight: 700,
      boxShadow: isActive ? "none" : "0 4px 20px rgba(56,189,248,0.35), 0 2px 6px rgba(99,102,241,0.3)",
      transform: isActive ? "scale(0.93)" : "translateY(-1px)",
    };
    if (isOp) return {
      background: isActive ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.08)",
      border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", fontSize: 22, fontWeight: 600,
      boxShadow: isActive ? "none" : "0 2px 8px rgba(56,189,248,0.1)",
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isClear) return {
      background: isActive ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.08)",
      border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", fontSize: 18, fontWeight: 600,
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isFn) return {
      background: isActive ? "rgba(129,140,248,0.2)" : "rgba(129,140,248,0.07)",
      border: "1px solid rgba(129,140,248,0.2)", color: "#818cf8", fontSize: 18,
      transform: isActive ? "scale(0.93)" : undefined,
    };
    if (isNum) return {
      background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.055)",
      border: "1px solid rgba(255,255,255,0.09)", color: "var(--text)", fontSize: 22, fontWeight: 500,
      boxShadow: isActive ? "none" : "0 2px 6px rgba(0,0,0,0.2)",
      transform: isActive ? "scale(0.93)" : "translateY(-1px)",
    };
    // ⌫
    return {
      background: isActive ? "rgba(251,146,60,0.15)" : "rgba(251,146,60,0.07)",
      border: "1px solid rgba(251,146,60,0.2)", color: "#fb923c", fontSize: 18,
      transform: isActive ? "scale(0.93)" : undefined,
    };
  };

  const fnRow = ["sin(","cos(","tan(","√(","^","log(","ln(","asin(","π","e"];

  // Constant groups
  const CONSTS = [
    {label:"π",  ins:"pi",       desc:"3.14159…"},
    {label:"e",  ins:"e",        desc:"2.71828…"},
    {label:"φ",  ins:"1.618034", desc:"Golden φ"},
    {label:"c",  ins:"c",        desc:"Speed of light"},
    {label:"G",  ins:"G",        desc:"Gravity const"},
    {label:"h",  ins:"h",        desc:"Planck"},
    {label:"NA", ins:"NA",       desc:"Avogadro"},
    {label:"kB", ins:"kb",       desc:"Boltzmann"},
    {label:"R",  ins:"R",        desc:"Gas const"},
    {label:"F",  ins:"F",        desc:"Faraday"},
    {label:"me", ins:"me",       desc:"e⁻ mass"},
    {label:"qe", ins:"qe",       desc:"e⁻ charge"},
  ];

  return (
    <div>
      {/* Display */}
      <div className="calc-display" style={{minHeight:110,alignItems:"flex-end",marginBottom:12}}>
        <div style={{width:"100%",display:"flex",justifyContent:"flex-end",minHeight:32,alignItems:"center",overflowX:"auto"}}>
          {input
            ? <MathDisplay expr={input} size="md" style={{color:"rgba(148,163,184,0.85)"}}/>
            : <span style={{color:"var(--muted)",fontFamily:"DM Mono",fontSize:15}}>0</span>}
        </div>
        <div style={{width:"100%",display:"flex",justifyContent:"flex-end",minHeight:48,alignItems:"center",overflowX:"auto"}}>
          {error
            ? <span style={{color:"var(--red)",fontFamily:"DM Mono",fontSize:16}}>Syntax Error</span>
            : result
              ? <MathDisplay expr={result} size="xl" style={{color:"var(--accent)",filter:"drop-shadow(0 0 12px rgba(56,189,248,0.4))"}}/>
              : <span style={{color:"rgba(100,116,139,0.3)",fontFamily:"DM Mono",fontSize:32}}>—</span>}
        </div>
      </div>

      {/* Main grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
        {layout.flat().map((b,i)=>(
          <button key={i} onClick={()=>handleBtn(b==="÷"?"/":b==="×"?"*":b==="−"?"-":b)}
            style={{height:"clamp(56px,14vw,72px)",borderRadius:16,cursor:"pointer",
              fontFamily:"DM Mono",transition:"all 0.1s ease",display:"flex",alignItems:"center",
              justifyContent:"center",...btnStyle(b)}}>
            {b}
          </button>
        ))}
      </div>

      {/* Function row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:8}}>
        {fnRow.map((b,i)=>(
          <button key={i} onClick={()=>handleBtn(b==="π"?"pi":b)}
            style={{height:"clamp(36px,9vw,44px)",borderRadius:10,cursor:"pointer",
              fontFamily:"DM Mono",fontSize:11,transition:"all 0.1s",
              background:pressed===b?"rgba(129,140,248,0.2)":"rgba(129,140,248,0.07)",
              border:"1px solid rgba(129,140,248,0.2)",color:"#818cf8",
              transform:pressed===b?"scale(0.93)":undefined}}>
            {b}
          </button>
        ))}
      </div>

      {/* Constants toggle + panel */}
      <button onClick={()=>setShowConst(v=>!v)}
        style={{width:"100%",padding:"8px",borderRadius:10,cursor:"pointer",marginBottom:6,
          fontFamily:"DM Mono",fontSize:12,
          background:showConst?"rgba(52,211,153,0.12)":"rgba(52,211,153,0.05)",
          border:`1px solid ${showConst?"rgba(52,211,153,0.4)":"rgba(52,211,153,0.15)"}`,
          color:showConst?"#34d399":"var(--muted)",transition:"all 0.15s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span style={{fontSize:14}}>{showConst?"▲":"▼"}</span>
        Constants  (π  e  φ  c  G  h  NA  kB…)
      </button>

      {showConst && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8,
          padding:10,background:"rgba(52,211,153,0.04)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:12}}>
          {CONSTS.map((c,i)=>(
            <button key={i} onClick={()=>handleBtn(c.ins)}
              style={{padding:"6px 4px",borderRadius:9,cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:1,
                background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.18)",
                transition:"all 0.12s",height:48}}>
              <span style={{fontFamily:"DM Mono",fontSize:14,fontWeight:700,color:"#34d399"}}>{c.label}</span>
              <span style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted)",textAlign:"center",lineHeight:1.2}}>{c.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MATRIX ────────────────────────────────────────────── */
const MATRIX_OPS=[{id:"multiply",label:"A × B",single:false},{id:"add",label:"A + B",single:false},{id:"subtract",label:"A − B",single:false},{id:"det",label:"det(A)",single:true},{id:"inv",label:"A⁻¹",single:true},{id:"transpose",label:"Aᵀ",single:true},{id:"power",label:"Aⁿ",single:true},{id:"eigenvalues",label:"eig(A)",single:true},{id:"trace",label:"tr(A)",single:true},{id:"rank",label:"rank(A)",single:true}];
function makeEmpty(r,c){return Array.from({length:r},(_,ri)=>Array.from({length:c},(_,ci)=>ri===ci?"1":"0"));}
function Matrix({setMode}){
  const[rows,setRows]=useState(3);const[cols,setCols]=useState(3);const[rowsB,setRowsB]=useState(3);const[colsB,setColsB]=useState(3);const[matA,setMatA]=useState(makeEmpty(3,3));const[matB,setMatB]=useState(makeEmpty(3,3));const[op,setOp]=useState("multiply");const[power,setPower]=useState("2");const[result,setResult]=useState(null);const[resultMeta,setResultMeta]=useState("matrix");const[error,setError]=useState("");
  const isSingle=MATRIX_OPS.find(o=>o.id===op)?.single;
  const resizeMat=(mat,r,c)=>Array.from({length:r},(_,i)=>Array.from({length:c},(_,j)=>mat[i]?.[j]??(i===j?"1":"0")));
  const resizeA=(r,c)=>{setRows(r);setCols(c);setMatA(p=>resizeMat(p,r,c));};
  const resizeB=(r,c)=>{setRowsB(r);setColsB(c);setMatB(p=>resizeMat(p,r,c));};
  const setCell=(setter,r,c,v)=>setter(p=>{const n=p.map(row=>[...row]);n[r][c]=v;return n;});
  const toMath=(mat)=>math.matrix(mat.map(row=>row.map(v=>parseFloat(v)||0)));
  const fmtCell=(v)=>{if(typeof v==="number")return formatResult(parseFloat(v.toPrecision(7)));if(v?.re!==undefined)return formatResult(parseFloat(v.re.toPrecision(6)));return String(v);};
  const compute=()=>{try{const A=toMath(matA);let res,meta="matrix";if(op==="multiply"){res=math.multiply(A,toMath(matB));}else if(op==="add"){res=math.add(A,toMath(matB));}else if(op==="subtract"){res=math.subtract(A,toMath(matB));}else if(op==="det"){res=math.det(A);meta="scalar";}else if(op==="inv"){res=math.inv(A);}else if(op==="transpose"){res=math.transpose(A);}else if(op==="power"){res=math.pow(A,parseInt(power)||2);}else if(op==="trace"){const a=A.toArray();res=a.reduce((s,r,i)=>s+(parseFloat(r[i])||0),0);meta="scalar";}else if(op==="rank"){const arr=A.toArray().map(r=>r.map(Number));let rank=0,lead=0,M=arr.map(r=>[...r]);const m=M.length,n2=M[0].length;for(let r=0;r<m;r++){if(lead>=n2)break;let i=r;while(Math.abs(M[i]?.[lead]??0)<1e-10){i++;if(i===m){i=r;lead++;if(lead===n2)break;}}if(lead>=n2)break;[M[i],M[r]]=[M[r],M[i]];const d=M[r][lead];if(Math.abs(d)>1e-10){M[r]=M[r].map(v=>v/d);rank++;}for(let j=0;j<m;j++){if(j!==r){const f=M[j][lead];M[j]=M[j].map((v,k)=>v-f*M[r][k]);}}lead++;}res=rank;meta="scalar";}else if(op==="eigenvalues"){const eigs=math.eigs(A);res=eigs.values.toArray?eigs.values.toArray():eigs.values;meta="list";}setResult(res?.toArray?res.toArray():res);setResultMeta(meta);setError("");}catch(e){setError(e.message||"Computation failed");setResult(null);}};
  const SizeBtn=({n,cur,onSel})=>(<button onClick={()=>onSel(n)} style={{width:26,height:26,borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"DM Mono",background:cur===n?"rgba(52,211,153,0.2)":"var(--surface2)",border:`1px solid ${cur===n?"rgba(52,211,153,0.5)":"var(--border)"}`,color:cur===n?"#34d399":"var(--muted)"}}>{n}</button>);
  const renderGrid=(mat,setter,label,color,r,c,onRR,onRC)=>{const cell=Math.max(28,Math.min(44,Math.floor(440/Math.max(c,2))));const fs=Math.max(11,Math.min(14,Math.floor(cell*0.38)));return(<div style={{marginBottom:20}}><div style={{marginBottom:8}}><span style={{fontSize:13,color,fontFamily:"DM Mono",fontWeight:600}}>{label} ({r}×{c})</span></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}><span style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono",minWidth:28}}>rows</span><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={r} onSel={onRR}/>)}</div></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}><span style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono",minWidth:28}}>cols</span><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={c} onSel={onRC}/>)}</div></div><div style={{overflowX:"auto"}}><div style={{display:"inline-grid",gap:4,gridTemplateColumns:`repeat(${c},${cell}px)`}}>{mat.map((row,ri)=>row.map((cell2,ci)=>(<input key={`${ri}-${ci}`} className="mat-cell" value={cell2} onChange={e=>setCell(setter,ri,ci,e.target.value)} style={{height:cell,fontSize:fs,borderColor:color+"33",padding:"2px"}}/>)))}</div></div></div>);};
  const renderResult=()=>{if(result===null||result===undefined)return null;if(resultMeta==="scalar")return<div style={{fontFamily:"DM Mono",fontSize:28,color:"#34d399"}}>{formatResult(typeof result==="number"?result:result)}</div>;if(resultMeta==="list"){const arr=Array.isArray(result)?result:[result];return<div style={{display:"flex",flexDirection:"column",gap:6}}>{arr.map((v,i)=>{const isC=v?.re!==undefined;const re=fmtCell(isC?v.re:v);const im=isC?v.im:0;return<div key={i} style={{fontFamily:"DM Mono",fontSize:15,color:"var(--text)"}}>λ{i+1} = {re}{isC&&Math.abs(im)>1e-10?` + ${formatResult(parseFloat(im.toPrecision(5)))}i`:""}</div>;})}</div>;}const arr=Array.isArray(result)?result:[];return(<div style={{overflowX:"auto"}}><div style={{display:"inline-grid",gap:4,gridTemplateColumns:`repeat(${arr[0]?.length||1},minmax(52px,auto))`}}>{arr.map((row,ri)=>(Array.isArray(row)?row:[row]).map((cell,ci)=>(<div key={`${ri}-${ci}`} style={{fontFamily:"DM Mono",fontSize:13,color:"var(--text)",padding:"5px 10px",background:"rgba(52,211,153,0.07)",borderRadius:6,textAlign:"right"}}>{fmtCell(cell)}</div>)))}</div></div>);};
  return(<div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>{MATRIX_OPS.map(o=>(<button key={o.id} onClick={()=>setOp(o.id)} style={{padding:"6px 12px",borderRadius:10,fontFamily:"DM Mono",fontSize:12,cursor:"pointer",background:op===o.id?"rgba(52,211,153,0.15)":"var(--surface2)",border:`1px solid ${op===o.id?"rgba(52,211,153,0.4)":"var(--border)"}`,color:op===o.id?"#34d399":"var(--muted)"}}>{o.label}</button>))}</div>{renderGrid(matA,setMatA,"Matrix A","#34d399",rows,cols,r=>resizeA(r,cols),c=>resizeA(rows,c))}{!isSingle&&renderGrid(matB,setMatB,"Matrix B","#38bdf8",rowsB,colsB,r=>resizeB(r,colsB),c=>resizeB(rowsB,c))}{op==="power"&&(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{color:"var(--muted)",fontSize:13}}>n =</span><input className="cf-input" type="number" value={power} onChange={e=>setPower(e.target.value)} style={{width:80}}/></div>)}<button onClick={compute} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,rgba(52,211,153,0.2),rgba(56,189,248,0.2))",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399",fontFamily:"DM Mono",fontSize:15,cursor:"pointer",fontWeight:500}}>Compute</button>{error&&<div style={{marginTop:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}{result!==null&&result!==undefined&&(<div style={{marginTop:14,padding:"16px",background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12}}><div style={{fontSize:11,color:"#34d399",marginBottom:10,fontFamily:"DM Mono"}}>RESULT</div>{renderResult()}</div>)}</div>);
}

/* ── CALCULUS ──────────────────────────────────────────── */
const CALC_OPS = [
  {id:"deriv1",   label:"d/dx",    group:"Basic",       color:"#f472b6", desc:"First Derivative",              inputs:1},
  {id:"deriv2",   label:"d²/dx²",  group:"Basic",       color:"#f472b6", desc:"Second Derivative",             inputs:1},
  {id:"derivN",   label:"dⁿ/dxⁿ", group:"Basic",       color:"#f472b6", desc:"nth Order Derivative",          inputs:1, hasN:true},
  {id:"product",  label:"UV Rule", group:"Rules",       color:"#818cf8", desc:"Product Rule (Differentiation)",inputs:2},
  {id:"quotient", label:"U/V Rule",group:"Rules",       color:"#818cf8", desc:"Quotient Rule",                 inputs:2},
  {id:"chain",    label:"Chain ∘", group:"Rules",       color:"#818cf8", desc:"Chain Rule",                    inputs:2},
  {id:"partial_x",label:"∂/∂x",   group:"Partial",     color:"#38bdf8", desc:"Partial w.r.t. x",             inputs:1},
  {id:"partial_y",label:"∂/∂y",   group:"Partial",     color:"#38bdf8", desc:"Partial w.r.t. y",             inputs:1},
  {id:"int_indef",label:"∫ dx",   group:"Integration", color:"#fb923c", desc:"Indefinite Integral",      inputs:1, isAsync:true},
  {id:"int_def",  label:"∫ₐᵇ dx", group:"Integration", color:"#fb923c", desc:"Definite Integral (Numerical)", inputs:1, hasBounds:true},
  {id:"simplify", label:"Simplify",group:"Algebra",     color:"#34d399", desc:"Algebraic Simplification",      inputs:1},
];

const OP_FORMULA = {
  deriv1:    {tex:"d/dx [ f(x) ]",                              rule:"Basic differentiation"},
  deriv2:    {tex:"d²/dx² [ f(x) ]",                            rule:"Apply d/dx twice"},
  derivN:    {tex:"dⁿ/dxⁿ [ f(x) ]",                           rule:"Repeated differentiation"},
  product:   {tex:"d/dx [u·v] = u′·v + u·v′",                  rule:"Product Rule"},
  quotient:  {tex:"d/dx [u/v] = (u′v − uv′) / v²",             rule:"Quotient Rule"},
  chain:     {tex:"d/dx [f(g)] = f′(g(x)) · g′(x)",            rule:"Chain Rule"},
  partial_x: {tex:"∂f/∂x  (y treated as constant)",             rule:"Partial Derivative"},
  partial_y: {tex:"∂f/∂y  (x treated as constant)",             rule:"Partial Derivative"},
  int_indef: {tex:"∫ f(x) dx",  rule:"Indefinite Integral"},
  int_def:   {tex:"∫ₐᵇ f(x) dx  — numerical via Simpson's rule",rule:"Definite Integral"},
  simplify:  {tex:"Simplify algebraic expression",               rule:"Algebra"},
};

const OP_EXAMPLES = {
  deriv1:    [["x^3 - 2*x"],["sin(x)*cos(x)"],["e^x + ln(x)"],["x^4/4 - x^2"]],
  deriv2:    [["sin(x)"],["x^5 - 3*x^2"],["e^(2*x)"],["ln(x)"]],
  derivN:    [["sin(x)"],["e^x"],["x^6 - x^3"]],
  product:   [["x^2","sin(x)"],["e^x","ln(x)"],["x^3","cos(x)"],["sqrt(x)","e^x"]],
  quotient:  [["sin(x)","x"],["x^2","x+1"],["e^x","x^2"],["ln(x)","x"]],
  chain:     [["sin(u)","x^2"],["e^u","sin(x)"],["u^3","x^2+1"],["ln(u)","x^2+1"]],
  partial_x: [["x^2*y + sin(x*y)"],["x^3 + y^3 - 3*x*y"],["e^(x+y)"],["x^2*y^2"]],
  partial_y: [["x^2*y + sin(x*y)"],["x*y^3 + ln(y)"],["x^2*y^3"],["e^(x*y)"]],
  int_indef: [["x^3 - 2*x"],["sin(x)"],["e^x"],["1/x"],["sqrt(x)"],["x*e^x"],["x*sin(x)"],["ln(x)"]],
  int_def:   [["sin(x)"],["x^2"],["e^x"],["sqrt(x)"],["1/(1+x^2)"],["x*cos(x)"]],
  simplify:  [["2*x + 3*x"],["sin(x)^2 + cos(x)^2"],["(x+1)^2 - x^2"],["x*(x+2)"]],
};

// ── Numerical definite integration via adaptive Simpson's rule ──
function simpsonIntegral(expr, a, b, n = 2000) {
  if (!isFinite(a) || !isFinite(b)) throw new Error("Bounds must be finite numbers");
  if (a === b) return 0;
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = 0;
  const fa = evalAt(expr, a), fb = evalAt(expr, b);
  if (fa === null || fb === null) throw new Error("Function undefined at bounds");
  sum += fa + fb;
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evalAt(expr, x);
    if (fx === null) throw new Error(`Function undefined at x = ${x.toPrecision(4)}`);
    sum += (i % 2 === 0 ? 2 : 4) * fx;
  }
  return (h / 3) * sum;
}

// ── ExprText: renders mathjs expressions with proper sup/sub ──
// ── FracSpan: renders a/b as a proper stacked fraction ──
// ── Frac: renders a stacked fraction ──────────────────────────
function Frac({ num, den, sz }) {
  const fs = (sz || 15) * 0.75;
  return (
    <span style={{display:'inline-flex',flexDirection:'column',alignItems:'center',
      verticalAlign:'middle',margin:'0 2px',lineHeight:1.1}}>
      <span style={{fontSize:fs,borderBottom:'1.5px solid var(--accent2)',
        paddingBottom:1,paddingLeft:3,paddingRight:3,textAlign:'center',
        color:'var(--accent2)',fontWeight:700,whiteSpace:'nowrap'}}>{num}</span>
      <span style={{fontSize:fs,paddingTop:1,paddingLeft:3,paddingRight:3,
        textAlign:'center',color:'var(--accent2)',fontWeight:700,whiteSpace:'nowrap'}}>{den}</span>
    </span>
  );
}

// ── ExprText: full expression renderer ───────────────────────
// Handles: a/b fractions, (a/b)*expr, x^n superscripts, removes *
function ExprText({ expr, size=15, color, bold=false }) {
  // we use a ref-based key so it resets each render call
  const _k = {n:0};
  const k = () => String(_k.n++);

  // ── superscript renderer: handles ^n and ^(expr)
  function withSup(str) {
    if (!str.includes('^')) return <span key={k()}>{str}</span>;
    const out = [];
    let i = 0;
    while (i < str.length) {
      if (str[i] === '^') {
        i++;
        if (str[i] === '(') {
          let d = 1, j = i+1;
          while (j < str.length && d > 0) { if(str[j]==='(')d++; else if(str[j]===')')d--; j++; }
          out.push(<sup key={k()} style={{fontSize:'0.62em',position:'relative',top:'-0.5em',color:'var(--accent2)',fontWeight:700}}>{str.slice(i+1,j-1)}</sup>);
          i = j;
        } else {
          let tok = '';
          if (str[i]==='-'){tok='-';i++;}
          while (i < str.length && /[\w.]/.test(str[i])) { tok+=str[i]; i++; }
          out.push(<sup key={k()} style={{fontSize:'0.62em',position:'relative',top:'-0.5em',color:'var(--accent2)',fontWeight:700}}>{tok}</sup>);
        }
      } else {
        let ch = '';
        while (i < str.length && str[i]!=='^') { ch+=str[i]; i++; }
        if (ch) out.push(<span key={k()}>{ch}</span>);
      }
    }
    return out;
  }

  // ── tokenise a single term into fraction or plain
  function renderTerm(t) {
    t = t.trim();
    if (!t) return null;

    // Pattern: (num/den)*rest  e.g. (2/3)*x^3
    const parenFrac = t.match(/^\(([^()]+)\/([^()]+)\)\*?(.*)$/);
    if (parenFrac) {
      const [, num, den, rest] = parenFrac;
      return <span key={k()} style={{display:'inline-flex',alignItems:'center',gap:1}}>
        <Frac num={withSup(num)} den={withSup(den)} sz={size}/>
        {rest && <span key={k()} style={{marginLeft:1}}>{withSup(rest)}</span>}
      </span>;
    }

    // Pattern: term/term  — top-level slash
    let slash = -1, d = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i]==='('||t[i]==='{') d++;
      else if (t[i]===')'||t[i]==='}') d--;
      else if (t[i]==='/' && d===0) { slash=i; break; }
    }
    if (slash > 0) {
      // split: before slash = numerator, after = denominator
      // strip outer parens
      const raw_n = t.slice(0, slash).replace(/^\(|\)$/g,'');
      const raw_d = t.slice(slash+1).replace(/^\(|\)$/g,'');
      return <Frac key={k()} num={withSup(raw_n)} den={withSup(raw_d)} sz={size}/>;
    }

    // Plain term — remove * (multiply dot shown implicitly), render with superscripts
    const cleaned = t.replace(/\*/g, '·');
    return <span key={k()} style={{whiteSpace:'nowrap'}}>{withSup(cleaned)}</span>;
  }

  // ── split into top-level terms by + and -
  function renderExpr(str) {
    str = String(str).trim();
    const tokens = []; // {sign, term}
    let cur = '', depth = 0, i = 0;

    while (i < str.length) {
      const c = str[i];
      if (c==='('||c==='{') depth++;
      else if (c===')'||c==='}') depth--;

      if (depth===0 && (c==='+'||c==='-') && i>0) {
        tokens.push({sign: '', term: cur});
        cur = c; // include sign in next term
      } else {
        cur += c;
      }
      i++;
    }
    if (cur) tokens.push({sign:'', term: cur});

    return tokens.map((tok, ti) => {
      const t = tok.term.trim();
      if (!t) return null;
      // extract leading sign
      let sign = '', body = t;
      if (t.startsWith('+')) { sign='+'; body=t.slice(1).trim(); }
      else if (t.startsWith('-')) { sign='-'; body=t.slice(1).trim(); }

      return (
        <span key={k()} style={{display:'inline-flex',alignItems:'center',gap:2}}>
          {ti > 0 && sign &&
            <span style={{margin:'0 4px', color:'var(--muted)', fontWeight:500}}>{sign}</span>
          }
          {ti === 0 && sign==='-' &&
            <span style={{marginRight:1, color:'var(--muted)'}}>-</span>
          }
          {renderTerm(body || (sign==='-'?'':t))}
        </span>
      );
    });
  }

  return (
    <span style={{
      fontFamily:"'DM Mono',monospace",
      fontSize: size,
      color: color || 'var(--text)',
      fontWeight: bold ? 600 : 400,
      display:'inline-flex',
      alignItems:'center',
      flexWrap:'wrap',
      rowGap:4,
      columnGap:1,
      lineHeight: 2.2,
    }}>
      {renderExpr(expr)}
    </span>
  );
}



// ── API routing ──
// localhost → /api/claude (Express server holds key, never exposed to browser)
// claude.ai → direct Anthropic call (key injected by claude.ai)
const IS_LOCAL = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const CLAUDE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:3001/api/claude" : "https://api.anthropic.com/v1/messages";
function CLAUDE_HEADERS() {
  const key = typeof __VITE_KEY__ !== "undefined" ? __VITE_KEY__ : "";
  return {
    "Content-Type": "application/json",
    "anthropic-dangerous-direct-browser-access": "true",
    ...(key ? {"x-api-key": key} : {}),
  };
}

// ── Indefinite integral via Claude API ──
// ── Pure symbolic integrator — no AI needed ──────────────────
// ── Symbolic integration using nerdamer (loaded via index.html) ──
function toNerdamer(expr) {
  // nerdamer uses e^x instead of exp(x)
  return expr
    .replace(/exp\(([^)]+)\)/g, 'e^($1)')
    .replace(/\bE\b/g, 'e');
}
function fromNerdamer(expr) {
  return expr
    .replace(/e\^\(([^)]+)\)/g, 'exp($1)')
    .replace(/e\^([a-zA-Z])\b/g, 'exp($1)');
}

// Fallback table for when nerdamer is not available
const INTEGRAL_TABLE = [
  [/^(\d+(?:\.\d+)?)$/, (m) => `${m[1]}*x`],
  [/^x$/, () => `x^2/2`],
  [/^x\^(\d+(?:\.\d+)?)$/, (m) => { const n=parseFloat(m[1]); return `x^(${n+1})/(${n+1})`; }],
  [/^x\^\((-?\d+(?:\.\d+)?)\)$/, (m) => { const n=parseFloat(m[1]); return n===-1?`ln(abs(x))`:`x^(${n+1})/(${n+1})`; }],
  [/^(\d+(?:\.\d+)?)\*x\^(\d+(?:\.\d+)?)$/, (m) => { const n=parseFloat(m[2]); return `${m[1]}*x^(${n+1})/(${n+1})`; }],
  [/^(\d+(?:\.\d+)?)\*x$/, (m) => `${m[1]}*x^2/2`],
  [/^1\/x$/, () => `ln(abs(x))`],
  [/^sqrt\(x\)$/, () => `(2/3)*x^(3/2)`],
  [/^sin\(x\)$/, () => `-cos(x)`], [/^cos\(x\)$/, () => `sin(x)`],
  [/^tan\(x\)$/, () => `-ln(abs(cos(x)))`],
  [/^(\d+)\*sin\(x\)$/, (m) => `-${m[1]}*cos(x)`],
  [/^(\d+)\*cos\(x\)$/, (m) => `${m[1]}*sin(x)`],
  [/^sin\((\d+)\*x\)$/, (m) => `-cos(${m[1]}*x)/${m[1]}`],
  [/^cos\((\d+)\*x\)$/, (m) => `sin(${m[1]}*x)/${m[1]}`],
  [/^sin\(x\)\^2$/, () => `x/2 - sin(2*x)/4`],
  [/^cos\(x\)\^2$/, () => `x/2 + sin(2*x)/4`],
  [/^exp\(x\)$/, () => `exp(x)`], [/^e\^x$/, () => `exp(x)`],
  [/^exp\((\d+)\*x\)$/, (m) => `exp(${m[1]}*x)/${m[1]}`],
  [/^(\d+(?:\.\d+)?)\*exp\(x\)$/, (m) => `${m[1]}*exp(x)`],
  [/^ln\(x\)$/, () => `x*ln(x) - x`],
  [/^x\*exp\(x\)$/, () => `exp(x)*(x - 1)`],
  [/^exp\(x\)\*x$/, () => `exp(x)*(x - 1)`],
  [/^x\*sin\(x\)$/, () => `sin(x) - x*cos(x)`],
  [/^x\*cos\(x\)$/, () => `cos(x) + x*sin(x)`],
  [/^x\*ln\(x\)$/, () => `(x^2/2)*ln(x) - x^2/4`],
  [/^x\^2\*exp\(x\)$/, () => `exp(x)*(x^2 - 2*x + 2)`],
  [/^x\^2\*sin\(x\)$/, () => `2*x*sin(x) - (x^2-2)*cos(x)`],
  [/^x\^2\*cos\(x\)$/, () => `(x^2-2)*sin(x) + 2*x*cos(x)`],
  [/^x\^2\*ln\(x\)$/, () => `(x^3/3)*ln(x) - x^3/9`],
  [/^1\/\(1\+x\^2\)$/, () => `atan(x)`],
  [/^1\/\(x\^2\+1\)$/, () => `atan(x)`],
  [/^1\/sqrt\(1-x\^2\)$/, () => `asin(x)`],
];

function tableFallbackIntegral(expr) {
  const s = expr.trim().replace(/\bexp\(x\)\*x\b/, 'x*exp(x)');
  for (const [pat, fn] of INTEGRAL_TABLE) {
    const m = s.match(pat);
    if (m) return fn(m);
  }
  // term-by-term
  const terms = []; let cur = '', depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c==='(') depth++; else if (c===')') depth--;
    if (depth===0 && (c==='+'||c==='-') && i>0) { if (cur.trim()) terms.push(cur.trim()); cur=c; } else cur+=c;
  }
  if (cur.trim()) terms.push(cur.trim());
  if (terms.length > 1) {
    const parts = terms.map(t => {
      const neg = t.startsWith('-');
      const body = (t.startsWith('+')||t.startsWith('-')) ? t.slice(1).trim() : t;
      try { const r = tableFallbackIntegral(body); return neg ? `-(${r})` : r; } catch { return null; }
    });
    if (parts.every(p => p !== null)) return parts.join(' + ').replace(/\+ -/g,'- ');
  }
  throw new Error("unsupported");
}

async function claudeIntegral(expr) {
  const processed = preprocess(expr);
  // Normalize e^x → exp(x) for table, exp(x) → e^x for nerdamer
  const normalized = processed
    .replace(/\be\^x\b/g, 'exp(x)')
    .replace(/\be\^\(([^)]+)\)/g, 'exp($1)');
  const nd = toNerdamer(normalized);

  // Try nerdamer first
  if (window.nerdamer && window.nerdamer.integrate) {
    try {
      const result = window.nerdamer(`integrate(${nd}, x)`).toString();
      if (result && !result.includes('integrate(')) return fromNerdamer(result);
    } catch(e) {/* fall through */}
  }
  // Fallback to table
  try { return tableFallbackIntegral(normalized); }
  catch { throw new Error("Cannot compute antiderivative. Use ∫ₐᵇ dx for a numerical result."); }
}

function runCalc(op, v1, v2, N) {
  const n = Math.min(Math.max(1, parseInt(N)||2), 6);
  const safe = (expr) => { try { return math.simplify(expr).toString(); } catch { return expr.toString(); } };
  const deriv = (expr, variable='x') => {
    try {
      const result = math.derivative(preprocessForDerivative(expr), variable).toString();
      return deprocessDerivative(result);
    } catch(err) { throw new Error(`Cannot differentiate "${expr}": ${err.message}`); }
  };
  switch(op) {
    case 'deriv1': {
      const d = deriv(v1);
      return [{label:"f(x)",expr:v1},{label:"f ′(x)",expr:d,hi:true}];
    }
    case 'deriv2': {
      const d1 = deriv(v1);
      const d2 = deriv(d1);
      return [{label:"f(x)",expr:v1},{label:"f ′(x)",expr:d1},{label:"f ″(x)",expr:d2,hi:true}];
    }
    case 'derivN': {
      const sup=['','′','″','‴','⁴','⁵','⁶'];
      const steps=[{label:"f(x)",expr:v1}]; let cur=v1;
      for (let i=1;i<=n;i++) { const d=deriv(cur); cur=d; steps.push({label:`f${sup[i]||`(${i})`}(x)`,expr:cur,hi:i===n}); }
      return steps;
    }
    case 'product': {
      const du=deriv(v1), dv=deriv(v2);
      const res=safe(`(${du})*(${v2}) + (${v1})*(${dv})`);
      return [{label:"u(x)",expr:v1},{label:"u ′(x)",expr:du},{label:"v(x)",expr:v2},{label:"v ′(x)",expr:dv},{label:"u′v + uv′",expr:res,hi:true}];
    }
    case 'quotient': {
      const du=deriv(v1), dv=deriv(v2);
      const res=safe(`((${du})*(${v2}) - (${v1})*(${dv})) / ((${v2})^2)`);
      return [{label:"u(x)",expr:v1},{label:"u ′(x)",expr:du},{label:"v(x)",expr:v2},{label:"v ′(x)",expr:dv},{label:"(u′v−uv′)/v²",expr:res,hi:true}];
    }
    case 'chain': {
      const df=deriv(v1.replace(/\bu\b/g,'x')), dg=deriv(v2);
      const dfSub=df.replace(/\bx\b/g,`(${v2})`);
      const res=safe(`(${dfSub}) * (${dg})`);
      return [{label:"f(u)",expr:v1},{label:"f ′(u)",expr:df},{label:"g(x)",expr:v2},{label:"g ′(x)",expr:dg},{label:"f′(g(x))·g′(x)",expr:res,hi:true}];
    }
    case 'partial_x': {
      const d=deriv(v1,'x');
      return [{label:"f(x, y)",expr:v1},{label:"∂f / ∂x",expr:d,hi:true}];
    }
    case 'partial_y': {
      const d=deriv(v1,'y');
      return [{label:"f(x, y)",expr:v1},{label:"∂f / ∂y",expr:d,hi:true}];
    }
    case 'int_def': {
      // v2 is encoded as "a||b" — split by caller
      const [aStr,bStr] = (v2||"0||1").split("||");
      const a = parseFloat(aStr), b = parseFloat(bStr);
      if (!isFinite(a)||!isFinite(b)) throw new Error("Invalid integration bounds");
      const val = simpsonIntegral(v1, a, b);
      const numStr = formatResult(val);
      return [
        {label:"f(x)",   expr:v1},
        {label:`a = ${a}`, expr:String(a), raw:true},
        {label:`b = ${b}`, expr:String(b), raw:true},
        {label:"∫ₐᵇ f(x) dx", expr:numStr, raw:true, hi:true, isNum:true},
      ];
    }
    case 'simplify': {
      const s=math.simplify(v1).toString();
      return [{label:"Input",expr:v1},{label:"Simplified",expr:s,hi:true}];
    }
    default: return [];
  }
}

/* ── Integral display component ── */
function IntegralSign({ expr, a, b, def=false, size=28 }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",fontFamily:"Georgia,serif",gap:3}}>
      <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",fontSize:size*0.55,lineHeight:1,marginRight:1,color:"#fb923c"}}>
        {def && <span style={{fontSize:size*0.42,lineHeight:1,marginBottom:1}}>{b}</span>}
        <span style={{fontSize:size,lineHeight:0.9,fontWeight:300,color:"#fb923c",textShadow:"0 0 14px rgba(251,146,60,0.6)"}}>∫</span>
        {def && <span style={{fontSize:size*0.42,lineHeight:1,marginTop:1}}>{a}</span>}
      </span>
      <MathDisplay expr={expr} size="md"/>
      <span style={{fontStyle:"italic",color:"var(--muted)",marginLeft:3,fontSize:size*0.5}}>dx</span>
    </span>
  );
}

function Calculus({setMode}) {
  const [op,setOp]           = useState("deriv1");
  const [v1,setV1]           = useState("x^3 + 2*x^2 - x");
  const [v2,setV2]           = useState("sin(x)");
  const [nOrder,setNOrder]   = useState("2");
  const [intA,setIntA]       = useState("0");
  const [intB,setIntB]       = useState("1");
  const [steps,setSteps]     = useState(null);
  const [error,setError]     = useState("");
  const [loading,setLoading] = useState(false);
  const [kbd1,setKbd1]       = useState(false);
  const [kbd2,setKbd2]       = useState(false);
  const ref1 = useRef(null), ref2 = useRef(null);
  const curOp   = CALC_OPS.find(o=>o.id===op);
  const col     = curOp?.color||"#f472b6";
  const isAsync = !!curOp?.isAsync;

  const compute = useCallback(async () => {
    setError(""); setSteps(null); setLoading(true);
    try {
      if (op === "int_indef") {
        const antideriv = await claudeIntegral(v1.trim());
        setSteps([
          {label:"f(x)",       expr:v1.trim(), isExpr:true},
          {label:"∫ f(x) dx",  expr:antideriv,  isExpr:true, hi:true, withC:true},
        ]);
      } else if (op === "int_def") {
        setSteps(runCalc("int_def", v1.trim(), `${intA}||${intB}`));
      } else {
        setSteps(runCalc(op, v1.trim(), v2.trim(), nOrder));
      }
    } catch(e) {
      setError(e.message||"Computation error — check syntax");
    } finally {
      setLoading(false);
    }
  }, [op, v1, v2, nOrder, intA, intB]);

  useEffect(()=>{
    const h=e=>{if(e.target.tagName==="INPUT")return;if(e.key==="Enter")compute();};
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[compute]);

  const groups = ["Basic","Rules","Partial","Integration","Algebra"];

  return (
    <div>

      {/* Operation tabs grouped */}
      <div style={{marginBottom:16}}>
        {groups.map(g=>{
          const gOps = CALC_OPS.filter(o=>o.group===g);
          const gc   = gOps[0]?.color||"#f472b6";
          return (
            <div key={g} style={{marginBottom:10}}>
              <div style={{fontSize:9,color:"var(--muted)",fontFamily:"DM Mono",letterSpacing:"0.1em",marginBottom:5}}>{g.toUpperCase()}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {gOps.map(o=>(
                  <button key={o.id} onClick={()=>{setOp(o.id);setSteps(null);setError("");}}
                    style={{padding:"6px 13px",borderRadius:10,fontFamily:"DM Mono",fontSize:12,cursor:"pointer",
                      background:op===o.id?`rgba(${hexToRgb(gc)},0.18)`:"var(--surface2)",
                      border:`1px solid ${op===o.id?gc+"66":"var(--border)"}`,
                      color:op===o.id?gc:"var(--muted)",fontWeight:op===o.id?600:400,transition:"all 0.15s"}}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula card */}
      <div style={{padding:"11px 16px",background:`rgba(${hexToRgb(col)},0.07)`,border:`1px solid ${col}33`,borderRadius:11,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:20,color:col,flexShrink:0}}>{op.startsWith("int")?"∫":"∂"}</span>
        <div>
          <div style={{fontFamily:"DM Mono",fontSize:12,color:col,letterSpacing:"0.04em",marginBottom:2}}>
            {curOp?.desc}
            
          </div>
          <div style={{fontFamily:"DM Mono",fontSize:11,color:"rgba(226,232,240,0.55)"}}>{OP_FORMULA[op]?.tex}</div>
        </div>
      </div>
      {op.startsWith("int") && v1.trim() && (
        <div style={{padding:"14px 18px",background:"rgba(251,146,60,0.06)",border:"1px solid rgba(251,146,60,0.18)",borderRadius:11,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",minHeight:60,overflowX:"auto"}}>
          <IntegralSign expr={v1} a={intA} b={intB} def={op==="int_def"} size={34}/>
        </div>
      )}

      {/* Input 1 */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:5,fontFamily:"DM Mono",letterSpacing:"0.05em"}}>
          {curOp?.inputs===2?(op==="chain"?"f(u) =":"u(x) ="):(op==="partial_x"||op==="partial_y"?"f(x,y) =" : "f(x) =")}
        </div>
        {!op.startsWith("int")&&(
          <div style={{padding:"10px 14px",background:"var(--surface)",border:`1px solid rgba(${hexToRgb(col)},0.2)`,borderRadius:10,marginBottom:7,minHeight:42,display:"flex",alignItems:"center",overflowX:"auto"}}>
            {v1 ? <MathDisplay expr={v1} size="md"/> : <span style={{color:"var(--muted)",fontFamily:"DM Mono",fontSize:13}}>enter expression…</span>}
          </div>
        )}
        <div style={{display:"flex",gap:6}}>
          <input ref={ref1} className="cf-input" value={v1} onChange={e=>setV1(e.target.value)} onKeyDown={e=>e.key==="Enter"&&compute()}
            placeholder={op==="chain"?"e.g. sin(u)  or  u^3":op.startsWith("int")?"e.g. x^2, sin(x), e^x":"e.g. x^3 + 2*x - 1"}
            style={{flex:1,borderColor:`rgba(${hexToRgb(col)},0.3)`}}/>
          <button onClick={()=>setKbd1(k=>!k)} style={{width:38,height:40,borderRadius:9,flexShrink:0,cursor:"pointer",
            background:kbd1?`rgba(${hexToRgb(col)},0.15)`:"var(--surface2)",
            border:`1px solid ${kbd1?col+"55":"var(--border)"}`,color:kbd1?col:"var(--muted)",
            fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>⌨</button>
        </div>
        {kbd1&&<div style={{marginTop:8}}><MathKeyboard inputRef={ref1} value={v1} onChange={setV1}/></div>}
      </div>

      {/* Bounds for definite integral */}
      {op==="int_def"&&(
        <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#fb923c",marginBottom:4,fontFamily:"DM Mono"}}>Lower bound  a</div>
            <input className="cf-input" value={intA} onChange={e=>setIntA(e.target.value)}
              placeholder="e.g. 0" style={{borderColor:"rgba(251,146,60,0.4)"}}/>
          </div>
          <span style={{color:"var(--muted)",fontSize:22,marginTop:18}}>→</span>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#fb923c",marginBottom:4,fontFamily:"DM Mono"}}>Upper bound  b</div>
            <input className="cf-input" value={intB} onChange={e=>setIntB(e.target.value)}
              placeholder="e.g. 1" style={{borderColor:"rgba(251,146,60,0.4)"}}/>
          </div>
        </div>
      )}

      {/* Input 2 (product/quotient/chain rules) */}
      {curOp?.inputs===2&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:5,fontFamily:"DM Mono",letterSpacing:"0.05em"}}>
            {op==="chain"?"g(x) =":"v(x) ="}
          </div>
          <div style={{padding:"10px 14px",background:"var(--surface)",border:`1px solid rgba(${hexToRgb(col)},0.2)`,borderRadius:10,marginBottom:7,minHeight:42,display:"flex",alignItems:"center",overflowX:"auto"}}>
            {v2 ? <MathDisplay expr={v2} size="md"/> : <span style={{color:"var(--muted)",fontFamily:"DM Mono",fontSize:13}}>enter expression…</span>}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input ref={ref2} className="cf-input" value={v2} onChange={e=>setV2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&compute()}
              placeholder={op==="chain"?"g(x) e.g. x^2":"v(x) e.g. cos(x)"}
              style={{flex:1,borderColor:`rgba(${hexToRgb(col)},0.3)`}}/>
            <button onClick={()=>setKbd2(k=>!k)} style={{width:38,height:40,borderRadius:9,flexShrink:0,cursor:"pointer",
              background:kbd2?`rgba(${hexToRgb(col)},0.15)`:"var(--surface2)",
              border:`1px solid ${kbd2?col+"55":"var(--border)"}`,color:kbd2?col:"var(--muted)",
              fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>⌨</button>
          </div>
          {kbd2&&<div style={{marginTop:8}}><MathKeyboard inputRef={ref2} value={v2} onChange={setV2}/></div>}
        </div>
      )}

      {/* nth order selector */}
      {curOp?.hasN&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:12,color:"var(--muted)",fontFamily:"DM Mono"}}>Order n =</span>
          <div style={{display:"flex",gap:5}}>
            {[2,3,4,5,6].map(n=>(
              <button key={n} onClick={()=>setNOrder(String(n))} style={{width:34,height:34,borderRadius:8,fontFamily:"DM Mono",fontSize:13,cursor:"pointer",
                background:nOrder===String(n)?`rgba(${hexToRgb(col)},0.2)`:"var(--surface2)",
                border:`1px solid ${nOrder===String(n)?col+"55":"var(--border)"}`,
                color:nOrder===String(n)?col:"var(--muted)"}}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compute button */}
      <button onClick={compute} disabled={loading}
        style={{width:"100%",padding:"13px",borderRadius:12,
          background:loading?"rgba(30,38,56,0.8)":`linear-gradient(135deg,rgba(${hexToRgb(col)},0.22),rgba(129,140,248,0.12))`,
          border:`1px solid ${col}44`,color:loading?"var(--muted)":col,fontFamily:"DM Mono",fontSize:15,cursor:loading?"wait":"pointer",fontWeight:600,marginBottom:14,
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.2s"}}>
        {loading
          ? <><span style={{display:"inline-block",width:16,height:16,border:"2px solid transparent",borderTopColor:col,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>Computing…</>
          : `Compute ↵`}
      </button>

      {/* Spin animation */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Error */}
      {error&&<div style={{marginBottom:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}

      {/* Results */}
      {steps&&(
        <div style={{marginBottom:18}}>
          {steps.map((step,i)=>{
            const isInt = op.startsWith("int");
            return (
            <div key={i} style={{padding:"14px 16px",
              background:step.hi?`rgba(${hexToRgb(col)},0.09)`:"var(--surface)",
              border:`1px solid ${step.hi?col+"55":"var(--border)"}`,
              borderRadius:10,marginBottom:6,display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
              <span style={{fontFamily:"DM Mono",fontSize:11,minWidth:100,flexShrink:0,paddingTop:3,
                color:step.hi?col:"var(--muted)",fontWeight:step.hi?600:400,letterSpacing:"0.04em"}}>
                {step.label}
              </span>
              <div style={{flex:1,display:"flex",alignItems:"center",flexWrap:"wrap",padding:"0",gap:6,minWidth:0}}>
                {step.isNum
                  ? <span style={{fontFamily:"Georgia,serif",fontSize:28,color:col,
                      textShadow:`0 0 16px ${col}66`,letterSpacing:"-0.01em"}}>{step.expr}</span>
                  : (isInt || step.isExpr || step.raw)
                    ? <ExprText expr={step.expr} size={step.hi?17:14}
                        color={step.hi?"var(--text)":"var(--muted)"} bold={step.hi}/>
                    : <MathDisplay expr={step.expr} size={step.hi?"lg":"md"}/>
                }
                {step.hi&&step.withC&&(
                  <span style={{fontFamily:"DM Mono",fontSize:15,color:col,opacity:0.8}}>+ C</span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Examples */}
      <div>
        <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,fontFamily:"DM Mono",letterSpacing:"0.08em"}}>EXAMPLES</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {(OP_EXAMPLES[op]||[]).map((ex,i)=>(
            <button key={i} onClick={()=>{setV1(ex[0]);if(ex[1])setV2(ex[1]);setSteps(null);setError("");}}
              style={{padding:"4px 11px",borderRadius:8,background:"var(--surface2)",border:"1px solid var(--border)",
                color:"var(--muted)",fontFamily:"DM Mono",fontSize:11,cursor:"pointer"}}>
              {ex.length===2?`u=${ex[0]}, v=${ex[1]}`:ex[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


