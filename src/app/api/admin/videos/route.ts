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
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const teacher = searchParams.get('teacher');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (subject) {
      whereClause.subject = subject;
    }

    if (teacher) {
      whereClause.teacher_id = teacher;
    }

    // Get videos with related data
    const [videos, totalCount] = await Promise.all([
      prisma.videos.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              full_name: true,
              avatar_url: true
            }
          },
          subject_videos_subjectTosubject: {
            select: {
              title: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.videos.count({ where: whereClause })
    ]);

    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      subject: video.subject_videos_subjectTosubject?.title || 'Unknown Subject',
      grade: video.grade,
      thumbnail: video.thumbnail,
      video_url: video.video_url,
      price: Number(video.price) || 0,
      views: video.views || 0,
      rating: Number(video.rating) || 0,
      teacher_name: video.users.full_name,
      teacher_avatar: video.users.avatar_url,
      status: 'active', // Default status
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
        error: 'Terjadi kesalahan saat mengambil data videos' 
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

    const { videoId, action } = await request.json();

    if (!videoId || !action) {
      return NextResponse.json(
        { error: 'videoId dan action diperlukan' },
        { status: 400 }
      );
    }

    let updateData: any = { updated_at: new Date() };

    switch (action) {
      case 'approve':
        // Logic untuk approve video
        break;
      case 'reject':
        // Logic untuk reject video
        break;
      case 'suspend':
        // Logic untuk suspend video
        break;
      default:
        return NextResponse.json(
          { error: 'Action tidak valid' },
          { status: 400 }
        );
    }

    const updatedVideo = await prisma.videos.update({
      where: { id: videoId },
      data: updateData,
      select: {
        id: true,
        title: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video berhasil diupdate',
      video: updatedVideo
    });

  } catch (error: any) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengupdate video' 
      },
      { status: 500 }
    );
  }
}