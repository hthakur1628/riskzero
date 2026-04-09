import { Icon } from "./ui.jsx";
import { NAV_ITEMS } from "./Sidebar.jsx";
import { useTheme } from "../hooks/useTheme.js";

/**
 * Navbar — sticky top header on all screens,
 *          plus a bottom tab bar on mobile (< lg).
 *
 * Props:
 *   page    string  — active page id
 *   setPage fn
 *   dark    bool
 *   setDark fn
 *   wallet  number
 */
export default function Navbar({ page, setPage, dark, setDark, wallet }) {
  const { text, muted, divider } = useTheme(dark);
  const activeItem = NAV_ITEMS.find((n) => n.id === page);

  return (
    <>
      {/* ── Sticky top header ───────────────────────────────────────────── */}
      <div
        className={`sticky top-0 z-20 px-6 py-4 border-b flex items-center justify-between backdrop-blur-md ${
          dark
            ? "bg-gray-950/90 border-gray-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        <div>
          <h1 className={`text-lg font-bold ${text}`}>{activeItem?.label}</h1>
          <div className={`text-xs ${muted}`}>
            {page === "dashboard" &&
              `Active positions · ${new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}`}
            {page === "portfolio" && "Risk metrics & performance"}
            {page === "transactions" && "Complete trading history"}
            {page === "profile" && "Account settings & preferences"}
            {page === "market"    && `${12} stocks · NSE & BSE (mock)`}
            {page === "simulator" && "Risk-free scenario testing"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet chip (hidden on xs) */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
              dark ? "bg-gray-800" : "bg-gray-100"
            } ${text}`}
          >
            <Icon name="wallet" size={14} cls="text-emerald-500" />
            ₹{Math.round(wallet).toLocaleString()}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-xl transition ${
              dark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            <Icon name={dark ? "sun" : "moon"} size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden flex border-t ${
          dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition ${
              page === n.id
                ? "text-emerald-500"
                : dark
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            <Icon name={n.icon} size={20} />
            {n.label}
          </button>
        ))}
      </div>
    </>
  );
}