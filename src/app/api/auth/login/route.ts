import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email dan password wajib diisi' 
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format email tidak valid' 
        },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        full_name: true,
        grade: true,
        role: true,
        hash_password: true,
        avatar_url: true,
        created_at: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email atau password salah' 
        },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.hash_password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email atau password salah' 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'kelasinaja-secret-key',
      { expiresIn: '7d' }
    );

    // Response sukses (tanpa hash_password)
    const { hash_password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: userWithoutPassword,
      token
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server. Silakan coba lagi.' 
      },
      { status: 500 }
    );
  }
}