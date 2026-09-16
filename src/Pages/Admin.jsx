import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Search, Trash2, LogOut, Package, TrendingUp, AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';
import '../Styles/Admin.css';


export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const LOW_STOCK_THRESHOLD = 5;
  const OUT_OF_STOCK_THRESHOLD = 0;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    if (!token || user?.role !== 'admin') {
      navigate('/login', { replace: true });
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.products || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    // Validate form data
    if (!formData.title || !formData.description || !formData.price || !formData.category || !imageFile) {
      setError('All fields including image are required.');
      return;
    }
    
    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock) || 0;
    
    if (priceNum <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    
    if (stockNum < 0) {
      setError('Stock cannot be negative.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', priceNum);
    data.append('category', formData.category.trim());
    data.append('stock', stockNum);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const response = await api.post('/products', data, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setProducts([response.data.product, ...products]);
      setFormData({ title: '', description: '', price: '', category: '', stock: '' });
      setImageFile(null);
      setImagePreview('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProducts(products.filter((product) => product._id !== productId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete product.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredProducts = products.filter((product) => 
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick stats calculations
  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => {
    const stock = Number(p.stock) || 0;
    return stock > OUT_OF_STOCK_THRESHOLD && stock <= LOW_STOCK_THRESHOLD;
  }).length;
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) <= OUT_OF_STOCK_THRESHOLD).length;
  const uniqueCategories = [...new Set(products.map(p => p.category))].length;



  

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-badge-top">SwiftCart Command Center</span>
          <h1>Store Dashboard</h1>
        </div>
        <div className="admin-actions">
          <Link to="/" className="admin-link">View Storefront</Link>
          <button type="button" onClick={logout} className="admin-logout">
            <LogOut size={16} className="button-icon" /> Log out
          </button>
        </div>
      </header>

      {/* Metrics Summary Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue"><Package size={20} /></div>
          <div>
            <p className="metric-label">Total Products</p>
            <h3 className="metric-value">{products.length}</h3>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green"><TrendingUp size={20} /></div>
          <div>
            <p className="metric-label">Inventory Units</p>
            <h3 className="metric-value">{totalStockCount}</h3>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon amber"><AlertTriangle size={20} /></div>
          <div>
            <p className="metric-label">Low Stock Alerts</p>
            <h3 className="metric-value">{lowStockCount} ({outOfStockCount} out)</h3>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple"><Layers size={20} /></div>
          <div>
            <p className="metric-label">Categories</p>
            <h3 className="metric-value">{uniqueCategories}</h3>
          </div>
        </div>
      </section>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-layout">
        <form className="product-form" onSubmit={handleSubmit}>
          <h2>Add New Product</h2>
          
          <div className="input-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Wireless Earbuds" required />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter detailed product information..." required />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Price (₦)</label>
              <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="input-group">
              <label>Stock Units</label>
              <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <div className="input-group">
            <label>Category</label>
            <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Electronics" required />
          </div>

          <div className="input-group">
            <label>Product Image File</label>
            <input name="image" type="file" accept="image/*" onChange={handleFileChange} required />
          </div>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}

          <button type="submit" className="admin-submit" disabled={submitting}>
            {submitting ? 'Publishing Product...' : 'Publish Product'}
          </button>
        </form>

        <section className="product-list-container">
          <div className="section-heading">
            <div>
              <h2>Inventory Catalog</h2>
              <p>Manage and monitor active store listings</p>
            </div>
            <span className="count-badge">{filteredProducts.length} items</span>
          </div>

          <div className="admin-search-container">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading inventory...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">No matching products found.</div>
          ) : (
            <div className="products-stack">
              {filteredProducts.map((product) => {
                const stockVal = Number(product.stock) || 0;
                const stockClass = stockVal <= OUT_OF_STOCK_THRESHOLD ? 'out' : stockVal <= LOW_STOCK_THRESHOLD ? 'low' : 'ok';
                const stockText = stockVal <= OUT_OF_STOCK_THRESHOLD 
                  ? 'Out of Stock' 
                  : stockVal <= LOW_STOCK_THRESHOLD 
                  ? `${stockVal} Low Stock` 
                  : `${stockVal} in stock`;

                return (
                  <article className="product-row" key={product._id}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} />
                    ) : (
                      <div className="product-placeholder-icon">
                        <ImageIcon size={20} color="#94A3B8" />
                      </div>
                    )}
                    <div className="product-details">
                      <h3>{product.title}</h3>
                      <div className="product-meta">
                        <span className="category-pill">{product.category}</span>
                        <span className={`stock-pill ${stockClass}`}>{stockText}</span>
                      </div>
                    </div>
                    <div className="product-price">
                      <strong>₦{Number(product.price).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                    <button type="button" onClick={() => handleDelete(product._id)} className="delete-button" aria-label="Delete product">
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}