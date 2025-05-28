'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import RenderVideo from '@/app/components/layouts/RenderVideo';
import type { Video } from '@/app/types/interface';

export default function PurchasedVideos() {
    const [purchasedVideos, setPurchasedVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPurchasedVideos() {
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
                
                // Ambil data video yang telah dibeli oleh pengguna
                const { data: purchasedData, error: purchasedError } = await supabase
                    .from('purchased_videos')
                    .select('video_id')
                    .eq('user_id', user.id);
                
                if (purchasedError) throw purchasedError;
                
                if (purchasedData && purchasedData.length > 0) {
                    // Ambil detail video berdasarkan ID yang telah dibeli
                    const videoIds = purchasedData.map(item => item.video_id);
                    
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
                        isBought: true
                    }));
                    
                    setPurchasedVideos(formattedVideos);
                } else {
                    setPurchasedVideos([]);
                }
            } catch (error: any) {
                console.error('Error fetching purchased videos:', error);
                setError(error.message || 'Terjadi kesalahan saat mengambil data video');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchPurchasedVideos();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-kelasin-purple mb-8">Kelas yang Telah Dibeli</h1>
            
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
                    videos={purchasedVideos} 
                    title="" 
                    emptyStateMessage="Belum ada kelas yang dibeli" 
                    showFilters={purchasedVideos.length > 3}
                />
            )}
        </div>
    );
}