import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { toast } from 'sonner';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import api from '@/services/api';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE';
}

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function MarkAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [fetched, setFetched] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select a class and section');
      return;
    }
    setLoading(true);
    setFetched(false);
    try {
      const [studentsRes, todayAttendanceRes] = await Promise.all([
        api.get('/students', { params: { class: selectedClass, section: selectedSection } }),
        api.get('/attendance/class', {
          params: {
            class: selectedClass,
            section: selectedSection,
            date: new Date().toISOString().split('T')[0],
          },
        }),
      ]);

      const existingMap: Record<string, string> = {};
      (todayAttendanceRes.data as any[]).forEach((a) => { existingMap[a.studentId] = a.status; });

      const hasMarked = todayAttendanceRes.data.length > 0;
      setAlreadyMarked(hasMarked);

      const mapped = (studentsRes.data as any[]).map((s) => ({
        ...s,
        attendanceStatus: (existingMap[s.id] as 'PRESENT' | 'ABSENT' | 'LATE') || 'PRESENT',
      }));
      setStudents(mapped);
      setFetched(true);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, attendanceStatus: status } : s));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendanceStatus: status })));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/attendance/bulk', {
        records: students.map(({ id, attendanceStatus }) => ({ studentId: id, status: attendanceStatus })),
        date: new Date().toISOString(),
      });
      toast.success(`Attendance submitted for ${students.length} students!`);
      setAlreadyMarked(true);
    } catch {
      toast.error('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const counts = useMemo(() => ({
    present: students.filter((s) => s.attendanceStatus === 'PRESENT').length,
    absent: students.filter((s) => s.attendanceStatus === 'ABSENT').length,
    late: students.filter((s) => s.attendanceStatus === 'LATE').length,
  }), [students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
          </div>
          Mark Attendance
        </h1>
        <p className="text-gray-500 text-sm mt-1 ml-[46px]">{today}</p>
      </div>

      {/* Class Selector */}
      <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '100ms' }}>
        <CardContent className="p-5">
          <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Select Class & Section</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Class</p>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>{CLASSES.map((c) => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Section</p>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-36 h-10 rounded-xl bg-gray-50/80 border-gray-200/60"><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button
              onClick={fetchStudents}
              disabled={loading}
              className="h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 shine"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</> : 'Load Students'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Already Marked Banner */}
      {fetched && alreadyMarked && (
        <Alert className="border-amber-200 bg-amber-50/80 fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm font-medium ml-2">
            Attendance was already marked for Class {selectedClass}-{selectedSection} today. You can still update it below.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary + Action Bar */}
      {fetched && students.length > 0 && (
        <div className="space-y-4 fade-in" style={{ animationDelay: '150ms' }}>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-green-100 bg-gradient-to-br from-green-50/80 to-emerald-50/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-green-700 tracking-tight">{counts.present}</p>
                  <p className="text-xs text-green-600/70 font-semibold">Present</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-gradient-to-br from-red-50/80 to-rose-50/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-red-700 tracking-tight">{counts.absent}</p>
                  <p className="text-xs text-red-600/70 font-semibold">Absent</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-100 bg-gradient-to-br from-amber-50/80 to-yellow-50/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-amber-700 tracking-tight">{counts.late}</p>
                  <p className="text-xs text-amber-600/70 font-semibold">Late</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll('PRESENT')} className="text-green-700 border-green-200 hover:bg-green-50 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll('ABSENT')} className="text-red-700 border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5 mr-1" /> All Absent
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 shine btn-glow"
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4 mr-2" /> Submit Attendance</>}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {fetched && (
        <Card className="border-gray-100/80 shadow-sm overflow-hidden fade-in" style={{ animationDelay: '200ms' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 font-bold text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50/80">Roll No.</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50/80">Student Name</TableHead>
                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50/80">Attendance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="empty-state py-12">
                      <div className="icon-container">
                        <CalendarCheck />
                      </div>
                      <p className="text-gray-600 font-semibold">No students found</p>
                      <p className="text-gray-400 text-sm mt-0.5">No students in Class {selectedClass}-{selectedSection}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className={`transition-all duration-200 ${
                    student.attendanceStatus === 'PRESENT' ? 'attendance-row-present' :
                    student.attendanceStatus === 'ABSENT' ? 'attendance-row-absent' : 'attendance-row-late'
                  }`}>
                    <TableCell className="font-mono text-xs text-gray-400 font-semibold">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-[10px] font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-500">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`status-btn status-btn-present ${student.attendanceStatus === 'PRESENT' ? 'active' : ''}`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`status-btn status-btn-absent ${student.attendanceStatus === 'ABSENT' ? 'active' : ''}`}
                        >
                          ✗ Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          className={`status-btn status-btn-late ${student.attendanceStatus === 'LATE' ? 'active' : ''}`}
                        >
                          ⏱ Late
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty / Initial state */}
      {!fetched && !loading && (
        <Card className="border-gray-100/80 shadow-sm fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent>
            <div className="empty-state">
              <div className="icon-container">
                <Sparkles />
              </div>
              <p className="text-gray-600 font-semibold text-base">Select a class and section</p>
              <p className="text-gray-400 text-sm mt-1">Start marking attendance by selecting a class above</p>
              <p className="text-gray-300 text-xs mt-2">All changes are saved on submit</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
