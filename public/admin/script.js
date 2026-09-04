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

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showLoginError('لطفاً همه فیلدها را پر کنید');
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

            // ورود موفق
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
        // بررسی احراز هویت
        const admin = await checkAuth();
        if (!admin) return;

        // نمایش نام کاربر
        const userSpan = document.querySelector('.admin-user span');
        if (userSpan) userSpan.textContent = admin.username;

        // دکمه خروج
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // بارگذاری آمار
        loadStats();

        // بارگذاری داده‌ها
        loadCategories();
        loadSubcategories();
        loadServices();
        loadReviews();
        loadPosts();
        loadSettings();

        // رویدادهای ناوبری
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

    // پر کردن dropdown دسته‌بندی‌ها
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
// ===== توابع کمکی =====
// ============================================

// این توابع برای سایر بخش‌ها (Services, Reviews, Posts, Settings)
// در ادامه اضافه می‌شوند. فعلاً این کافی است.

console.log('✅ Admin panel loaded successfully!');
