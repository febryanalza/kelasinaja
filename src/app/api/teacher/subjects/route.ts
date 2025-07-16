import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token akses diperlukan' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Get all subjects
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        title: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      subjects
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data mata pelajaran' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token akses diperlukan' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded || (!['teacher', 'admin'].includes(decoded.role))) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Judul mata pelajaran diperlukan' },
        { status: 400 }
      );
    }

    // Check if subject already exists
    const existingSubject = await prisma.subject.findFirst({
      where: {
        title: {
          equals: title,
          mode: 'insensitive'
        }
      }
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Mata pelajaran sudah ada' },
        { status: 409 }
      );
    }

    // Create new subject
    const newSubject = await prisma.subject.create({
      data: {
        title: title.trim()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mata pelajaran berhasil ditambahkan',
      subject: newSubject
    });

  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menambahkan mata pelajaran' 
      },
      { status: 500 }
    );
  }
}