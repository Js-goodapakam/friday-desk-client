import { LogIn, IndianRupee, ArrowRight, FileText, ChartNoAxesColumn, CircleHelp, Search, Phone, Plus, Pencil, Trash2, CalendarDays, Users, LayoutDashboard, BedDouble, Settings, ChevronDown, ChevronRight, X, Check, AlertCircle, LoaderCircle, Download, Filter, RefreshCw, Eye, LogOut, Wallet, MessageSquare, Plug } from "lucide-react";

const icons = { bed: BedDouble, login: LogIn, rupee: IndianRupee, plus: Plus, arrow: ArrowRight, invoices: FileText, reports: ChartNoAxesColumn, help: CircleHelp, reservations: BedDouble, search: Search, phone: Phone, add: Plus, edit: Pencil, delete: Trash2, calendar: CalendarDays, guests: Users, dashboard: LayoutDashboard, rooms: BedDouble, settings: Settings, down: ChevronDown, right: ChevronRight, close: X, check: Check, alert: AlertCircle, loading: LoaderCircle, download: Download, filter: Filter, refresh: RefreshCw, view: Eye, logout: LogOut, finance: Wallet, chat: MessageSquare, integrations: Plug };
const sizes = { action: 20, navigation: 24, dashboard: 32, compact: 16 };

export default function EngageIcon({ name, variant = "action", label, className }) {
  const Icon = icons[name];
  if (!Icon) return null;
  return <Icon size={sizes[variant] ?? sizes.action} strokeWidth={2} color="currentColor" className={className} focusable="false" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label} />;
}
