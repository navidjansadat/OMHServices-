// ============================================
// OMH Social Services - Main JavaScript
// ============================================

// ===== تنظیمات =====
const API_URL = window.location.origin;
const WHATSAPP_NUMBER = '937XXXXXXXX'; // شماره خود را وارد کنید

// ===== منتظر بارگذاری DOM =====
document.addEventListener('DOMContentLoaded', () => {

    // ===== منوی همبرگری =====
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    // ===== بارگذاری داده‌ها =====
    loadCategories();
    loadServices();
    loadPosts();
    loadReviews();
    loadSettings();

    // ===== جستجو =====
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                searchServices(query);
            } else if (query.length === 0) {
                loadServices();
            }
        });
    }

    // ===== دکمه شناور واتساپ =====
    const floatingBtn = document.getElementById('floatingWhatsapp');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    }

    // ===== لینک‌های تماس =====
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink) {
        whatsappLink.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    }

    // ===== هایلایت منو هنگام اسکرول =====
    highlightNavOnScroll();
});

// ============================================
// ===== بارگذاری دسته‌بندی‌ها =====
// ============================================
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        const categories = await response.json();

        const filterContainer = document.getElementById('filterButtons');
        if (!filterContainer) return;

        // دکمه "همه"
        let html = `<button class="filter-btn active" data-category="all">همه</button>`;

        // دکمه‌های دسته‌بندی
        categories.forEach(cat => {
            const icon = cat.icon || '📂';
            html += `<button class="filter-btn" data-category="${cat.id}">${icon} ${cat.name}</button>`;
        });

        filterContainer.innerHTML = html;

        // رویداد کلیک روی دکمه‌های فیلتر
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const categoryId = btn.dataset.category;
                if (categoryId === 'all') {
                    loadServices();
                } else {
                    filterServicesByCategory(categoryId);
                }
            });
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ============================================
// ===== بارگذاری سرویس‌ها =====
// ============================================
async function loadServices() {
    try {
        const response = await fetch(`${API_URL}/api/services`);
        if (!response.ok) throw new Error('Failed to load services');
        const services = await response.json();
        renderServices(services);
    } catch (error) {
        console.error('Error loading services:', error);
        const grid = document.getElementById('servicesGrid');
        if (grid) {
            grid.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:40px 0;">خطا در بارگذاری سرویس‌ها</p>`;
        }
    }
}

// ============================================
// ===== فیلتر سرویس‌ها بر اساس دسته‌بندی =====
// ============================================
async function filterServicesByCategory(categoryId) {
    try {
        // دریافت همه سرویس‌ها و فیلتر در سمت کلاینت
        const response = await fetch(`${API_URL}/api/services`);
        if (!response.ok) throw new Error('Failed to load services');
        const services = await response.json();

        // فیلتر بر اساس categoryId
        const filtered = services.filter(s => {
            return s.subcategories?.categories?.id === categoryId;
        });

        renderServices(filtered);
    } catch (error) {
        console.error('Error filtering services:', error);
    }
}

// ============================================
// ===== جستجوی سرویس‌ها =====
// ============================================
async function searchServices(query) {
    try {
        const response = await fetch(`${API_URL}/api/services?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search services');
        const services = await response.json();
        renderServices(services);
    } catch (error) {
        console.error('Error searching services:', error);
    }
}

// ============================================
// ===== رندر سرویس‌ها =====
// ============================================
function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (!services || services.length === 0) {
        grid.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:40px 0;">هیچ سرویسی یافت نشد</p>`;
        return;
    }

    let html = '';
    services.forEach(service => {
        const icon = service.icon || '📱';
        const image = service.image || '';
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
// ===== سفارش سرویس =====
// ============================================
function orderService(id, name, price) {
    const message = `سلام، من می‌خواهم این سرویس را سفارش بدهم:
سرویس: ${name}
قیمت: ${price} AFN
لطفاً راهنمایی کنید.`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank');
}

// ============================================
// ===== باز کردن واتساپ =====
// ============================================
function openWhatsApp() {
    const message = encodeURIComponent('سلام، من از سایت OMH Social Services با شما تماس می‌گیرم.');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
}

// ============================================
// ===== بارگذاری نشرات =====
// ============================================
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`);
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();

        const grid = document.getElementById('postsGrid');
        if (!grid) return;

        if (!posts || posts.length === 0) {
            grid.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:40px 0;">هیچ مطلبی منتشر نشده است</p>`;
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
        const grid = document.getElementById('postsGrid');
        if (grid) {
            grid.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:40px 0;">خطا در بارگذاری مطالب</p>`;
        }
    }
}

// ============================================
// ===== لایک کردن مطلب =====
// ============================================
async function likePost(postId, btn) {
    try {
        const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to like post');
        const data = await response.json();

        // بروزرسانی تعداد لایک
        const countSpan = btn.querySelector('.like-count');
        if (countSpan) {
            countSpan.textContent = data.likes || 0;
        }
        btn.classList.toggle('liked');

    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// ============================================
// ===== کپی متن مطلب =====
// ============================================
function copyPost(btn) {
    const card = btn.closest('.post-card');
    const content = card.querySelector('.post-content');
    if (!content) return;

    const text = content.textContent.trim();

    navigator.clipboard.writeText(text).then(() => {
        // نمایش پیام موقت
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }).catch(() => {
        // روش جایگزین برای مرورگرهای قدیمی
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('متن کپی شد!');
    });
}

// ============================================
// ===== بارگذاری نظرات =====
// ============================================
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/api/reviews`);
        if (!response.ok) throw new Error('Failed to load reviews');
        const reviews = await response.json();

        const grid = document.getElementById('reviewsGrid');
        if (!grid) return;

        if (!reviews || reviews.length === 0) {
            grid.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:40px 0;">هنوز نظری ثبت نشده است</p>`;
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
// ===== بارگذاری تنظیمات =====
// ============================================
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (!response.ok) throw new Error('Failed to load settings');
        const settings = await response.json();

        // به‌روزرسانی لینک‌های تماس
        if (settings.whatsapp_number) {
            window.WHATSAPP_NUMBER = settings.whatsapp_number;
        }

        if (settings.telegram_link) {
            const el = document.getElementById('telegramLink');
            if (el) el.href = settings.telegram_link;
        }

        if (settings.facebook_link) {
            const el = document.getElementById('facebookLink');
            if (el) el.href = settings.facebook_link;
        }

        if (settings.instagram_link) {
            const el = document.getElementById('instagramLink');
            if (el) el.href = settings.instagram_link;
        }

        // فوتر
        if (settings.footer_text) {
            const footer = document.querySelector('.footer-copy p');
            if (footer) footer.textContent = settings.footer_text;
        }

        // عنوان سایت
        if (settings.site_name) {
            document.title = settings.site_name;
            const logoText = document.querySelector('.logo span');
            if (logoText) logoText.textContent = settings.site_name;
        }

        // توضیحات سایت
        if (settings.site_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = settings.site_description;
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ============================================
// ===== هایلایت منو هنگام اسکرول =====
// ============================================
function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
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

// ============================================
// ===== تابع increment برای Supabase =====
// ============================================
// این تابع در سمت سرور استفاده می‌شود، اما
// برای جلوگیری از خطا در کلاینت تعریف می‌کنیم
if (!window.supabase) {
    window.supabase = {
        rpc: () => {}
    };
}

console.log('✅ OMH Social Services loaded successfully!');
