/* ============================================================
   MobileHostel.com - Main JavaScript
   Handles: Navigation, Scroll Effects, Animations, FAQ
   ============================================================ */

(function () {
  'use strict';

  // ---------- DOM Elements ----------
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('main-nav');
  const animatedElements = document.querySelectorAll('[data-animate]');

  // ---------- Mobile Menu ----------
  function toggleMobileMenu() {
    const isOpen = menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when a nav link is clicked
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // ---------- Header Scroll Effect ----------
  var lastScrollY = 0;
  var ticking = false;

  function updateHeader() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  if (header) {
    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load
    updateHeader();
  }

  // ---------- Scroll Animations (Intersection Observer) ----------
  if ('IntersectionObserver' in window && animatedElements.length > 0) {
    var animationObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            animationObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1,
      }
    );

    animatedElements.forEach(function (el) {
      animationObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    animatedElements.forEach(function (el) {
      el.classList.add('animated');
    });
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerOffset = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height')
        ) || 72;

        var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });

  // ---------- FAQ Accordion Enhancement ----------
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (this.open) {
        // Close other open items (optional accordion behavior)
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item && otherItem.open) {
            otherItem.open = false;
          }
        });
      }
    });
  });

  // ---------- Newsletter Form Handler ----------
  var newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      // The form action already points to coming-soon.html
      // This is a placeholder for future functionality
    });
  }

  // ---------- Lazy Loading Enhancement ----------
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported, nothing extra needed
  } else {
    // Fallback for older browsers
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      var imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.src; // Trigger load
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(function (img) {
        imageObserver.observe(img);
      });
    }
  }

  // ---------- Counter Animation for Trust Section ----------
  function animateCounters() {
    var counters = document.querySelectorAll('.trust-number');
    if (!counters.length) return;

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var text = el.textContent.trim();
            var hasPlus = text.includes('+');
            var hasComma = text.includes(',');

            // Extract the numeric value
            var numericStr = text.replace(/[^0-9]/g, '');
            var target = parseInt(numericStr, 10);

            if (isNaN(target) || target === 0) {
              counterObserver.unobserve(el);
              return;
            }

            var duration = 2000;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              // Ease out quad
              var eased = 1 - (1 - progress) * (1 - progress);
              var current = Math.floor(eased * target);

              // Format with commas
              var formatted = current.toLocaleString();
              el.textContent = formatted + (hasPlus ? '+' : '');

              if (progress < 1) {
                requestAnimationFrame(step);
              }
            }

            requestAnimationFrame(step);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }

  animateCounters();

  // ---------- Keyboard Navigation Enhancements ----------
  // Trap focus in mobile menu when open
  function handleTabKey(e) {
    if (!navLinks || !navLinks.classList.contains('active')) return;

    var focusable = navLinks.querySelectorAll('a, button');
    var firstFocusable = focusable[0];
    var lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      menuToggle.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      menuToggle.focus();
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      handleTabKey(e);
    }
  });

})();
