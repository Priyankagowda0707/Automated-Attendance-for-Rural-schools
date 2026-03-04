import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '@/services/api';

interface HistoryItem {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

interface StudentInfo {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function AttendanceHistory() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth()));
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    fetchHistory();
  }, [studentId, month, year]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/student/${studentId}`, {
        params: { month: Number(month) + 1, year: Number(year) },
      });
      setStudent(res.data.student || null);
      setHistory(res.data.attendance || []);
    } catch {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    present: history.filter((h) => h.status === 'PRESENT').length,
    absent: history.filter((h) => h.status === 'ABSENT').length,
    late: history.filter((h) => h.status === 'LATE').length,
  };
  const totalDays = history.length;
  const attendancePct = totalDays > 0 ? Math.round(((counts.present + counts.late) / totalDays) * 100) : 0;

  // Generate calendar grid
  const selectedMonth = Number(month);
  const selectedYear = Number(year);
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const historyMap: Record<number, string> = {};
  history.forEach((h) => {
    const d = new Date(h.date).getDate();
    historyMap[d] = h.status;
  });

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return { bg: 'bg-green-500', ring: 'ring-green-200', icon: '✓', textColor: 'text-white' };
      case 'ABSENT':
        return { bg: 'bg-red-500', ring: 'ring-red-200', icon: '✗', textColor: 'text-white' };
      case 'LATE':
        return { bg: 'bg-amber-500', ring: 'ring-amber-200', icon: '⏱', textColor: 'text-white' };
      default:
        return { bg: 'bg-gray-100', ring: '', icon: '', textColor: 'text-gray-400' };
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Back & Header */}
        <div className="flex items-center gap-3 fade-in">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
              </div>
              Attendance History
            </h1>
          </div>
        </div>

        {/* Student info card */}
        {loading ? (
          <Card className="border-gray-100/80 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>
        ) : student && (
          <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-14 h-14 flex-shrink-0">
                <AvatarFallback className="text-lg font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-500">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{student.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 text-xs font-semibold">
                    Class {student.class}-{student.section}
                  </Badge>
                  <Badge variant="outline" className="text-gray-500 border-gray-200 text-xs font-semibold">
                    Roll #{student.rollNo}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-extrabold tracking-tight ${attendancePct >= 75 ? 'text-green-600' : attendancePct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {attendancePct}%
                </p>
                <p className="text-xs text-gray-400 font-semibold">Monthly Attendance</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month/Year selector + Summary stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 fade-in" style={{ animationDelay: '200ms' }}>
          {/* Selector */}
          <Card className="border-gray-100/80 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Select Period</p>
              <div className="flex gap-3">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="flex-1 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-28 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue /></SelectTrigger>
                  <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <Card className="border-green-100/80 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
            <CardContent className="p-5 flex items-center justify-between h-full">
              <div>
                <p className="text-2xl font-extrabold text-green-700 tracking-tight">{counts.present}</p>
                <p className="text-xs text-green-600/60 font-semibold mt-0.5">Days Present</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-red-100/80 bg-gradient-to-br from-red-50/50 to-rose-50/30">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-xl font-extrabold text-red-700 tracking-tight">{counts.absent}</p>
                <p className="text-[10px] text-red-600/60 font-semibold mt-0.5">Absent</p>
              </CardContent>
            </Card>
            <Card className="border-amber-100/80 bg-gradient-to-br from-amber-50/50 to-yellow-50/30">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-xl font-extrabold text-amber-700 tracking-tight">{counts.late}</p>
                <p className="text-[10px] text-amber-600/60 font-semibold mt-0.5">Late</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attendance Progress bar */}
        {!loading && totalDays > 0 && (
          <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '250ms' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Overall Attendance
                </p>
                <p className={`font-bold text-sm ${attendancePct >= 75 ? 'text-green-600' : attendancePct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {counts.present + counts.late} / {totalDays} days ({attendancePct}%)
                </p>
              </div>
              <Progress value={attendancePct} className="h-3" />
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[11px] text-gray-500 font-medium">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-[11px] text-gray-500 font-medium">Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-gray-500 font-medium">Late</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar grid */}
        <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              {MONTHS[selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayLabels.map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    const status = historyMap[day];
                    const config = getStatusConfig(status);

                    return (
                      <Tooltip key={day}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-default ${config.bg} ${config.textColor} ${
                              status ? `ring-2 ${config.ring} shadow-sm` : ''
                            }`}
                          >
                            {status ? config.icon : day}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">
                            {MONTHS[selectedMonth]} {day}: {status || 'Not Marked'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
