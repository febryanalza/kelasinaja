import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isTeacher } from '@/lib/auth';

interface Chapter {
  id: string;
  title: string;
  duration: string;
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
    if (!decoded || (!isTeacher(decoded.role) && decoded.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya guru yang dapat mengunggah video' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      subject,
      grade,
      price,
      video_url,
      thumbnail_url,
      instructor,
      duration,
      rating,
      views,
      chapters
    } = await request.json();

    // Validasi input required
    if (!title || !subject || !grade || !video_url || !instructor || !duration) {
      return NextResponse.json(
        { 
          error: 'Field wajib: title, subject, grade, video_url, instructor, dan duration harus diisi' 
        },
        { status: 400 }
      );
    }

    // Validasi URL video
    try {
      new URL(video_url);
    } catch {
      return NextResponse.json(
        { error: 'URL video tidak valid' },
        { status: 400 }
      );
    }

    // Validasi URL thumbnail jika ada
    if (thumbnail_url) {
      try {
        new URL(thumbnail_url);
      } catch {
        return NextResponse.json(
          { error: 'URL thumbnail tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validasi price
    const videoPrice = parseFloat(price) || 0;
    if (videoPrice < 0) {
      return NextResponse.json(
        { error: 'Harga tidak boleh negatif' },
        { status: 400 }
      );
    }

    // Validasi rating
    const videoRating = parseFloat(rating) || 0;
    if (videoRating < 0 || videoRating > 5) {
      return NextResponse.json(
        { error: 'Rating harus antara 0-5' },
        { status: 400 }
      );
    }

    // Validasi views
    const videoViews = parseInt(views) || 0;
    if (videoViews < 0) {
      return NextResponse.json(
        { error: 'Jumlah views tidak boleh negatif' },
        { status: 400 }
      );
    }

    // Check if subject exists or create new one
    let subjectRecord = await prisma.subject.findFirst({
      where: {
        title: {
          equals: subject,
          mode: 'insensitive'
        }
      }
    });

    if (!subjectRecord) {
      subjectRecord = await prisma.subject.create({
        data: {
          title: subject
        }
      });
    }

    // Validate chapters format if provided
    let validatedChapters: Chapter[] = [];
    if (chapters && Array.isArray(chapters)) {
      validatedChapters = chapters.filter((chapter: any) => 
        chapter.title && chapter.duration
      );
    }

    // Create video record in database
    const newVideo = await prisma.videos.create({
      data: {
        title,
        description: description || null,
        grade,
        thumbnail: thumbnail_url || null,
        video_url,
        price: videoPrice,
        views: videoViews,
        rating: videoRating,
        teacher_id: decoded.userId,
        subject: subjectRecord.id,
        // Store additional fields in JSON format if your schema supports it
        // If not, you might need to add these fields to your schema
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        },
        subject_videos_subjectTosubject: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // If you have a separate chapters table, create chapter records
    // For now, we'll return the chapters in the response
    // You might want to create a separate chapters table and relate it to videos

    return NextResponse.json({
      success: true,
      message: 'Video berhasil diunggah!',
      video: {
        id: newVideo.id,
        title: newVideo.title,
        description: newVideo.description,
        grade: newVideo.grade,
        thumbnail: newVideo.thumbnail,
        video_url: newVideo.video_url,
        price: Number(newVideo.price),
        views: newVideo.views,
        rating: Number(newVideo.rating),
        teacher: {
          id: newVideo.users.id,
          name: newVideo.users.full_name,
          email: newVideo.users.email
        },
        subject: {
          id: newVideo.subject_videos_subjectTosubject.id,
          title: newVideo.subject_videos_subjectTosubject.title
        },
        instructor,
        duration,
        chapters: validatedChapters,
        created_at: newVideo.created_at.toISOString(),
        updated_at: newVideo.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error uploading video:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Video dengan judul yang sama sudah ada' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengunggah video',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}