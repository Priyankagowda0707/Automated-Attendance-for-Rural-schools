import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart3, Download, Loader2, TrendingUp, Users, AlertTriangle, TableIcon, BarChart } from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell,
} from 'recharts';
import api from '@/services/api';

interface ReportRow {
  id: string; name: string; rollNo: string;
  class: string; section: string;
  present: number; absent: number; late: number;
  total: number; percentage: number;
}

const CLASSES = ['1','2','3','4','5','6','7','8'];
const SECTIONS = ['A','B','C','D'];

const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].payload.percentage >= 75 ? '#10b981' : payload[0].payload.percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
          {payload[0].value}% attendance
        </p>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = { dateFrom, dateTo };
      if (filterClass !== 'all') params.class = filterClass;
      if (filterSection !== 'all') params.section = filterSection;
      const res = await api.get('/attendance/report', { params });
      setReport(res.data);
    } catch {
      toast.error('Failed to fetch report');
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (report.length === 0) { toast.error('No data to export'); return; }
    const header = 'Roll No,Name,Class,Section,Present,Absent,Late,Total Days,Attendance %\n';
    const rows = report.map((r) =>
      `${r.rollNo},${r.name},${r.class},${r.section},${r.present},${r.absent},${r.late},${r.total},${r.percentage}%`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV');
  };

  const avg = report.length > 0
    ? Math.round(report.reduce((s, r) => s + r.percentage, 0) / report.length)
    : 0;

  const belowThreshold = report.filter((r) => r.percentage < 75).length;

  // Chart data
  const chartData = report.slice(0, 20).map((r) => ({
    name: r.name.split(' ')[0],
    percentage: r.percentage,
    fullName: r.name,
  }));

  const getBarColor = (pct: number) => pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-in">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              Attendance Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-[46px]">Per-student attendance summary & analytics</p>
          </div>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0 rounded-xl font-semibold shadow-sm group"
          >
            <Download className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Filters</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">From Date</p>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 w-40 rounded-xl bg-gray-50/80 border-gray-200/60 text-sm" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">To Date</p>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 w-40 rounded-xl bg-gray-50/80 border-gray-200/60 text-sm" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Class</p>
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue placeholder="All Classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {CLASSES.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Section</p>
                <Select value={filterSection} onValueChange={setFilterSection}>
                  <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue placeholder="All Sections" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {SECTIONS.map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchReport} className="h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 shine" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</> : 'Generate Report'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        {!loading && report.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in" style={{ animationDelay: '150ms' }}>
            <Card className="border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 to-violet-50/30">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-indigo-700 tracking-tight">{report.length}</p>
                  <p className="text-xs text-indigo-600/60 font-semibold mt-0.5">Students Tracked</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
            <Card className={`border-gray-100/80 ${avg >= 75 ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/30' : avg >= 60 ? 'bg-gradient-to-br from-amber-50/50 to-yellow-50/30' : 'bg-gradient-to-br from-red-50/50 to-rose-50/30'}`}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-extrabold tracking-tight ${avg >= 75 ? 'text-green-700' : avg >= 60 ? 'text-amber-700' : 'text-red-700'}`}>{avg}%</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Avg. Attendance</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${avg >= 75 ? 'bg-green-100' : avg >= 60 ? 'bg-amber-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`w-6 h-6 ${avg >= 75 ? 'text-green-600' : avg >= 60 ? 'text-amber-600' : 'text-red-600'}`} />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-100/80 bg-gradient-to-br from-red-50/50 to-rose-50/30">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-red-700 tracking-tight">{belowThreshold}</p>
                  <p className="text-xs text-red-600/60 font-semibold mt-0.5">Below 75% Attendance</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabbed view: Table + Chart */}
        <Tabs defaultValue="table" className="fade-in" style={{ animationDelay: '250ms' }}>
          <TabsList className="bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger value="table" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:shadow-sm">
              <TableIcon className="w-3.5 h-3.5" /> Table View
            </TabsTrigger>
            <TabsTrigger value="chart" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:shadow-sm">
              <BarChart className="w-3.5 h-3.5" /> Chart View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-4">
            <Card className="border-gray-100/80 shadow-sm overflow-hidden">
              <Table className="data-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-right">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(8)].map((__, j) => (
                          <TableCell key={j}><Skeleton className="h-4 rounded w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : report.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div className="empty-state py-16">
                          <div className="icon-container">
                            <TrendingUp />
                          </div>
                          <p className="text-gray-600 font-semibold">No data found</p>
                          <p className="text-gray-400 text-sm mt-0.5">Adjust filters and generate report</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.map((row) => (
                      <TableRow key={row.id} className="group">
                        <TableCell className="font-mono text-xs text-gray-400 font-semibold">{row.rollNo}</TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">{row.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 text-xs font-semibold">
                            {row.class}-{row.section}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="badge-present">{row.present}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="badge-absent">{row.absent}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="badge-late">{row.late}</span>
                        </TableCell>
                        <TableCell className="text-center text-gray-500 text-sm font-medium">{row.total}</TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-end gap-2.5 cursor-default">
                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${row.percentage}%`,
                                      background: getBarColor(row.percentage),
                                    }}
                                  />
                                </div>
                                <span className={`text-sm font-bold tabular-nums w-12 text-right ${
                                  row.percentage >= 75 ? 'text-green-600' : row.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {row.percentage}%
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{row.present} present, {row.absent} absent, {row.late} late out of {row.total} days</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <Card className="border-gray-100/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">Student Attendance Overview</CardTitle>
                <p className="text-xs text-gray-400">Top 20 students by roll number</p>
              </CardHeader>
              <CardContent className="pt-2 pb-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsBarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">No data to display</p>
                      <p className="text-gray-300 text-xs mt-0.5">Generate a report first</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
