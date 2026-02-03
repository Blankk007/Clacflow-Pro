import React, { useState, useEffect, useCallback } from "react";

import * as math from "mathjs";
import {
  Calculator,
  TrendingUp,
  Grid3x3,
  Sigma,
  Sun,
  Moon,
  Zap,
  Droplet,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CalcFlowPro() {
  const [mode, setMode] = useState("home");
  const [theme, setTheme] = useState("dark"); // dark | light | neon | ocean

  const themes = {
    dark: {
      bg: "bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950",
      text: "text-white",
      card: "bg-white/5 backdrop-blur-xl border border-white/10",
      glow: "hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]",
      accent: "from-cyan-400 to-purple-500",
    },
    light: {
      bg: "bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50",
      text: "text-gray-900",
      card: "bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl",
      glow: "hover:shadow-2xl hover:shadow-purple-200/60",
      accent: "from-indigo-500 to-purple-600",
    },
    neon: {
      bg: "bg-black",
      text: "text-cyan-200",
      card: "bg-black/40 backdrop-blur-xl border border-cyan-500/30",
      glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.7)]",
      accent: "from-cyan-300 to-pink-400",
    },
    ocean: {
      bg: "bg-gradient-to-br from-teal-950 via-cyan-950 to-blue-950",
      text: "text-cyan-50",
      card: "bg-white/5 backdrop-blur-xl border border-cyan-500/20",
      glow: "hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]",
      accent: "from-cyan-300 to-teal-400",
    },
  };

  const current = themes[theme] || themes.dark;

  const cycleTheme = () => {
    const order = ["dark", "light", "neon", "ocean"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  return (
    <div className={`min-h-screen ${current.bg} ${current.text} transition-all duration-700 relative overflow-hidden`}>
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(139,92,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(34,211,238,0.12),transparent_50%)]" />
      </div>

      {mode === "home" && (
        <Home
          setMode={setMode}
          theme={theme}
          cycleTheme={cycleTheme}
          currentTheme={current}
        />
      )}
      {mode === "basic" && <BasicCalc back={() => setMode("home")} currentTheme={current} />}
      {mode === "graph" && <GraphCalc back={() => setMode("home")} currentTheme={current} />}
      {mode === "matrix" && <MatrixCalc back={() => setMode("home")} currentTheme={current} />}
      {mode === "calc" && <CalculusCalc back={() => setMode("home")} currentTheme={current} />}
    </div>
  );
}

// ────────────────────────────────────────────────

function Home({ setMode, cycleTheme, currentTheme }) {
  const icons = [
    <Calculator size={48} />,
    <TrendingUp size={48} />,
    <Grid3x3 size={48} />,
    <Sigma size={48} />,
  ];

  const titles = ["Calculator", "Graph", "Matrix", "Calculus"];

  return (
    <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-16">
        <h1
          className={`text-5xl md:text-7xl font-black bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent tracking-tight`}
        >
          CalcFlow Pro
        </h1>

        <button
          onClick={cycleTheme}
          className="p-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          {currentTheme === "dark" ? (
            <Sun size={28} />
          ) : currentTheme === "light" ? (
            <Moon size={28} />
          ) : currentTheme === "neon" ? (
            <Zap size={28} />
          ) : (
            <Droplet size={28} />
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {titles.map((title, i) => (
          <div
            key={title}
            onClick={() => setMode(title.toLowerCase().replace("calculator", "basic").replace("calculus", "calc"))}
            className={`group relative overflow-hidden p-8 md:p-10 rounded-3xl ${currentTheme.card} shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.04] ${currentTheme.glow}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`mb-6 text-cyan-300 group-hover:text-purple-300 transition-colors duration-300`}>
                {icons[i]}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                {title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────

function Screen({ back, children, currentTheme }) {
  return (
    <div className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto">
      <button
        onClick={back}
        className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
      >
        ← Back to Home
      </button>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────

function BasicCalc({ back, currentTheme }) {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState([]);

  // ✅ append value
  const append = useCallback((v) => {
    setDisplay((d) => {
      if (d === "Error") return v;
      if (d === "0" && v !== ".") return v;
      return d + v;
    });
  }, []);

  // ✅ evaluate expression
  const evaluate = useCallback(() => {
    try {
      const res = math.evaluate(display);
      setHistory((h) => [...h.slice(-4), `${display} = ${res}`]);
      setDisplay(res.toString());
    } catch {
      setDisplay("Error");
    }
  }, [display]);

  // ✅ clear display
  const clear = useCallback(() => {
    setDisplay("0");
  }, []);

  // ✅ central button logic
  const handleButtonClick = (val) => {
    if (val === "C") clear();
    else if (val === "=") evaluate();
    else append(val);
  };

  // ✅ keyboard support (SAFE)
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement.tagName === "INPUT") return;

      if ("0123456789+-*/.".includes(e.key)) append(e.key);
      if (e.key === "Enter") evaluate();
      if (e.key === "Backspace") {
        setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [append, evaluate]);

  const buttons = [
    "C", "/", 
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "=",
  ];

  return (
    <Screen back={back} currentTheme={currentTheme}>
      <div className="mb-6 text-right text-5xl font-black break-all">
        {display}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {buttons.map((b) => (
          <button
            key={b}
            onClick={() => handleButtonClick(b)}
            className={`
              p-5 rounded-xl font-bold text-white transition active:scale-95
              ${
                b === "C"
                  ? "bg-red-600"
                  : b === "="
                  ? "bg-green-600"
                  : "+-*/".includes(b)
                  ? "bg-indigo-600"
                  : "bg-gray-700"
              }
            `}
          >
            {b}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-6 text-sm opacity-70">
          <h4 className="font-bold mb-2">History</h4>
          {history.map((h, i) => (
            <div key={i}>{h}</div>
          ))}
        </div>
      )}
    </Screen>
  );
}


// ────────────────────────────────────────────────

function GraphCalc({ back, currentTheme }) {
  const [eq, setEq] = useState("x^2");
  const [data, setData] = useState([]);

  const plot = () => {
  const pts = [];
  for (let x = -10; x <= 10; x += 0.2) {
    try {
      const y = math.evaluate(eq, { x });
      if (typeof y === "number" && isFinite(y)) {
        pts.push({ x, y });
      }
    } catch {}
  }
  setData(pts);
};


  return (
    <Screen back={back} currentTheme={currentTheme}>
      <div className="mb-6">
        <input
          value={eq}
          onChange={(e) => setEq(e.target.value)}
          placeholder="e.g. x^2 + sin(x)"
          className="w-full p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl outline-none focus:border-cyan-400 transition"
        />
      </div>

      <button
        onClick={plot}
        className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-lg hover:brightness-110 transition mb-10 shadow-lg"
      >
        Plot Function
      </button>

      <div className="h-96 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="x" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30,30,50,0.9)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: "12px",
                color: "white",
              }}
            />
            <Line type="monotone" dataKey="y" stroke="#a78bfa" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Screen>
  );
}

// ────────────────────────────────────────────────

function MatrixCalc({ back, currentTheme }) {
  const make = () => Array.from({ length: 3 }, () => Array(3).fill(0));
  const [A, setA] = useState(make());
  const [result, setResult] = useState("");

  const op = (type) => {
    try {
      if (type === "det") setResult(math.det(A).toFixed(4));
      if (type === "inv") setResult(JSON.stringify(math.inv(A), null, 2));
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  return (
    <Screen back={back} currentTheme={currentTheme}>
      <div className="mb-8 text-2xl font-bold">3×3 Matrix</div>

      <div className="flex flex-col gap-3 mb-8">
        {A.map((row, i) => (
          <div key={i} className="flex gap-3">
            {row.map((v, j) => (
              <input
                key={j}
                type="number"
                value={v}
                onChange={(e) => {
                  const next = A.map((r) => [...r]);
                  next[i][j] = +e.target.value || 0;
                  setA(next);
                }}
                className="w-20 p-4 text-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white outline-none focus:border-purple-400 transition text-lg"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => op("det")}
          className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold transition shadow-lg"
        >
          Determinant
        </button>
        <button
          onClick={() => op("inv")}
          className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 font-bold transition shadow-lg"
        >
          Inverse
        </button>
      </div>

      {result && (
        <pre className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-sm overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </Screen>
  );
}

// ────────────────────────────────────────────────

function CalculusCalc({ back, currentTheme }) {
  const [input, setInput] = useState("x^2 + 3x + 1");
  const [res, setRes] = useState("");

  const diff = () => {
    try {
      const der = math.derivative(input, "x");
      setRes(der.toString());
    } catch {
      setRes("Invalid expression");
    }
  };

  return (
    <Screen back={back} currentTheme={currentTheme}>
      <div className="mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. x^3 - 2x + sin(x)"
          className="w-full p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl outline-none focus:border-cyan-400 transition"
        />
      </div>

      <button
        onClick={diff}
        className="px-10 py-5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 font-bold text-lg hover:brightness-110 transition shadow-lg"
      >
        Compute Derivative
      </button>

      {res && (
        <div className="mt-10 text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
          d/dx = {res}
        </div>
      )}
    </Screen>
  );
}