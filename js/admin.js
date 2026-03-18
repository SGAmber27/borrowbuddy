/**
 * Borrow Buddy Admin Dashboard JavaScript
 * Handles all admin functionality including item management, user management, and request approval
 */

// ==========================================
// GLOBAL VARIABLES & DATA MANAGEMENT
// ==========================================

// Global data arrays - Supabase ready
let items = [];
let requests = [];
let users = []; 


// Global state variables
let currentRequestIndex = null;
let currentItemImage = null;
let isSubmitting = false;
let currentUserFilter = 'all';
let editingItemIndex = null;
let editItemImageData = null;
let currentReturnIndex = null;

// DOM element references
let modal, closeModal, modalReject, approvalForm;
let itemForm, itemList, requestList, usersList;
let searchInput, userSearchInput, notification, formStatus, submitBtn;

// ==========================================
// INITIALIZATION & DATA SETUP
// ==========================================

/**
 * Initialize the admin dashboard
 * Sets up default data and initializes all components
 */
async function initializeAdminDashboard() {
  try {
    // Load ALL data from Supabase (parallel)
    [items, requests, users] = await Promise.all([
      getItemsAsync(),
      getRequestsAsync(),
      getUsersAsync()
    ]);
    
    // Init defaults only if needed
    await initDefaultItemsAsync();

    cacheDOMElements();
    setupEventListeners();
    ensureAdminRole();

    // Refresh UI
    displayItems();
    updateItemStats();
    displayUsers();
    displayRequests();
    
    console.log(`✅ Admin loaded: ${items.length} items, ${requests.length} requests, ${users.length} users`);
  } catch (error) {
    console.error('Dashboard init failed:', error);
    showNotification('Failed to load data', 'error');
  }
}


/**
 * Initialize default data if localStorage is empty
 */
// initializeDefaultData() removed - use initDefaultItemsAsync() from utils.js


/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
  // Modal elements
  modal = document.getElementById("approvalModal");
}