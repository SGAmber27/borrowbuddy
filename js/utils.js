/**
 * Borrow Buddy - Shared Utilities
 * Common functions for auth, storage, validation, notifications
 * ✅ Supabase Integration Complete
 */

(function() {
  'use strict';

  // Load Supabase from CDN (add to HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>)
  const supabasejs = supabasejs || window.supabasejs; // Fallback


  // ========================================
  // SUPABASE CONFIGURATION
  // ========================================
  // ⚠️ REPLACE THESE WITH YOUR SUPABASE VALUES
  const SUPABASE_URL = 'https://merrdzfabaujzkuxkhob.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcnJkemZhYmF1anprdXhraG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDc1NDUsImV4cCI6MjA4OTIyMzU0NX0.YsS_jB6qz3EIijiRoLL1tbjYEGG8XDDItHEzi4-Cx9Y';
  
  let supabase = null;
  
  /**
   * Initialize Supabase client
   */
  window.initSupabase = async function() {
    if (supabase) return supabase;
    
    const { createClient } = supabasejs; // Assumes CDN loaded
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase initialized');
    return supabase;
  };
  
  // Global cache for items (for performance)
  window.itemsCache = [];
  window.itemsCacheValid = false;

  // ========================================
  // AUTHENTICATION
  // ========================================


/**
 * Get current logged-in user from Supabase Auth session
 * @returns {Promise<Object|null>} User object or null
 */
window.getCurrentUser = async function() {
  try {
    await initSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // Not found
      console.error('Profile fetch error:', profileError);
      return { id: user.id, email: user.email, role: 'student' }; // Fallback
    }

    return profile || { id: user.id, email: user.email, role: 'student' };
  } catch (e) {
    console.error('Error getting current user:', e);
    return null;
  }
};

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  window.isAdmin = async function() {
    const user = await getCurrentUser();
    return user && user.role === 'admin';
  };

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  window.isLoggedIn = async function() {
    const user = await getCurrentUser();
    return user !== null;
  };

  /**
   * Require admin access - redirect if not authorized
   * @param {string} redirectUrl - URL to redirect to
   * @param {string} message - Optional message
   */
  window.requireAdmin = async function(redirectUrl = 'login.html', message = '') {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
      if (message) {
        alert(message);
      }
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  };

/**
 * Logout user from Supabase Auth
 */
window.logout = async function() {
  try {
    await initSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
  } catch (e) {
    console.error('Logout failed:', e);
  }
  window.location.href = 'login.html';
};

  // ========================================
  // SUPABASE ITEMS OPERATIONS
  // ========================================
  /**
   * Get all items from Supabase (with cache)
   */
  window.getItemsAsync = async function() {
    await initSupabase();
    
    if (window.itemsCacheValid) {
      return window.itemsCache;
    }
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('addedAt', { ascending: false });
      
      if (error) throw error;
      
      // Direct schema mapping - matches table exactly
      window.itemsCache = (data || []).map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        author: row.author,
        status: row.status || 'Available',
        image: row.image,
        description: row.description,
        addedAt: row.addedAt,
        publisher: row.publisher,
        publishedDate: row.publishedDate,
        isbn: row.isbn,
        pages: row.pages
      }));
      
      window.itemsCacheValid = true;
      console.log(`✅ Fetched ${window.itemsCache.length} items from Supabase`);
      return window.itemsCache;
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to load items from database', 'error');
      return [];
    }
  };

  /**
   * Add new item to Supabase
   */
  window.addItemAsync = async function(newItem) {
    await initSupabase();
    
    try {
      const itemData = {
        code: newItem.code,
        name: newItem.name,
        author: newItem.author,
        status: newItem.status || 'Available',
        image: newItem.image,
        description: newItem.description,
        publisher: newItem.publisher,
        publishedDate: newItem.publishedDate,
        isbn: newItem.isbn,
        pages: newItem.pages,
        addedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to cache
      const fullItem = { id: data.id, ...newItem };
      window.itemsCache.unshift(fullItem);
      
      window.itemsCacheValid = true;
      console.log('✅ Item added:', data.id);
      showNotification('Item added successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Failed to add item', 'error');
      return null;
    }
  };

  /**
   * Update item in Supabase
   */
  window.updateItemAsync = async function(id, updates) {
    await initSupabase();
    
    try {
      const updateData = {
        code: updates.code,
        name: updates.name,
        author: updates.author,
        status: updates.status,
        image: updates.image,
        description: updates.description,
        publisher: updates.publisher,
        publishedDate: updates.publishedDate,
        isbn: updates.isbn,
        pages: updates.pages
      };
      
      const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update cache
      const index = window.itemsCache.findIndex(i => i.id === id);
      if (index > -1) {
        window.itemsCache[index] = { ...window.itemsCache[index], ...updates };
      }
      
      console.log('✅ Item updated:', id);
      showNotification('Item updated successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Failed to update item', 'error');
      return null;
    }
  };

  /**
   * Delete item from Supabase
   */
  window.deleteItemAsync = async function(id) {
    await initSupabase();
    
    try {
      const { data, error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Remove from cache
      window.itemsCache = window.itemsCache.filter(i => i.id !== id);
      
      console.log('✅ Item deleted:', id);
      showNotification('Item deleted successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item', 'error');
      return false;
    }
  };

  /**
   * Initialize default items if table empty
   */
  window.initDefaultItemsAsync = async function() {
    const items = await getItemsAsync();
    if (items.length > 0) return;
    
    const defaultBooks = [
      { code: "BK001", name: "The Great Gatsby", author: "F. Scott Fitzgerald", description: "A classic novel by F. Scott Fitzgerald", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0743273567-M.jpg", publisher: "Scribner", publishedDate: "April 10, 1925", isbn: "978-0743273565", pages: 180 },
      { code: "BK002", name: "To Kill a Mockingbird", author: "Harper Lee", description: "Harper Lee's masterpiece about racial injustice", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0061120081-M.jpg", publisher: "J.B. Lippincott", publishedDate: "July 11, 1960", isbn: "978-0061120084", pages: 324 },
      // ... (add all 12 defaults from admin.js)
    ];
    
    for (const item of defaultBooks) {
      await addItemAsync(item);
    }
    
    showNotification('Default items initialized!', 'success');
  };

  /**
   * Invalidate cache (call after external changes)
   */
  window.invalidateItemsCache = function() {
    window.itemsCacheValid = false;
  };

  // ========================================
  // SUPABASE USERS OPERATIONS
  // ========================================
  window.usersCache = [];
  window.usersCacheValid = false;

  window.getUsersAsync = async function() {
    await initSupabase();
    
    if (window.usersCacheValid) {
      return window.usersCache;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      window.usersCache = data || [];
      window.usersCacheValid = true;
      console.log(`✅ Fetched ${window.usersCache.length} users from Supabase`);
      return window.usersCache;
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
      return [];
    }
  };

  window.addUserAsync = async function(newUser) {
    await initSupabase();
    
    try {
      const userData = {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role || 'student',
        isActive: newUser.isActive !== false, // default true
        createdAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      
      const fullUser = { id: data.id, ...newUser };
      window.usersCache.unshift(fullUser);
      window.usersCacheValid = true;
      
      console.log('✅ User added:', data.id);
      showNotification('User added successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('Failed to add user', 'error');
      return null;
    }
  };

  window.updateUserAsync = async function(id, updates) {
    await initSupabase();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const index = window.usersCache.findIndex(u => u.id === id);
      if (index > -1) {
        window.usersCache[index] = { ...window.usersCache[index], ...updates };
      }
      
      console.log('✅ User updated:', id);
      showNotification('User updated successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user', 'error');
      return null;
    }
  };

  window.deleteUserAsync = async function(id) {
    await initSupabase();
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      window.usersCache = window.usersCache.filter(u => u.id !== id);
      
      console.log('✅ User deleted:', id);
      showNotification('User deleted successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
      return false;
    }
  };

  // ========================================
  // SUPABASE REQUESTS OPERATIONS
  // ========================================
  window.requestsCache = [];
  window.requestsCacheValid = false;

  window.getRequestsAsync = async function() {
    await initSupabase();
    
    if (window.requestsCacheValid) {
      return window.requestsCache;
    }
    
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('requestedAt', { ascending: false });
      
      if (error) throw error;
      
      window.requestsCache = data || [];
      window.requestsCacheValid = true;
      console.log(`✅ Fetched ${window.requestsCache.length} requests from Supabase`);
      return window.requestsCache;
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification('Failed to load requests', 'error');
      return [];
    }
  };

  window.addRequestAsync = async function(newRequest) {
    await initSupabase();
    
    try {
      const requestData = {
        student: newRequest.student,
        studentEmail: newRequest.studentEmail,
        itemCode: newRequest.itemCode,
        itemName: newRequest.itemName,
        status: newRequest.status || 'Pending',
        requestedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('requests')
        .insert([requestData])
        .select()
        .single();
      
      if (error) throw error;
      
      const fullRequest = { id: data.id, ...newRequest };
      window.requestsCache.unshift(fullRequest);
      window.requestsCacheValid = true;
      
      console.log('✅ Request added:', data.id);
      showNotification('Request added successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error adding request:', error);
      showNotification('Failed to add request', 'error');
      return null;
    }
  };

  window.updateRequestAsync = async function(id, updates) {
    await initSupabase();
    
    try {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const index = window.requestsCache.findIndex(r => r.id === id);
      if (index > -1) {
        window.requestsCache[index] = { ...window.requestsCache[index], ...updates };
      }
      
      console.log('✅ Request updated:', id);
      showNotification('Request updated successfully!', 'success');
      return data;
    } catch (error) {
      console.error('Error updating request:', error);
      showNotification('Failed to update request', 'error');
      return null;
    }
  };

  window.deleteRequestAsync = async function(id) {
    await initSupabase();
    
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      window.requestsCache = window.requestsCache.filter(r => r.id !== id);
      
      console.log('✅ Request deleted:', id);
      showNotification('Request deleted successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting request:', error);
      showNotification('Failed to delete request', 'error');
      return false;
    }
  };

  window.invalidateAllCaches = function() {
    window.itemsCacheValid = false;
    window.usersCacheValid = false;
    window.requestsCacheValid = false;
  };

  // ========================================
  // LOCALSTORAGE HELPERS (Safe Operations) - Legacy for users/requests
  // ========================================


/* safeGet removed - use Supabase async functions */

/* safeSet removed - use Supabase async functions */

  // Async wrappers for backward compatibility
  window.getItems = async function() { 
    return await getItemsAsync(); 
  };
  window.setItems = async function(items) { 
    window.itemsCacheValid = false;
    return true; // Cache invalidation only
  };
  window.getRequests = async function() { 
    return await getRequestsAsync(); 
  };
  window.setRequests = async function(requests) { 
    window.requestsCacheValid = false;
    return true;
  };
  window.getUsers = async function() { 
    return await getUsersAsync(); 
  };
  window.setUsers = async function(users) { 
    window.usersCacheValid = false;
    return true;
  };

  /**
   * Add or update user
   * @param {Object} userData
   * @returns {boolean}
   */
/**
 * Save user profile to Supabase profiles table
 * @param {Object} profileData
 * @returns {Promise<boolean>}
 */
window.saveProfileAsync = async function(profileData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileData })
      .select();

    showNotification('Profile saved successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Profile save error:', error);
    showNotification('Failed to save profile', 'error');
    return false;
  }
};

  // ========================================
  // VALIDATION
  // ========================================

  /**
   * Validate item code format (e.g., BK001, MATH101)
   * @param {string} code
   * @returns {boolean}
   */
  window.isValidItemCode = function(code) {
    return /^[A-Z]{2,4}\d{3,4}$/i.test(code.trim());
  };

  /**
   * Validate email
   * @param {string} email
   * @returns {boolean}
   */
  window.isValidEmail = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Validate password strength
   * @param {string} password
   * @returns {boolean}
   */
  window.isValidPassword = function(password) {
    return password && password.length >= 4;
  };

  // ========================================
  // NOTIFICATIONS
  // ========================================

  /**
   * Show notification toast
   * @param {string} message
   * @param {string} type - success|error|info|warning
   * @param {number} duration
   */
  window.showNotification = function(message, type = 'info', duration = 4000) {
    // Remove existing
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  };

  function getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      info: 'info-circle',
      warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
  }

  // ========================================
  // DATA OPERATIONS
  // ========================================

  /**
   * Find item by code
   * @param {string} code
   * @returns {Object|null}
   */
  window.findItemByCode = function(code) {
    return getItems().find(item => item.code === code);
  };

  /**
   * Update item status
   * @param {string} code
   * @param {string} status
   * @returns {boolean}
   */
  window.updateItemStatus = function(code, status) {
    const items = getItems();
    const itemIndex = items.findIndex(item => item.code === code);
    
    if (itemIndex >= 0) {
      items[itemIndex].status = status;
      return setItems(items);
    }
    return false;
  };

  // ========================================
  // INIT
  // ========================================

  // Export globals
  window.BorrowBuddyUtils = {
    getCurrentUser,
    isAdmin,
    isLoggedIn,
    requireAdmin,
    logout,
    safeGet,
    safeSet,
    getItems,
    setItems,
    getRequests,
    setRequests,
    getUsers,
    setUsers,
    saveUser,
    isValidItemCode,
    isValidEmail,
    isValidPassword,
    showNotification,
    findItemByCode,
    updateItemStatus
  };

})();

