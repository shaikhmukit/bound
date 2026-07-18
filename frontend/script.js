document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menu = document.querySelector('.menu');
  const links = document.querySelector('.nav-links');
  if (menu && links) {
    menu.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    });
  }

  // Legal footer links mapping
  const legalKeys = [
    'privacy', 'terms', 'cookies', 'sharing', 'spam', 
    'uk-gdpr', 'eu-gdpr', 'uae-pdpl', 'ccpa', 'us', 
    'opt-out', 'unsubscribe'
  ];
  legalKeys.forEach(id => {
    const link = document.querySelector(`footer a[href="#${id}"]`);
    if (link) {
      link.href = `legal.html#${id}`;
    }
  });

  // Unsubscribe dialog trigger
  const unsubscribeLink = document.querySelector('footer a[href="legal.html#unsubscribe"]');
  const unsubscribeDialog = document.querySelector('#unsubscribe-dialog');
  if (unsubscribeLink && unsubscribeDialog) {
    unsubscribeLink.addEventListener('click', event => {
      event.preventDefault();
      unsubscribeDialog.showModal();
    });
  }

  // Database count animator on viewport intersection
  const database = document.querySelector('#database');
  if (database) {
    const counters = database.querySelectorAll('.db-counter');
    
    // Initialize counters to 0 on page load
    counters.forEach(counter => {
      const decimals = parseInt(counter.getAttribute('data-decimals') || '0');
      counter.textContent = (0).toFixed(decimals) + 'M+';
    });

    const animate = () => {
      const duration = 1500;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const decimals = parseInt(counter.getAttribute('data-decimals') || '0');
          counter.textContent = (progress * target).toFixed(decimals) + 'M+';
        });
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    };

    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !database.__animated) {
        animate();
        database.__animated = true;
      }
    }, { threshold: 0.1 }).observe(database);
  }

  // Service dialog functionality
  const serviceDialog = document.querySelector('#service-dialog');
  const serviceTitle = document.querySelector('#service-dialog-title');
  const serviceCopy = document.querySelector('#service-dialog-copy');
  const serviceDetails = {
    'Demand Generation': 'Generate high-quality opportunities through strategically designed campaigns focused on engaging decision-makers throughout the buying journey.\n\nWe combine audience intelligence, content marketing, digital channels, and personalized outreach to create consistent pipeline growth.',
    'Account-Based Marketing': 'Target high-value accounts with personalized campaigns that align sales and marketing teams around shared revenue objectives.\n\nOur ABM strategies help increase engagement, shorten sales cycles, and improve conversion rates.',
    'Content Syndication': 'Expand the reach of your content assets by distributing them across targeted audiences actively consuming business information.\n\nDrive engagement through whitepapers, reports, webinars, case studies, guides, and industry resources.',
    'Intent Data & Buyer Intelligence': 'Identify organizations actively researching products and services related to your business.\n\nLeverage behavioral insights to prioritize sales outreach and engage buyers before your competitors.',
    'Marketing Qualified Leads': 'Deliver verified prospects who have demonstrated meaningful engagement and match your ideal customer profile.\n\nEach lead is aligned with campaign objectives and qualification criteria.',
    'Sales Qualified Leads': 'Generate sales-ready opportunities validated through additional qualification processes, ensuring your sales team focuses on prospects with genuine buying potential.',
    'Appointment Setting': 'Enable your sales teams to spend more time selling while we identify, qualify, and schedule meetings with key decision-makers.',
    'Telemarketing Services': 'Professional outbound calling programs focused on lead qualification, event promotion, customer engagement, appointment setting, and market research.'
  };

  if (serviceDialog && serviceTitle && serviceCopy) {
    document.querySelectorAll('.service').forEach(card => {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      
      const openService = () => {
        const title = card.querySelector('h3').textContent.trim();
        serviceTitle.textContent = title;
        serviceCopy.textContent = serviceDetails[title] || card.querySelector('p').textContent;
        serviceCopy.style.whiteSpace = 'pre-line';
        serviceDialog.showModal();
      };
      
      card.addEventListener('click', openService);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openService();
        }
      });
    });
  }

  // Contact Form AJAX Submission (updated to point to backend Server)
  const form = document.querySelector('#contact-form');
  const statusMsg = document.querySelector('#form-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const successDialog = document.querySelector('#success-dialog');

  if (form && statusMsg && submitBtn) {
    form.action = '/api/contact';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusMsg.className = 'form-status';
      statusMsg.textContent = 'Sending your enquiry...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Request failed');
        await res.json();
        form.reset();
        if (successDialog) {
          successDialog.showModal();
        }
        statusMsg.className = 'form-status';
        statusMsg.textContent = 'Thank you. Your enquiry has been sent — we\'ll be in touch shortly.';
      } catch (err) {
        statusMsg.className = 'form-status error';
        statusMsg.textContent = 'Something went wrong sending your enquiry. Please try again.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
