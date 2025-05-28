/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import RenderVideo from '@/app/components/layouts/RenderVideo';
import type{ Video } from '@/app/types/interface';

export default function Liked() {
    const [likedVideos, setLikedVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLikedVideos() {
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
                
                // Ambil data video yang disukai oleh pengguna
                const { data: likedData, error: likedError } = await supabase
                    .from('liked_videos')
                    .select('video_id')
                    .eq('user_id', user.id);
                
                if (likedError) throw likedError;
                
                if (likedData && likedData.length > 0) {
                    // Ambil detail video berdasarkan ID yang disukai
                    const videoIds = likedData.map(item => item.video_id);
                    
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
                        isLiked: true
                    }));
                    
                    setLikedVideos(formattedVideos);
                } else {
                    setLikedVideos([]);
                }
            } catch (error: any) {
                console.error('Error fetching liked videos:', error);
                setError(error.message || 'Terjadi kesalahan saat mengambil data video');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchLikedVideos();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-kelasin-purple mb-8">Video yang Disukai</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-lg">Memuat data...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100/10 border border-red-400/20 text-red-400 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            ) : (
                <RenderVideo 
                    videos={likedVideos} 
                    title="" 
                    emptyMessage="Belum ada video yang disukai" 
                    showFilters={likedVideos.length > 3}
                />
            )}
        </div>
    );
}