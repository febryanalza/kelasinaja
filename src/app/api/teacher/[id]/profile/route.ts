import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isTeacher } from '@/lib/auth';

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
    if (!decoded || (decoded.userId !== params.id && !['admin', 'teacher'].includes(decoded.role))) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    // Get teacher profile with statistics
    const teacher = await prisma.users.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        grade: true,
        role: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            videos: true,
            liked_videos: true,
            video_ratings: true
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher tidak ditemukan' },
        { status: 404 }
      );
    }

    if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
      return NextResponse.json(
        { error: 'User bukan teacher' },
        { status: 403 }
      );
    }

    // Get token balance
    let tokenBalance = 0;
    let tokenLastUpdated = null;

    try {
      const userToken = await prisma.tokens.findUnique({
        where: { user_id: params.id },
        select: {
          amount: true,
          last_updated: true
        }
      });

      if (userToken) {
        tokenBalance = Number(userToken.amount) || 0;
        tokenLastUpdated = userToken.last_updated;
      }
    } catch (tokenError) {
      console.log('Token data not available:', tokenError);
    }

    // Get additional statistics
    const [totalViews, totalRevenue, totalStudents] = await Promise.all([
      // Total views across all videos
      prisma.video_views.count({
        where: {
          videos: {
            teacher_id: params.id
          }
        }
      }),
      
      // Total revenue from video purchases
      prisma.purchased_videos.aggregate({
        where: {
          videos: {
            teacher_id: params.id
          },
          payment_status: 'completed'
        },
        _sum: {
          price_paid: true
        }
      }),
      
      // Unique students who purchased videos
      prisma.purchased_videos.findMany({
        where: {
          videos: {
            teacher_id: params.id
          },
          payment_status: 'completed'
        },
        select: {
          user_id: true
        },
        distinct: ['user_id']
      })
    ]);

    const stats = {
      total_videos: teacher._count.videos,
      total_views: totalViews,
      total_revenue: Number(totalRevenue._sum.price_paid) || 0,
      total_students: totalStudents.length,
      total_likes: teacher._count.liked_videos,
      total_ratings: teacher._count.video_ratings
    };

    return NextResponse.json({
      success: true,
      teacher: {
        ...teacher,
        token_balance: tokenBalance,
        token_last_updated: tokenLastUpdated,
        stats,
        created_at: teacher.created_at.toISOString(),
        updated_at: teacher.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error fetching teacher profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data profile teacher',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { full_name, avatar_url, grade } = await request.json();

    // Validation
    if (full_name && typeof full_name !== 'string') {
      return NextResponse.json(
        { error: 'Nama lengkap harus berupa string' },
        { status: 400 }
      );
    }

    if (avatar_url && typeof avatar_url !== 'string') {
      return NextResponse.json(
        { error: 'URL avatar harus berupa string' },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const existingTeacher = await prisma.users.findUnique({
      where: { id: params.id }
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingTeacher.role !== 'teacher' && existingTeacher.role !== 'admin') {
      return NextResponse.json(
        { error: 'User bukan teacher' },
        { status: 403 }
      );
    }

    // Update teacher profile
    const updateData: any = {
      updated_at: new Date()
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (grade !== undefined) updateData.grade = grade;

    const updatedTeacher = await prisma.users.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        grade: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profil teacher berhasil diperbarui',
      teacher: {
        ...updatedTeacher,
        created_at: updatedTeacher.created_at.toISOString(),
        updated_at: updatedTeacher.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat memperbarui profil teacher'
      },
      { status: 500 }
    );
  }
}