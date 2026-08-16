import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { isCrossmarkInstalled } from "../../auth/crossmark.js";
import { useAuth } from "../../auth/useAuth.js";
import { cn } from "../../lib/utils.js";

const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/corridors", label: "Corridor Atlas" },
  { to: "/safe-path", label: "Safe Path Agent" },
  { to: "/analyze", label: "Entity Audit" },
  { to: "/developers", label: "Docs" },
];

export function Navbar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isPremium, connect, logout } = useAuth();

  const handleConnect = async (): Promise<void> => {
    if (!isCrossmarkInstalled()) {
      navigate("/premium");
      return;
    }
    try {
      await connect();
    } catch {
      navigate("/premium");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-[color:rgba(244,246,250,0.22)] bg-[#020409]/80">
      <NavLink to="/home" className="select-none" aria-label="Go to corelens home">
        <span className="text-[15px] font-bold tracking-[-0.01em] text-slate-100 transition-colors duration-200 hover:text-white">
          corelens
        </span>
      </NavLink>

      <div className="flex items-center gap-0">
        {NAV_LINKS.map(({ to, label }) => {
          const isActive =
            to === "/home" ? location.pathname === "/home" : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "relative px-4 py-2.5 text-[13px] font-semibold transition-all duration-150",
                isActive
                  ? "text-slate-100 [text-shadow:0_0_6px_rgba(180,205,255,0.55)]"
                  : "font-medium text-slate-400 hover:text-slate-100",
              )}
            >
              {label}
              {isActive && (
                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-[#8FB4FF] shadow-[0_0_6px_1px_rgba(110,163,255,0.7)]" />
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            {isPremium && (
              <span className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] bg-emerald-500/16 text-emerald-300 border border-emerald-500/32">
                Premium
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate("/account")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-all duration-150 border",
                isPremium
                  ? "bg-transparent border-[color:var(--app-glass-panel-border)] text-slate-300 hover:bg-white/5"
                  : "btn-primary-themed text-white border-[color:var(--page-accent-400)]",
              )}
            >
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1.5 text-[11px] text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all duration-150"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            className="px-3 py-1.5 text-xs font-medium transition-all duration-150 btn-primary-themed text-white border border-[color:var(--page-accent-400)]"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
