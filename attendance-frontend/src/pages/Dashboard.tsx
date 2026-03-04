import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarCheck, UserX, Clock, TrendingUp, BookOpen, ArrowRight, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import api from '@/services/api';

interface Stats {
  totalStudents: number;
  PRESENT: number;
  ABSENT: number;
  LATE: number;
  notMarked: number;
  weeklyTrend: { date: string; presentCount: number }[];
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  iconBg,
  sub,
  delay,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  bgColor?: string;
  iconBg: string;
  sub?: string;
  delay?: number;
}) => (
  <div
    className="stat-card fade-in"
    style={{ '--card-color': color, animationDelay: `${delay || 0}ms` } as any}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        style={{ background: iconBg }}
      >
        <Icon className="w-5.5 h-5.5" style={{ color }} />
      </div>
      <Badge variant="outline" className="text-[10px] font-semibold border-gray-200 text-gray-400">
        Today
      </Badge>
    </div>
    <p className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{value}</p>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-900 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-indigo-600">{payload[0].value} students present</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const school = (() => {
    try { return JSON.parse(localStorage.getItem('school') || '{}'); } catch { return {}; }
  })();
  const teacher = (() => {
    try { return JSON.parse(localStorage.getItem('teacher') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/attendance/stats');
      setStats(res.data);
    } catch {
      setStats({ totalStudents: 0, PRESENT: 0, ABSENT: 0, LATE: 0, notMarked: 0, weeklyTrend: [] });
    } finally {
      setLoading(false);
    }
  };

  const attendancePct = stats && stats.totalStudents > 0
    ? Math.round(((stats.PRESENT + stats.LATE) / stats.totalStudents) * 100)
    : 0;

  const statCards = stats
    ? [
        { icon: Users, label: 'Total Students', value: stats.totalStudents, color: '#6366f1', bgColor: '#eef2ff', iconBg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', sub: school?.name || 'Your school' },
        { icon: CalendarCheck, label: 'Present Today', value: stats.PRESENT, color: '#10b981', bgColor: '#ecfdf5', iconBg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', sub: `${attendancePct}% attendance rate` },
        { icon: UserX, label: 'Absent Today', value: stats.ABSENT, color: '#ef4444', bgColor: '#fef2f2', iconBg: 'linear-gradient(135deg, #fef2f2, #fecaca)', sub: stats.ABSENT === 0 ? 'Full house! 🎉' : 'Follow up needed' },
        { icon: Clock, label: 'Late / Not Marked', value: stats.LATE + stats.notMarked, color: '#f59e0b', bgColor: '#fffbeb', iconBg: 'linear-gradient(135deg, #fffbeb, #fde68a)', sub: `${stats.LATE} late, ${stats.notMarked} not marked` },
      ]
    : [];

  // Prepare chart data
  const chartData = stats?.weeklyTrend?.map((item) => ({
    name: new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    present: item.presentCount,
    date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  })) || [];

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good Morning' : greetHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {greeting}, {teacher?.name?.split(' ')[0] || 'Teacher'}
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            onClick={() => navigate('/attendance')}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shrink-0 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all shine btn-glow"
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-28" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 80} />
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-day trend chart */}
          <Card className="lg:col-span-2 border-gray-100/80 shadow-sm hover:shadow-md transition-shadow fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    7-Day Attendance Trend
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1 ml-9">Students present per day</p>
                </div>
                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100 text-[10px] font-semibold">
                  This Week
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="present"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#colorPresent)"
                      dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No data yet</p>
                    <p className="text-gray-300 text-xs mt-0.5">Mark attendance to see trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-100/80 shadow-sm hover:shadow-md transition-shadow fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { label: "Mark Today's Attendance", path: '/attendance', icon: CalendarCheck, gradient: 'from-indigo-50 to-blue-50', text: 'text-indigo-700', hover: 'hover:from-indigo-100 hover:to-blue-100', iconColor: 'text-indigo-500' },
                { label: 'Add New Student', path: '/students', icon: Users, gradient: 'from-emerald-50 to-green-50', text: 'text-emerald-700', hover: 'hover:from-emerald-100 hover:to-green-100', iconColor: 'text-emerald-500' },
                { label: 'View Monthly Report', path: '/reports', icon: BookOpen, gradient: 'from-amber-50 to-orange-50', text: 'text-amber-700', hover: 'hover:from-amber-100 hover:to-orange-100', iconColor: 'text-amber-500' },
                { label: 'Manage Students', path: '/students', icon: Users, gradient: 'from-violet-50 to-purple-50', text: 'text-violet-700', hover: 'hover:from-violet-100 hover:to-purple-100', iconColor: 'text-violet-500' },
              ].map(({ label, path, icon: Icon, gradient, text, hover, iconColor }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-r ${gradient} ${text} ${hover} group`}
                    >
                      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                      <span className="flex-1 text-left">{label}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    <p>Go to {label.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Attendance % Banner */}
        {stats && stats.totalStudents > 0 && (
          <Card className="border-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 shadow-sm fade-in" style={{ animationDelay: '500ms' }}>
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Today's Attendance Rate
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {stats.PRESENT + stats.LATE} of {stats.totalStudents} students are present
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Progress
                  value={attendancePct}
                  className="w-full sm:w-48 h-2.5"
                />
                <span className={`text-2xl font-extrabold tracking-tight w-16 text-right ${
                  attendancePct >= 75 ? 'text-green-600' : attendancePct >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {attendancePct}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
