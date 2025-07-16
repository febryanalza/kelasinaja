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
    if (!decoded || (decoded.userId !== params.id && decoded.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.users.findUnique({
      where: { id: params.id },
      select: { id: true, role: true }
    });

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Teacher tidak ditemukan' },
        { status: 404 }
      );
    }

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get comprehensive dashboard statistics
    const [
      totalVideos,
      publishedVideos,
      draftVideos,
      totalViews,
      totalRevenue,
      recentRevenue,
      totalStudents,
      recentViews,
      topVideos,
      recentPurchases,
      monthlyStats
    ] = await Promise.all([
      // Total videos count
      prisma.videos.count({
        where: { teacher_id: params.id }
      }),

      // Published videos (assuming all videos are published in current schema)
      prisma.videos.count({
        where: { teacher_id: params.id }
      }),

      // Draft videos (placeholder for future implementation)
      Promise.resolve(0),

      // Total views across all videos
      prisma.video_views.count({
        where: {
          videos: { teacher_id: params.id }
        }
      }),

      // Total revenue from completed purchases
      prisma.purchased_videos.aggregate({
        where: {
          videos: { teacher_id: params.id },
          payment_status: 'completed'
        },
        _sum: { price_paid: true }
      }),

      // Recent revenue (last 30 days)
      prisma.purchased_videos.aggregate({
        where: {
          videos: { teacher_id: params.id },
          payment_status: 'completed',
          purchase_date: { gte: last30Days }
        },
        _sum: { price_paid: true }
      }),

      // Unique students count
      prisma.purchased_videos.findMany({
        where: {
          videos: { teacher_id: params.id },
          payment_status: 'completed'
        },
        select: { user_id: true },
        distinct: ['user_id']
      }),

      // Recent views (last 7 days)
      prisma.video_views.count({
        where: {
          videos: { teacher_id: params.id },
          created_at: { gte: last7Days }
        }
      }),

      // Top performing videos
      prisma.videos.findMany({
        where: { teacher_id: params.id },
        select: {
          id: true,
          title: true,
          views: true,
          rating: true,
          price: true,
          thumbnail: true,
          created_at: true,
          _count: {
            select: {
              purchased_videos: true,
              liked_videos: true,
              video_views: true
            }
          }
        },
        orderBy: { views: 'desc' },
        take: 5
      }),

      // Recent purchases
      prisma.purchased_videos.findMany({
        where: {
          videos: { teacher_id: params.id },
          payment_status: 'completed'
        },
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          videos: {
            select: {
              id: true,
              title: true,
              thumbnail: true
            }
          }
        },
        orderBy: { purchase_date: 'desc' },
        take: 10
      }),

      // Monthly statistics for charts
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', purchase_date) as month,
          COUNT(*)::integer as purchases,
          SUM(price_paid)::decimal as revenue
        FROM purchased_videos pv
        JOIN videos v ON pv.video_id = v.id
        WHERE v.teacher_id = ${params.id}
          AND pv.payment_status = 'completed'
          AND pv.purchase_date >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)}
        GROUP BY DATE_TRUNC('month', purchase_date)
        ORDER BY month ASC
      `
    ]);

    // Format dashboard data
    const dashboardStats = {
      overview: {
        total_videos: totalVideos,
        published_videos: publishedVideos,
        draft_videos: draftVideos,
        total_views: totalViews,
        recent_views: recentViews,
        total_revenue: Number(totalRevenue._sum.price_paid) || 0,
        recent_revenue: Number(recentRevenue._sum.price_paid) || 0,
        total_students: totalStudents.length
      },
      
      top_videos: topVideos.map(video => ({
        id: video.id,
        title: video.title,
        views: video.views || 0,
        rating: Number(video.rating) || 0,
        price: Number(video.price) || 0,
        thumbnail: video.thumbnail,
        total_purchases: video._count.purchased_videos,
        total_likes: video._count.liked_videos,
        total_views: video._count.video_views,
        created_at: video.created_at.toISOString()
      })),
      
      recent_purchases: recentPurchases.map(purchase => ({
        id: purchase.id,
        student: {
          id: purchase.users.id,
          name: purchase.users.full_name,
          avatar: purchase.users.avatar_url
        },
        video: {
          id: purchase.videos.id,
          title: purchase.videos.title,
          thumbnail: purchase.videos.thumbnail
        },
        price_paid: Number(purchase.price_paid),
        purchase_date: purchase.purchase_date.toISOString(),
        payment_method: purchase.payment_method,
        payment_status: purchase.payment_status
      })),
      
      monthly_stats: (monthlyStats as any[]).map(stat => ({
        month: stat.month,
        purchases: stat.purchases,
        revenue: Number(stat.revenue) || 0
      }))
    };

    return NextResponse.json({
      success: true,
      stats: dashboardStats
    });

  } catch (error: any) {
    console.error('Error fetching teacher dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil statistik dashboard'
      },
      { status: 500 }
    );
  }
}