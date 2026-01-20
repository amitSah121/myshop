// src/hooks/useWishlist.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const isRiderOrAdmin = () => {
    const riderStr = localStorage.getItem('rider');
    if (riderStr) return true;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.isAdmin || user.role === 'admin';
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const fetchWishlist = async () => {
    // ✅ Don't fetch for riders/admins
    if (isRiderOrAdmin()) {
      console.log('⚠️ Skipping wishlist - user is rider/admin');
      setWishlist([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(data || []);
    } catch (error) {
      console.error('❌ Wishlist error:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []); // ✅ Only once on mount

  return { 
    wishlist, 
    loading, 
    refreshWishlist: fetchWishlist 
  };
}
