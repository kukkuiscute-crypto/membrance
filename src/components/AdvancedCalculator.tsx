import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CalcMode = "basic" | "scientific";

const AdvancedCalculator = () => {
  const [display, setDisplay] = useState("0");
  const [mode, setMode] = useState<CalcMode>("basic");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (val: string) => {
    if (fresh) {
      setDisplay(val === "." ? "0." : val);
      setFresh(false);
    } else {
      if (val === "." && display.includes(".")) return;
      setDisplay(display + val);
    }
  };

  const operate = (operator: string) => {
    setPrev(display);
    setOp(operator);
    setFresh(true);
  };

  const calculate = () => {
    if (!prev || !op) return;
    const a = parseFloat(prev);
    const b = parseFloat(display);
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
    setPrev(null);
    setOp(null);
    setFresh(true);
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

  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const btnClass = "py-2.5 rounded-lg text-sm font-medium transition-all";

  return (
    <div className="p-4 space-y-3">
      {/* Display */}
      <div className="bg-secondary/60 rounded-xl p-4 text-right border border-border/30">
        <p className="text-xs text-muted-foreground h-4">{prev && op ? `${prev} ${op}` : ""}</p>
        <p className="text-2xl font-display font-bold text-foreground truncate">{display}</p>
      </div>

      {/* Mode toggle */}
      <button
        onClick={() => setMode(mode === "basic" ? "scientific" : "basic")}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        {mode === "basic" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        {mode === "basic" ? "Scientific" : "Basic"}
      </button>

      {/* Scientific row */}
      {mode === "scientific" && (
        <div className="grid grid-cols-4 gap-1.5">
          {["sin", "cos", "tan", "sqrt", "log", "ln", "pi", "e", "x2", "1/x", "abs", "fact"].map((fn) => (
            <button
              key={fn}
              onClick={() => sciOp(fn)}
              className={`${btnClass} bg-accent/10 text-accent hover:bg-accent/20 text-xs`}
            >
              {fn}
            </button>
          ))}
        </div>
      )}

      {/* Basic grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {["C", "(", ")", "^", "7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === "C") clear();
              else if (btn === "=") calculate();
              else if (["+", "-", "*", "/", "^"].includes(btn)) operate(btn);
              else input(btn);
            }}
            className={`${btnClass} ${
              btn === "="
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : btn === "C"
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : ["+", "-", "*", "/", "^", "(", ")"].includes(btn)
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "bg-secondary/40 text-foreground hover:bg-secondary/60"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvancedCalculator;
