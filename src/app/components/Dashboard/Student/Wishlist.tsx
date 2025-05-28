'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import RenderVideo from '@/app/components/layouts/RenderVideo';
import type { Video } from '@/app/types/interface';

export default function Wishlist() {
    const [wishlistVideos, setWishlistVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWishlistVideos() {
            try {
                setIsLoading(true);
                setError(null);
                
                // Dapatkan user saat ini
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    setError('Anda harus login terlebih dahulu');
                    setIsLoading(false);
                    return;
                }
                
                // Ambil data video yang ada di wishlist pengguna
                const { data: wishlistData, error: wishlistError } = await supabase
                    .from('wishlists')
                    .select('video_id')
                    .eq('user_id', user.id);
                
                if (wishlistError) throw wishlistError;
                
                if (wishlistData && wishlistData.length > 0) {
                    // Ambil detail video berdasarkan ID yang ada di wishlist
                    const videoIds = wishlistData.map(item => item.video_id);
                    
                    const { data: videosData, error: videosError } = await supabase
                        .from('videos')
                        .select('*')
                        .in('id', videoIds);
                    
                    if (videosError) throw videosError;
                    
                    // Format data video sesuai dengan interface VideoClass
                    const formattedVideos: Video[] = videosData.map(video => ({
                        id: video.id,
                        title: video.title,
                        subject: video.subject,
                        grade: video.grade,
                        thumbnail: video.thumbnail || '/images/integral.jpg', // Fallback jika tidak ada thumbnail
                        views: video.views || '0',
                        rating: video.rating || 0,
                        isWishlisted: true
                    }));
                    
                    setWishlistVideos(formattedVideos);
                } else {
                    setWishlistVideos([]);
                }
            } catch (error: any) {
                console.error('Error fetching wishlist videos:', error);
                setError(error.message || 'Terjadi kesalahan saat mengambil data video');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchWishlistVideos();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-kelasin-purple mb-8">Wishlist Kelas</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-lg">Memuat data...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            ) : (
                <RenderVideo 
                    videos={wishlistVideos} 
                    title="" 
                    emptyStateMessage="Belum ada video di wishlist Anda" 
                    showFilters={wishlistVideos.length > 3}
                />
            )}
        </div>
    );
}