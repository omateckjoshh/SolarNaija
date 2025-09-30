import { supabase } from '../App';

export const initializeStorage = async () => {
  try {
    // Try to access the products bucket
    const { error: listError } = await supabase
      .storage
      .from('products')
      .list();

    if (listError) {
      console.error('Error accessing products bucket:', listError);
      throw listError;
    }

    console.log('Successfully connected to products bucket');
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Generate a unique filename
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError.message.includes('permission')) {
        throw new Error('Permission denied. Please make sure you are logged in.');
      }
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Error uploading image');
  }
};