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

    // Get user statistics
    const [
      totalUsers,
      usersByRole,
      recentUsers,
      activeUsersThisWeek,
      topTeachers,
      topStudents
    ] = await Promise.all([
      // Total users
      prisma.users.count(),
      
      // Users by role
      prisma.users.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      
      // Recent users (last 30 days)
      prisma.users.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Active users this week (based on updated_at)
      prisma.users.count({
        where: {
          updated_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top teachers by video count
      prisma.users.findMany({
        where: { role: 'teacher' },
        include: {
          _count: {
            select: {
              videos: true
            }
          }
        },
        orderBy: {
          videos: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Top students by purchase count
      prisma.users.findMany({
        where: { role: 'student' },
        include: {
          _count: {
            select: {
              purchased_videos: true
            }
          }
        },
        orderBy: {
          purchased_videos: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Format statistics
    const roleStats = {
      admin: 0,
      teacher: 0,
      student: 0
    };

    usersByRole.forEach(group => {
      if (group.role in roleStats) {
        roleStats[group.role as keyof typeof roleStats] = group._count.id;
      }
    });

    const stats = {
      total_users: totalUsers,
      recent_users: recentUsers,
      active_users_this_week: activeUsersThisWeek,
      users_by_role: roleStats,
      
      top_teachers: topTeachers.map(teacher => ({
        id: teacher.id,
        full_name: teacher.full_name || 'No Name',
        email: teacher.email,
        avatar_url: teacher.avatar_url,
        video_count: teacher._count.videos,
        created_at: teacher.created_at.toISOString()
      })),
      
      top_students: topStudents.map(student => ({
        id: student.id,
        full_name: student.full_name || 'No Name',
        email: student.email,
        avatar_url: student.avatar_url,
        purchase_count: student._count.purchased_videos,
        created_at: student.created_at.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil statistik pengguna' 
      },
      { status: 500 }
    );
  }
}