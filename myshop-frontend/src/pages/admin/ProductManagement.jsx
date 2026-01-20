import { useState, useEffect } from 'react';
import axios from 'axios';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    unit: 'pcs',
    unitQuantity: '1',
    image: null
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '📦'
  });
  const [loading, setLoading] = useState(false);

  // ✅ Unit options
  const unitOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'box', label: 'Box' },
    { value: 'packet', label: 'Packet' }
  ];

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

 const loadProducts = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get('http://localhost:5000/api/products');
    
    // ✅ Ensure products is always an array
    setProducts(Array.isArray(data.products) ? data.products : []);
  } catch (error) {
    console.error('Failed to load products:', error);
    setProducts([]); // ✅ Set to empty array on error
  } finally {
    setLoading(false);
  }
};

  const loadCategories = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/categories');
      setCategories(data);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({ ...categoryFormData, [name]: value });
  };

  // ✅ CREATE NEW CATEGORY
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name || categoryFormData.name.trim() === '') {
      alert('❌ Please enter a category name!');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'http://localhost:5000/api/categories',
        {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          icon: categoryFormData.icon || '📦'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Category created:', data.category);
      
      alert(`✅ Category "${data.category.name}" created successfully!`);
      
      setCategories([...categories, data.category]);
      setFormData({ ...formData, category: data.category.name });
      setShowCategoryForm(false);
      setCategoryFormData({ name: '', description: '', icon: '📦' });
      
    } catch (error) {
      console.error('Create category error:', error);
      alert('Failed to create category: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || formData.category.trim() === '') {
      alert('❌ Please select a category or create a new one!');
      return;
    }
    
    if (!formData.unit) {
      alert('❌ Please select a unit!');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('unitQuantity', formData.unitQuantity);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('📤 Submitting product with category:', formData.category);

      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('✅ Product updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/products',
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert('✅ Product added successfully!');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        unit: 'pcs',
        unitQuantity: '1',
        image: null
      });
      setEditingProduct(null);
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save product: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      unit: product.unit || 'pcs',
      unitQuantity: product.unitQuantity || '1',
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Product deleted!');
      loadProducts();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Product Management</h1>
        <button 
          style={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              stock: '',
              unit: 'pcs',
              unitQuantity: '1',
              image: null
            });
          }}
        >
          ➕ Add Product
        </button>
      </div>

      {/* ADD/EDIT PRODUCT FORM */}
      {showForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            
            {/* ✅ PRODUCT NAME */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="e.g., Basmati Rice"
              />
            </div>

            {/* ✅ DESCRIPTION */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                style={styles.textarea}
                placeholder="Product description..."
                rows="3"
              />
            </div>

            {/* ✅ CATEGORY SECTION - ONLY ONE! */}
            <div style={styles.formGroup}>
              <div style={styles.categoryHeader}>
                <label style={styles.label}>
                  Category * 
                  {formData.category && (
                    <span style={{ color: '#10b981', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                      ✓ Selected: {formData.category}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  style={styles.createCategoryBtn}
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                >
                  {showCategoryForm ? '❌ Cancel' : '➕ New Category'}
                </button>
              </div>

              {showCategoryForm ? (
                <div style={styles.inlineCategoryForm}>
                  <input
                    type="text"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    placeholder="Category name (e.g., Groceries)"
                    style={styles.input}
                  />
                  <input
                    type="text"
                    name="icon"
                    value={categoryFormData.icon}
                    onChange={handleCategoryInputChange}
                    placeholder="Icon"
                    style={{...styles.input, width: '80px'}}
                    maxLength="2"
                  />
                  <button
                    type="button"
                    style={styles.saveCategoryBtn}
                    onClick={handleCreateCategory}
                  >
                    ✅ Save
                  </button>
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...styles.input,
                    border: formData.category ? '1px solid #10b981' : '1px solid #d1d5db'
                  }}
                >
                  <option value="">-- Select a category --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
              
              {!formData.category && !showCategoryForm && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  ⚠️ Please select a category or create a new one
                </p>
              )}
            </div>

            {/* ✅ PRICE & STOCK ROW */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="99"
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            {/* ✅ UNIT & QUANTITY ROW */}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  {unitOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Quantity per Unit *</label>
                <input
                  type="number"
                  name="unitQuantity"
                  value={formData.unitQuantity}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="e.g., 500 (for 500g)"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            {/* ✅ IMAGE UPLOAD */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Product Image * {editingProduct && '(Leave empty to keep current)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingProduct}
                style={styles.fileInput}
              />
              {formData.image && (
                <p style={styles.fileName}>📎 {formData.image.name}</p>
              )}
            </div>

            {/* ✅ FORM ACTIONS */}
            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? '⏳ Saving...' : (editingProduct ? '💾 Update' : '➕ Add Product')}
              </button>
              <button 
                type="button"
                style={styles.cancelBtn}
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS LIST */}
      <div style={styles.productsList}>
        <h2 style={styles.sectionTitle}>All Products ({products.length})</h2>
        <div style={styles.productsGrid}>
          {products.map(product => (
            <div key={product._id} style={styles.productCard}>
              <img 
                src={`http://localhost:5000${product.image}`} 
                alt={product.name}
                style={styles.productImage}
                onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
              />
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDesc}>{product.description}</p>
                <div style={styles.productMeta}>
                  <span style={styles.price}>₹{product.price}</span>
                  <span style={styles.unit}>
                    {product.unitQuantity} {product.unit}
                  </span>
                </div>
                <div style={styles.productMeta}>
                  <span style={styles.stock}>Stock: {product.stock}</span>
                  <span style={styles.category}>{product.category}</span>
                </div>
                <div style={styles.productActions}>
                  <button 
                    style={styles.editBtn}
                    onClick={() => handleEdit(product)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(product._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  formContainer: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#1f2937'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    width: '100%'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  createCategoryBtn: {
    padding: '0.5rem 1rem',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  inlineCategoryForm: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  saveCategoryBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  fileInput: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  fileName: {
    marginTop: '0.5rem',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  submitBtn: {
    padding: '0.75rem 2rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1
  },
  cancelBtn: {
    padding: '0.75rem 2rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  productsList: {
    marginTop: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#1f2937'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  productInfo: {
    padding: '1rem'
  },
  productName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937'
  },
  productDesc: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
    lineHeight: '1.4'
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },
  price: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#10b981'
  },
  unit: {
    fontSize: '0.9rem',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontWeight: '600'
  },
  stock: {
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  category: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  productActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  editBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  deleteBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default ProductManagement;
