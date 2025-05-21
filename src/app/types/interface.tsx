interface UserMenuDashboard {
    id: string;
    title: string;
    component: React.ComponentType;
  }
  
  export type { UserMenuDashboard };
  
  // Interface untuk tabel users
  interface UserAuth {
    id: string | number;
    email: string;
    full_name: string;
    avatar_url: string;
    grade: string;
    role: 'student' | 'teacher' | 'admin';
    created_at: string;
    updated_at: string;
  }
  
  export type { UserAuth };
  
  // Interface untuk tabel videos
  interface Video {
    id: string | number;
    title: string;
    description: string;
    subject: string;
    grade: string;
    thumbnail: string;
    video_url: string;
    price: number;
    views: number;
    rating: number;
    teacher_id: string;
    created_at: string;
    updated_at: string;
  }
  
  export type { Video };
  
  // Interface untuk tabel wishlists
  interface Wishlist {
    id: string | number;
    user_id: string;
    video_id: string;
    created_at: string;
  }
  
  export type { Wishlist };
  
  // Interface untuk tabel liked_videos
  interface LikedVideo {
    id: string | number;
    user_id: string;
    video_id: string;
    created_at: string;
  }
  
  export type { LikedVideo };
  
  // Interface untuk tabel purchased_videos
  interface PurchasedVideo {
    id: string | number;
    user_id: string;
    video_id: string;
    purchase_date: string;
    price_paid: number;
    payment_method: string;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  }
  
  export type { PurchasedVideo };
  
  // Interface untuk tabel subscriptions
  interface Subscription {
    id: string | number;
    user_id: string;
    name: string;
    start_date: string;
    end_date: string;
    price_paid: number;
    is_active: boolean;
    payment_method: string;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    created_at: string;
  }
  
  export type { Subscription };
  
  // Interface untuk tabel tokens
  interface Token {
    id: string | number;
    user_id: string;
    amount: number;
    last_updated: string;
  }
  
  export type { Token };
  
  // Interface untuk tabel token_transactions
  interface TokenTransaction {
    id: string | number;
    user_id: string;
    amount: number;
    transaction_type: 'purchase' | 'usage' | 'reward' | 'refund';
    description: string;
    payment_method?: string;
    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
    created_at: string;
  }
  
  export type { TokenTransaction };
  
  // Interface untuk tabel activity_logs
  interface ActivityLog {
    id: string | number;
    user_id: string;
    activity_type: string;
    description: string;
    created_at: string;
  }
  
  export type { ActivityLog };
  
  // Interface untuk komponen Alert
  interface Alert {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    time: string;
  }
  
  export type { Alert };
  
  // Interface untuk komponen Activity
  interface Activity {
    id: number;
    user: string;
    action: string;
    time: string;
    avatar?: string;
  }
  
  export type { Activity };
  
  // Interface untuk komponen StatCard
  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
  }
  
  export type { StatCardProps };
  
  // Interface untuk komponen ActivityItem
  interface ActivityItemProps {
    user: string;
    action: string;
    time: string;
    avatar?: string;
  }
  
  export type { ActivityItemProps };
  
  // Interface untuk komponen AlertItem
  interface AlertItemProps {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    time: string;
  }
  
  export type { AlertItemProps };