import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  Bell,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Menu,
  Search,
  Home,
  Clock,
  TrendingUp,
  Zap,
  ChevronDown,
  Activity,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";

const navLinks = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Overview & Analytics",
    badge: null,
  },
  {
    to: "/students",
    icon: Users,
    label: "Students",
    description: "Manage Students",
    badge: null,
  },
  {
    to: "/attendance",
    icon: CalendarCheck,
    label: "Mark Attendance",
    description: "Take Attendance",
    badge: "Today",
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports",
    description: "View Analytics",
    badge: null,
  },
];

const quickActions = [
  {
    to: "/attendance",
    icon: Zap,
    label: "Quick Attendance",
    color: "from-violet-500 to-purple-600",
  },
  {
    to: "/reports",
    icon: TrendingUp,
    label: "Latest Reports",
    color: "from-blue-500 to-cyan-600",
  },
];

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  students: "Students",
  attendance: "Mark Attendance",
  reports: "Reports",
  history: "Attendance History",
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const teacher = (() => {
    try {
      return JSON.parse(localStorage.getItem("teacher") || "{}");
    } catch {
      return {};
    }
  })();
  const school = (() => {
    try {
      return JSON.parse(localStorage.getItem("school") || "{}");
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacher");
    localStorage.removeItem("school");
    navigate("/login");
  };

  const initials = teacher?.name
    ? teacher.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  // Build breadcrumbs from location
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: breadcrumbMap[segment] || segment,
    path: "/" + pathSegments.slice(0, index + 1).join("/"),
    isLast: index === pathSegments.length - 1,
  }));

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeString = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full relative z-10">
      {/* Logo / School Header */}
      <div className={`px-4 py-6 ${collapsed && !isMobile ? "px-2" : ""}`}>
        <div
          className={`flex items-center gap-3 ${collapsed && !isMobile ? "justify-center" : ""}`}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-violet-500 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <h1 className="text-white font-bold text-base leading-tight truncate tracking-tight">
                {school?.name || "Loyola"}
              </h1>
              <p className="text-indigo-300/90 text-xs truncate font-medium">
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats - only show when expanded */}
        {(!collapsed || isMobile) && (
          <Card className="mt-4 bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300/70 font-medium">
                  Today's Activity
                </span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">94%</span>
                <span className="text-xs text-green-400 font-medium">
                  +2.5%
                </span>
              </div>
              <div className="text-xs text-indigo-300/60">Attendance Rate</div>
            </div>
          </Card>
        )}
      </div>

      <Separator className="bg-white/10 mx-4" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {(!collapsed || isMobile) && (
          <div className="flex items-center justify-between px-3 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/70">
              Navigation
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[9px] text-green-400 font-semibold">
                Live
              </span>
            </div>
          </div>
        )}
        <nav className="space-y-1.5">
          {navLinks.map(({ to, icon: Icon, label, description, badge }) => (
            <TooltipProvider key={to} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={to}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                        collapsed && !isMobile ? "justify-center px-2" : ""
                      } ${
                        isActive
                          ? "bg-white/10 text-white shadow-lg shadow-indigo-500/20 backdrop-blur-sm"
                          : "text-indigo-200/80 hover:text-white hover:bg-white/5"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-linear-to-b from-indigo-400 via-violet-400 to-purple-400 rounded-r-full shadow-lg shadow-indigo-400/50"></div>
                        )}

                        {/* Icon with glow effect */}
                        <div
                          className={`relative shrink-0 ${isActive ? "text-white" : ""}`}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-indigo-400 rounded-lg blur-md opacity-40"></div>
                          )}
                          <Icon
                            className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform"
                            strokeWidth={2.2}
                          />
                        </div>

                        {(!collapsed || isMobile) && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {label}
                              </div>
                              {!isActive && (
                                <div className="text-[10px] text-indigo-300/50 truncate">
                                  {description}
                                </div>
                              )}
                            </div>

                            {badge && (
                              <Badge className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-[10px] px-2 py-0 h-5 border-0 font-bold shadow-lg">
                                {badge}
                              </Badge>
                            )}

                            {isActive && (
                              <ChevronRight
                                className="w-4 h-4 text-indigo-300"
                                strokeWidth={2.5}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && !isMobile && (
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="bg-slate-900 border-slate-700"
                  >
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-slate-400">{description}</div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>

        {/* Quick Actions Section */}
        {(!collapsed || isMobile) && (
          <>
            <Separator className="bg-white/10 my-4" />
            <div className="px-3 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/70">
                Quick Actions
              </p>
            </div>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.to}
                  onClick={() => {
                    navigate(action.to);
                    isMobile && setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl bg-linear-to-r ${action.color} text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                >
                  <action.icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      {/* Bottom Section */}
      <div className="mt-auto">
        <Separator className="bg-white/10 mx-4 mb-3" />

        {/* Collapse Toggle (desktop only) */}
        {!isMobile && (
          <div className="px-4 pb-3">
            <Button
              onClick={() => setCollapsed(!collapsed)}
              variant="ghost"
              className={`w-full flex items-center gap-2 text-indigo-300/80 hover:text-white hover:bg-white/5 h-10 ${
                collapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="text-sm font-medium">Collapse Sidebar</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* User Profile */}
        <div className={`px-4 pb-4 ${collapsed && !isMobile ? "px-2" : ""}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`w-full flex items-center gap-3 px-2.5 py-3 rounded-xl bg-linear-to-br from-white/5 to-white/2 hover:from-white/10 hover:to-white/5 transition-all duration-300 group border border-white/10 hover:border-white/20 ${
                  collapsed && !isMobile ? "justify-center px-2" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-violet-500 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <Avatar className="w-10 h-10 relative border-2 border-white/20">
                    <AvatarFallback className="bg-linear-to-br from-indigo-500 via-purple-500 to-violet-600 text-white text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-[#1e1b4b] rounded-full"></div>
                </div>
                {(!collapsed || isMobile) && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-bold truncate">
                        {teacher?.name || "Teacher"}
                      </p>
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-indigo-300/70 text-xs truncate font-medium">
                      {teacher?.email || "teacher@school.com"}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl p-2 bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-indigo-100">
                    <AvatarFallback className="bg-linear-to-br from-indigo-500 to-violet-600 text-white font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {teacher?.name || "Teacher"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {teacher?.email || ""}
                    </p>
                    <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-1.5 py-0 h-4 border-0">
                      Active now
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium">
                  <Settings className="w-4 h-4 mr-3 text-slate-600" />
                  Account Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium">
                  <Bell className="w-4 h-4 mr-3 text-slate-600" />
                  Notifications
                  <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer px-3 py-2.5 text-sm font-medium">
                  <History className="w-4 h-4 mr-3 text-slate-600" />
                  Activity Log
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg cursor-pointer px-3 py-2.5 text-sm font-bold text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-50">
        {/* Desktop Sidebar */}
        <aside
          className={`sidebar-container hidden lg:flex flex-col shrink-0 transition-all duration-500 ease-in-out border-r border-indigo-900/10 ${
            collapsed ? "w-20" : "w-70"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="sidebar-container w-70 p-0 border-0"
          >
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Top Bar */}
          <header className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Mobile menu trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Breadcrumb navigation */}
              <div className="hidden sm:block">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                      >
                        <Home className="w-3.5 h-3.5" />
                        Home
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbs.map((crumb) => (
                      <span key={crumb.path} className="contents">
                        <BreadcrumbSeparator className="text-slate-400" />
                        <BreadcrumbItem>
                          {crumb.isLast ? (
                            <BreadcrumbPage className="text-slate-900 text-sm font-semibold">
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              href={crumb.path}
                              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                            >
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </span>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Search button */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 h-9 px-3 text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium">Quick search...</span>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded bg-slate-200 px-1.5 font-mono text-[10px] font-medium text-slate-600">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Current time */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mr-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">
                    {timeString}
                  </span>
                  <span className="text-slate-500 ml-1.5 hidden xl:inline">
                    {today.split(",")[0]}
                  </span>
                </div>
              </div>

              {/* Notification bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl p-0 bg-white"
                >
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900">
                        Notifications
                      </h3>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs px-2 h-5 border-0">
                        3 new
                      </Badge>
                    </div>
                  </div>
                  <div className="max-h-100 overflow-y-auto">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            Attendance Marked
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Successfully marked attendance for Class 10-A
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            New Student Added
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            John Doe has been enrolled in Class 9-B
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            Report Generated
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Monthly attendance report is ready
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            3 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    >
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick action button */}
              <Button
                size="sm"
                className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 border-0 h-9 px-4"
                onClick={() => navigate("/attendance")}
              >
                <CalendarCheck className="w-4 h-4 mr-2" strokeWidth={2.5} />
                <span className="hidden sm:inline">Mark Attendance</span>
                <span className="sm:hidden">Mark</span>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-linear-to-br from-slate-50 via-white to-slate-50">
            <div className="p-4 lg:p-8">
              <div className="max-w-7xl mx-auto fade-in">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Layout;
