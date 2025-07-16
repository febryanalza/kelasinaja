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
    const subjectId = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (subjectId) {
      whereClause.subject = subjectId;
    }
    
    if (grade) {
      whereClause.grade = grade;
    }

    // Get videos with teacher and subject info
    const [videos, totalCount] = await Promise.all([
      prisma.videos.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          subject_videos_subjectTosubject: {
            select: {
              id: true,
              title: true
            }
          },
          _count: {
            select: {
              video_views: true,
              liked_videos: true,
              purchased_videos: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.videos.count({ where: whereClause })
    ]);

    // Format videos
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      grade: video.grade,
      thumbnail: video.thumbnail,
      video_url: video.video_url,
      price: Number(video.price) || 0,
      views: video.views || 0,
      rating: Number(video.rating) || 0,
      teacher: {
        id: video.users.id,
        name: video.users.full_name,
        avatar: video.users.avatar_url
      },
      subject: {
        id: video.subject_videos_subjectTosubject.id,
        title: video.subject_videos_subjectTosubject.title
      },
      stats: {
        total_views: video._count.video_views,
        total_likes: video._count.liked_videos,
        total_purchases: video._count.purchased_videos
      },
      created_at: video.created_at.toISOString(),
      updated_at: video.updated_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      videos: formattedVideos,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data video' 
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
        { error: 'ID video diperlukan' },
        { status: 400 }
      );
    }

    // Check if video exists
    const existingVideo = await prisma.videos.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchased_videos: true
          }
        }
      }
    });

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if video has been purchased
    if (existingVideo._count.purchased_videos > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus video yang sudah dibeli oleh pengguna' 
        },
        { status: 409 }
      );
    }

    // Delete video and related data
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      await tx.liked_videos.deleteMany({ where: { video_id: id } });
      await tx.wishlists.deleteMany({ where: { video_id: id } });
      await tx.video_ratings.deleteMany({ where: { video_id: id } });
      await tx.video_views.deleteMany({ where: { video_id: id } });
      
      // Delete video
      await tx.videos.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: 'Video berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus video' 
      },
      { status: 500 }
    );
  }
}