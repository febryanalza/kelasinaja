'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import RenderVideo from '@/app/components/layouts/RenderVideo';
import type { Video } from '@/app/types/interface';

export default function Wishlist() {
    const { user, token } = useAuth();
    const [wishlistVideos, setWishlistVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWishlistVideos() {
            if (!user || !token) {
                setError('Anda harus login terlebih dahulu');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch(`/api/user/${user.id}/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Gagal mengambil data wishlist');
                }

                const data = await response.json();
                
                if (data.success) {
                    setWishlistVideos(data.videos);
                } else {
                    throw new Error(data.error || 'Gagal memuat data wishlist');
                }
                
            } catch (error: any) {
                console.error('Error fetching wishlist videos:', error);
                setError(error.message || 'Terjadi kesalahan saat mengambil data video');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchWishlistVideos();
    }, [user, token]);

    const handleRemoveFromWishlist = async (videoId: string) => {
        if (!user || !token) return;

        try {
            const response = await fetch(`/api/user/${user.id}/wishlist?video_id=${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gagal menghapus dari wishlist');
            }

            // Update state untuk menghapus video dari list
            setWishlistVideos(prev => prev.filter(video => video.id !== videoId));
            
        } catch (error: any) {
            console.error('Error removing from wishlist:', error);
            setError(error.message || 'Terjadi kesalahan saat menghapus dari wishlist');
        }
    };

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
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                />
            )}
        </div>
    );
}