// ============================================
// OMH Social Services - Main JavaScript (نسخه جدید)
// ============================================

const API_URL = window.location.origin;
let WHATSAPP_NUMBER = '9370000000';

// ===== داده‌های کلی =====
let allCategories = [];
let allSubcategories = [];
let allServices = [];

let currentCategoryId = 'all';
let currentSubcategoryId = 'all';

// ============================================
// بارگذاری اولیه
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ OMH Social Services loaded!');

    // منوی همبرگری
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // جستجو
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                searchServices(query);
            } else if (query.length === 0) {
                loadAllData();
            }
        });
    }

    // دکمه شناور واتساپ
    const floatingBtn = document.getElementById('floatingWhatsapp');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    }

    // لینک‌های تماس
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink) {
        whatsappLink.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    }

    // بارگذاری همه داده‌ها
    loadAllData();

    // هایلایت منو
    highlightNavOnScroll();
});

// ============================================
// بارگذاری همه داده‌ها
// ============================================
async function loadAllData() {
    try {
        await Promise.all([
            loadCategories(),
            loadSubcategories(),
            loadServices()
        ]);
        renderCategories();
        renderServicesByCategory('all');
    } catch (error) {
        console.error('Error loading data:', error);
    }
    loadPosts();
    loadReviews();
    loadSettings();
}

// ============================================
// بارگذاری دسته‌بندی‌ها
// ============================================
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error('Failed');
        allCategories = await res.json();
        console.log('📂 دسته‌بندی‌ها:', allCategories.length);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ============================================
// بارگذاری زیردسته‌ها
// ============================================
async function loadSubcategories() {
    try {
        const res = await fetch(`${API_URL}/api/subcategories`);
        if (!res.ok) throw new Error('Failed');
        allSubcategories = await res.json();
        console.log('📁 زیردسته‌ها:', allSubcategories.length);
    } catch (error) {
        console.error('Error loading subcategories:', error);
    }
}

// ============================================
// بارگذاری سرویس‌ها
// ============================================
async function loadServices() {
    try {
        const res = await fetch(`${API_URL}/api/services`);
        if (!res.ok) throw new Error('Failed');
        allServices = await res.json();
        console.log('📦 سرویس‌ها:', allServices.length);
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// ============================================
// رندر دسته‌بندی‌ها
// ============================================
function renderCategories() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;

    let html = `<button class="cat-btn active" data-category="all">📋 همه</button>`;

    allCategories.forEach(cat => {
        const icon = cat.icon || '📂';
        html += `<button class="cat-btn" data-category="${cat.id}">${icon} ${cat.name}</button>`;
    });

    container.innerHTML = html;

    // رویداد کلیک روی دسته‌بندی‌ها
    container.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoryId = btn.dataset.category;
            currentCategoryId = categoryId;
            currentSubcategoryId = 'all';

            renderSubcategories(categoryId);
            renderServicesByCategory(categoryId);
        });
    });

    // بارگذاری زیردسته‌ها برای "همه"
    renderSubcategories('all');
}

// ============================================
// رندر زیردسته‌ها
// ============================================
function renderSubcategories(categoryId) {
    const container = document.getElementById('subcategoryTabs');
    if (!container) return;

    // فیلتر زیردسته‌ها بر اساس دسته‌بندی
    let filtered = [];
    if (categoryId === 'all') {
        filtered = allSubcategories;
    } else {
        filtered = allSubcategories.filter(sub => sub.category_id === categoryId);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-message">هیچ زیردسته‌ای موجود نیست</div>`;
        return;
    }

    let html = `<button class="sub-btn active" data-subcategory="all">📁 همه</button>`;

    filtered.forEach(sub => {
        const icon = sub.icon || '📁';
        html += `<button class="sub-btn" data-subcategory="${sub.id}">${icon} ${sub.name}</button>`;
    });

    container.innerHTML = html;

    // رویداد کلیک روی زیردسته‌ها
    container.querySelectorAll('.sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const subcategoryId = btn.dataset.subcategory;
            currentSubcategoryId = subcategoryId;

            renderServicesByCategoryAndSubcategory(currentCategoryId, subcategoryId);
        });
    });
}

// ============================================
// رندر سرویس‌ها بر اساس دسته‌بندی
// ============================================
function renderServicesByCategory(categoryId) {
    let filtered = [];

    if (categoryId === 'all') {
        filtered = allServices;
    } else {
        filtered = allServices.filter(service => {
            return service.subcategories?.categories?.id === categoryId;
        });
    }

    renderServices(filtered);
}

// ============================================
// رندر سرویس‌ها بر اساس دسته‌بندی + زیردسته
// ============================================
function renderServicesByCategoryAndSubcategory(categoryId, subcategoryId) {
    let filtered = [];

    // فیلتر بر اساس دسته‌بندی
    if (categoryId === 'all') {
        filtered = allServices;
    } else {
        filtered = allServices.filter(service => {
            return service.subcategories?.categories?.id === categoryId;
        });
    }

    // فیلتر بر اساس زیردسته
    if (subcategoryId !== 'all') {
        filtered = filtered.filter(service => {
            return service.subcategory_id === subcategoryId;
        });
    }

    renderServices(filtered);
}

// ============================================
// رندر سرویس‌ها
// ============================================
function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (!services || services.length === 0) {
        grid.innerHTML = `<div class="empty-message">هیچ سرویسی یافت نشد</div>`;
        return;
    }

    let html = '';
    services.forEach(service => {
        const icon = service.icon || '📱';
        const discount = service.discount || 0;
        const price = service.price || 0;
        const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
        const views = service.views || 0;
        const categoryName = service.subcategories?.categories?.name || '';
        const subcategoryName = service.subcategories?.name || '';

        html += `
            <div class="service-card" data-id="${service.id}">
                <div class="icon-wrap">${icon}</div>
                <h4>${service.name}</h4>
                ${subcategoryName ? `<div style="font-size:13px;color:var(--gray-400);margin-bottom:6px;">${categoryName} / ${subcategoryName}</div>` : ''}
                <p class="desc">${service.short_description || service.description || ''}</p>
                <div class="price">
                    ${finalPrice.toFixed(0)} AFN
                    ${discount > 0 ? `<span class="old">${price.toFixed(0)} AFN</span>` : ''}
                    ${discount > 0 ? `<span style="color:#EF4444;font-size:14px;font-weight:600;margin-right:8px;">-${discount}%</span>` : ''}
                </div>
                <div class="meta">
                    <span class="views"><i class="fas fa-eye"></i> ${views}</span>
                    <button class="order-btn" onclick="orderService('${service.id}', '${service.name}', '${finalPrice}')">
                        <i class="fas fa-shopping-cart"></i> سفارش
                    </button>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

// ============================================
// جستجوی سرویس‌ها
// ============================================
async function searchServices(query) {
    try {
        const res = await fetch(`${API_URL}/api/services?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed');
        const services = await res.json();
        renderServices(services);
    } catch (error) {
        console.error('Error searching:', error);
    }
}

// ============================================
// سفارش سرویس
// ============================================
function orderService(id, name, price) {
    const message = `سلام، من می‌خواهم این سرویس را سفارش بدهم:
سرویس: ${name}
قیمت: ${price} AFN
لطفاً راهنمایی کنید.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ============================================
// باز کردن واتساپ
// ============================================
function openWhatsApp() {
    const message = 'سلام، من از سایت OMH Social Services با شما تماس می‌گیرم.';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ============================================
// بارگذاری نشرات
// ============================================
async function loadPosts() {
    try {
        const res = await fetch(`${API_URL}/api/posts`);
        if (!res.ok) throw new Error('Failed');
        const posts = await res.json();

        const grid = document.getElementById('postsGrid');
        if (!grid) return;

        if (!posts.length) {
            grid.innerHTML = `<div class="empty-message">هیچ مطلبی منتشر نشده است</div>`;
            return;
        }

        let html = '';
        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString('fa-IR');
            html += `
                <div class="post-card" data-id="${post.id}">
                    <div class="post-title">🕌 ${post.title}</div>
                    <div class="post-content">${post.content}</div>
                    <div style="font-size:13px;color:var(--gray-400);margin-top:8px;">📅 ${date}</div>
                    <div class="post-actions">
                        <button class="like-btn" onclick="likePost('${post.id}', this)">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">${post.likes || 0}</span>
                        </button>
                        <button onclick="copyPost(this)">
                            <i class="fas fa-copy"></i> کپی متن
                        </button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// ============================================
// لایک کردن مطلب
// ============================================
async function likePost(postId, btn) {
    try {
        const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();

        const countSpan = btn.querySelector('.like-count');
        if (countSpan) countSpan.textContent = data.likes || 0;
        btn.classList.toggle('liked');

    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// ============================================
// کپی متن مطلب
// ============================================
function copyPost(btn) {
    const card = btn.closest('.post-card');
    const content = card?.querySelector('.post-content');
    if (!content) return;

    const text = content.textContent.trim();

    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
        setTimeout(() => { btn.innerHTML = original; }, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('متن کپی شد!');
    });
}

// ============================================
// بارگذاری نظرات
// ============================================
async function loadReviews() {
    try {
        const res = await fetch(`${API_URL}/api/reviews`);
        if (!res.ok) throw new Error('Failed');
        const reviews = await res.json();

        const grid = document.getElementById('reviewsGrid');
        if (!grid) return;

        if (!reviews.length) {
            grid.innerHTML = `<div class="empty-message">هنوز نظری ثبت نشده است</div>`;
            return;
        }

        let html = '';
        reviews.slice(0, 6).forEach(review => {
            const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            const date = new Date(review.created_at).toLocaleDateString('fa-IR');
            const avatar = review.customer_avatar || review.customer_name.charAt(0);

            html += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-avatar">${avatar}</div>
                        <div>
                            <div class="review-name">${review.customer_name}</div>
                            <div class="review-stars">${stars}</div>
                        </div>
                    </div>
                    <p class="review-text">${review.comment}</p>
                    <div class="review-date">📅 ${date}</div>
                </div>
            `;
        });

        grid.innerHTML = html;

    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// ============================================
// بارگذاری تنظیمات
// ============================================
async function loadSettings() {
    try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (!res.ok) throw new Error('Failed');
        const settings = await res.json();

        if (settings.whatsapp_number) {
            WHATSAPP_NUMBER = settings.whatsapp_number;
        }

        const socialLinks = {
            telegram: 'telegramLink',
            facebook: 'facebookLink',
            instagram: 'instagramLink'
        };

        Object.entries(socialLinks).forEach(([key, id]) => {
            if (settings[`${key}_link`]) {
                const el = document.getElementById(id);
                if (el) el.href = settings[`${key}_link`];
            }
        });

        if (settings.footer_text) {
            const footer = document.querySelector('.footer-copy p');
            if (footer) footer.textContent = settings.footer_text;
        }

        if (settings.site_name) {
            document.title = settings.site_name;
            const logoText = document.querySelector('.logo span');
            if (logoText) logoText.textContent = settings.site_name;
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ============================================
// هایلایت منو هنگام اسکرول
// ============================================
function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

console.log('✅ OMH Social Services loaded successfully!');
