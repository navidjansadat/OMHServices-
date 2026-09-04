// ============================================
// OMH Social Services - Admin Panel
// ============================================

const API_URL = window.location.origin;

// ===== صفحه ورود =====
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value.trim();

        if (!password) {
            showLoginError('لطفاً رمز عبور را وارد کنید');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                showLoginError(data.error || 'ورود ناموفق');
                return;
            }

            window.location.href = '/admin/dashboard.html';

        } catch (error) {
            showLoginError('خطا در ارتباط با سرور');
            console.error('Login error:', error);
        }
    });
}

function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.add('show');
        setTimeout(() => loginError.classList.remove('show'), 4000);
    }
}

// ===== بررسی وضعیت ورود =====
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/api/admin/check`, {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/admin/index.html';
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        window.location.href = '/admin/index.html';
        return null;
    }
}

// ===== خروج =====
async function logout() {
    try {
        await fetch(`${API_URL}/api/admin/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/admin/index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ============================================
// ===== داشبورد =====
// ============================================
if (document.querySelector('.admin-dashboard')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const admin = await checkAuth();
        if (!admin) return;

        const userSpan = document.querySelector('.admin-user span');
        if (userSpan) userSpan.textContent = admin.username;

        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        loadStats();
        loadCategories();
        loadSubcategories();
        loadServices();
        loadReviews();
        loadPosts();
        loadSettings();
        setupNavigation();
    });
}

// ===== بارگذاری آمار =====
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to load stats');
        const stats = await response.json();

        document.getElementById('statCategories').textContent = stats.totalCategories || 0;
        document.getElementById('statSubcategories').textContent = stats.totalSubcategories || 0;
        document.getElementById('statServices').textContent = stats.totalServices || 0;
        document.getElementById('statReviews').textContent = stats.totalReviews || 0;
        document.getElementById('statPendingReviews').textContent = stats.pendingReviews || 0;
        document.getElementById('statPosts').textContent = stats.totalPosts || 0;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===== ناوبری =====
function setupNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav button');
    const sections = document.querySelectorAll('.admin-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const target = document.getElementById(btn.dataset.section);
            if (target) target.classList.add('active');
        });
    });
}

// ===== مدیریت Categories =====
let categoriesData = [];

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        categoriesData = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategories() {
    const tbody = document.querySelector('#categoriesTable tbody');
    if (!tbody) return;

    if (!categoriesData || categoriesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;">هیچ دسته‌بندی وجود ندارد</td></tr>`;
        return;
    }

    let html = '';
    categoriesData.forEach(cat => {
        const status = cat.is_active ? '<span class="status-badge active">فعال</span>' : '<span class="status-badge inactive">غیرفعال</span>';
        html += `
            <tr>
                <td>${cat.icon || '📂'}</td>
                <td>${cat.name}</td>
                <td>${status}</td>
                <td>${cat.order || 0}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editCategory('${cat.id}')">ویرایش</button>
                        <button class="btn-delete" onclick="deleteCategory('${cat.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function showCategoryModal(category = null) {
    const modal = document.getElementById('categoryModal');
    if (!modal) return;

    const title = document.getElementById('categoryModalTitle');
    const id = document.getElementById('categoryId');
    const name = document.getElementById('categoryName');
    const icon = document.getElementById('categoryIcon');
    const order = document.getElementById('categoryOrder');
    const active = document.getElementById('categoryActive');

    if (category) {
        title.textContent = 'ویرایش دسته‌بندی';
        id.value = category.id;
        name.value = category.name;
        icon.value = category.icon || '';
        order.value = category.order || 0;
        active.checked = category.is_active;
    } else {
        title.textContent = 'افزودن دسته‌بندی جدید';
        id.value = '';
        name.value = '';
        icon.value = '';
        order.value = 0;
        active.checked = true;
    }

    modal.classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    const icon = document.getElementById('categoryIcon').value.trim();
    const order = parseInt(document.getElementById('categoryOrder').value) || 0;
    const is_active = document.getElementById('categoryActive').checked;

    if (!name) {
        alert('لطفاً نام دسته‌بندی را وارد کنید');
        return;
    }

    try {
        const url = id ? `${API_URL}/api/categories/${id}` : `${API_URL}/api/categories`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, icon, order, is_active, slug: name.replace(/\s/g, '-').toLowerCase() })
        });

        if (!response.ok) throw new Error('Failed to save category');

        closeModal('categoryModal');
        loadCategories();
        loadStats();

    } catch (error) {
        console.error('Error saving category:', error);
        alert('خطا در ذخیره دسته‌بندی');
    }
}

async function editCategory(id) {
    const category = categoriesData.find(c => c.id === id);
    if (category) showCategoryModal(category);
}

async function deleteCategory(id) {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete category');

        loadCategories();
        loadStats();

    } catch (error) {
        console.error('Error deleting category:', error);
        alert('خطا در حذف دسته‌بندی');
    }
}

// ===== مدیریت Subcategories =====
let subcategoriesData = [];

async function loadSubcategories() {
    try {
        const response = await fetch(`${API_URL}/api/subcategories`);
        if (!response.ok) throw new Error('Failed to load subcategories');
        subcategoriesData = await response.json();
        renderSubcategories();
    } catch (error) {
        console.error('Error loading subcategories:', error);
    }
}

function renderSubcategories() {
    const tbody = document.querySelector('#subcategoriesTable tbody');
    if (!tbody) return;

    if (!subcategoriesData || subcategoriesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;">هیچ زیردسته‌ای وجود ندارد</td></tr>`;
        return;
    }

    let html = '';
    subcategoriesData.forEach(sub => {
        const status = sub.is_active ? '<span class="status-badge active">فعال</span>' : '<span class="status-badge inactive">غیرفعال</span>';
        html += `
            <tr>
                <td>${sub.icon || '📁'}</td>
                <td>${sub.name}</td>
                <td>${sub.categories?.name || '-'}</td>
                <td>${status}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editSubcategory('${sub.id}')">ویرایش</button>
                        <button class="btn-delete" onclick="deleteSubcategory('${sub.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function showSubcategoryModal(subcategory = null) {
    const modal = document.getElementById('subcategoryModal');
    if (!modal) return;

    const title = document.getElementById('subcategoryModalTitle');
    const id = document.getElementById('subcategoryId');
    const name = document.getElementById('subcategoryName');
    const icon = document.getElementById('subcategoryIcon');
    const categoryId = document.getElementById('subcategoryCategoryId');
    const order = document.getElementById('subcategoryOrder');
    const active = document.getElementById('subcategoryActive');

    categoryId.innerHTML = '<option value="">انتخاب دسته‌بندی</option>';
    categoriesData.forEach(cat => {
        categoryId.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

    if (subcategory) {
        title.textContent = 'ویرایش زیردسته';
        id.value = subcategory.id;
        name.value = subcategory.name;
        icon.value = subcategory.icon || '';
        categoryId.value = subcategory.category_id || '';
        order.value = subcategory.order || 0;
        active.checked = subcategory.is_active;
    } else {
        title.textContent = 'افزودن زیردسته جدید';
        id.value = '';
        name.value = '';
        icon.value = '';
        categoryId.value = '';
        order.value = 0;
        active.checked = true;
    }

    modal.classList.add('show');
}

async function saveSubcategory() {
    const id = document.getElementById('subcategoryId').value;
    const name = document.getElementById('subcategoryName').value.trim();
    const icon = document.getElementById('subcategoryIcon').value.trim();
    const category_id = document.getElementById('subcategoryCategoryId').value;
    const order = parseInt(document.getElementById('subcategoryOrder').value) || 0;
    const is_active = document.getElementById('subcategoryActive').checked;

    if (!name || !category_id) {
        alert('لطفاً همه فیلدهای ضروری را پر کنید');
        return;
    }

    try {
        const url = id ? `${API_URL}/api/subcategories/${id}` : `${API_URL}/api/subcategories`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ category_id, name, icon, order, is_active, slug: name.replace(/\s/g, '-').toLowerCase() })
        });

        if (!response.ok) throw new Error('Failed to save subcategory');

        closeModal('subcategoryModal');
        loadSubcategories();
        loadStats();

    } catch (error) {
        console.error('Error saving subcategory:', error);
        alert('خطا در ذخیره زیردسته');
    }
}

async function editSubcategory(id) {
    const sub = subcategoriesData.find(s => s.id === id);
    if (sub) showSubcategoryModal(sub);
}

async function deleteSubcategory(id) {
    if (!confirm('آیا از حذف این زیردسته مطمئن هستید؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/subcategories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete subcategory');

        loadSubcategories();
        loadStats();

    } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('خطا در حذف زیردسته');
    }
}

// ============================================
// ===== مدیریت Services =====
// ============================================
let servicesData = [];

async function loadServices() {
    try {
        const response = await fetch(`${API_URL}/api/services`);
        if (!response.ok) throw new Error('Failed to load services');
        servicesData = await response.json();
        renderServices();
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function renderServices() {
    const tbody = document.querySelector('#servicesTable tbody');
    if (!tbody) return;

    if (!servicesData || servicesData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94A3B8;">هیچ سرویسی وجود ندارد</td></tr>`;
        return;
    }

    let html = '';
    servicesData.forEach(service => {
        const status = service.is_active ? '<span class="status-badge active">فعال</span>' : '<span class="status-badge inactive">غیرفعال</span>';
        html += `
            <tr>
                <td>${service.icon || '📱'}</td>
                <td>${service.name}</td>
                <td>${service.price || 0} AFN</td>
                <td>${service.discount || 0}%</td>
                <td>${status}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editService('${service.id}')">ویرایش</button>
                        <button class="btn-delete" onclick="deleteService('${service.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function showServiceModal(service = null) {
    const modal = document.getElementById('serviceModal');
    if (!modal) return;

    const title = document.getElementById('serviceModalTitle');
    const id = document.getElementById('serviceId');
    const name = document.getElementById('serviceName');
    const price = document.getElementById('servicePrice');
    const discount = document.getElementById('serviceDiscount');
    const description = document.getElementById('serviceDescription');
    const subcategoryId = document.getElementById('serviceSubcategoryId');
    const active = document.getElementById('serviceActive');

    // پر کردن dropdown زیردسته‌ها
    subcategoryId.innerHTML = '<option value="">انتخاب زیردسته</option>';
    subcategoriesData.forEach(sub => {
        subcategoryId.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    });

    if (service) {
        title.textContent = 'ویرایش سرویس';
        id.value = service.id;
        name.value = service.name;
        price.value = service.price || '';
        discount.value = service.discount || 0;
        description.value = service.description || '';
        subcategoryId.value = service.subcategory_id || '';
        active.checked = service.is_active;
    } else {
        title.textContent = 'افزودن سرویس جدید';
        id.value = '';
        name.value = '';
        price.value = '';
        discount.value = 0;
        description.value = '';
        subcategoryId.value = '';
        active.checked = true;
    }

    modal.classList.add('show');
}

async function saveService() {
    const id = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const price = parseFloat(document.getElementById('servicePrice').value) || 0;
    const discount = parseFloat(document.getElementById('serviceDiscount').value) || 0;
    const description = document.getElementById('serviceDescription').value.trim();
    const subcategory_id = document.getElementById('serviceSubcategoryId').value;
    const is_active = document.getElementById('serviceActive').checked;

    if (!name || !subcategory_id) {
        alert('لطفاً همه فیلدهای ضروری را پر کنید');
        return;
    }

    try {
        const url = id ? `${API_URL}/api/services/${id}` : `${API_URL}/api/services`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                subcategory_id,
                name,
                price,
                discount,
                description,
                is_active,
                slug: name.replace(/\s/g, '-').toLowerCase()
            })
        });

        if (!response.ok) throw new Error('Failed to save service');

        closeModal('serviceModal');
        loadServices();
        loadStats();

    } catch (error) {
        console.error('Error saving service:', error);
        alert('خطا در ذخیره سرویس');
    }
}

async function editService(id) {
    const service = servicesData.find(s => s.id === id);
    if (service) showServiceModal(service);
}

async function deleteService(id) {
    if (!confirm('آیا از حذف این سرویس مطمئن هستید؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/services/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete service');

        loadServices();
        loadStats();

    } catch (error) {
        console.error('Error deleting service:', error);
        alert('خطا در حذف سرویس');
    }
}

// ============================================
// ===== مدیریت Reviews =====
// ============================================
let reviewsData = [];

async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/api/reviews`);
        if (!response.ok) throw new Error('Failed to load reviews');
        reviewsData = await response.json();
        renderReviews();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function renderReviews() {
    const tbody = document.querySelector('#reviewsTable tbody');
    if (!tbody) return;

    if (!reviewsData || reviewsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;">هیچ نظری وجود ندارد</td></tr>`;
        return;
    }

    let html = '';
    reviewsData.forEach(review => {
        const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        html += `
            <tr>
                <td>${review.customer_name}</td>
                <td>${stars}</td>
                <td>${review.comment.substring(0, 30)}...</td>
                <td>${review.is_approved ? '✅ تأیید شده' : '⏳ در انتظار'}</td>
                <td>
                    <div class="actions">
                        ${!review.is_approved ? `<button class="btn-approve" onclick="approveReview('${review.id}')">تأیید</button>` : ''}
                        <button class="btn-delete" onclick="deleteReview('${review.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

async function approveReview(id) {
    try {
        const response = await fetch(`${API_URL}/api/reviews/${id}/approve`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to approve review');

        loadReviews();
        loadStats();

    } catch (error) {
        console.error('Error approving review:', error);
        alert('خطا در تأیید نظر');
    }
}

async function deleteReview(id) {
    if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/reviews/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete review');

        loadReviews();
        loadStats();

    } catch (error) {
        console.error('Error deleting review:', error);
        alert('خطا در حذف نظر');
    }
}

// ============================================
// ===== مدیریت Posts =====
// ============================================
let postsData = [];

async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`);
        if (!response.ok) throw new Error('Failed to load posts');
        postsData = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function renderPosts() {
    const tbody = document.querySelector('#postsTable tbody');
    if (!tbody) return;

    if (!postsData || postsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94A3B8;">هیچ مطلبی وجود ندارد</td></tr>`;
        return;
    }

    let html = '';
    postsData.forEach(post => {
        const status = post.is_active ? '<span class="status-badge active">فعال</span>' : '<span class="status-badge inactive">غیرفعال</span>';
        html += `
            <tr>
                <td>${post.title}</td>
                <td>${post.content.substring(0, 30)}...</td>
                <td>❤️ ${post.likes || 0}</td>
                <td>${status}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="editPost('${post.id}')">ویرایش</button>
                        <button class="btn-delete" onclick="deletePost('${post.id}')">حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function showPostModal(post = null) {
    const modal = document.getElementById('postModal');
    if (!modal) return;

    const title = document.getElementById('postModalTitle');
    const id = document.getElementById('postId');
    const name = document.getElementById('postTitle');
    const content = document.getElementById('postContent');
    const active = document.getElementById('postActive');

    if (post) {
        title.textContent = 'ویرایش مطلب';
        id.value = post.id;
        name.value = post.title;
        content.value = post.content;
        active.checked = post.is_active;
    } else {
        title.textContent = 'افزودن مطلب جدید';
        id.value = '';
        name.value = '';
        content.value = '';
        active.checked = true;
    }

    modal.classList.add('show');
}

async function savePost() {
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const is_active = document.getElementById('postActive').checked;

    if (!title || !content) {
        alert('لطفاً عنوان و متن را وارد کنید');
        return;
    }

    try {
        const url = id ? `${API_URL}/api/posts/${id}` : `${API_URL}/api/posts`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content, is_active })
        });

        if (!response.ok) throw new Error('Failed to save post');

        closeModal('postModal');
        loadPosts();
        loadStats();

    } catch (error) {
        console.error('Error saving post:', error);
        alert('خطا در ذخیره مطلب');
    }
}

async function editPost(id) {
    const post = postsData.find(p => p.id === id);
    if (post) showPostModal(post);
}

async function deletePost(id) {
    if (!confirm('آیا از حذف این مطلب مطمئن هستید؟')) return;

    try {
        const response = await fetch(`${API_URL}/api/posts/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to delete post');

        loadPosts();
        loadStats();

    } catch (error) {
        console.error('Error deleting post:', error);
        alert('خطا در حذف مطلب');
    }
}

// ============================================
// ===== مدیریت Settings =====
// ============================================
let settingsData = {};

async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        if (!response.ok) throw new Error('Failed to load settings');
        settingsData = await response.json();
        renderSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function renderSettings() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    // پر کردن فیلدها با مقادیر موجود
    document.getElementById('settingSiteName').value = settingsData.site_name || '';
    document.getElementById('settingWhatsapp').value = settingsData.whatsapp_number || '';
    document.getElementById('settingTelegram').value = settingsData.telegram_link || '';
    document.getElementById('settingFacebook').value = settingsData.facebook_link || '';
    document.getElementById('settingInstagram').value = settingsData.instagram_link || '';
    document.getElementById('settingFooter').value = settingsData.footer_text || '';
    document.getElementById('settingAnnouncement').value = settingsData.announcement || '';
}

async function saveSettings() {
    const updates = {
        site_name: document.getElementById('settingSiteName').value.trim(),
        whatsapp_number: document.getElementById('settingWhatsapp').value.trim(),
        telegram_link: document.getElementById('settingTelegram').value.trim(),
        facebook_link: document.getElementById('settingFacebook').value.trim(),
        instagram_link: document.getElementById('settingInstagram').value.trim(),
        footer_text: document.getElementById('settingFooter').value.trim(),
        announcement: document.getElementById('settingAnnouncement').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to save settings');

        alert('تنظیمات با موفقیت ذخیره شد!');
        loadSettings();

    } catch (error) {
        console.error('Error saving settings:', error);
        alert('خطا در ذخیره تنظیمات');
    }
}
