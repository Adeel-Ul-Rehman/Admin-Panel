import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../../client/src/context/AppContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BulkProductUpload = () => {
  const { admin } = useContext(AppContext);
  const [jsonData, setJsonData] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validateProductData = (product) => {
    const errors = [];

    // Required fields validation
    if (!product.name) errors.push('Name is required');
    if (!product.description) errors.push('Description is required');
    if (!product.price) errors.push('Price is required');
    if (!product.category) errors.push('Category is required');
    if (!product.author) errors.push('Author is required');
    if (!product.language) errors.push('Language is required');

    // Length validation
    if (product.name && product.name.length > 255) errors.push('Name too long (max 255 chars)');
    if (product.description && product.description.length > 1000) errors.push('Description too long (max 1000 chars)');

    // Price validation
    if (product.price && (isNaN(product.price) || parseFloat(product.price) <= 0)) errors.push('Invalid price');
    if (product.originalPrice && (isNaN(product.originalPrice) || parseFloat(product.originalPrice) <= 0)) {
      errors.push('Invalid original price');
    }

    return errors;
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
    setValidationErrors([]);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jsonData.trim()) {
      toast.error('Please paste product JSON data');
      return;
    }

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    let productData;
    try {
      productData = JSON.parse(jsonData);
    } catch (error) {
      toast.error('Invalid JSON format');
      return;
    }

    // Validate product data
    const errors = validateProductData(productData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsUploading(true);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      
      // Append all product fields
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('author', productData.author);
      formData.append('language', productData.language);
      
      if (productData.originalPrice) formData.append('originalPrice', productData.originalPrice);
      if (productData.isbn) formData.append('isbn', productData.isbn);
      
      // Handle subCategories (convert to JSON string if it's an array/object)
      if (productData.subCategories) {
        if (typeof productData.subCategories === 'string') {
          formData.append('subCategories', productData.subCategories);
        } else {
          formData.append('subCategories', JSON.stringify(productData.subCategories));
        }
      }
      
      // Append the image file
      formData.append('image', imageFile);

      // Make the API request (temporarily without adminAuth)
      const response = await axios.post(`${backendURL}/adminCtrl/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Product added successfully!');
        setJsonData('');
        setImageFile(null);
        document.getElementById('image-input').value = '';
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  const jsonTemplate = `{
  "name": "Book Name",
  "description": "Book description...",
  "price": 19.99,
  "originalPrice": 24.99,
  "category": "Fiction",
  "subCategories": ["Novel", "Adventure"],
  "author": "Author Name",
  "isbn": "1234567890",
  "language": "English"
}`;

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Bulk Product Upload</h1>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Note</p>
        <p>Admin authentication is temporarily disabled for this endpoint to facilitate bulk uploads.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Product JSON Format</h2>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <pre className="whitespace-pre-wrap">{jsonTemplate}</pre>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Required Fields:</h3>
            <ul className="list-disc list-inside">
              <li>name (max 255 chars)</li>
              <li>description (max 1000 chars)</li>
              <li>price (number greater than 0)</li>
              <li>category</li>
              <li>author</li>
              <li>language</li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Optional Fields:</h3>
            <ul className="list-disc list-inside">
              <li>originalPrice (number greater than 0)</li>
              <li>isbn</li>
              <li>subCategories (array or JSON string)</li>
            </ul>
          </div>
        </div>
        
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="json-data">
                Product JSON Data
              </label>
              <textarea
                id="json-data"
                className="w-full h-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={jsonData}
                onChange={handleJsonChange}
                placeholder="Paste product JSON data here"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-input">
                Product Image
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                <h4 className="font-bold mb-1">Validation Errors:</h4>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;