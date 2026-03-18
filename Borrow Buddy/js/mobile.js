/**
 * Borrow Buddy - Mobile JavaScript
 * Handles mobile-specific functionality
 */

(function() {
  'use strict';

  // ========================================
  // MOBILE NAVIGATION
  // ========================================
  
  /**
   * Initialize mobile navigation
   */
  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const body = document.body;

    if (!hamburger || !mobileMenu) return;

    // Toggle menu
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    // Close on overlay click
    mobileMenu.addEventListener('click', function(e) {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Close menu function
    function closeMobileMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Close menu when clicking a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // ========================================
  // BOTTOM NAVIGATION
  // ========================================

  /**
   * Initialize bottom navigation for mobile
   */
  function initBottomNav() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;

    // Add class to body for padding
    document.body.classList.add('has-bottom-nav');

    // Set active state based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = bottomNav.querySelectorAll('.bottom-nav-link');

    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ========================================
  // MOBILE MODAL HANDLING
  // ========================================

  /**
   * Enhance modals for mobile
   */
  function initMobileModals() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(function(modal) {
      // Add mobile-friendly classes
      modal.classList.add('mobile-modal');

      // Handle swipe down to close
      let startY = 0;
      let currentY = 0;
      const modalContent = modal.querySelector('.modal-content');

      if (!modalContent) return;

      modalContent.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
      }, { passive: true });

      modalContent.addEventListener('touchmove', function(e) {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0 && modal.scrollTop === 0) {
          // Pulling down from top
          e.preventDefault();
          modalContent.style.transform = `translateY(${diff}px)`;
          modalContent.style.opacity = 1 - (diff / 300);
        }
      }, { passive: false });

      modalContent.addEventListener('touchend', function(e) {
        const diff = currentY - startY;
        
        if (diff > 100) {
          // Close modal on swipe down
          modal.style.display = 'none';
          modalContent.style.transform = '';
          modalContent.style.opacity = '';
        } else {
          modalContent.style.transform = '';
          modalContent.style.opacity = '';
        }
      }, { passive: true });
    });
  }

  // ========================================
  // MOBILE TOAST NOTIFICATIONS
  // ========================================

  /**
   * Show mobile toast notification
   */
  window.showMobileToast = function(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-mobile');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-mobile ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(function() {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);

    return toast;
  };

  // ========================================
  // PULL TO REFRESH
  // ========================================

  /**
   * Initialize pull to refresh
   */
  function initPullToRefresh() {
    const container = document.querySelector('.dashboard-container') || 
                     document.querySelector('.admin-container') ||
                     document.body;
    
    let startY = 0;
    let currentY = 0;
    let isRefreshing = false;
    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-to-refresh';
    pullIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pull to refresh...';
    pullIndicator.style.display = 'none';
    
    container.parentNode.insertBefore(pullIndicator, container);

    document.addEventListener('touchstart', function(e) {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (window.scrollY === 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 50) {
          pullIndicator.style.display = 'block';
          pullIndicator.classList.add('active');
          pullIndicator.style.transform = `translateY(${Math.min(diff - 50, 50)}px)`;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      const diff = currentY - startY;
      
      if (diff > 100 && !isRefreshing) {
        isRefreshing = true;
        pullIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        
        // Trigger refresh (custom event)
        document.dispatchEvent(new CustomEvent('mobileRefresh'));
        
        setTimeout(function() {
          isRefreshing = false;
          pullIndicator.style.display = 'none';
          pullIndicator.classList.remove('active');
          pullIndicator.style.transform = '';
          startY = 0;
          currentY = 0;
        }, 1000);
      } else {
        pullIndicator.style.display = 'none';
        pullIndicator.classList.remove('active');
        pullIndicator.style.transform = '';
      }
      
      startY = 0;
      currentY = 0;
    }, { passive: true });
  }

  // ========================================
  // MOBILE SEARCH
  // ========================================

  /**
   * Initialize mobile search enhancements
   */
  function initMobileSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input, input[type="search"]');
    
    searchInputs.forEach(function(input) {
      // Add mobile search wrapper
      if (!input.parentElement.classList.contains('search-mobile')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-mobile';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Add search icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-search';
        wrapper.appendChild(icon);
      }
    });
  }

  // ========================================
  // FILTER CHIPS
  // ========================================

  /**
   * Initialize mobile filter chips
   */
  function initFilterChips() {
    const filterContainers = document.querySelectorAll('.category-tabs, .filter-buttons, .request-status-tabs');
    
    filterContainers.forEach(function(container) {
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(function(button) {
        button.addEventListener('click', function() {
          // Remove active from siblings
          buttons.forEach(function(btn) {
            btn.classList.remove('active');
          });
          
          // Add active to clicked
          this.classList.add('active');
        });
      });
    });
  }

  // ========================================
  // STAGGER ANIMATION
  // ========================================

  /**
   * Add stagger animation to lists
   */
  function initStaggerAnimation() {
    const lists = document.querySelectorAll('.items-grid, .requests-grid, .users-list');
    
    lists.forEach(function(list) {
      const items = list.querySelectorAll('.item-card, .request-card, .user-card');
      
      items.forEach(function(item, index) {
        item.classList.add('stagger-item');
        item.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
      });
    });
  }

  // ========================================
  // DETECT MOBILE
  // ========================================

  /**
   * Check if device is mobile
   */
  function isMobile() {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Add mobile class to body
   */
  function addMobileClass() {
    if (isMobile()) {
      document.body.classList.add('is-mobile');
    } else {
      document.body.classList.add('is-desktop');
    }
  }

  // ========================================
  // VIEWPORT HEIGHT FIX
  // ========================================

  /**
   * Fix viewport height for mobile browsers
   */
  function fixViewportHeight() {
    function setVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', function() {
      setTimeout(setVH, 100);
    });
  }

  // ========================================
  // RESPONSIVE IMAGES
  // ========================================

  /**
   * Handle responsive images
   */
  function initResponsiveImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(function(img) {
        imageObserver.observe(img);
      });
    }
  }

  // ========================================
  // SKELETON LOADING
  // ========================================

  /**
   * Show skeleton loading
   */
  window.showSkeleton = function(element, type = 'text') {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton-mobile skeleton-${type}`;
    element.innerHTML = '';
    element.appendChild(skeleton);
    return skeleton;
  };

  /**
   * Hide skeleton loading
   */
  window.hideSkeleton = function(element, content) {
    element.innerHTML = content;
  };

  // ========================================
  // INITIALIZE ALL
  // ========================================

  /**
   * Initialize all mobile features
   */
  function init() {
    addMobileClass();
    fixViewportHeight();
    initMobileNav();
    initBottomNav();
    initMobileModals();
    initMobileSearch();
    initFilterChips();
    initResponsiveImages();
    
    // Only add pull to refresh on mobile
    if (isMobile()) {
      initPullToRefresh();
    }

    // Add stagger animation after content loads
    if (document.readyState === 'complete') {
      setTimeout(initStaggerAnimation, 300);
    } else {
      window.addEventListener('load', function() {
        setTimeout(initStaggerAnimation, 300);
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

