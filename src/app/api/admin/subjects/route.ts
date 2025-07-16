import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';

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
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }

    const subjects = await prisma.subject.findMany({
      include: {
        videos_videos_subjectTosubject: {
          select: {
            id: true
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      title: subject.title,
      video_count: subject.videos_videos_subjectTosubject.length
    }));

    return NextResponse.json({
      success: true,
      subjects: formattedSubjects
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data subjects' 
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
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Nama subject tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Check if subject already exists
    const existingSubject = await prisma.subject.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject dengan nama tersebut sudah ada' },
        { status: 409 }
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        title: title.trim()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject berhasil ditambahkan',
      subject: newSubject
    });

  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menambahkan subject' 
      },
      { status: 500 }
    );
  }
}