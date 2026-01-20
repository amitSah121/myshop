import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { extractProducts } from '../utils/apiHelpers';
import Toast from '../components/Toast';

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [addingToCart, setAddingToCart] = useState(null);
  
  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '0');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '10000');
  const [rating, setRating] = useState(searchParams.get('rating') || '0');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, minPrice, maxPrice, rating, inStock, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/categories/list');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        search,
        category: selectedCategory,
        minPrice,
        maxPrice,
        rating,
        inStock: inStock.toString(),
        sortBy,
        sortOrder
      };

      const { data } = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(extractProducts(data));
      
      setSearchParams(params);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
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

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMinPrice('0');
    setMaxPrice('10000');
    setRating('0');
    setInStock(false);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (search) count++;
    if (selectedCategory !== 'all') count++;
    if (minPrice !== '0' || maxPrice !== '10000') count++;
    if (rating !== '0') count++;
    if (inStock) count++;
    return count;
  };

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.pageTitle}>Products</h1>
        
        {/* Search Bar */}
        <div style={styles.searchBar}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <button 
          style={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1A1A1A'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2C3E50'}
        >
          {showFilters ? '✕ Hide Filters' : `⚙️ Filters ${activeFiltersCount() > 0 ? `(${activeFiltersCount()})` : ''}`}
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* Filters Sidebar */}
        {showFilters && (
          <div style={styles.sidebar}>
            <div style={styles.filterHeader}>
              <h3 style={styles.filterTitle}>Filters</h3>
              {activeFiltersCount() > 0 && (
                <button 
                  style={styles.clearBtn} 
                  onClick={clearFilters}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#C0392B'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#E74C3C'}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterLabel}>Category</h4>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterLabel}>Price Range (₹)</h4>
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={styles.priceInput}
                  min="0"
                />
                <span style={styles.priceSeparator}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={styles.priceInput}
                  min="0"
                />
              </div>
              <div style={styles.priceDisplay}>
                ₹{minPrice} - ₹{maxPrice}
              </div>
            </div>

            {/* Rating Filter */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterLabel}>Minimum Rating</h4>
              <div style={styles.ratingButtons}>
                {[0, 1, 2, 3, 4].map(r => (
                  <button
                    key={r}
                    style={{
                      ...styles.ratingBtn,
                      ...(rating == r ? styles.ratingBtnActive : {})
                    }}
                    onClick={() => setRating(r.toString())}
                  >
                    {r === 0 ? 'All' : `${r}⭐+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Show In Stock Only</span>
              </label>
            </div>

            {/* Sort By */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterLabel}>Sort By</h4>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={styles.select}
              >
                <option value="createdAt-desc">⏰ Newest First</option>
                <option value="createdAt-asc">⏰ Oldest First</option>
                <option value="price-asc">💰 Price: Low to High</option>
                <option value="price-desc">💰 Price: High to Low</option>
                <option value="rating-desc">⭐ Highest Rated</option>
                <option value="name-asc">🔤 Name: A to Z</option>
                <option value="name-desc">🔤 Name: Z to A</option>
              </select>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div style={{...styles.productsSection, ...(showFilters ? {} : {marginLeft: 0})}}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📦</div>
              <h2>No products found</h2>
              <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                Try adjusting your search or filters
              </p>
              <button style={styles.clearBtnLarge} onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div style={styles.resultsHeader}>
                <p style={styles.resultsCount}>
                  <strong>{products.length}</strong> products found
                </p>
              </div>
              
              <div style={styles.grid}>
                {products.map(product => {
                  const cartQty = getCartQuantity(product._id);
                  const isAdding = addingToCart === product._id;

                  return (
                    <div 
                      key={product._id} 
                      style={styles.productCard}
                      onClick={() => navigate(`/product/${product._id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
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
                          <div style={styles.outOfStockOverlay}>Out of Stock</div>
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
                              {product.stock === 0 ? 'Out of Stock' : 'Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        show={toast.show} 
        onClose={() => setToast({ show: false, message: '' })}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
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
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '100vh'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2C3E50',
    margin: 0
  },
  searchBar: {
    flex: 1,
    position: 'relative',
    minWidth: '300px',
    maxWidth: '500px'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 3rem',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  filterToggle: {
    padding: '0.75rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s'
  },
  mainContent: {
    display: 'flex',
    gap: '2rem'
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '12px',
    padding: '1.5rem',
    height: 'fit-content',
    position: 'sticky',
    top: '100px'
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #E8ECEF'
  },
  filterTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    color: '#2C3E50'
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    background: '#E74C3C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  clearBtnLarge: {
    padding: '0.75rem 2rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filterGroup: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #F0F1F3'
  },
  filterLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '0.75rem',
    display: 'block'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    background: 'white',
    cursor: 'pointer'
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  priceInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #E8ECEF',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none'
  },
  priceSeparator: {
    color: '#6b7280',
    fontWeight: '600'
  },
  priceDisplay: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '0.5rem'
  },
  ratingButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem'
  },
  ratingBtn: {
    padding: '0.6rem 0.5rem',
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#6b7280'
  },
  ratingBtnActive: {
    background: '#2C3E50',
    color: 'white',
    borderColor: '#2C3E50'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#2C3E50',
    fontWeight: '500'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  productsSection: {
    flex: 1,
    transition: 'margin 0.3s'
  },
  resultsHeader: {
    marginBottom: '1.5rem'
  },
  resultsCount: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.5rem'
  },
  productCard: {
    background: 'white',
    border: '1px solid #E8ECEF',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
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
    transition: 'transform 0.3s'
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
    color: '#E74C3C',
    padding: '0.4rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
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
    justifyContent: 'center',
    color: '#8B8B8B',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  productInfo: {
    padding: '1.25rem'
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '0.5rem',
    lineHeight: '1.4'
  },
  productUnit: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    marginBottom: '1rem'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2C3E50'
  },
  addBtn: {
    padding: '0.625rem 1.5rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  addBtnDisabled: {
    background: '#E8ECEF',
    color: '#6b7280',
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
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#6b7280'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E8ECEF',
    borderTop: '4px solid #2C3E50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F9FA',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  }
};

export default Products;
