import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CalcMode = "basic" | "scientific" | "graphing";

const AdvancedCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [mode, setMode] = useState<CalcMode>("basic");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [graphExpr, setGraphExpr] = useState("Math.sin(x)");

  const input = (val: string) => {
    if (fresh) { setDisplay(val === "." ? "0." : val); setFresh(false); }
    else { if (val === "." && display.includes(".")) return; setDisplay(display + val); }
  };

  const operate = (operator: string) => { setPrev(display); setOp(operator); setFresh(true); };

  const calculate = () => {
    if (!prev || !op) return;
    const a = parseFloat(prev), b = parseFloat(display);
    let result: number;
    switch (op) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = b !== 0 ? a / b : NaN; break;
      case "^": result = Math.pow(a, b); break;
      default: return;
    }
    setDisplay(isNaN(result) ? "Error" : String(result));
    setPrev(null); setOp(null); setFresh(true);
  };

  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); };

  const sciOp = (fn: string) => {
    const x = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin(x * Math.PI / 180); break;
      case "cos": result = Math.cos(x * Math.PI / 180); break;
      case "tan": result = Math.tan(x * Math.PI / 180); break;
      case "sqrt": result = Math.sqrt(x); break;
      case "log": result = Math.log10(x); break;
      case "ln": result = Math.log(x); break;
      case "pi": result = Math.PI; break;
      case "e": result = Math.E; break;
      case "x2": result = x * x; break;
      case "1/x": result = 1 / x; break;
      case "abs": result = Math.abs(x); break;
      case "fact": result = x >= 0 && x <= 170 ? factorial(x) : NaN; break;
      default: return;
    }
    setDisplay(isNaN(result) || !isFinite(result) ? "Error" : String(parseFloat(result.toFixed(10))));
    setFresh(true);
  };

  const factorial = (n: number): number => { if (n === 0 || n === 1) return 1; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

  const btnClass = "py-2.5 rounded-lg text-sm font-medium transition-all";

  // Simple graph renderer
  const renderGraph = () => {
    const points: { x: number; y: number }[] = [];
    for (let px = -10; px <= 10; px += 0.2) {
      try {
        const y = new Function("x", `return ${graphExpr}`)(px);
        if (isFinite(y)) points.push({ x: px, y });
      } catch { /* skip */ }
    }
    if (points.length < 2) return null;
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const range = maxY - minY || 1;
    const w = 300, h = 160;
    const pathD = points.map((p, i) => {
      const px = ((p.x + 10) / 20) * w;
      const py = h - ((p.y - minY) / range) * h;
      return `${i === 0 ? "M" : "L"} ${px} ${py}`;
    }).join(" ");

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 rounded-lg bg-secondary/30 border border-border/30">
        {/* Axes */}
        <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="hsl(var(--border))" strokeWidth="0.5" />
        <line x1={0} y1={h - ((0 - minY) / range) * h} x2={w} y2={h - ((0 - minY) / range) * h} stroke="hsl(var(--border))" strokeWidth="0.5" />
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="p-4 space-y-3">
      <div className="bg-secondary/60 rounded-xl p-4 text-right border border-border/30">
        <p className="text-xs text-muted-foreground h-4">{prev && op ? `${prev} ${op}` : ""}</p>
        <p className="text-2xl font-display font-bold text-foreground truncate">{display}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1">
        {(["basic", "scientific", "graphing"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${mode === m ? "bg-primary/15 text-primary" : "bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Graphing mode */}
      {mode === "graphing" && (
        <div className="space-y-2">
          <input value={graphExpr} onChange={e => setGraphExpr(e.target.value)}
            className="w-full bg-secondary/60 border border-border/50 rounded-lg px-3 py-2 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Math.sin(x)" />
          {renderGraph()}
          <p className="text-[10px] text-muted-foreground">Use JS math syntax: Math.sin(x), x*x, Math.pow(x,3)</p>
        </div>
      )}

      {/* Scientific row */}
      {mode === "scientific" && (
        <div className="grid grid-cols-4 gap-1.5">
          {["sin", "cos", "tan", "sqrt", "log", "ln", "pi", "e", "x2", "1/x", "abs", "fact"].map((fn) => (
            <button key={fn} onClick={() => sciOp(fn)} className={`${btnClass} bg-accent/10 text-accent hover:bg-accent/20 text-xs`}>{fn}</button>
          ))}
        </div>
      )}

      {/* Basic grid */}
      {mode !== "graphing" && (
        <div className="grid grid-cols-4 gap-1.5">
          {["C", "(", ")", "^", "7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map((btn) => (
            <button key={btn} onClick={() => {
              if (btn === "C") clear();
              else if (btn === "=") calculate();
              else if (["+", "-", "*", "/", "^"].includes(btn)) operate(btn);
              else input(btn);
            }} className={`${btnClass} ${
              btn === "=" ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : btn === "C" ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
              : ["+", "-", "*", "/", "^", "(", ")"].includes(btn) ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "bg-secondary/40 text-foreground hover:bg-secondary/60"
            }`}>{btn}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedCalculator;
