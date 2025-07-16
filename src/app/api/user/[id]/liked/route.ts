import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    // Ambil liked videos dengan detail video dan subject
    const likedData = await prisma.liked_videos.findMany({
      where: { user_id: params.id },
      include: {
        videos: {
          include: {
            subject_videos_subjectTosubject: {
              select: { title: true }
            },
            users: {
              select: { full_name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format data sesuai interface Video
    const formattedVideos = likedData.map(liked => ({
      id: liked.videos.id,
      title: liked.videos.title,
      description: liked.videos.description,
      subject: liked.videos.subject_videos_subjectTosubject.title,
      grade: liked.videos.grade,
      thumbnail: liked.videos.thumbnail || '/images/integral.jpg',
      video_url: liked.videos.video_url,
      price: Number(liked.videos.price) || 0,
      views: liked.videos.views || 0,
      rating: Number(liked.videos.rating) || 0,
      teacher_id: liked.videos.teacher_id,
      teacher_name: liked.videos.users.full_name,
      created_at: liked.videos.created_at.toISOString(),
      updated_at: liked.videos.updated_at.toISOString(),
      isLiked: true
    }));

    return NextResponse.json({
      success: true,
      videos: formattedVideos
    });

  } catch (error: any) {
    console.error('Error fetching liked videos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data video yang disukai' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    const { video_id } = await request.json();

    if (!video_id) {
      return NextResponse.json(
        { error: 'video_id diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah video sudah dilike
    const existingLike = await prisma.liked_videos.findFirst({
      where: {
        user_id: params.id,
        video_id: video_id
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Video sudah disukai' },
        { status: 409 }
      );
    }

    // Tambah like
    const newLike = await prisma.liked_videos.create({
      data: {
        user_id: params.id,
        video_id: video_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video berhasil disukai',
      like: newLike
    });

  } catch (error: any) {
    console.error('Error liking video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menyukai video' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');

    if (!video_id) {
      return NextResponse.json(
        { error: 'video_id diperlukan' },
        { status: 400 }
      );
    }

    // Hapus like
    await prisma.liked_videos.deleteMany({
      where: {
        user_id: params.id,
        video_id: video_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Like berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Error unliking video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus like' 
      },
      { status: 500 }
    );
  }
}