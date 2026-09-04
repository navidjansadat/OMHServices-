import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-frontend.onrender.com'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ===== سرو کردن فایل‌های استاتیک =====
app.use(express.static('public'));

// ===== صفحه اصلی =====
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// ===== Health Check =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running!' });
});

// ===== احراز هویت ادمین =====
const requireAuth = async (req, res, next) => {
    try {
        const sessionToken = req.cookies?.admin_session || req.headers?.authorization?.split(' ')[1];
        if (!sessionToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('session_token', sessionToken)
            .gt('session_expiry', new Date().toISOString())
            .single();
        if (error || !admin) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// ===== Admin Login (بدون هش) =====
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .single();

        if (adminError || !adminData) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (adminData.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const sessionToken = crypto.randomBytes(64).toString('hex');
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 24);

        await supabase
            .from('admins')
            .update({
                session_token: sessionToken,
                session_expiry: sessionExpiry.toISOString(),
                last_login: new Date().toISOString()
            })
            .eq('id', adminData.id);

        res.cookie('admin_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        res.json({ message: 'Login successful', username: adminData.username });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ===== Admin Logout =====
app.post('/api/admin/logout', requireAuth, async (req, res) => {
    try {
        await supabase
            .from('admins')
            .update({ session_token: null, session_expiry: null })
            .eq('id', req.admin.id);
        res.clearCookie('admin_session');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Admin Check =====
app.get('/api/admin/check', requireAuth, async (req, res) => {
    res.json({ authenticated: true, username: req.admin.username });
});

// ===== Admin Stats =====
app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
        const [categories, subcategories, services, reviews, pendingReviews, posts] = await Promise.all([
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('subcategories').select('*', { count: 'exact', head: true }),
            supabase.from('services').select('*', { count: 'exact', head: true }),
            supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true),
            supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
            supabase.from('posts').select('*', { count: 'exact', head: true })
        ]);
        res.json({
            totalCategories: categories.count || 0,
            totalSubcategories: subcategories.count || 0,
            totalServices: services.count || 0,
            totalReviews: reviews.count || 0,
            pendingReviews: pendingReviews.count || 0,
            totalPosts: posts.count || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Categories =====
app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();
        if (catError || !category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const { data: subcategories, error: subError } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', id)
            .eq('is_active', true)
            .order('order', { ascending: true });
        res.json({ ...category, subcategories: subcategories || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const { name, slug, icon, description, order } = req.body;
        const { data, error } = await supabase
            .from('categories')
            .insert({ name, slug, icon, description, order })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, icon, description, is_active, order } = req.body;
        const { data, error } = await supabase
            .from('categories')
            .update({ name, slug, icon, description, is_active, order })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Subcategories =====
app.get('/api/subcategories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*, categories(name, slug)')
            .eq('is_active', true)
            .order('order', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/subcategories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: subcategory, error: subError } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', id)
            .single();
        if (subError || !subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        const { data: services, error: serError } = await supabase
            .from('services')
            .select('*')
            .eq('subcategory_id', id)
            .eq('is_active', true)
            .order('order', { ascending: true });
        res.json({ ...subcategory, services: services || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/subcategories', requireAuth, async (req, res) => {
    try {
        const { category_id, name, slug, icon, order } = req.body;
        const { data, error } = await supabase
            .from('subcategories')
            .insert({ category_id, name, slug, icon, order })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/subcategories/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, slug, icon, is_active, order } = req.body;
        const { data, error } = await supabase
            .from('subcategories')
            .update({ category_id, name, slug, icon, is_active, order })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/subcategories/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Services =====
app.get('/api/services', async (req, res) => {
    try {
        const { subcategoryId, featured, search } = req.query;
        let query = supabase
            .from('services')
            .select('*, subcategories(name, slug, categories(name, slug))')
            .eq('is_active', true);
        if (subcategoryId) {
            query = query.eq('subcategory_id', subcategoryId);
        }
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        const { data, error } = await query.order('order', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await supabase
            .from('services')
            .update({ views: supabase.rpc('increment', { row_id: id }) })
            .eq('id', id);
        const { data, error } = await supabase
            .from('services')
            .select('*, subcategories(name, slug, categories(name, slug))')
            .eq('id', id)
            .single();
        if (error || !data) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/services', requireAuth, async (req, res) => {
    try {
        const { subcategory_id, name, slug, description, short_description, price, discount, unit, image, icon, delivery_time, guarantee, is_active, is_featured, order } = req.body;
        const { data, error } = await supabase
            .from('services')
            .insert({ subcategory_id, name, slug, description, short_description, price, discount, unit, image, icon, delivery_time, guarantee, is_active, is_featured, order })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/services/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { subcategory_id, name, slug, description, short_description, price, discount, unit, image, icon, delivery_time, guarantee, is_active, is_featured, order } = req.body;
        const { data, error } = await supabase
            .from('services')
            .update({ subcategory_id, name, slug, description, short_description, price, discount, unit, image, icon, delivery_time, guarantee, is_active, is_featured, order })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/services/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Reviews =====
app.get('/api/reviews', async (req, res) => {
    try {
        const { serviceId } = req.query;
        let query = supabase
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });
        if (serviceId) {
            query = query.eq('service_id', serviceId);
        }
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { service_id, customer_name, rating, comment } = req.body;
        const { data, error } = await supabase
            .from('reviews')
            .insert({ service_id, customer_name, rating, comment, is_approved: false })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ message: 'Review submitted for approval', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/reviews/:id/approve', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('reviews')
            .update({ is_approved: true })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Announcements =====
app.get('/api/announcements', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/announcements', requireAuth, async (req, res) => {
    try {
        const { title, content, icon } = req.body;
        const { data, error } = await supabase
            .from('announcements')
            .insert({ title, content, icon })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/announcements/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, icon, is_active } = req.body;
        const { data, error } = await supabase
            .from('announcements')
            .update({ title, content, icon, is_active })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/announcements/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Settings =====
app.get('/api/settings', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*');
        if (error) throw error;
        const settings = {};
        data.forEach(item => {
            settings[item.key] = item.value;
        });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', requireAuth, async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await supabase
                .from('settings')
                .update({ value })
                .eq('key', key);
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== Posts =====
app.get('/api/posts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts', requireAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const { data, error } = await supabase
            .from('posts')
            .insert({ title, content })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, is_active } = req.body;
        const { data, error } = await supabase
            .from('posts')
            .update({ title, content, is_active })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('posts')
            .update({ likes: supabase.rpc('increment', { row_id: id }) })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== شروع سرور =====
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
