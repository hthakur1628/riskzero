import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Icon, CircularProgress } from "../components/ui.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * Dashboard — overview of portfolio health, performance chart, AI advice,
 *             and a holdings list.
 *
 * Props:
 *   holdings       array   — [{ symbol, qty, avgPrice }]
 *   stockMap       object  — symbol → stock object
 *   wallet         number
 *   dark           bool
 *   onSell         fn(holding) — opens the sell modal
 */
export default function Dashboard({ holdings, stockMap, wallet, dark, onSell }) {
  const { card, text, muted, divider, hover, tooltipStyle } = useTheme(dark);

  // ── Derived values ──────────────────────────────────────────────────────
  const portfolioValue = holdings.reduce(
    (sum, h) => sum + (stockMap[h.symbol]?.price ?? 0) * h.qty,
    0
  );
  const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.qty, 0);
  const totalPnL      = portfolioValue - totalInvested;
  const pnlPct        = totalInvested > 0
    ? ((totalPnL / totalInvested) * 100).toFixed(2)
    : 0;

  const riskScore = Math.min(
    100,
    Math.round(
      holdings.reduce((max, h) => {
        const val = (stockMap[h.symbol]?.price ?? 0) * h.qty;
        return Math.max(max, (val / Math.max(portfolioValue, 1)) * 100);
      }, 0) * 0.5 +
      (holdings.filter((h) => stockMap[h.symbol]?.sector === "IT").length /
        Math.max(holdings.length, 1)) * 100 * 0.3 +
      20
    )
  );

  const lossProbability = Math.min(85, Math.round(10 + riskScore * 0.75));
  const riskColor       = riskScore < 35 ? "#10b981" : riskScore < 65 ? "#f59e0b" : "#ef4444";
  const riskLabel       = riskScore < 35 ? "LOW RISK" : riskScore < 65 ? "MODERATE" : "HIGH RISK";

  // ── Mock weekly chart ────────────────────────────────────────────────────
  const chartData = [
    { name: "Mon", value: 91200 },
    { name: "Tue", value: 93400 },
    { name: "Wed", value: 90100 },
    { name: "Thu", value: 95600 },
    { name: "Fri", value: 94300 },
    { name: "Sat", value: +portfolioValue.toFixed(0) },
  ];

  const aiText =
    "Your portfolio is 62% concentrated in IT and Finance sectors. The top holding (HDFC) represents 38% of total value — a single sector event could wipe ₹22,000+. Consider adding 2–3 FMCG or pharma stocks to reduce concentration risk below 25%.";

  return (
    <div className="space-y-6">
      {/* ── Top stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Wallet */}
        <div
          className={`rounded-2xl border p-6 relative overflow-hidden ${
            dark
              ? "bg-gradient-to-br from-emerald-900/60 to-gray-900 border-emerald-800/50"
              : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
          }`}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #10b981, transparent)", transform: "translate(30%,-30%)" }}
          />
          <div className={`text-xs font-semibold tracking-widest mb-1 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
            VIRTUAL WALLET
          </div>
          <div className={`text-4xl font-bold mb-1 ${text}`}>₹{Math.round(wallet).toLocaleString()}</div>
          <div className={`text-sm ${muted}`}>Available to invest</div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex-1 h-1.5 rounded-full ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, (wallet / 100000) * 100)}%`, transition: "width 1s ease" }}
              />
            </div>
            <span className={`text-xs ${muted}`}>{((wallet / 100000) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Portfolio value */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-1 ${muted}`}>PORTFOLIO VALUE</div>
          <div className={`text-4xl font-bold mb-1 ${text}`}>₹{Math.round(portfolioValue).toLocaleString()}</div>
          <div className={`flex items-center gap-1.5 text-sm ${totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            <Icon name={totalPnL >= 0 ? "trending_up" : "trending_down"} size={16} />
            <span className="font-semibold">
              {totalPnL >= 0 ? "+" : ""}₹{Math.abs(Math.round(totalPnL)).toLocaleString()}
            </span>
            <span className="opacity-70">({totalPnL >= 0 ? "+" : ""}{pnlPct}%)</span>
          </div>
        </div>

        {/* Risk score */}
        <div className={`rounded-2xl border p-6 flex items-center gap-5 ${card}`}>
          <CircularProgress value={riskScore} size={90} color={riskColor} />
          <div>
            <div className={`text-xs font-semibold tracking-widest mb-1 ${muted}`}>RISK SCORE</div>
            <div className="text-lg font-bold" style={{ color: riskColor }}>{riskLabel}</div>
            <div className={`text-xs mt-1 ${muted}`}>Loss Probability</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${lossProbability}%`, background: `linear-gradient(90deg, #f59e0b, ${riskColor})` }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: riskColor }}>{lossProbability}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart + AI advisor ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Performance chart */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${card}`}>
          <div className={`text-xs font-semibold tracking-widest mb-4 ${muted}`}>
            PORTFOLIO PERFORMANCE — THIS WEEK
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: dark ? "#6b7280" : "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${v.toLocaleString()}`, "Value"]} />
              <Line
                type="monotone" dataKey="value" stroke="url(#pg)" strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981", stroke: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI advisor */}
        <div
          className={`rounded-2xl border p-6 ${
            dark
              ? "bg-gradient-to-b from-violet-950/40 to-gray-900 border-violet-800/40"
              : "bg-gradient-to-b from-violet-50 to-white border-violet-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-violet-900/60" : "bg-violet-100"}`}>
              <Icon name="brain" size={14} cls={dark ? "text-violet-400" : "text-violet-600"} />
            </div>
            <div>
              <div className={`text-xs font-bold tracking-widest ${dark ? "text-violet-400" : "text-violet-600"}`}>
                AI ADVISOR
              </div>
              <div className={`text-xs ${muted}`}>Powered by Gemini</div>
            </div>
          </div>
          <p className={`text-sm leading-relaxed ${dark ? "text-gray-300" : "text-gray-700"}`}>{aiText}</p>
          <button
            className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
              dark
                ? "bg-violet-900/50 hover:bg-violet-800/60 text-violet-300 border border-violet-700/50"
                : "bg-violet-100 hover:bg-violet-200 text-violet-700 border border-violet-300"
            }`}
          >
            REFRESH ANALYSIS
          </button>
        </div>
      </div>

      {/* ── Holdings list ───────────────────────────────────────────────── */}
      <div className={`rounded-2xl border ${card}`}>
        <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
          <span className={`text-xs font-semibold tracking-widest ${muted}`}>YOUR HOLDINGS</span>
          <span className={`text-xs ${muted}`}>{holdings.length} positions</span>
        </div>
        <div className={`divide-y ${dark ? "divide-gray-800/50" : "divide-gray-100"}`}>
          {holdings.map((h) => {
            const s    = stockMap[h.symbol];
            if (!s) return null;
            const curr  = s.price * h.qty;
            const cost  = h.avgPrice * h.qty;
            const pnl   = curr - cost;
            const pnlP  = ((pnl / cost) * 100).toFixed(2);
            return (
              <div key={h.symbol} className={`flex items-center gap-4 px-6 py-3.5 transition ${hover}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${dark ? "bg-gray-800" : "bg-gray-100"} ${text}`}>
                  {h.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${text}`}>{h.symbol}</div>
                  <div className={`text-xs ${muted}`}>{h.qty} shares · avg ₹{h.avgPrice.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${text}`}>₹{Math.round(curr).toLocaleString()}</div>
                  <div className={`text-xs font-semibold ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {pnl >= 0 ? "+" : ""}₹{Math.round(pnl).toLocaleString()} ({pnl >= 0 ? "+" : ""}{pnlP}%)
                  </div>
                </div>
                <button
                  onClick={() => onSell && onSell(h)}
                  className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                >
                  SELL
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}