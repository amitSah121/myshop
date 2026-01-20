import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { extractProducts, extractCategories } from '../utils/apiHelpers';
import Toast from '../components/Toast';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/categories')
      ]);
      
      setProducts(extractProducts(productsRes.data));
      setCategories(extractCategories(categoriesRes.data));
      
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get cart quantity for a product
  const getCartQuantity = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  // ✅ Add to cart with animation
  const addToCart = (product, e) => {
    e.stopPropagation();
    
    if (product.stock === 0) return;

    // Show +1 animation
    setAddingToCart(product._id);
    setTimeout(() => setAddingToCart(null), 600);

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    // Show toast
    setToast({ show: true, message: 'Added to cart' });
  };

  // ✅ Update cart quantity
  const updateCartQuantity = (product, delta, e) => {
    e.stopPropagation();
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += delta;
      
      if (existingItem.quantity <= 0) {
        const updatedCart = cart.filter(item => item._id !== product._id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setToast({ show: true, message: 'Removed from cart' });
      } else {
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const featuredProducts = Array.isArray(products) 
    ? products.filter(p => p.featured).slice(0, 8)
    : [];

  const displayProducts = searchQuery 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 12)
    : products.slice(0, 12);

  if (loading) {
    return (
      <div style={styles.loading}>
        <img 
          src="/assets/logo.jpg" 
          alt="Loading" 
          style={styles.loadingLogo}
          onError={(e) => e.target.style.display = 'none'}
        />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroMain}>
            <img 
              src="/assets/logo.jpg" 
              alt="EverestMart" 
              style={styles.heroLogo}
              onError={(e) => e.target.style.display = 'none'}
            />
            <h1 style={styles.heroTitle}>Premium Groceries, Delivered</h1>
            <p style={styles.heroSubtitle}>
              Handpicked quality at your doorstep in 10 minutes
            </p>
          </div>
          
          {/* SEARCH BAR */}
          <div style={styles.searchContainer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                style={styles.searchButton}
                onClick={handleSearch}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1A1A1A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2C3E50'}
              >
                Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Collections</h2>
          <div style={styles.categoriesList}>
            {categories.map((category) => (
              <div 
                key={category._id} 
                style={styles.categoryItem}
                onClick={() => handleCategoryClick(category.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.paddingLeft = '0.5rem';
                  e.currentTarget.querySelector('svg').style.opacity = '1';
                  e.currentTarget.querySelector('svg').style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.paddingLeft = '0';
                  e.currentTarget.querySelector('svg').style.opacity = '0.4';
                  e.currentTarget.querySelector('svg').style.transform = 'translateX(0)';
                }}
              >
                <span style={styles.categoryName}>{category.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={styles.categoryArrow}>
                  <path d="M9 18L15 12L9 6" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Curated Selection'}
          </h2>
          {!searchQuery && (
            <button 
              style={styles.viewAllBtn}
              onClick={() => navigate('/products')}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8B7355'}
            >
              View All →
            </button>
          )}
        </div>

        {displayProducts.length > 0 ? (
          <div style={styles.productsGrid}>
            {displayProducts.map(product => {
              const cartQty = getCartQuantity(product._id);
              const isAdding = addingToCart === product._id;

              return (
                <div 
                  key={product._id} 
                  style={styles.productCard}
                  onClick={() => handleProductClick(product._id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                >
                  <div style={styles.productImageContainer}>
                    <img 
                      src={product.image?.startsWith('data:') 
                        ? product.image 
                        : `http://localhost:5000${product.image}`}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = '#F0EDE8';
                      }}
                    />
                    
                    {/* ✅ +1 Animation */}
                    {isAdding && (
                      <div style={styles.plusOne}>+1</div>
                    )}
                    
                    {product.stock < 10 && product.stock > 0 && (
                      <div style={styles.stockBadge}>Limited Stock</div>
                    )}
                    {product.stock === 0 && (
                      <div style={styles.outOfStockOverlay}>
                        <span style={styles.outOfStockText}>Sold Out</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productUnit}>{product.unitQuantity} {product.unit}</p>
                    
                    <div style={styles.productFooter}>
                      <span style={styles.price}>₹{product.price}</span>
                      
                      {/* ✅ Quantity Controls or Add Button */}
                      {cartQty > 0 ? (
                        <div style={styles.quantityControl} onClick={(e) => e.stopPropagation()}>
                          <button 
                            style={styles.quantityBtn}
                            onClick={(e) => updateCartQuantity(product, -1, e)}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F0F0F0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            −
                          </button>
                          <span style={styles.quantity}>{cartQty}</span>
                          <button 
                            style={styles.quantityBtn}
                            onClick={(e) => updateCartQuantity(product, 1, e)}
                            disabled={product.stock <= cartQty}
                            onMouseEnter={(e) => {
                              if (product.stock > cartQty) {
                                e.currentTarget.style.background = '#F0F0F0';
                              }
                            }}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          style={{
                            ...styles.addBtn,
                            ...(product.stock === 0 ? styles.addBtnDisabled : {})
                          }}
                          onClick={(e) => addToCart(product, e)}
                          disabled={product.stock === 0}
                          onMouseEnter={(e) => {
                            if (product.stock > 0) {
                              e.currentTarget.style.background = '#2C3E50';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (product.stock > 0) {
                              e.currentTarget.style.background = '#1A1A1A';
                            }
                          }}
                        >
                          {product.stock === 0 ? 'Sold Out' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noResults}>
            <p style={styles.noResultsText}>
              {searchQuery 
                ? `No products found for "${searchQuery}"`
                : 'No products available'}
            </p>
            {searchQuery && (
              <button 
                style={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* FEATURES */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureNumber}>01</div>
            <h3 style={styles.featureTitle}>Express Delivery</h3>
            <p style={styles.featureText}>Your order delivered within 10 minutes</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureNumber}>02</div>
            <h3 style={styles.featureTitle}>Premium Quality</h3>
            <p style={styles.featureText}>Handpicked products from trusted sources</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureNumber}>03</div>
            <h3 style={styles.featureTitle}>Best Value</h3>
            <p style={styles.featureText}>Competitive pricing without compromise</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureNumber}>04</div>
            <h3 style={styles.featureTitle}>Live Tracking</h3>
            <p style={styles.featureText}>Monitor your delivery in real-time</p>
          </div>
        </div>
      </div>

      {/* FLOATING CART */}
      {JSON.parse(localStorage.getItem('cart') || '[]').length > 0 && (
        <button 
          style={styles.floatingCartBtn}
          onClick={() => navigate('/cart')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={styles.cartIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9Z" fill="currentColor"/>
            </svg>
          </span>
          <span style={styles.cartCount}>
            {JSON.parse(localStorage.getItem('cart') || '[]').reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={() => setToast({ show: false, message: '' })}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes plusOneAnim {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.8);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", Roboto, sans-serif'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#FFFFFF'
  },
  loadingLogo: {
    width: '80px',
    height: 'auto',
    marginBottom: '1.5rem',
    opacity: 0.6
  },
  loadingText: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    fontWeight: '400',
    letterSpacing: '0.5px'
  },
  hero: {
    background: '#F8F7F5',
    padding: '6rem 2rem 4rem',
    borderBottom: '1px solid #E5E2DD'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  heroMain: {
    marginBottom: '3rem'
  },
  heroLogo: {
    width: '60px',
    height: 'auto',
    marginBottom: '2rem',
    opacity: 0.9
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    color: '#5A5A5A',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '0.2px'
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '1.25rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1
  },
  searchInput: {
    width: '100%',
    padding: '1rem 7rem 1rem 3rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '8px',
    outline: 'none',
    background: '#FFFFFF',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    fontWeight: '400',
    boxSizing: 'border-box'
  },
  searchButton: {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0.65rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    letterSpacing: '0.3px'
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '4rem 2rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: '0.5px',
    margin: 0
  },
  viewAllBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8B7355',
    fontSize: '0.9375rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s',
    letterSpacing: '0.3px'
  },
  categoriesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '0'
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 0',
    borderBottom: '1px solid #F0EDE8',
    cursor: 'pointer',
    transition: 'padding-left 0.2s ease'
  },
  categoryName: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: '0.3px'
  },
  categoryArrow: {
    opacity: 0.4,
    transition: 'opacity 0.2s, transform 0.2s'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '2rem'
  },
  productCard: {
    background: '#FFFFFF',
    border: '1px solid #F0EDE8',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer'
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: '260px',
    background: '#F8F7F5',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease'
  },
  plusOne: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '3rem',
    fontWeight: '700',
    color: '#22C55E',
    animation: 'plusOneAnim 0.6s ease forwards',
    pointerEvents: 'none',
    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
    zIndex: 10
  },
  stockBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: '#FFFFFF',
    color: '#8B7355',
    padding: '0.4rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  outOfStockText: {
    color: '#8B8B8B',
    fontWeight: '400',
    fontSize: '0.875rem',
    letterSpacing: '0.5px'
  },
  productInfo: {
    padding: '1.5rem'
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
    letterSpacing: '0.2px'
  },
  productUnit: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    marginBottom: '1.25rem',
    fontWeight: '400'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: '0.2px'
  },
  addBtn: {
    padding: '0.625rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderRadius: '4px'
  },
  addBtnDisabled: {
    background: '#F0EDE8',
    color: '#8B8B8B',
    cursor: 'not-allowed'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '2px solid #2C3E50',
    borderRadius: '8px',
    padding: '0.25rem 0.5rem'
  },
  quantityBtn: {
    width: '30px',
    height: '30px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2C3E50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    borderRadius: '4px'
  },
  quantity: {
    fontSize: '1rem',
    fontWeight: '700',
    minWidth: '24px',
    textAlign: 'center',
    color: '#2C3E50'
  },
  noResults: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  noResultsText: {
    fontSize: '1rem',
    color: '#8B8B8B',
    marginBottom: '1.5rem'
  },
  clearSearchBtn: {
    padding: '0.75rem 2rem',
    background: '#2C3E50',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  featuresSection: {
    background: '#F8F7F5',
    padding: '5rem 2rem',
    borderTop: '1px solid #E5E2DD'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '3rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    textAlign: 'left'
  },
  featureNumber: {
    fontSize: '2.5rem',
    fontWeight: '200',
    color: '#8B7355',
    marginBottom: '1rem',
    opacity: 0.6
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '0.75rem',
    letterSpacing: '0.3px'
  },
  featureText: {
    color: '#5A5A5A',
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    fontWeight: '300'
  },
  floatingCartBtn: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s'
  },
  cartIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#8B7355',
    color: '#FFFFFF',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default Home;
