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

    // Ambil purchased videos dengan detail video dan subject
    const purchasedData = await prisma.purchased_videos.findMany({
      where: { 
        user_id: params.id,
        payment_status: 'completed' // Hanya yang sudah dibayar
      },
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
      orderBy: { purchase_date: 'desc' }
    });

    // Format data sesuai interface Video
    const formattedVideos = purchasedData.map(purchase => ({
      id: purchase.videos.id,
      title: purchase.videos.title,
      description: purchase.videos.description,
      subject: purchase.videos.subject_videos_subjectTosubject.title,
      grade: purchase.videos.grade,
      thumbnail: purchase.videos.thumbnail || '/images/integral.jpg',
      video_url: purchase.videos.video_url,
      price: Number(purchase.videos.price) || 0,
      views: purchase.videos.views || 0,
      rating: Number(purchase.videos.rating) || 0,
      teacher_id: purchase.videos.teacher_id,
      teacher_name: purchase.videos.users.full_name,
      created_at: purchase.videos.created_at.toISOString(),
      updated_at: purchase.videos.updated_at.toISOString(),
      purchase_date: purchase.purchase_date.toISOString(),
      price_paid: Number(purchase.price_paid),
      payment_method: purchase.payment_method,
      isPurchased: true
    }));

    return NextResponse.json({
      success: true,
      videos: formattedVideos
    });

  } catch (error: any) {
    console.error('Error fetching purchased videos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data video yang dibeli' 
      },
      { status: 500 }
    );
  }
}