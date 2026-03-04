import { Response } from 'express';
import { PrismaClient, AttendanceStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// POST /api/attendance/bulk - Mark attendance for multiple students at once
export const bulkMarkAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { records, date } = req.body as {
      records: { studentId: string; status: AttendanceStatus }[];
      date: string;
    };

    if (!records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ message: 'Records array is required' });
      return;
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(12, 0, 0, 0); // Normalize to noon

    // Use upsert to handle re-submissions
    const results = await prisma.$transaction(
      records.map(({ studentId, status }) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId,
              date: attendanceDate,
            },
          },
          update: { status, teacherId: req.user!.id },
          create: { studentId, status, date: attendanceDate, teacherId: req.user!.id },
        })
      )
    );

    res.status(200).json({ message: `Attendance marked for ${results.length} students`, data: results });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/attendance - Single mark (kept for backward compat)
export const markAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { date, status, studentId } = req.body;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId, date: attendanceDate } },
      update: { status, teacherId: req.user!.id },
      create: { date: attendanceDate, status, studentId, teacherId: req.user!.id },
    });
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/attendance/stats - Today's stats for the school dashboard
export const getAttendanceStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const schoolId = req.user!.schoolId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all students in school
    const totalStudents = await prisma.student.count({ where: { schoolId } });

    // Get today's attendance for this school's students
    const todayAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: { gte: today, lt: tomorrow },
        student: { schoolId },
      },
      _count: { status: true },
    });

    const stats = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    todayAttendance.forEach((a) => { stats[a.status] = a._count.status; });
    const marked = stats.PRESENT + stats.ABSENT + stats.LATE;
    const notMarked = totalStudents - marked;

    // 7-day trend
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyRaw = await prisma.attendance.findMany({
      where: {
        date: { gte: sevenDaysAgo, lt: tomorrow },
        student: { schoolId },
        status: 'PRESENT',
      },
      select: { date: true },
    });

    // Build trend map
    const trendMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      trendMap[d.toISOString().split('T')[0]] = 0;
    }
    weeklyRaw.forEach((a) => {
      const key = new Date(a.date).toISOString().split('T')[0];
      if (trendMap[key] !== undefined) trendMap[key]++;
    });

    const weeklyTrend = Object.entries(trendMap).map(([date, presentCount]) => ({
      date,
      presentCount,
    }));

    res.json({ totalStudents, ...stats, notMarked, weeklyTrend });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/attendance/report - Per-student report for a date range
export const getAttendanceReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { class: cls, section, dateFrom, dateTo } = req.query;
    const schoolId = req.user!.schoolId;

    const from = dateFrom ? new Date(dateFrom as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = dateTo ? new Date(dateTo as string) : new Date();
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const studentWhere: any = { schoolId };
    if (cls) studentWhere.class = cls as string;
    if (section) studentWhere.section = section as string;

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        attendance: {
          where: { date: { gte: from, lte: to } },
          select: { status: true, date: true },
        },
      },
      orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
    });

    const report = students.map((student) => {
      const present = student.attendance.filter((a) => a.status === 'PRESENT').length;
      const absent = student.attendance.filter((a) => a.status === 'ABSENT').length;
      const late = student.attendance.filter((a) => a.status === 'LATE').length;
      const total = present + absent + late;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      return {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        section: student.section,
        present,
        absent,
        late,
        total,
        percentage,
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/attendance/student/:studentId - Single student attendance history
export const getStudentAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    const from = new Date(targetYear, targetMonth, 1);
    const to = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const attendance = await prisma.attendance.findMany({
      where: { studentId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    });
    res.json(attendance);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/attendance/class - Class attendance for a given date (existing)
export const getClassAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { class: studentClass, section, date } = req.query;
    if (!studentClass || !date) {
      res.status(400).json({ message: 'Class and date are required' });
      return;
    }

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      date: { gte: targetDate, lte: endOfDay },
      student: { class: studentClass as string, schoolId: req.user!.schoolId },
    };
    if (section) where.student.section = section as string;

    const attendance = await prisma.attendance.findMany({
      where,
      include: { student: true },
    });
    res.json(attendance);
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
