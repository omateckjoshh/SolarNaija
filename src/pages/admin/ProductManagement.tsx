import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Search, Star, ArrowLeft } from 'lucide-react';
import { supabase } from '../../App';
import { initializeStorage, uploadProductImage } from '../../utils/supabaseStorage';
import ProductForm from '../../components/ProductForm';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  specifications: Record<string, any>;
  features: string[];
  rating: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // ...existing code for products list and actions

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'inverters', label: 'Inverters' },
    { value: 'batteries', label: 'Batteries' },
    { value: 'panels', label: 'Solar Panels' },
    { value: 'kits', label: 'Solar Kits' },
    { value: 'combos', label: 'Combos' },
    { value: 'controllers', label: 'Charge Controllers' }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        await initializeStorage();
        fetchProducts();
      } catch (error: any) {
        console.error('Failed to initialize storage:', error);
        if (error?.message?.includes('Permission denied')) {
          alert('Permission denied. Please make sure you are logged in and have the correct permissions.');
        } else if (error?.message?.includes('NetworkError')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert(`Error initializing storage: ${error?.message || 'Unknown error'}`);
        }
      }
    };
    init();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  if (showAddForm) {
    const handleSubmit = async (formData: any, selectedFile: File | null) => {
      try {
        let imageUrl = formData.image;

        // If a file is selected, upload it
        if (selectedFile) {
          try {
            imageUrl = await uploadProductImage(selectedFile);
          } catch (error: any) {
            alert(error.message || 'Error uploading image');
            return;
          }
        } else if (!formData.image) {
          alert('Please either upload an image or provide an image URL');
          return;
        }

        // Parse specifications: accept JSON or friendly key: value lines
        const parseSpecifications = (input: string) => {
          if (!input || !input.trim()) return {};
          const trimmed = input.trim();
          // Try JSON first
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object') return parsed;
          } catch (e) {
            // Not JSON — proceed to parse key: value lines
          }

          const obj: Record<string, any> = {};
          const lines = trimmed.split(/\r?\n/);
          for (const line of lines) {
            const idx = line.indexOf(':');
            if (idx === -1) continue;
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            if (key) obj[key] = val;
          }
          return obj;
        };

        const productData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: imageUrl,
          category: formData.category,
          specifications: parseSpecifications(formData.specifications || ''),
          features: formData.features ? formData.features.split('\n').filter((f: string) => f.trim()) : [],
          rating: formData.rating,
          in_stock: formData.in_stock,
          featured: formData.featured
        };

        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id);

          if (error) throw error;
          alert('Product updated successfully!');
        } else {
          const { error } = await supabase
            .from('products')
            .insert([productData]);

          if (error) throw error;
          alert('Product added successfully!');
        }

        resetForm();
        fetchProducts();
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product. Please check your data and try again.');
      }
    };

    return (
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={resetForm}
        initialData={editingProduct ? {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price.toString(),
          image: editingProduct.image,
          category: editingProduct.category,
          specifications: (
            editingProduct.specifications && typeof editingProduct.specifications === 'object'
              ? Object.entries(editingProduct.specifications).map(([k, v]) => `${k}: ${v}`).join('\n')
              : (editingProduct.specifications as any) || ''
          ),
          features: Array.isArray(editingProduct.features) ? editingProduct.features.join('\n') : '',
          rating: editingProduct.rating,
          in_stock: editingProduct.in_stock,
          featured: editingProduct.featured
  } : undefined}
        isEdit={!!editingProduct}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link
                to="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600">Manage your solar product inventory</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              {product.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-gray-700">{product.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-700">{product.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.in_stock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;