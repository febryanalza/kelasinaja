import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';

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
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Get user with detailed information
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        tokens: {
          select: {
            amount: true,
            last_updated: true
          }
        },
        videos: {
          select: {
            id: true,
            title: true,
            views: true,
            rating: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' },
          take: 5
        },
        purchased_videos: {
          select: {
            id: true,
            purchase_date: true,
            price_paid: true,
            payment_status: true,
            videos: {
              select: {
                title: true
              }
            }
          },
          orderBy: { purchase_date: 'desc' },
          take: 5
        },
        liked_videos: {
          select: {
            created_at: true,
            videos: {
              select: {
                title: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          take: 5
        },
        token_transactions: {
          select: {
            id: true,
            amount: true,
            transaction_type: true,
            description: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' },
          take: 10
        },
        _count: {
          select: {
            videos: true,
            purchased_videos: true,
            liked_videos: true,
            wishlists: true,
            video_ratings: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Format user data
    const formattedUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'No Name',
      avatar_url: user.avatar_url,
      role: user.role,
      grade: user.grade,
      status: 'active' as const,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      last_login: user.updated_at.toISOString(),
      
      // Token information
      token_balance: user.tokens?.amount || 0,
      token_last_updated: user.tokens?.last_updated?.toISOString(),
      
      // Statistics
      stats: {
        total_videos: user._count.videos,
        total_purchases: user._count.purchased_videos,
        total_likes: user._count.liked_videos,
        total_wishlists: user._count.wishlists,
        total_ratings: user._count.video_ratings
      },
      
      // Recent activity data
      recent_videos: user.videos.map(video => ({
        id: video.id,
        title: video.title,
        views: video.views || 0,
        rating: Number(video.rating) || 0,
        created_at: video.created_at.toISOString()
      })),
      
      recent_purchases: user.purchased_videos.map(purchase => ({
        id: purchase.id,
        video_title: purchase.videos.title,
        price_paid: Number(purchase.price_paid),
        payment_status: purchase.payment_status,
        purchase_date: purchase.purchase_date.toISOString()
      })),
      
      recent_likes: user.liked_videos.map(like => ({
        video_title: like.videos.title,
        created_at: like.created_at.toISOString()
      })),
      
      // Activity logs from token transactions
      activity_logs: user.token_transactions.map(transaction => ({
        id: transaction.id,
        activity_type: transaction.transaction_type,
        description: transaction.description || `${transaction.transaction_type} sebesar ${transaction.amount} token`,
        created_at: transaction.created_at.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error: any) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil detail pengguna' 
      },
      { status: 500 }
    );
  }
}