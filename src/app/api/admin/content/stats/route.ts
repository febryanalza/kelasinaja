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

    // Get content statistics
    const [
      totalSubjects,
      totalVideos,
      totalTeachers,
      totalStudents,
      recentVideos,
      popularSubjects
    ] = await Promise.all([
      // Total subjects
      prisma.subject.count(),
      
      // Total videos
      prisma.videos.count(),
      
      // Total teachers
      prisma.users.count({
        where: { role: 'teacher' }
      }),
      
      // Total students
      prisma.users.count({
        where: { role: 'student' }
      }),
      
      // Recent videos (last 7 days)
      prisma.videos.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Popular subjects by video count
      prisma.subject.findMany({
        select: {
          id: true,
          title: true,
          videos_videos_subjectTosubject: {
            select: {
              id: true,
              views: true
            }
          }
        },
        orderBy: {
          videos_videos_subjectTosubject: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Format popular subjects with stats
    const formattedPopularSubjects = popularSubjects.map(subject => ({
      id: subject.id,
      title: subject.title,
      video_count: subject.videos_videos_subjectTosubject.length,
      total_views: subject.videos_videos_subjectTosubject.reduce(
        (sum, video) => sum + (video.views || 0), 0
      )
    }));

    const stats = {
      total_subjects: totalSubjects,
      total_videos: totalVideos,
      total_teachers: totalTeachers,
      total_students: totalStudents,
      recent_videos: recentVideos,
      popular_subjects: formattedPopularSubjects
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching content stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil statistik konten' 
      },
      { status: 500 }
    );
  }
}