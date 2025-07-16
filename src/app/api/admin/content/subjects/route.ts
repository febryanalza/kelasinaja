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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search ? {
      title: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {};

    // Get subjects with pagination and video count
    const [subjects, totalCount] = await Promise.all([
      prisma.subject.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          videos_videos_subjectTosubject: {
            select: {
              id: true
            }
          }
        },
        orderBy: { title: 'asc' },
        skip: offset,
        take: limit
      }),
      prisma.subject.count({ where: whereClause })
    ]);

    // Format subjects with video count
    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      title: subject.title,
      video_count: subject.videos_videos_subjectTosubject.length,
      created_at: new Date().toISOString() // Note: schema doesn't have created_at, using current date
    }));

    return NextResponse.json({
      success: true,
      subjects: formattedSubjects,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data subject' 
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

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nama subject tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (title.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama subject minimal 2 karakter' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: 'Nama subject maksimal 100 karakter' },
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

    // Create new subject
    const newSubject = await prisma.subject.create({
      data: {
        title: title.trim()
      },
      select: {
        id: true,
        title: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject berhasil ditambahkan',
      subject: {
        ...newSubject,
        video_count: 0,
        created_at: new Date().toISOString()
      }
    }, { status: 201 });

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

export async function PUT(request: NextRequest) {
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

    const { id, title } = await request.json();

    // Validation
    if (!id || !title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'ID dan nama subject tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (title.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nama subject minimal 2 karakter' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: 'Nama subject maksimal 100 karakter' },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: 'Subject tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if another subject with same title exists
    const duplicateSubject = await prisma.subject.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: 'insensitive'
        },
        id: {
          not: id
        }
      }
    });

    if (duplicateSubject) {
      return NextResponse.json(
        { error: 'Subject dengan nama tersebut sudah ada' },
        { status: 409 }
      );
    }

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        title: title.trim()
      },
      select: {
        id: true,
        title: true,
        videos_videos_subjectTosubject: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject berhasil diperbarui',
      subject: {
        id: updatedSubject.id,
        title: updatedSubject.title,
        video_count: updatedSubject.videos_videos_subjectTosubject.length,
        created_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat memperbarui subject' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID subject diperlukan' },
        { status: 400 }
      );
    }

    // Check if subject exists and has videos
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        videos_videos_subjectTosubject: {
          select: { id: true }
        }
      }
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: 'Subject tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if subject has videos
    if (existingSubject.videos_videos_subjectTosubject.length > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus subject yang masih memiliki video. Hapus video terlebih dahulu.' 
        },
        { status: 409 }
      );
    }

    // Delete subject
    await prisma.subject.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus subject' 
      },
      { status: 500 }
    );
  }
}