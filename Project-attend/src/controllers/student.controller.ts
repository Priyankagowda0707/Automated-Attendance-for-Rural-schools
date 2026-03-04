import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { class: cls, section } = req.query;
    const where: any = { schoolId: req.user!.schoolId };
    if (cls) where.class = cls as string;
    if (section) where.section = section as string;

    const students = await prisma.student.findMany({
      where,
      orderBy: [{ class: 'asc' }, { rollNo: 'asc' }],
    });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, rollNo, class: cls, section, gender, parentPhone } = req.body;

    if (!name || !rollNo || !cls || !section) {
      res.status(400).json({ message: 'Name, roll number, class, and section are required' });
      return;
    }

    const existing = await prisma.student.findFirst({
      where: { rollNo, class: cls, section, schoolId: req.user!.schoolId },
    });
    if (existing) {
      res.status(400).json({ message: `Roll number ${rollNo} already exists in Class ${cls}-${section}` });
      return;
    }

    const student = await prisma.student.create({
      data: {
        name, rollNo, class: cls, section,
        gender: gender || null,
        parentPhone: parentPhone || null,
        schoolId: req.user!.schoolId,
      },
    });
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.student.findFirst({ where: { id, schoolId: req.user!.schoolId } });
    if (!existing) { res.status(404).json({ message: 'Student not found' }); return; }

    const { name, rollNo, class: cls, section, gender, parentPhone } = req.body;
    const updated = await prisma.student.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        rollNo: rollNo ?? existing.rollNo,
        class: cls ?? existing.class,
        section: section ?? existing.section,
        gender: gender !== undefined ? gender : (existing as any).gender,
        parentPhone: parentPhone !== undefined ? parentPhone : existing.parentPhone,
      } as any,
    });
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.student.findFirst({ where: { id, schoolId: req.user!.schoolId } });
    if (!existing) { res.status(404).json({ message: 'Student not found' }); return; }

    await prisma.student.delete({ where: { id } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
