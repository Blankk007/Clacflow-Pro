import React, { useState, useEffect, useCallback } from "react";
import * as math from "mathjs";
import {
  Calculator,
  TrendingUp,
  Grid3x3,
  Sigma,
  Moon,
  Sun
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

/* ================== MAIN APP ================== */
export default function CalcFlowPro() {
  const [mode, setMode] = useState("home");
  const [darkMode, setDarkMode] = useState(true);

  const bg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {mode === "home" && <Home setMode={setMode} darkMode={darkMode} setDarkMode={setDarkMode} />}
      {mode === "basic" && <BasicCalc back={() => setMode("home")} darkMode={darkMode} />}
      {mode === "graph" && <GraphCalc back={() => setMode("home")} darkMode={darkMode} />}
      {mode === "matrix" && <MatrixCalc back={() => setMode("home")} darkMode={darkMode} />}
      {mode === "calc" && <CalculusCalc back={() => setMode("home")} darkMode={darkMode} />}
    </div>
  );
}

/* ================== HOME ================== */
function Home({ setMode, darkMode, setDarkMode }) {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          CalcFlow Pro
        </h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun /> : <Moon />}
        </button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Calculator" icon={<Calculator />} onClick={() => setMode("basic")} />
        <Card title="Graph" icon={<TrendingUp />} onClick={() => setMode("graph")} />
        <Card title="Matrix" icon={<Grid3x3 />} onClick={() => setMode("matrix")} />
        <Card title="Calculus" icon={<Sigma />} onClick={() => setMode("calc")} />
      </div>
    </div>
  );
}

/* ================== BASIC CALCULATOR ================== */
function BasicCalc({ back, darkMode }) {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState([]);

  const append = (v) => {
    setDisplay((d) => {
      if (d === "Error") return v;
      if (/[+*/.-]$/.test(d) && /[+*/.-]/.test(v)) return d;
      return d === "0" ? v : d + v;
    });
  };

  const evaluate = () => {
    try {
      const res = math.evaluate(display);
      setHistory((h) => [...h.slice(-4), `${display} = ${res}`]);
      setDisplay(res.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const clear = () => setDisplay("0");

  useEffect(() => {
    const handler = (e) => {
      if ("0123456789+-*/.".includes(e.key)) append(e.key);
      if (e.key === "Enter") evaluate();
      if (e.key === "Backspace") setDisplay((d) => d.slice(0, -1) || "0");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [display]);

  return (
    <Screen back={back} darkMode={darkMode}>
      <div className="text-right text-6xl font-black mb-4">{display}</div>
      <div className="grid grid-cols-4 gap-3">
        {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"]
          .map((k) => (
            <button
              key={k}
              onClick={() => k === "=" ? evaluate() : append(k)}
              className="btn"
            >
              {k}
            </button>
          ))}
        <button onClick={clear} className="btn col-span-4 bg-red-500">Clear</button>
      </div>

      {history.length > 0 && (
        <div className="mt-6 text-sm opacity-70">
          <h4 className="font-bold mb-2">History</h4>
          {history.map((h, i) => <div key={i}>{h}</div>)}
        </div>
      )}
    </Screen>
  );
}

/* ================== GRAPH ================== */
function GraphCalc({ back, darkMode }) {
  const [eq, setEq] = useState("x^2");
  const [data, setData] = useState([]);

  const plot = () => {
    const pts = [];
    for (let x = -10; x <= 10; x += 0.1) {
      try {
        const y = math.evaluate(eq, { x });
        if (isFinite(y)) pts.push({ x, y });
      } catch {}
    }
    setData(pts);
  };

  return (
    <Screen back={back} darkMode={darkMode}>
      <input value={eq} onChange={(e) => setEq(e.target.value)} className="input" />
      <button onClick={plot} className="btn mt-4">Plot</button>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Line dataKey="y" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Screen>
  );
}

/* ================== MATRIX ================== */
function MatrixCalc({ back, darkMode }) {
  const make = () => Array.from({ length: 3 }, () => Array(3).fill(0));
  const [A, setA] = useState(make());
  const [result, setResult] = useState("");

  const op = (type) => {
    try {
      if (type === "det") setResult(math.det(A).toString());
      if (type === "inv") setResult(JSON.stringify(math.inv(A)));
    } catch (e) {
      setResult(e.message);
    }
  };

  return (
    <Screen back={back} darkMode={darkMode}>
      <MatrixEditor matrix={A} setMatrix={setA} darkMode={darkMode} />
      <div className="flex gap-3 mb-4">
        <button className="btn" onClick={() => op("det")}>det(A)</button>
        <button className="btn" onClick={() => op("inv")}>A⁻¹</button>
      </div>
      <pre className="text-sm">{result}</pre>
    </Screen>
  );
}

/* ================== CALCULUS ================== */
function CalculusCalc({ back, darkMode }) {
  const [input, setInput] = useState("x^2 + 3x");
  const [res, setRes] = useState("");

  const diff = () => {
    try {
      setRes(math.derivative(input, "x").toString());
    } catch {
      setRes("Invalid expression");
    }
  };

  return (
    <Screen back={back} darkMode={darkMode}>
      <input value={input} onChange={(e) => setInput(e.target.value)} className="input" />
      <button onClick={diff} className="btn mt-4">Derivative</button>
      <div className="mt-4 text-xl font-bold">{res}</div>
    </Screen>
  );
}

/* ================== UI COMPONENTS ================== */
function Screen({ back, children, darkMode }) {
  return (
    <div className="p-6">
      <button onClick={back} className="mb-4 text-cyan-400">← Back</button>
      {children}
    </div>
  );
}

function Card({ title, icon, onClick }) {
  return (
    <div onClick={onClick} className="p-8 rounded-3xl bg-indigo-600 text-white cursor-pointer hover:scale-105 transition">
      {icon}
      <h2 className="text-2xl font-bold mt-4">{title}</h2>
    </div>
  );
}

function MatrixEditor({ matrix, setMatrix, darkMode }) {
  return matrix.map((row, i) => (
    <div key={i} className="flex gap-2 mb-2">
      {row.map((v, j) => (
        <input
          key={j}
          type="number"
          value={v}
          onChange={(e) => {
            const next = matrix.map((r) => [...r]);
            next[i][j] = +e.target.value;
            setMatrix(next);
          }}
          className={`w-16 p-2 text-center rounded ${darkMode ? "bg-gray-800" : "bg-white"}`}
        />
      ))}
    </div>
  ));
}

/* ================== GLOBAL STYLES (TAILWIND) ==================
.input { @apply w-full p-3 rounded-xl bg-gray-800 text-white outline-none; }
.btn { @apply p-3 rounded-xl bg-gray-700 font-bold hover:bg-gray-600; }
================================================ */

