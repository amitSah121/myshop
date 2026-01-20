import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById, getProducts } from '../services/api'
import { useCart } from '../context/CartContext'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await getProductById(id)
      setProduct(data)
      
      // Fetch related products (same category)
      const allProducts = await getProducts({ category: data.category })
      const related = allProducts.filter(p => p._id !== id).slice(0, 3)
      setRelatedProducts(related)
    } catch (error) {
      console.error('Error:', error)
      alert('Product not found!')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    
    // Toast notification
    const toast = document.createElement('div')
    toast.textContent = `✓ ${quantity} ${product.name} added to cart!`
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) return null

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSeparator}>›</span>
        <Link to="/products" style={styles.breadcrumbLink}>Products</Link>
        <span style={styles.breadcrumbSeparator}>›</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      {/* Product Details */}
      <div style={styles.productContainer}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <img src={product.image} alt={product.name} style={styles.productImage} />
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.productName}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>
          
          <div style={styles.priceSection}>
            <span style={styles.price}>₹{product.price.toLocaleString()}</span>
            <span style={styles.stock}>✓ In Stock</span>
          </div>

          {/* Quantity Selector */}
          <div style={styles.quantitySection}>
            <label style={styles.label}>Quantity:</label>
            <div style={styles.quantityControls}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyBtn}
              >
                −
              </button>
              <span style={styles.qtyDisplay}>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                style={styles.qtyBtn}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button onClick={handleAddToCart} style={styles.addToCartBtn}>
              🛒 Add to Cart
            </button>
            <button onClick={() => navigate('/cart')} style={styles.buyNowBtn}>
              ⚡ Buy Now
            </button>
          </div>

          {/* Features */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p style={styles.featureText}>On orders above ₹500</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>↩️</span>
              <div>
                <strong>Easy Returns</strong>
                <p style={styles.featureText}>7-day return policy</p>
              </div>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <div>
                <strong>Verified Quality</strong>
                <p style={styles.featureText}>100% authentic products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>You May Also Like</h2>
          <div style={styles.relatedGrid}>
            {relatedProducts.map(relatedProduct => (
              <div 
                key={relatedProduct._id} 
                style={styles.relatedCard}
                onClick={() => navigate(`/product/${relatedProduct._id}`)}
              >
                <img 
                  src={relatedProduct.image} 
                  alt={relatedProduct.name} 
                  style={styles.relatedImage} 
                />
                <div style={styles.relatedInfo}>
                  <h4 style={styles.relatedName}>{relatedProduct.name}</h4>
                  <p style={styles.relatedPrice}>₹{relatedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: 'calc(100vh - 80px)'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    fontSize: '0.9rem'
  },
  breadcrumbLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500'
  },
  breadcrumbSeparator: {
    color: '#9ca3af'
  },
  breadcrumbCurrent: {
    color: '#6b7280'
  },
  productContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '4rem',
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productImage: {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    borderRadius: '12px',
    objectFit: 'cover'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  category: {
    color: '#2563eb',
    fontSize: '0.9rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  productName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  description: {
    fontSize: '1.1rem',
    color: '#6b7280',
    lineHeight: '1.6'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2563eb'
  },
  stock: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: '1rem'
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  label: {
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#f3f4f6',
    padding: '0.5rem 1rem',
    borderRadius: '8px'
  },
  qtyBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    width: '35px',
    height: '35px',
    borderRadius: '6px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  qtyDisplay: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    minWidth: '40px',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  addToCartBtn: {
    flex: 1,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buyNowBtn: {
    flex: 1,
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  featureIcon: {
    fontSize: '2rem'
  },
  featureText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0
  },
  relatedSection: {
    marginTop: '4rem'
  },
  relatedTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#111827'
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem'
  },
  relatedCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  relatedImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  relatedInfo: {
    padding: '1rem'
  },
  relatedName: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    color: '#111827'
  },
  relatedPrice: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: 0
  }
}

// Add spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .productContainer {
      grid-template-columns: 1fr !important;
    }
    .relatedGrid {
      grid-template-columns: 1fr !important;
    }
  }
`
document.head.appendChild(styleSheet)

export default ProductDetails
