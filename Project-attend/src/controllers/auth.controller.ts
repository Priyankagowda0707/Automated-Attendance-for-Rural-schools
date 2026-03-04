import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'attendance_system_secret_rural_schools_2024';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, schoolName, schoolAddress } = req.body;

    if (!name || !email || !password || !schoolName) {
      res.status(400).json({ message: 'Name, email, password, and school name are required' });
      return;
    }

    // Check if teacher already exists
    const existingUser = await prisma.teacher.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    // Find or create school
    let school = await prisma.school.findFirst({ where: { name: schoolName } });
    if (!school) {
      school = await prisma.school.create({
        data: { name: schoolName, address: schoolAddress || '' },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        schoolId: school.id,
      },
    });

    const token = jwt.sign({ id: teacher.id, schoolId: school.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
      school: { id: school.id, name: school.name },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: { school: true },
    });

    if (!teacher) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: teacher.id, schoolId: teacher.schoolId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
      school: { id: teacher.school.id, name: teacher.school.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.user.id },
      include: { school: true },
      omit: { password: true },
    } as any);

    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }
    res.json(teacher);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
