document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA ====================
  const jobsData = [
    { id:1, title:'Frontend Developer', company:'Gojek', location:'Jakarta', type:'Full-time', bookmarked:false },
    { id:2, title:'Backend Engineer', company:'Tokopedia', location:'Remote', type:'Remote', bookmarked:false },
    { id:3, title:'UI/UX Designer', company:'Bukalapak', location:'Bandung', type:'Contract', bookmarked:false },
    { id:4, title:'Mobile Developer', company:'Traveloka', location:'Jakarta', type:'Full-time', bookmarked:false },
    { id:5, title:'Data Scientist', company:'Ruangguru', location:'Remote', type:'Remote', bookmarked:false },
    { id:6, title:'DevOps Engineer', company:'OVO', location:'Tangerang', type:'Part-time', bookmarked:false },
    { id:7, title:'Product Manager', company:'Shopee', location:'Jakarta', type:'Full-time', bookmarked:false },
    { id:8, title:'QA Engineer', company:'Blibli', location:'Bandung', type:'Contract', bookmarked:false },
    { id:9, title:'System Analyst', company:'BCA', location:'Jakarta', type:'Full-time', bookmarked:false },
  ];

  const communityPosts = [
    { username:'Rizky Setiawan', avatar:'RS', content:'Ada rekomendasi course React terbaru?', likes:24, comments:8, liked:false },
    { username:'Sari Dewi', avatar:'SD', content:'Baru diterima di startup unicorn! Thanks INFORIA!', likes:57, comments:12, liked:false },
    { username:'Andi Pratama', avatar:'AP', content:'Tips interview backend: kuasai system design.', likes:33, comments:5, liked:false },
  ];

  const eventsData = [
    { title:'Webinar: Roadmap Fullstack 2026', date:'15 Mei 2026', desc:'Bersama expert Silicon Valley.', icon:'fa-microphone', color:'bg-purple-100 text-purple-600' },
    { title:'Workshop React 19 & Next.js', date:'22 Mei 2026', desc:'Hands-on coding session.', icon:'fa-laptop-code', color:'bg-blue-100 text-blue-600' },
    { title:'Hackathon Nasional INFORIA', date:'10 Juni 2026', desc:'Total hadiah 100 juta.', icon:'fa-trophy', color:'bg-amber-100 text-amber-600' },
  ];

  const testimonialsData = [
    { name:'Anisa Putri', role:'Frontend Dev at Gojek', text:'INFORIA membantu saya menemukan pekerjaan impian hanya dalam 2 minggu!', avatar:'AP' },
    { name:'Budi Hartono', role:'Backend Engineer', text:'Komunitasnya sangat suportif, banyak insight berharga.', avatar:'BH' },
    { name:'Clara Maharani', role:'UI/UX Designer', text:'Event dan workshop-nya berkualitas, worth it banget!', avatar:'CM' },
  ];

  const faqData = [
    { q:'Apa itu INFORIA?', a:'Platform karier khusus mahasiswa informatika & fresh graduate untuk mencari lowongan, membangun profil, dan networking.' },
    { q:'Apakah gratis?', a:'Ya, pendaftaran dan penggunaan dasar sepenuhnya gratis. Ada opsi premium untuk fitur tambahan.' },
    { q:'Bagaimana cara melamar?', a:'Cukup buat akun, lengkapi profil, lalu klik "Lamar Sekarang" pada lowongan yang diminati.' },
    { q:'Apakah lowongan selalu update?', a:'Kami bekerja sama dengan 120+ perusahaan yang rutin memposting lowongan terbaru.' },
  ];

  // ==================== UTILS ====================
  function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-4 rounded-2xl shadow-2xl text-white font-medium ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Simpan data ke LocalStorage
  function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function loadFromStorage(key, fallback) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  }

  // ==================== COUNTER ANIMATION ====================
  function animateCounters() {
    document.querySelectorAll('.counter').forEach(el => {
      const target = +el.dataset.target;
      if (!target || el.dataset.animated) return;
      el.dataset.animated = true;
      let count = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          el.textContent = target.toLocaleString() + (el.dataset.suffix || '');
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(count).toLocaleString() + (el.dataset.suffix || '');
        }
      }, 30);
    });
  }

  // ==================== INTERSECTION OBSERVER ====================
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.querySelector('.counter')) animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  document.querySelectorAll('.counter').forEach(el => observer.observe(el.parentElement));

  // ==================== SKILL BAR ANIMATION ====================
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width;
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.skill-bar').forEach(bar => skillObserver.observe(bar));

  // ==================== RENDER JOBS + PAGINATION ====================
  const itemsPerPage = 6;
  let currentPage = 1;

  function getFilteredJobs() {
    const search = document.getElementById('job-search')?.value.toLowerCase() || '';
    const type = document.getElementById('job-filter')?.value || 'all';
    const location = document.getElementById('job-location-filter')?.value || 'all';
    return jobsData.filter(job => {
      const matchSearch = !search || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search);
      const matchType = type === 'all' || job.type === type;
      const matchLocation = location === 'all' || job.location === location;
      return matchSearch && matchType && matchLocation;
    });
  }

  function renderJobsPage(page) {
    const container = document.getElementById('job-cards-container');
    const pagination = document.getElementById('pagination-container');
    const skeleton = document.getElementById('job-skeleton');
    const emptyState = document.getElementById('job-empty-state');
    if (!container) return;

    // Tampilkan skeleton, sembunyikan konten
    skeleton.classList.remove('hidden');
    container.classList.add('hidden');
    emptyState.classList.add('hidden');
    if (pagination) pagination.innerHTML = '';

    // Simulasi loading
    setTimeout(() => {
      const filtered = getFilteredJobs();
      const start = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(start, start + itemsPerPage);

      skeleton.classList.add('hidden');
      
      if (paginated.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
      } else {
        emptyState.classList.add('hidden');
        container.classList.remove('hidden');
        container.innerHTML = paginated.map(job => `
          <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-2xl card-interactive shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">${job.company[0]}</div>
              <div class="flex gap-2">
                <button class="bookmark-btn ${job.bookmarked ? 'bookmarked' : ''} text-gray-400 hover:text-brand-600" data-job-id="${job.id}" aria-label="Bookmark lowongan">
                  <i class="fa-${job.bookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${job.type === 'Remote' ? 'bg-green-100 text-green-700' : job.type === 'Full-time' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}">${job.type}</span>
              </div>
            </div>
            <h3 class="font-display font-semibold text-lg">${job.title}</h3>
            <p class="text-gray-500 text-sm">${job.company}</p>
            <div class="flex items-center gap-2 text-sm text-gray-400 mt-3"><i class="fa-solid fa-location-dot text-brand-500"></i> ${job.location}</div>
            <button class="mt-5 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl active:scale-95 transition-all apply-btn">Lamar Sekarang</button>
          </div>
        `).join('');

        // Bookmark listeners
        container.querySelectorAll('.bookmark-btn').forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.jobId);
            const job = jobsData.find(j => j.id === id);
            if (job) {
              job.bookmarked = !job.bookmarked;
              saveToStorage('bookmarkedJobs', jobsData.filter(j => j.bookmarked).map(j => j.id));
              renderJobsPage(currentPage);
              showToast(job.bookmarked ? 'Lowongan disimpan!' : 'Bookmark dihapus');
            }
          });
        });

        // Apply listeners
        container.querySelectorAll('.apply-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            showToast('Fitur lamaran akan segera hadir!', 'error');
          });
        });
      }

      // Pagination
      if (pagination) {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        if (totalPages > 1) {
          let btns = '';
          for (let i = 1; i <= totalPages; i++) {
            btns += `<button class="pagination-btn w-10 h-10 rounded-xl font-semibold text-sm ${i === page ? 'active' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all">${i}</button>`;
          }
          pagination.innerHTML = btns;
          pagination.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
              const newPage = parseInt(btn.textContent);
              if (newPage !== currentPage) {
                currentPage = newPage;
                renderJobsPage(currentPage);
              }
            });
          });
        } else {
          pagination.innerHTML = '';
        }
      }
    }, 400); // simulasi loading
  }

  // Inisialisasi jobs
  renderJobsPage(1);

  // Load bookmark dari storage
  const storedBookmarks = loadFromStorage('bookmarkedJobs', []);
  jobsData.forEach(job => {
    if (storedBookmarks.includes(job.id)) job.bookmarked = true;
  });

  // Debounce untuk search
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
  const debouncedRender = debounce(() => { currentPage = 1; renderJobsPage(1); }, 300);

  document.getElementById('job-search')?.addEventListener('input', debouncedRender);
  document.getElementById('job-filter')?.addEventListener('change', () => { currentPage = 1; renderJobsPage(1); });
  document.getElementById('job-location-filter')?.addEventListener('change', () => { currentPage = 1; renderJobsPage(1); });
  document.getElementById('job-search-btn')?.addEventListener('click', () => { currentPage = 1; renderJobsPage(1); });

  // ==================== COMMUNITY ====================
  function renderCommunity() {
    const container = document.getElementById('community-container');
    const skeleton = document.getElementById('community-skeleton');
    if (!container) return;

    skeleton.classList.remove('hidden');
    container.classList.add('hidden');

    setTimeout(() => {
      skeleton.classList.add('hidden');
      container.classList.remove('hidden');
      container.innerHTML = communityPosts.map((post, idx) => `
        <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-2xl card-interactive shadow-sm flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">${post.avatar}</div>
            <p class="font-semibold">${post.username}</p>
          </div>
          <p class="text-gray-600 text-sm flex-1">${post.content}</p>
          <div class="flex items-center gap-6 mt-5 text-gray-500">
            <button class="like-btn flex items-center gap-2 hover:text-red-500 transition-all ${post.liked ? 'active text-red-500' : ''}" data-index="${idx}">
              <i class="fa-${post.liked ? 'solid' : 'regular'} fa-heart"></i>
              <span>${post.likes}</span>
            </button>
            <button class="flex items-center gap-2 hover:text-brand-600 transition-all"><i class="fa-regular fa-comment"></i> ${post.comments}</button>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = this.dataset.index;
          const post = communityPosts[idx];
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
          renderCommunity();
        });
      });
    }, 300);
  }
  renderCommunity();

  // ==================== EVENTS ====================
  function renderEvents() {
    const container = document.getElementById('events-container');
    const skeleton = document.getElementById('events-skeleton');
    if (!container) return;

    skeleton.classList.remove('hidden');
    container.classList.add('hidden');

    setTimeout(() => {
      skeleton.classList.add('hidden');
      container.classList.remove('hidden');
      container.innerHTML = eventsData.map((ev, idx) => `
        <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-2xl card-interactive shadow-sm">
          <div class="w-14 h-14 ${ev.color} rounded-2xl flex items-center justify-center mb-4"><i class="fa-solid ${ev.icon} text-2xl"></i></div>
          <h3 class="font-display font-semibold text-lg">${ev.title}</h3>
          <p class="text-sm text-brand-600 font-medium mt-1"><i class="fa-regular fa-calendar mr-1"></i>${ev.date}</p>
          <p class="text-gray-500 text-sm mt-2">${ev.desc}</p>
          <button class="mt-5 w-full py-2.5 bg-white border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-semibold rounded-xl active:scale-95 transition-all event-register-btn" data-event-index="${idx}">Daftar</button>
        </div>
      `).join('');

      container.querySelectorAll('.event-register-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.dataset.eventIndex;
          openEventModal(eventsData[idx]);
        });
      });
    }, 300);
  }
  renderEvents();

  // Event Modal
  const eventModal = document.getElementById('event-modal');
  const closeEventModal = document.getElementById('close-event-modal');
  const eventForm = document.getElementById('event-registration-form');
  const eventDesc = document.getElementById('event-modal-desc');

  function openEventModal(event) {
    document.getElementById('event-modal-title').textContent = event.title;
    eventDesc.textContent = event.desc;
    eventModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeEventModalHandler() {
    eventModal.classList.add('hidden');
    document.body.style.overflow = '';
    eventForm.reset();
  }

  closeEventModal?.addEventListener('click', closeEventModalHandler);
  eventModal?.addEventListener('click', e => { if (e.target === eventModal) closeEventModalHandler(); });
  eventForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('event-name').value;
    const email = document.getElementById('event-email').value;
    if (!name || !email || !email.includes('@')) {
      showToast('Mohon isi data dengan benar.', 'error');
      return;
    }
    showToast('Pendaftaran berhasil! Cek email kamu.', 'success');
    closeEventModalHandler();
  });

  // ==================== TESTIMONIALS ====================
  function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    container.innerHTML = testimonialsData.map(t => `
      <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-2xl card-interactive shadow-sm text-center">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">${t.avatar}</div>
        <p class="text-gray-600 italic mb-4">"${t.text}"</p>
        <p class="font-semibold">${t.name}</p>
        <p class="text-sm text-gray-400">${t.role}</p>
      </div>
    `).join('');
  }
  renderTestimonials();

  // ==================== FAQ ACCORDION ====================
  function renderFAQ() {
    const container = document.getElementById('faq-container');
    if (!container) return;
    container.innerHTML = faqData.map((item, i) => `
      <div class="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl card-interactive shadow-sm overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-semibold flex justify-between items-center hover:text-brand-600 transition-colors">
          ${item.q}
          <i class="fa-solid fa-chevron-down transition-transform duration-300"></i>
        </button>
        <div class="faq-answer px-5"><p class="text-gray-600 pb-5">${item.a}</p></div>
      </div>
    `).join('');

    container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function() {
        const answer = this.nextElementSibling;
        const icon = this.querySelector('i');
        const isOpen = answer.classList.contains('open');
        container.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
        container.querySelectorAll('.fa-chevron-down').forEach(i => i.style.transform = 'rotate(0deg)');
        if (!isOpen) {
          answer.classList.add('open');
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }
  renderFAQ();

  // ==================== DASHBOARD ====================
  function loadDashboard() {
    // Simulasi data dinamis
    const recentActivities = [
      { icon:'fa-paper-plane', color:'bg-blue-100 text-blue-600', text:'Melamar Frontend Developer di Gojek', time:'2 jam lalu' },
      { icon:'fa-check', color:'bg-green-100 text-green-600', text:'Interview teknis Tokopedia', time:'1 hari lalu' },
      { icon:'fa-graduation-cap', color:'bg-purple-100 text-purple-600', text:'Menyelesaikan React Advanced', time:'3 hari lalu' },
    ];
    const container = document.getElementById('recent-activities');
    if (container) {
      container.innerHTML = recentActivities.map(act => `
        <div class="flex items-center gap-4 pb-4 border-b last:border-b-0">
          <div class="w-10 h-10 ${act.color} rounded-xl flex items-center justify-center"><i class="fa-solid ${act.icon}"></i></div>
          <div><p class="text-sm font-medium">${act.text}</p><p class="text-xs text-gray-400">${act.time}</p></div>
        </div>
      `).join('');
    }
    // Statis counter tetap, bisa diupdate jika ada logic backend
  }
  loadDashboard();

  // ==================== AUTH MODAL ====================
  const modal = document.getElementById('auth-modal');
  const closeModal = document.getElementById('close-modal');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  function openAuthModal(tab='login') {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      tabLogin.classList.add('bg-white','shadow');
      tabRegister.classList.remove('bg-white','shadow');
      tabLogin.setAttribute('aria-selected', 'true');
      tabRegister.setAttribute('aria-selected', 'false');
    } else {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      tabRegister.classList.add('bg-white','shadow');
      tabLogin.classList.remove('bg-white','shadow');
      tabRegister.setAttribute('aria-selected', 'true');
      tabLogin.setAttribute('aria-selected', 'false');
    }
  }

  function closeAuthModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('open-login-modal')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('open-register-modal')?.addEventListener('click', () => openAuthModal('register'));
  document.getElementById('mobile-login-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('mobile-menu-closed');
    openAuthModal('login');
  });
  document.getElementById('mobile-register-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('mobile-menu-closed');
    openAuthModal('register');
  });
  closeModal?.addEventListener('click', closeAuthModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });

  tabLogin?.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('bg-white','shadow');
    tabRegister.classList.remove('bg-white','shadow');
    tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.setAttribute('aria-selected', 'false');
  });
  tabRegister?.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('bg-white','shadow');
    tabLogin.classList.remove('bg-white','shadow');
    tabRegister.setAttribute('aria-selected', 'true');
    tabLogin.setAttribute('aria-selected', 'false');
  });

  // Password toggle
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = document.getElementById(this.dataset.target);
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      this.querySelector('i').classList.toggle('fa-eye', !isPass);
      this.querySelector('i').classList.toggle('fa-eye-slash', isPass);
    });
  });

  loginForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('#login-email').value;
    const pass = document.getElementById('login-password').value;
    if (!email || !pass || !email.includes('@')) {
      showToast('Mohon isi data dengan benar.', 'error');
      return;
    }
    showToast('Login berhasil!', 'success');
    setTimeout(closeAuthModal, 1500);
  });

  registerForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    if (!name || !email || !pass || !confirm || !email.includes('@')) {
      showToast('Mohon isi semua field dengan benar.', 'error');
      return;
    }
    if (pass.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }
    if (pass !== confirm) {
      showToast('Konfirmasi password tidak sama.', 'error');
      return;
    }
    showToast('Registrasi berhasil!', 'success');
    this.reset();
    tabLogin?.click();
  });

  // ==================== NAVBAR & MOBILE MENU ====================
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar?.classList.toggle('navbar-scrolled', window.scrollY > 20);
    const backToTop = document.getElementById('back-to-top');
    backToTop?.classList.toggle('show', window.scrollY > 600);
  });

  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  menuToggle?.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('mobile-menu-closed');
    if (isOpen) {
      mobileMenu.classList.add('mobile-menu-closed');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      menuToggle.setAttribute('aria-expanded', 'false');
    } else {
      mobileMenu.classList.remove('mobile-menu-closed');
      menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      menuToggle.setAttribute('aria-expanded', 'true');
    }
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('mobile-menu-closed');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
      mobileMenu?.classList.add('mobile-menu-closed');
    });
  });

  document.getElementById('back-to-top')?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  // Demo button
  document.getElementById('demo-btn')?.addEventListener('click', () => {
    showToast('Demo interaktif akan segera hadir!', 'success');
  });
});