import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ActivityLogger } from '@/lib/activity-logger';

// Gunakan fungsi validasi email yang sama
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (email.length > 254) return false;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  // Minimal 6 karakter
  return password && password.length >= 6;
}

function isValidRole(role: string): boolean {
  return ['admin', 'teacher', 'student'].includes(role);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    let { email, password, full_name, role, grade } = body;

    console.log('Registration attempt:', { 
      email: email, 
      full_name: full_name,
      role: role,
      grade: grade,
      passwordLength: password?.length 
    });

    // Validasi input dasar
    if (!email || !password || !full_name) {
      console.log('Missing required fields');
      return NextResponse.json(
        { 
          success: false,
          error: 'Email, password, dan nama lengkap wajib diisi' 
        },
        { status: 400 }
      );
    }

    // Normalize input
    email = email.toString().toLowerCase().trim();
    password = password.toString();
    full_name = full_name.toString().trim();
    role = role ? role.toString().toLowerCase().trim() : 'student';
    grade = grade ? grade.toString().trim() : null;

    console.log('Normalized data:', { email, full_name, role, grade });

    // Validasi format email
    if (!isValidEmail(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { 
          success: false,
          error: 'Format email tidak valid' 
        },
        { status: 400 }
      );
    }

    // Validasi password
    if (!isValidPassword(password)) {
      console.log('Invalid password');
      return NextResponse.json(
        { 
          success: false,
          error: 'Password minimal 6 karakter' 
        },
        { status: 400 }
      );
    }

    // Validasi role
    if (!isValidRole(role)) {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { 
          success: false,
          error: 'Role tidak valid. Gunakan: student, teacher, atau admin' 
        },
        { status: 400 }
      );
    }

    // Validasi grade untuk student
    if (role === 'student' && !grade) {
      console.log('Missing grade for student');
      return NextResponse.json(
        { 
          success: false,
          error: 'Kelas wajib diisi untuk siswa' 
        },
        { status: 400 }
      );
    }

    // Validasi nama lengkap
    if (full_name.length < 2) {
      console.log('Invalid full_name');
      return NextResponse.json(
        { 
          success: false,
          error: 'Nama lengkap minimal 2 karakter' 
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    console.log('Checking if email exists:', email);
    const existingUser = await prisma.users.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log('Email already exists:', email);
      return NextResponse.json(
        { 
          success: false,
          error: 'Email sudah terdaftar' 
        },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat user baru
    console.log('Creating new user...');
    const newUser = await prisma.users.create({
      data: {
        email,
        full_name,
        hash_password: hashedPassword,
        role,
        grade: grade || null,
        avatar_url: null
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        grade: true,
        role: true,
        avatar_url: true,
        created_at: true
      }
    });

    console.log('User created successfully:', newUser.id);

    // Buat token wallet untuk user baru
    try {
      await prisma.tokens.create({
        data: {
          user_id: newUser.id,
          amount: 0
        }
      });
      console.log('Token wallet created for user:', newUser.id);
    } catch (tokenError) {
      console.error('Failed to create token wallet:', tokenError);
      // Continue with registration even if token creation fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'kelasinaja-secret-key',
      { expiresIn: '7d' }
    );

    // Log successful registration
    try {
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await ActivityLogger.log({
        userId: newUser.id,
        userName: newUser.full_name || newUser.email,
        userEmail: newUser.email,
        userRole: newUser.role,
        action: 'User registered successfully',
        actionType: 'CREATE',
        resourceType: 'user',
        resourceId: newUser.id,
        ipAddress: clientIp,
        userAgent,
        details: {
          registrationMethod: 'form',
          role: newUser.role,
          grade: newUser.grade
        }
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail registration if logging fails
    }

    console.log('Registration successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil!',
      user: newUser,
      token
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email sudah terdaftar' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server. Silakan coba lagi.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}