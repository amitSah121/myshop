import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ✅ Check if product is in wishlist on mount
  useEffect(() => {
    checkWishlistStatus();
  }, [product._id]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data } = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const inWishlist = data.wishlist?.some(item => item._id === product._id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      // Silently fail
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setWishlistLoading(true);

      if (isInWishlist) {
        await axios.delete(
          `http://localhost:5000/api/wishlist/remove/${product._id}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setIsInWishlist(false);
        alert('❌ Removed from wishlist');
      } else {
        await axios.post(
          `http://localhost:5000/api/wishlist/add/${product._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setIsInWishlist(true);
        alert('💖 Added to wishlist!');
      }

      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    const result = await addToCart(product);
    if (result.success) {
      alert('✅ Added to cart!');
    } else {
      alert('❌ Failed to add to cart');
    }
    setAdding(false);
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div 
        style={styles.imageContainer}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
        
        {/* ✅ WISHLIST HEART BUTTON */}
        <button
          style={{
            ...styles.wishlistBtn,
            ...(isInWishlist ? styles.wishlistActive : {})
          }}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlistLoading ? '⏳' : (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={isInWishlist ? 'currentColor' : 'none'}
              style={styles.heartIcon}
            >
              <path 
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {product.stock === 0 && (
          <div style={styles.outOfStock}>Out of Stock</div>
        )}
      </div>

      <div style={styles.info}>
        <h3 
          style={styles.name}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>
        
        {product.category && (
          <p style={styles.category}>{product.category}</p>
        )}
        
        <div style={styles.priceRow}>
          <span style={styles.price}>₹{product.price}</span>
          {product.rating > 0 && (
            <span style={styles.rating}>⭐ {product.rating}</span>
          )}
        </div>

        <button 
          style={{
            ...styles.addBtn,
            ...(product.stock === 0 || adding ? styles.disabledBtn : {})
          }}
          onClick={handleAddToCart}
          disabled={adding || cartLoading || product.stock === 0}
          onMouseEnter={(e) => {
            if (product.stock > 0 && !adding) {
              e.currentTarget.style.background = '#1a1a1a';
            }
          }}
          onMouseLeave={(e) => {
            if (product.stock > 0 && !adding) {
              e.currentTarget.style.background = '#2C3E50';
            }
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    position: 'relative'
  },
  imageContainer: {
    position: 'relative',
    paddingTop: '100%',
    overflow: 'hidden',
    background: '#F8F9FA'
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s'
  },
  wishlistBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 10,
    color: '#6b7280'
  },
  wishlistActive: {
    background: '#FFE5EC',
    color: '#E91E63',
    transform: 'scale(1.1)'
  },
  heartIcon: {
    display: 'block'
  },
  outOfStock: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(239, 68, 68, 0.95)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    zIndex: 10
  },
  info: {
    padding: '1rem'
  },
  name: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2C3E50',
    margin: '0 0 0.5rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    cursor: 'pointer',
    minHeight: '3rem'
  },
  category: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 0.75rem'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2C3E50'
  },
  rating: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  addBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  disabledBtn: {
    background: '#9ca3af',
    cursor: 'not-allowed'
  }
};

export default ProductCard;
