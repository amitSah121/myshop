import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const { data } = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

 const removeFromWishlist = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/wishlist/remove/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setWishlist(wishlist.filter(item => item._id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated')); // ✅ Add this
  } catch (error) {
    alert('Failed to remove from wishlist');
  }
};

const moveToCart = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:5000/api/wishlist/move-to-cart/${productId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    );

    alert('✅ Item moved to cart!');
    setWishlist(wishlist.filter(item => item._id !== productId));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated')); // ✅ Add this
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to move to cart');
  }
};


  

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <h1 style={styles.title}>My Wishlist</h1>
      </div>

      {wishlist.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💖</div>
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite items to buy them later!</p>
          <button 
            style={styles.shopBtn}
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {wishlist.map(item => (
            <div key={item._id} style={styles.card}>
              {/* Product Image */}
              <div style={styles.imageContainer}>
                <img 
                  src={item.images?.[0] || '/placeholder.png'}
                  alt={item.name}
                  style={styles.image}
                  onClick={() => navigate(`/product/${item._id}`)}
                />
                {item.stock === 0 && (
                  <div style={styles.outOfStock}>Out of Stock</div>
                )}
              </div>

              {/* Product Info */}
              <div style={styles.info}>
                <h3 
                  style={styles.productName}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {item.name}
                </h3>
                
                <div style={styles.priceRow}>
                  <span style={styles.price}>₹{item.price}</span>
                  {item.rating > 0 && (
                    <span style={styles.rating}>
                      ⭐ {item.rating}
                    </span>
                  )}
                </div>

                <p style={styles.addedDate}>
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button
                  style={{...styles.btn, ...styles.cartBtn}}
                  onClick={() => moveToCart(item._id)}
                  disabled={item.stock === 0}
                >
                  {item.stock === 0 ? 'Out of Stock' : '🛒 Move to Cart'}
                </button>
                <button
                  style={{...styles.btn, ...styles.removeBtn}}
                  onClick={() => removeFromWishlist(item._id)}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '70vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #E8ECEF',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2C3E50',
    fontWeight: '600'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0
  },
  loading: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E8ECEF',
    borderTop: '4px solid #2C3E50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F9FA',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  shopBtn: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s'
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
    cursor: 'pointer'
  },
  outOfStock: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  info: {
    padding: '1rem'
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2C3E50',
    margin: '0 0 0.5rem',
    cursor: 'pointer',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
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
  addedDate: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    borderTop: '1px solid #F0F1F3'
  },
  btn: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cartBtn: {
    background: '#2C3E50',
    color: 'white'
  },
  removeBtn: {
    background: 'transparent',
    color: '#E74C3C',
    border: '1px solid #E74C3C'
  }
};

// Add spinner animation
if (!document.getElementById('wishlist-spinner')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'wishlist-spinner';
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Wishlist;
