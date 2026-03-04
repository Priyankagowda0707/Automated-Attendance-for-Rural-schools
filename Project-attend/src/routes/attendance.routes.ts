import express from 'express';
import {
  markAttendance,
  bulkMarkAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStats,
  getAttendanceReport,
} from '../controllers/attendance.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All attendance routes require authentication

router.get('/stats', getAttendanceStats);
router.get('/report', getAttendanceReport);
router.get('/student/:studentId', getStudentAttendance);
router.get('/class', getClassAttendance);
router.post('/', markAttendance);
router.post('/bulk', bulkMarkAttendance);

export default router;
