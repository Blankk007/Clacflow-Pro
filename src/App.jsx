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
  :root {
    --bg: #080b14; --surface: #0e1220; --surface2: #141928;
    --border: rgba(99,179,237,0.12); --accent: #38bdf8; --accent2: #818cf8;
    --accent3: #34d399; --red: #f87171; --text: #e2e8f0; --muted: #64748b;
  }
  .cf-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; position:relative; overflow-x:hidden; }
  .cf-root::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:0; background: radial-gradient(ellipse 60% 40% at 20% -10%, rgba(56,189,248,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 85% 110%, rgba(129,140,248,0.06) 0%, transparent 70%); }
  .cf-root > * { position:relative; z-index:1; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:16px; transition:all 0.25s ease; }
  .card:hover { border-color:rgba(56,189,248,0.3); box-shadow:0 0 32px rgba(56,189,248,0.07); transform:translateY(-2px); }
  .btn-calc { background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Mono',monospace; font-weight:500; cursor:pointer; transition:all 0.12s ease; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .btn-calc:hover { background:#1e2638; border-color:rgba(56,189,248,0.35); color:var(--accent); box-shadow:0 0 12px rgba(56,189,248,0.12); transform:translateY(-1px); }
  .btn-calc:active, .btn-calc.pressed { transform:scale(0.93); background:rgba(56,189,248,0.12); border-color:var(--accent); }
  .btn-calc.btn-op   { color:var(--accent); border-color:rgba(56,189,248,0.2); }
  .btn-calc.btn-eq   { background:linear-gradient(135deg,#0ea5e9,#6366f1); border:none; color:#fff; font-size:22px; }
  .btn-calc.btn-eq:hover { filter:brightness(1.15); transform:translateY(-1px); box-shadow:0 4px 20px rgba(56,189,248,0.35); }
  .btn-calc.btn-clear { color:var(--red); border-color:rgba(248,113,113,0.2); }
  .btn-calc.btn-fn   { color:var(--accent2); }
  .calc-display { background:linear-gradient(160deg,#0a0e1a,#0d1525); border:1px solid var(--border); border-radius:14px; padding:18px 20px; min-height:96px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-end; gap:6px; margin-bottom:18px; position:relative; overflow:hidden; }
  .calc-display::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent); }
  .display-input  { font-family:'DM Mono',monospace; font-size:15px; color:var(--muted); word-break:break-all; text-align:right; max-width:100%; }
  .display-result { font-family:'DM Mono',monospace; font-size:30px; font-weight:500; color:var(--text); word-break:break-all; text-align:right; }
  .display-result.has-val { color:var(--accent); text-shadow:0 0 20px rgba(56,189,248,0.4); }
  .display-result.error   { color:var(--red); font-size:16px; }
  .back-btn { display:inline-flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--border); border-radius:10px; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; padding:8px 16px; margin-bottom:28px; transition:all 0.2s; }
  .back-btn:hover { color:var(--accent); border-color:rgba(56,189,248,0.3); }
  .cf-input { background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Mono',monospace; font-size:15px; padding:10px 14px; width:100%; outline:none; transition:border-color 0.2s; }
  .cf-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(56,189,248,0.08); }
  .pill { display:inline-block; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:500; letter-spacing:0.05em; background:rgba(56,189,248,0.1); color:var(--accent); border:1px solid rgba(56,189,248,0.2); }
  .mat-cell { background:var(--surface2); border:1px solid var(--border); border-radius:6px; color:var(--text); font-family:'DM Mono',monospace; text-align:center; outline:none; transition:border-color 0.15s; width:100%; display:block; }
  .mat-cell:focus { border-color:var(--accent3); box-shadow:0 0 0 2px rgba(52,211,153,0.12); }
  .math-kbd { background:#0c1120; border:1px solid rgba(129,140,248,0.25); border-radius:12px; padding:10px; display:grid; gap:5px; }
  .math-kbd-btn { background:var(--surface2); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'DM Mono',monospace; font-size:13px; cursor:pointer; transition:all 0.1s; padding:7px 4px; display:flex; align-items:center; justify-content:center; min-height:34px; }
  .math-kbd-btn:hover { background:rgba(129,140,248,0.15); border-color:rgba(129,140,248,0.4); color:#818cf8; }
  .math-kbd-btn:active { transform:scale(0.92); }
  .math-kbd-btn.kbd-red { color:var(--red); border-color:rgba(248,113,113,0.2); }
  .math-kbd-btn.kbd-red:hover { background:rgba(248,113,113,0.1); border-color:var(--red); }
  .math-kbd-btn.kbd-accent { color:var(--accent); border-color:rgba(56,189,248,0.2); }
  .math-kbd-btn.kbd-accent:hover { background:rgba(56,189,248,0.1); }
  .math-preview { font-family:'DM Mono',monospace; font-size:17px; color:var(--text); min-height:26px; word-break:break-all; line-height:1.6; }
  .math-preview sup { font-size:0.62em; line-height:0; position:relative; top:-0.5em; color:var(--accent2); }
  /* Beautiful math rendering */
  .math-display { display:inline-flex; align-items:center; flex-wrap:wrap; font-family:Georgia,'Times New Roman',serif; user-select:text; }
  .math-var { font-style:italic; color:var(--text); }
  .math-num { color:var(--accent); }
  .math-const { color:var(--accent3); font-style:normal; }
  .math-fn { font-style:normal; color:var(--text); letter-spacing:0.02em; }
  .math-op { color:var(--muted); }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#2a3045; border-radius:4px; }
`;
document.head.appendChild(globalStyle);

/* ── MATH HELPERS ─────────────────────────────────────── */
const BASE_SCOPE = { e: Math.E, pi: Math.PI, π: Math.PI, E: Math.E };

function preprocess(expr) {
  return expr
    .replace(/×/g,"*").replace(/÷/g,"/")
    .replace(/π/g,"pi").replace(/√\(/g,"sqrt(")
    .replace(/\|([^|]+)\|/g,"abs($1)")
    .replace(/(\d)([a-zA-Z(])/g,"$1*$2")
    .replace(/([a-zA-Z)])(\d)/g,"$1*$2")
    .replace(/\)\s*\(/g,")*(");
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
      return <span key={key} style={{display:'inline-flex',flexDirection:'column',alignItems:'center',verticalAlign:'middle',margin:'0 5px',lineHeight:1.3}}>
        <span style={{borderBottom:'1.5px solid rgba(226,232,240,0.28)',paddingBottom:'2px',paddingLeft:'5px',paddingRight:'5px',textAlign:'center'}}>{_mjsx(args[0])}</span>
        <span style={{paddingTop:'2px',paddingLeft:'5px',paddingRight:'5px',textAlign:'center'}}>{_mjsx(args[1])}</span>
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
    <div className="math-kbd" style={{gridTemplateColumns:"repeat(8,1fr)"}}>
      {KBD_ROWS.flat().map((btn,i)=>(
        <button key={i} className={`math-kbd-btn ${btn.cls||""}`} onMouseDown={e=>{e.preventDefault();handleKey(btn.ins);}}>{btn.label}</button>
      ))}
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
    const W=canvas.width, H=canvas.height, v=vpRef.current;
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
    ctx.font="10px DM Mono,monospace"; ctx.fillStyle="rgba(100,116,139,0.9)";
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
  },[expressions]);

  useEffect(()=>{draw();},[vp,draw]);

  const handleWheel=useCallback((e)=>{
    e.preventDefault();
    const canvas=canvasRef.current; if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const W=canvas.width, H=canvas.height, v=vpRef.current;
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
    const v=vpRef.current,W=canvas.width,H=canvas.height;
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
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="∿" title="Graphing Calculator" color="#818cf8"/>
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
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="⬡" title="3D Surface Graph" color="#818cf8"/>

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
   APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [mode, setMode] = useState("home");
  return (
    <div className="cf-root" style={{ padding:"28px 20px", maxWidth:560, margin:"0 auto" }}>
      {mode==="home"     && <Home setMode={setMode}/>}
      {mode==="basic"    && <BasicCalc setMode={setMode}/>}
      {mode==="graph"    && <Graphing setMode={setMode}/>}
      {mode==="graph3d"  && <Graphing3D setMode={setMode}/>}
      {mode==="matrix"   && <Matrix setMode={setMode}/>}
      {mode==="calculus" && <Calculus setMode={setMode}/>}
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────── */
function Home({ setMode }) {
  const cards = [
    { name:"Basic Calc",    sub:"Arithmetic & functions",  icon:"⊞", mode:"basic",   accent:"#38bdf8" },
    { name:"2D Graphing",   sub:"Real-time function plotter", icon:"∿", mode:"graph",   accent:"#818cf8" },
    { name:"Matrix",        sub:"Up to 10×10 algebra",    icon:"⊡", mode:"matrix",  accent:"#34d399" },
    { name:"Calculus",      sub:"Derivatives & more",     icon:"∂", mode:"calculus",accent:"#f472b6" },
  ];
  return (
    <div>
      <div style={{ marginBottom:36 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, letterSpacing:"-0.02em", background:"linear-gradient(135deg,#38bdf8 0%,#818cf8 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CalcFlow</span>
          <span className="pill">PRO</span>
        </div>
        <p style={{ color:"var(--muted)", fontSize:14 }}>Your complete mathematics toolkit</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {cards.map(c=>(
          <button key={c.mode} onClick={()=>setMode(c.mode)} className="card"
            style={{ cursor:"pointer", padding:"22px 20px", textAlign:"left", border:"1px solid var(--border)", background:"var(--surface)" }}>
            <div style={{ fontSize:28, marginBottom:12, color:c.accent, textShadow:`0 0 20px ${c.accent}44` }}>{c.icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:4 }}>{c.name}</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{c.sub}</div>
          </button>
        ))}
      </div>

      {/* 3D Graph — featured full-width card */}
      <button onClick={()=>setMode("graph3d")} className="card"
        style={{ width:"100%", cursor:"pointer", padding:"20px 22px", textAlign:"left", border:"1px solid rgba(129,140,248,0.25)", background:"linear-gradient(135deg, rgba(129,140,248,0.08), rgba(56,189,248,0.04))" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:32, textShadow:"0 0 24px #818cf877" }}>⬡</span>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#818cf8", marginBottom:3 }}>3D Surface Graph</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Plot z = f(x,y) · orbit controls · height-gradient shading</div>
          </div>
          <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(129,140,248,0.6)", fontFamily:"DM Mono", background:"rgba(129,140,248,0.1)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(129,140,248,0.2)" }}>NEW</span>
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

  const evaluate = useCallback((expr) => {
    if (!expr) return;
    try {
      const val = math.evaluate(preprocess(expr), { ...BASE_SCOPE });
      // Handle complex numbers
      if (val && typeof val === "object" && val.re !== undefined) {
        const re = val.re, im = val.im;
        const reNZ = Math.abs(re) > 1e-12, imNZ = Math.abs(im) > 1e-12;
        if (!reNZ && !imNZ) { setResult("0"); }
        else if (!imNZ) { setResult(formatResult(re)); }
        else if (!reNZ) { setResult(formatResult(im) + "i"); }
        else { setResult(formatResult(re) + (im > 0 ? " + " : " − ") + formatResult(Math.abs(im)) + "i"); }
        setError(false); return;
      }
      // Handle matrix / array
      if (val && typeof val === "object" && val.toArray) {
        setResult("[matrix]"); setError(false); return;
      }
      const num = typeof val === "number" ? val : (val?.valueOf ? val.valueOf() : NaN);
      if (typeof num === "number" && isFinite(num)) {
        setResult(formatResult(num));
      } else if (num === Infinity || num === -Infinity) {
        setResult(num > 0 ? "∞" : "-∞");
      } else {
        setResult(String(val));
      }
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

  // Main grid: ( and ) replace +/- and %
  const layout = [
    ["C","(",")","÷"],
    ["7","8","9","×"],
    ["4","5","6","-"],
    ["1","2","3","+"],
    ["0",".","⌫","="],
  ];

  const cls = (b) => {
    let c = "btn-calc";
    if (["÷","×","-","+"].includes(b)) c += " btn-op";
    if (b === "=") c += " btn-eq";
    if (b === "C") c += " btn-clear";
    if (["(",")"].includes(b)) c += " btn-fn";
    if (b === pressed) c += " pressed";
    return c;
  };

  // Function row: 5 cols × 2 rows
  const fnRow = ["sin(","cos(","tan(","√(","^",  "log(","ln(","asin(","π","e"];

  return (
    <div>
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="⊞" title="Basic Calculator" color="#38bdf8"/>
      <div className="calc-display" style={{minHeight:110,alignItems:"flex-end"}}>
        {/* Live input rendered as math */}
        <div style={{width:"100%",display:"flex",justifyContent:"flex-end",minHeight:34,alignItems:"center",overflowX:"auto"}}>
          {input
            ? <MathDisplay expr={input} size="md" style={{color:"rgba(148,163,184,0.85)"}}/>
            : <span style={{color:"var(--muted)",fontFamily:"DM Mono",fontSize:15}}>0</span>}
        </div>
        {/* Result rendered as larger math */}
        <div style={{width:"100%",display:"flex",justifyContent:"flex-end",minHeight:42,alignItems:"center",overflowX:"auto"}}>
          {error
            ? <span style={{color:"var(--red)",fontFamily:"DM Mono",fontSize:16}}>Syntax Error</span>
            : result
              ? <MathDisplay expr={result} size="xl" style={{color:"#38bdf8",filter:"drop-shadow(0 0 12px rgba(56,189,248,0.4))"}}/>
              : <span style={{color:"rgba(100,116,139,0.4)",fontFamily:"DM Mono",fontSize:28}}>—</span>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
        {layout.flat().map((b,i)=>(
          <button key={i} className={cls(b)} onClick={()=>handleBtn(b)} style={{height:64,fontSize:b.length>1?14:20}}>{b}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {fnRow.map((b,i)=>(
          <button key={i} className={`btn-calc btn-fn ${pressed===b?"pressed":""}`}
            onClick={()=>handleBtn(b==="π"?"pi":b==="^"?"^":""+b)}
            style={{height:44,fontSize:12}}>{b}</button>
        ))}
      </div>
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
  const renderGrid=(mat,setter,label,color,r,c,onRR,onRC)=>{const cell=Math.max(26,Math.min(42,Math.floor(440/Math.max(c,2))));const fs=Math.max(10,Math.min(14,Math.floor(cell*0.38)));return(<div style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}><span style={{fontSize:13,color,fontFamily:"DM Mono",fontWeight:500}}>{label} ({r}×{c})</span><span style={{fontSize:11,color:"var(--muted)"}}>rows</span><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={r} onSel={onRR}/>)}</div><span style={{fontSize:11,color:"var(--muted)"}}>cols</span><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,2,3,4,5,6,7,8,9,10].map(n=><SizeBtn key={n} n={n} cur={c} onSel={onRC}/>)}</div></div><div style={{overflowX:"auto"}}><div style={{display:"inline-grid",gap:3,gridTemplateColumns:`repeat(${c},${cell}px)`}}>{mat.map((row,ri)=>row.map((cell2,ci)=>(<input key={`${ri}-${ci}`} className="mat-cell" value={cell2} onChange={e=>setCell(setter,ri,ci,e.target.value)} style={{height:cell,fontSize:fs,borderColor:color+"33",padding:"1px"}}/>)))}</div></div></div>);};
  const renderResult=()=>{if(result===null||result===undefined)return null;if(resultMeta==="scalar")return<div style={{fontFamily:"DM Mono",fontSize:28,color:"#34d399"}}>{formatResult(typeof result==="number"?result:result)}</div>;if(resultMeta==="list"){const arr=Array.isArray(result)?result:[result];return<div style={{display:"flex",flexDirection:"column",gap:6}}>{arr.map((v,i)=>{const isC=v?.re!==undefined;const re=fmtCell(isC?v.re:v);const im=isC?v.im:0;return<div key={i} style={{fontFamily:"DM Mono",fontSize:15,color:"var(--text)"}}>λ{i+1} = {re}{isC&&Math.abs(im)>1e-10?` + ${formatResult(parseFloat(im.toPrecision(5)))}i`:""}</div>;})}</div>;}const arr=Array.isArray(result)?result:[];return(<div style={{overflowX:"auto"}}><div style={{display:"inline-grid",gap:4,gridTemplateColumns:`repeat(${arr[0]?.length||1},minmax(52px,auto))`}}>{arr.map((row,ri)=>(Array.isArray(row)?row:[row]).map((cell,ci)=>(<div key={`${ri}-${ci}`} style={{fontFamily:"DM Mono",fontSize:13,color:"var(--text)",padding:"5px 10px",background:"rgba(52,211,153,0.07)",borderRadius:6,textAlign:"right"}}>{fmtCell(cell)}</div>)))}</div></div>);};
  return(<div><BackBtn setMode={setMode}/><SectionTitle icon="⊡" title="Matrix Operations" color="#34d399"/><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>{MATRIX_OPS.map(o=>(<button key={o.id} onClick={()=>setOp(o.id)} style={{padding:"6px 12px",borderRadius:10,fontFamily:"DM Mono",fontSize:12,cursor:"pointer",background:op===o.id?"rgba(52,211,153,0.15)":"var(--surface2)",border:`1px solid ${op===o.id?"rgba(52,211,153,0.4)":"var(--border)"}`,color:op===o.id?"#34d399":"var(--muted)"}}>{o.label}</button>))}</div>{renderGrid(matA,setMatA,"Matrix A","#34d399",rows,cols,r=>resizeA(r,cols),c=>resizeA(rows,c))}{!isSingle&&renderGrid(matB,setMatB,"Matrix B","#38bdf8",rowsB,colsB,r=>resizeB(r,colsB),c=>resizeB(rowsB,c))}{op==="power"&&(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{color:"var(--muted)",fontSize:13}}>n =</span><input className="cf-input" type="number" value={power} onChange={e=>setPower(e.target.value)} style={{width:80}}/></div>)}<button onClick={compute} style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,rgba(52,211,153,0.2),rgba(56,189,248,0.2))",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399",fontFamily:"DM Mono",fontSize:15,cursor:"pointer",fontWeight:500}}>Compute</button>{error&&<div style={{marginTop:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}{result!==null&&result!==undefined&&(<div style={{marginTop:14,padding:"16px",background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:12}}><div style={{fontSize:11,color:"#34d399",marginBottom:10,fontFamily:"DM Mono"}}>RESULT</div>{renderResult()}</div>)}</div>);
}

/* ── CALCULUS ──────────────────────────────────────────── */
const CALC_OPS = [
  {id:"deriv1",   label:"d/dx",    group:"Basic",   color:"#f472b6", desc:"First Derivative",           inputs:1},
  {id:"deriv2",   label:"d²/dx²",  group:"Basic",   color:"#f472b6", desc:"Second Derivative",          inputs:1},
  {id:"derivN",   label:"dⁿ/dxⁿ", group:"Basic",   color:"#f472b6", desc:"nth Order Derivative",       inputs:1, hasN:true},
  {id:"product",  label:"UV Rule", group:"Rules",   color:"#818cf8", desc:"Product Rule",               inputs:2},
  {id:"quotient", label:"U/V Rule",group:"Rules",   color:"#818cf8", desc:"Quotient Rule",              inputs:2},
  {id:"chain",    label:"Chain ∘", group:"Rules",   color:"#818cf8", desc:"Chain Rule",                 inputs:2},
  {id:"partial_x",label:"∂/∂x",   group:"Partial", color:"#38bdf8", desc:"Partial w.r.t. x",          inputs:1},
  {id:"partial_y",label:"∂/∂y",   group:"Partial", color:"#38bdf8", desc:"Partial w.r.t. y",          inputs:1},
  {id:"simplify", label:"Simplify",group:"Algebra", color:"#34d399", desc:"Algebraic Simplification",   inputs:1},
];

const OP_FORMULA = {
  deriv1:    {tex:"d/dx [ f(x) ]",  rule:"Basic differentiation"},
  deriv2:    {tex:"d²/dx² [ f(x) ]",rule:"Apply d/dx twice"},
  derivN:    {tex:"dⁿ/dxⁿ [ f(x) ]",rule:"Repeated differentiation"},
  product:   {tex:"d/dx [u·v] = u′·v + u·v′",      rule:"Product Rule"},
  quotient:  {tex:"d/dx [u/v] = (u′v − uv′) / v²", rule:"Quotient Rule"},
  chain:     {tex:"d/dx [f(g)] = f′(g(x)) · g′(x)", rule:"Chain Rule"},
  partial_x: {tex:"∂f/∂x  (y treated as constant)",  rule:"Partial Derivative"},
  partial_y: {tex:"∂f/∂y  (x treated as constant)",  rule:"Partial Derivative"},
  simplify:  {tex:"Simplify algebraic expression",    rule:"Algebra"},
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
  simplify:  [["2*x + 3*x"],["sin(x)^2 + cos(x)^2"],["(x+1)^2 - x^2"],["x*(x+2)"]],
};

function runCalc(op, v1, v2, N) {
  const n = Math.min(Math.max(1, parseInt(N)||2), 6);
  const safe = (expr) => { try { return math.simplify(expr).toString(); } catch { return expr.toString(); } };
  switch(op) {
    case 'deriv1': {
      const d = math.derivative(v1,'x');
      return [{label:"f(x)",expr:v1},{label:"f ′(x)",expr:d.toString(),hi:true}];
    }
    case 'deriv2': {
      const d1 = math.derivative(v1,'x');
      const d2 = math.derivative(d1.toString(),'x');
      return [{label:"f(x)",expr:v1},{label:"f ′(x)",expr:d1.toString()},{label:"f ″(x)",expr:d2.toString(),hi:true}];
    }
    case 'derivN': {
      const sup=['','′','″','‴','⁴','⁵','⁶'];
      const steps=[{label:"f(x)",expr:v1}]; let cur=v1;
      for (let i=1;i<=n;i++) { const d=math.derivative(cur,'x'); cur=d.toString(); steps.push({label:`f${sup[i]||`(${i})`}(x)`,expr:cur,hi:i===n}); }
      return steps;
    }
    case 'product': {
      const du=math.derivative(v1,'x').toString(), dv=math.derivative(v2,'x').toString();
      const res=safe(`(${du})*(${v2}) + (${v1})*(${dv})`);
      return [{label:"u(x)",expr:v1},{label:"u ′(x)",expr:du},{label:"v(x)",expr:v2},{label:"v ′(x)",expr:dv},{label:"u′v + uv′",expr:res,hi:true}];
    }
    case 'quotient': {
      const du=math.derivative(v1,'x').toString(), dv=math.derivative(v2,'x').toString();
      const res=safe(`((${du})*(${v2}) - (${v1})*(${dv})) / ((${v2})^2)`);
      return [{label:"u(x)",expr:v1},{label:"u ′(x)",expr:du},{label:"v(x)",expr:v2},{label:"v ′(x)",expr:dv},{label:"(u′v−uv′)/v²",expr:res,hi:true}];
    }
    case 'chain': {
      const df=math.derivative(v1,'u').toString(), dg=math.derivative(v2,'x').toString();
      const dfSub=df.replace(/\bu\b/g,`(${v2})`);
      const res=safe(`(${dfSub}) * (${dg})`);
      return [{label:"f(u)",expr:v1},{label:"f ′(u)",expr:df},{label:"g(x)",expr:v2},{label:"g ′(x)",expr:dg},{label:"f′(g(x))·g′(x)",expr:res,hi:true}];
    }
    case 'partial_x': {
      const d=math.derivative(v1,'x').toString();
      return [{label:"f(x, y)",expr:v1},{label:"∂f / ∂x",expr:d,hi:true}];
    }
    case 'partial_y': {
      const d=math.derivative(v1,'y').toString();
      return [{label:"f(x, y)",expr:v1},{label:"∂f / ∂y",expr:d,hi:true}];
    }
    case 'simplify': {
      const s=math.simplify(v1).toString();
      return [{label:"Input",expr:v1},{label:"Simplified",expr:s,hi:true}];
    }
    default: return [];
  }
}

function Calculus({setMode}) {
  const [op,setOp]=useState("deriv1");
  const [v1,setV1]=useState("x^3 + 2*x^2 - x");
  const [v2,setV2]=useState("sin(x)");
  const [nOrder,setNOrder]=useState("2");
  const [steps,setSteps]=useState(null);
  const [error,setError]=useState("");
  const [kbd1,setKbd1]=useState(false);
  const [kbd2,setKbd2]=useState(false);
  const ref1=useRef(null), ref2=useRef(null);
  const curOp=CALC_OPS.find(o=>o.id===op);
  const col=curOp?.color||"#f472b6";

  const compute=useCallback(()=>{
    setError(""); setSteps(null);
    try { setSteps(runCalc(op,v1.trim(),v2.trim(),nOrder)); }
    catch(e) { setError(e.message||"Computation error — check syntax"); }
  },[op,v1,v2,nOrder]);

  useEffect(()=>{
    const h=e=>{if(e.target.tagName==="INPUT")return;if(e.key==="Enter")compute();};
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[compute]);

  const groups=["Basic","Rules","Partial","Algebra"];

  return (
    <div>
      <BackBtn setMode={setMode}/>
      <SectionTitle icon="∂" title="Calculus" color="#f472b6"/>

      {/* Operation tabs grouped */}
      <div style={{marginBottom:16}}>
        {groups.map(g=>{
          const gOps=CALC_OPS.filter(o=>o.group===g);
          const gc=gOps[0]?.color||"#f472b6";
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
        <span style={{fontSize:20,color:col,flexShrink:0}}>∂</span>
        <div>
          <div style={{fontFamily:"DM Mono",fontSize:12,color:col,letterSpacing:"0.04em",marginBottom:2}}>{curOp?.desc}</div>
          <div style={{fontFamily:"DM Mono",fontSize:11,color:"rgba(226,232,240,0.55)"}}>{OP_FORMULA[op]?.tex}</div>
        </div>
      </div>

      {/* Input 1 */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:5,fontFamily:"DM Mono",letterSpacing:"0.05em"}}>
          {curOp?.inputs===2?(op==="chain"?"f(u) =":"u(x) ="):(op==="partial_x"||op==="partial_y"?"f(x,y) =":"f(x) =")}
        </div>
        <div style={{padding:"10px 14px",background:"var(--surface)",border:`1px solid rgba(${hexToRgb(col)},0.2)`,borderRadius:10,marginBottom:7,minHeight:42,display:"flex",alignItems:"center",overflowX:"auto"}}>
          {v1 ? <MathDisplay expr={v1} size="md"/> : <span style={{color:"var(--muted)",fontFamily:"DM Mono",fontSize:13}}>enter expression…</span>}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input ref={ref1} className="cf-input" value={v1} onChange={e=>setV1(e.target.value)} onKeyDown={e=>e.key==="Enter"&&compute()}
            placeholder={op==="chain"?"e.g. sin(u)  or  u^3":"e.g. x^3 + 2*x - 1"}
            style={{flex:1,borderColor:`rgba(${hexToRgb(col)},0.3)`}}/>
          <button onClick={()=>setKbd1(k=>!k)} style={{width:38,height:40,borderRadius:9,flexShrink:0,cursor:"pointer",
            background:kbd1?`rgba(${hexToRgb(col)},0.15)`:"var(--surface2)",
            border:`1px solid ${kbd1?col+"55":"var(--border)"}`,color:kbd1?col:"var(--muted)",
            fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>⌨</button>
        </div>
        {kbd1&&<div style={{marginTop:8}}><MathKeyboard inputRef={ref1} value={v1} onChange={setV1}/></div>}
      </div>

      {/* Input 2 */}
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

      {/* n selector */}
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

      {/* Compute */}
      <button onClick={compute} style={{width:"100%",padding:"13px",borderRadius:12,
        background:`linear-gradient(135deg,rgba(${hexToRgb(col)},0.22),rgba(129,140,248,0.12))`,
        border:`1px solid ${col}44`,color:col,fontFamily:"DM Mono",fontSize:15,cursor:"pointer",fontWeight:600,marginBottom:14}}>
        Compute ↵
      </button>

      {/* Error */}
      {error&&<div style={{marginBottom:14,color:"var(--red)",fontSize:13,padding:"10px 14px",background:"rgba(248,113,113,0.08)",borderRadius:10,border:"1px solid rgba(248,113,113,0.2)"}}>{error}</div>}

      {/* Step results */}
      {steps&&(
        <div style={{marginBottom:18}}>
          {steps.map((step,i)=>(
            <div key={i} style={{padding:"12px 16px",
              background:step.hi?`rgba(${hexToRgb(col)},0.08)`:"var(--surface)",
              border:`1px solid ${step.hi?col+"44":"var(--border)"}`,
              borderRadius:10,marginBottom:6,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <span style={{fontFamily:"DM Mono",fontSize:11,minWidth:80,flexShrink:0,
                color:step.hi?col:"var(--muted)",fontWeight:step.hi?600:400,letterSpacing:"0.04em"}}>
                {step.label}
              </span>
              <div style={{flex:1,display:"flex",alignItems:"center",overflowX:"auto",padding:"2px 0"}}>
                <MathDisplay expr={step.expr} size={step.hi?"lg":"md"}
                  style={{color:step.hi?"var(--text)":"rgba(226,232,240,0.72)"}}/>
              </div>
            </div>
          ))}
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

/* ── SHARED ──────────────────────────────────────────────── */
function BackBtn({ setMode }) {
  return (
    <button className="back-btn" onClick={()=>setMode("home")} title="Back to Home" style={{padding:"8px 14px"}}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9"/>
        <path d="M9 21V12h6v9"/>
        <path d="M3 12v9h18V12"/>
      </svg>
      <span style={{fontSize:13}}>Home</span>
    </button>
  );
}
function SectionTitle({ icon, title, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
      <span style={{fontSize:22,color,textShadow:`0 0 16px ${color}66`}}>{icon}</span>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,letterSpacing:"-0.01em"}}>{title}</h2>
    </div>
  );
}
