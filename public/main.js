const API_URL = '';
let allCategories = [], allSubcategories = [], allServices = [];
let currentCategoryId = 'all', currentSubcategoryId = 'all';
let currentSettings = {};
let searchTimer;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const money = value => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

async function api(url, options = {}) {
    const res = await fetch(`${API_URL}${url}`, { credentials: 'include', ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'خطا در ارتباط با سرور');
    return data;
}

function safeUrl(value) {
    try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.toString() : '#'; } catch { return '#'; }
}

function serviceImage(service) {
    if (service.image) return `<img src="${esc(service.image)}" alt="${esc(service.name)}" loading="lazy" onerror="this.parentElement.innerHTML='📱'">`;
    return `<span>${esc(service.icon || '📱')}</span>`;
}

function applyLogo(url) {
    document.querySelectorAll('[data-site-logo]').forEach(img => {
        if (url) { img.src = url; img.hidden = false; }
        else { img.removeAttribute('src'); img.hidden = true; }
    });
    document.querySelectorAll('[data-logo-fallback]').forEach(el => el.hidden = !!url);
}

async function loadSettings() {
    try {
        currentSettings = await api('/api/settings');
        const s = currentSettings;
        document.title = s.site_name ? `${s.site_name} | خدمات دیجیتال` : document.title;
        document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = s.site_name || 'OMH Social Services');
        document.querySelectorAll('[data-footer-text]').forEach(el => el.textContent = s.footer_text || `© ${new Date().getFullYear()} OMH Social Services. تمامی حقوق محفوظ است.`);
        applyLogo(s.logo_url || '');
        setSocialLink('telegramLink', s.telegram); setSocialLink('facebookLink', s.facebook); setSocialLink('instagramLink', s.instagram);
        setSocialLink('footerTelegram', s.telegram); setSocialLink('footerFacebook', s.facebook); setSocialLink('footerInstagram', s.instagram);
        if (s.announcement) {
            let banner = $('announcementBanner');
            if (!banner) { banner = document.createElement('div'); banner.id = 'announcementBanner'; banner.className = 'announcement-banner'; $('header')?.after(banner); }
            banner.textContent = s.announcement; banner.hidden = false;
        }
    } catch (e) { console.warn(e); }
}
function setSocialLink(id, value) { const el = $(id); if (!el) return; const url = safeUrl(value); el.href = url; el.target = url === '#' ? '' : '_blank'; el.rel = url === '#' ? '' : 'noopener noreferrer'; el.hidden = url === '#'; }
function whatsappUrl(message = 'سلام، من از سایت OMH Social Services با شما تماس می‌گیرم.') { const n = String(currentSettings.whatsapp || '9370000000').replace(/\D/g, ''); return `https://wa.me/${n}?text=${encodeURIComponent(message)}`; }
function openWhatsApp() { window.open(whatsappUrl(), '_blank', 'noopener'); }

async function loadAllData() {
    const [cats, subs, services] = await Promise.all([api('/api/categories'), api('/api/subcategories'), api('/api/services')]);
    allCategories = cats; allSubcategories = subs; allServices = services;
    renderCategories(); renderSubcategories('all'); applyFilters();
    fillReviewServices();
    loadPosts(); loadReviews(); loadSettings(); loadAnnouncementList();
}

function renderCategories() {
    const box = $('categoryTabs'); if (!box) return;
    box.replaceChildren();
    const make = (id, label, icon = '📋') => { const b = document.createElement('button'); b.className = `cat-btn ${currentCategoryId === id ? 'active' : ''}`; b.dataset.category = id; b.textContent = `${icon} ${label}`; b.addEventListener('click', () => { currentCategoryId = id; currentSubcategoryId = 'all'; renderCategories(); renderSubcategories(id); applyFilters(); }); return b; };
    box.append(make('all', 'همه'));
    allCategories.forEach(c => box.append(make(c.id, c.name, c.icon || '📂')));
}
function renderSubcategories(categoryId) {
    const box = $('subcategoryTabs'); if (!box) return;
    box.replaceChildren();
    const list = categoryId === 'all' ? allSubcategories : allSubcategories.filter(s => s.category_id === categoryId);
    if (!list.length) { const p = document.createElement('div'); p.className = 'empty-message'; p.textContent = 'زیردسته‌ای موجود نیست'; box.append(p); return; }
    const all = document.createElement('button'); all.className = `sub-btn ${currentSubcategoryId === 'all' ? 'active' : ''}`; all.textContent = '📁 همه'; all.addEventListener('click', () => { currentSubcategoryId = 'all'; renderSubcategories(currentCategoryId); applyFilters(); }); box.append(all);
    list.forEach(s => { const b = document.createElement('button'); b.className = `sub-btn ${currentSubcategoryId === s.id ? 'active' : ''}`; b.textContent = `${s.icon || '📁'} ${s.name}`; b.addEventListener('click', () => { currentSubcategoryId = s.id; renderSubcategories(currentCategoryId); applyFilters(); }); box.append(b); });
}
function applyFilters() {
    const q = $('searchInput')?.value.trim().toLowerCase() || '';
    let list = allServices.filter(s => currentCategoryId === 'all' || s.subcategories?.category_id === currentCategoryId);
    if (currentSubcategoryId !== 'all') list = list.filter(s => s.subcategory_id === currentSubcategoryId);
    if (q.length >= 1) list = list.filter(s => [s.name, s.description, s.short_description, s.subcategories?.name, s.subcategories?.categories?.name].some(v => String(v || '').toLowerCase().includes(q)));
    renderServices(list);
}
function renderServices(services) {
    const grid = $('servicesGrid'); if (!grid) return;
    grid.replaceChildren();
    if (!services.length) { const d = document.createElement('div'); d.className = 'empty-message'; d.textContent = 'هیچ سرویسی مطابق جستجو پیدا نشد.'; grid.append(d); return; }
    services.forEach(service => {
        const price = Number(service.price || 0), discount = Number(service.discount || 0), final = discount > 0 ? price - price * discount / 100 : price;
        const card = document.createElement('article'); card.className = 'service-card';
        card.innerHTML = `<div class="icon-wrap service-media">${serviceImage(service)}</div><h4>${esc(service.name)}</h4><div class="service-path">${esc(service.subcategories?.categories?.name || '')}${service.subcategories?.name ? ` / ${esc(service.subcategories.name)}` : ''}</div><p class="desc">${esc(service.short_description || service.description || '')}</p><div class="price">${money(final)} AFN ${discount > 0 ? `<span class="old">${money(price)} AFN</span><span class="discount">-${discount}%</span>` : ''}</div><div class="meta"><span class="views"><i class="fas fa-eye"></i> ${Number(service.views || 0).toLocaleString()}</span><button class="order-btn" type="button"><i class="fas fa-shopping-cart"></i> سفارش</button></div>`;
        card.querySelector('.order-btn').addEventListener('click', () => orderService(service.id, service.name, final));
        grid.append(card);
    });
}
function orderService(id, name, price) { window.open(whatsappUrl(`سلام، من می‌خواهم این سرویس را سفارش بدهم:\nسرویس: ${name}\nقیمت: ${money(price)} AFN\nلطفاً راهنمایی کنید.`), '_blank', 'noopener'); }

async function loadPosts() { try { const posts = await api('/api/posts'); const box = $('postsGrid'); if (!box) return; box.replaceChildren(); if (!posts.length) { const p=document.createElement('p'); p.className='empty-message'; p.textContent='هنوز مطلبی منتشر نشده است.'; box.append(p); return; } posts.forEach(post => { const article=document.createElement('article'); article.className='post-card'; const h=document.createElement('h3'); h.textContent=post.title || ''; const p=document.createElement('p'); p.textContent=post.content || ''; article.append(h,p); if (post.likes !== undefined) { const b=document.createElement('button'); b.className='like-btn'; b.textContent=`❤️ ${Number(post.likes||0)}`; b.addEventListener('click',async()=>{try{const updated=await api(`/api/posts/${post.id}/like`,{method:'POST'}); b.textContent=`❤️ ${Number(updated.likes||0)}`;}catch(e){}}); article.append(b); } box.append(article); }); } catch(e) { console.warn(e); } }
async function loadReviews() { try { const reviews = await api('/api/reviews'); const box=$('reviewsGrid'); if(!box)return; box.replaceChildren(); if(!reviews.length){const p=document.createElement('p');p.className='empty-message';p.textContent='هنوز نظری ثبت نشده است.';box.append(p);return;} reviews.forEach(r=>{const article=document.createElement('article');article.className='review-card';const h=document.createElement('h4');h.textContent=r.customer_name||'مشتری';const stars=document.createElement('div');stars.textContent='★'.repeat(Number(r.rating||0))+'☆'.repeat(5-Number(r.rating||0));const p=document.createElement('p');p.textContent=r.comment||'';article.append(h,stars,p);box.append(article);}); } catch(e){console.warn(e);} }

async function loadAnnouncementList() {
    try {
        const rows = await api('/api/announcements');
        const box = $('announcementList'); if (!box) return;
        box.replaceChildren();
        if (!rows.length) { box.hidden = true; return; }
        rows.forEach(a => {
            const item = document.createElement('div'); item.className = 'announcement-item';
            const icon = document.createElement('span'); icon.className = 'announcement-icon'; icon.textContent = a.icon || '📢';
            const wrap = document.createElement('div'); const h = document.createElement('strong'); h.textContent = a.title || 'اعلان'; const p = document.createElement('span'); p.textContent = a.content || '';
            wrap.append(h,p); item.append(icon,wrap); box.append(item);
        });
        box.hidden = false;
    } catch (e) { console.warn(e); }
}
function fillReviewServices() {
    const select = $('reviewService'); if (!select) return;
    select.replaceChildren(new Option('انتخاب سرویس',''));
    allServices.forEach(s => select.append(new Option(s.name, s.id)));
}
function initTheme() {
    const saved = localStorage.getItem('omh-theme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    const btn = $('themeToggle'); if (!btn) return;
    const sync = () => { const dark = document.body.classList.contains('dark-mode'); btn.innerHTML = `<i class="fas ${dark ? 'fa-sun' : 'fa-moon'}"></i><span class="theme-label">${dark ? 'روشن' : 'تاریک'}</span>`; };
    sync();
    btn.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('omh-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); sync(); });
}
async function submitReview(e) {
    e.preventDefault(); const form=e.currentTarget, msg=$('reviewMessage'), btn=form.querySelector('button[type="submit"]');
    msg.textContent=''; msg.className='review-message'; btn.disabled=true;
    try {
        const body={customer_name:$('reviewName').value.trim(),service_id:$('reviewService').value,rating:Number($('reviewRating').value),comment:$('reviewComment').value.trim()};
        const out=await api('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
        msg.textContent=out.message || 'نظر شما برای تأیید ارسال شد.'; msg.classList.add('success'); form.reset();
    } catch(e) { msg.textContent=e.message; msg.classList.add('error'); } finally { btn.disabled=false; }
}

window.addEventListener('DOMContentLoaded', async () => {
    $('hamburger')?.addEventListener('click', () => $('navMenu')?.classList.toggle('open'));
    $('hamburger')?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('navMenu')?.classList.toggle('open'); } });
    document.querySelectorAll('#navMenu a').forEach(a => a.addEventListener('click',()=> $('navMenu')?.classList.remove('open')));
    $('searchInput')?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer=setTimeout(applyFilters,150); });
    $('floatingWhatsapp')?.addEventListener('click', e=>{e.preventDefault();openWhatsApp();});
    $('whatsappLink')?.addEventListener('click',e=>{e.preventDefault();openWhatsApp();});
    $('footerWhatsapp')?.addEventListener('click',e=>{e.preventDefault();openWhatsApp();});
    initTheme();
    $('reviewForm')?.addEventListener('submit', submitReview);
    try { await loadAllData(); } catch(e) { const grid=$('servicesGrid'); if(grid) grid.textContent='ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.'; console.error(e); }
});
