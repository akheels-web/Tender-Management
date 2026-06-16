import { Link } from "react-router";
import {
  Shield,
  FileText,
  Users,
  Gavel,
  Lock,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "agent") return "/agent/dashboard";
    return "/vendor/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-slate-900 font-semibold text-lg">ProTender</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                asChild
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 gap-2"
              >
                <Link to={getDashboardLink()}>
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 gap-2"
                >
                  <Link to="/login">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium mb-6 border border-cyan-500/20">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            Next-Gen Tender Management
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Secure. Transparent.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Procurement Simplified.
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            ProTender is an enterprise-grade tender management platform with
            role-based access control, auto-locked documents, and comprehensive
            bid tracking.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 gap-2 px-8"
            >
              <Link to="/login">
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Tenders Managed", value: "10,000+", icon: FileText },
              { label: "Active Vendors", value: "500+", icon: Users },
              { label: "Bids Processed", value: "25,000+", icon: Gavel },
              { label: "Uptime", value: "99.9%", icon: TrendingUp },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Built for Modern Procurement
            </h2>
            <p className="text-slate-600 mt-3">
              Comprehensive features for every stakeholder in the tender process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Auto-Locked Tenders",
                description:
                  "All tenders are automatically locked with admin-controlled passwords for maximum security.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                description:
                  "Three distinct roles - Admin, Agent, and Vendor - each with carefully controlled permissions.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                icon: Gavel,
                title: "Bid Management",
                description:
                  "Vendors can place bids with PDF proposals. Admins can review, score, and manage all bids.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Users,
                title: "Vendor Directory",
                description:
                  "Complete vendor management with activation, deactivation, and barring capabilities.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description:
                  "Real-time statistics, charts, and activity logs for complete oversight.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Globe,
                title: "Advanced Search",
                description:
                  "Search tenders by ID, filter by status, category, and date range for quick access.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-[#111C2E] border border-white/[0.06] rounded-xl p-6 hover:border-cyan-500/20 transition-all duration-300"
                >
                  <div className={feature.bg + " w-12 h-12 rounded-lg flex items-center justify-center mb-4"}>
                    <Icon className={feature.color + " w-6 h-6"} />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-6 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Three Roles, One Platform</h2>
            <p className="text-slate-600 mt-3">
              Each role is designed with specific capabilities for the procurement workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">Administrator</h3>
              <p className="text-slate-600 text-sm mb-4">
                Full platform control. Create tenders, manage vendors, review bids, and control access.
              </p>
              <ul className="space-y-2">
                {[
                  "Create & manage tenders",
                  "Lock/unlock with passwords",
                  "Activate/deactivate vendors",
                  "Bar vendors from tenders",
                  "Review & score bids",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">Procurement Agent</h3>
              <p className="text-slate-600 text-sm mb-4">
                Monitor tender activity and bid participation with read-only access to locked tenders.
              </p>
              <ul className="space-y-2">
                {[
                  "View tender summaries",
                  "See bid activity",
                  "Track tender status",
                  "View vendor list",
                  "Limited access (locked)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/20 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Gavel className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">Vendor</h3>
              <p className="text-slate-600 text-sm mb-4">
                Browse tenders, place bids with PDF proposals, and track bid status in real-time.
              </p>
              <ul className="space-y-2">
                {[
                  "Browse open tenders",
                  "Unlock with password",
                  "Place bids (PDF required)",
                  "Track bid status",
                  "Manage profile",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-slate-900" />
            </div>
            <span className="text-slate-600 text-sm">ProTender</span>
          </div>
          <p className="text-slate-600 text-sm">
            Enterprise Tender Management Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
