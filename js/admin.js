/**
 * Borrow Buddy Admin Dashboard JavaScript
 * Handles all admin functionality including item management, user management, and request approval
 */

// ==========================================
// GLOBAL VARIABLES & DATA MANAGEMENT
// ==========================================

// Global data arrays
let items = JSON.parse(localStorage.getItem("items")) || [];
let requests = JSON.parse(localStorage.getItem("requests")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];

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
function initializeAdminDashboard() {
  // Initialize default data if empty
  initializeDefaultData();

  // Cache DOM elements
  cacheDOMElements();

  // Set up event listeners
  setupEventListeners();

  // Ensure admin role
  ensureAdminRole();

  // Display initial data
  displayItems();
  updateItemStats();
  displayUsers();
  displayRequests();
}

/**
 * Initialize default data if localStorage is empty
 */
function initializeDefaultData() {
  // Add test pending request if none exist
  if (requests.length === 0) {
    requests.push({
      student: "Test Student",
      studentEmail: "test@student.com",
      grade: "10",
      section: "A",
      itemCode: "BK001",
      itemName: "The Great Gatsby",
      status: "Pending",
      desiredDueDate: "2024-12-31",
      dueDate: "",
      approvedAt: "",
      requestedAt: new Date().toLocaleString(),
      requestDate: new Date().toLocaleString()
    });
    localStorage.setItem("requests", JSON.stringify(requests));
  }

  // Initialize default books if library is empty
  if (items.length === 0) {
    const defaultBooks = [
      { code: "BK001", name: "The Great Gatsby", author: "F. Scott Fitzgerald", description: "A classic novel by F. Scott Fitzgerald", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0743273567-M.jpg", publisher: "Scribner", publishedDate: "April 10, 1925", isbn: "978-0743273565", pages: 180 },
      { code: "BK002", name: "To Kill a Mockingbird", author: "Harper Lee", description: "Harper Lee's masterpiece about racial injustice", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0061120081-M.jpg", publisher: "J.B. Lippincott", publishedDate: "July 11, 1960", isbn: "978-0061120084", pages: 324 },
      { code: "BK003", name: "1984", author: "George Orwell", description: "George Orwell's dystopian novel", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0451524934-M.jpg", publisher: "Secker and Warburg", publishedDate: "June 8, 1949", isbn: "978-0451524935", pages: 328 },
      { code: "BK004", name: "Pride and Prejudice", author: "Jane Austen", description: "Jane Austen's romantic novel", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0141439513-M.jpg", publisher: "T. Egerton", publishedDate: "January 28, 1813", isbn: "978-0141439518", pages: 432 },
      { code: "BK005", name: "The Catcher in the Rye", author: "J.D. Salinger", description: "J.D. Salinger's coming-of-age novel", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0316769177-M.jpg", publisher: "Little, Brown", publishedDate: "July 16, 1951", isbn: "978-0316769174", pages: 277 },
      { code: "BK006", name: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", description: "J.K. Rowling's fantasy adventure", status: "Borrowed", image: "https://covers.openlibrary.org/b/isbn/0439708184-M.jpg", publisher: "Bloomsbury", publishedDate: "June 26, 1997", isbn: "978-0439708180", pages: 309 },
      { code: "BK007", name: "The Hobbit", author: "J.R.R. Tolkien", description: "J.R.R. Tolkien's fantasy classic", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0547928228-M.jpg", publisher: "Allen and Unwin", publishedDate: "September 21, 1937", isbn: "978-0547928228", pages: 342 },
      { code: "BK008", name: "Brave New World", author: "Aldous Huxley", description: "Aldous Huxley's science fiction novel", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0060850523-M.jpg", publisher: "Chatto and Windus", publishedDate: "August 30, 1932", isbn: "978-0060850524", pages: 311 },
      { code: "BK009", name: "The Lord of the Rings", author: "J.R.R. Tolkien", description: "Tolkien's epic fantasy trilogy", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0544003411-M.jpg", publisher: "Allen and Unwin", publishedDate: "July 29, 1954", isbn: "978-0544003415", pages: 1216 },
      { code: "BK010", name: "Dune", author: "Frank Herbert", description: "Frank Herbert's science fiction epic", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0441172717-M.jpg", publisher: "Chilton Books", publishedDate: "June 1, 1965", isbn: "978-0441172719", pages: 688 },
      { code: "BK011", name: "The Hunger Games", author: "Suzanne Collins", description: "Suzanne Collins' dystopian series", status: "Available", image: "https://covers.openlibrary.org/b/isbn/0439023521-M.jpg", publisher: "Scholastic Press", publishedDate: "September 14, 2008", isbn: "978-0439023521", pages: 374 },
      { code: "BK012", name: "Sherlock Holmes Collection", author: "Arthur Conan Doyle", description: "Arthur Conan Doyle's detective stories", status: "Available", image: "https://covers.openlibrary.org/b/isbn/1840224614-M.jpg", publisher: "Penguin Classics", publishedDate: "1892-1927", isbn: "978-1840224610", pages: 1461 }
    ];
    items = defaultBooks;
    localStorage.setItem("items", JSON.stringify(items));
  }
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
  // Modal elements
  modal = document.getElementById("approvalModal");
