/* ===== تنظیمات پایه ===== */
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #10B981;
    --primary-dark: #059669;
    --primary-light: #D1FAE5;
    --bg: #F1F5F9;
    --white: #FFFFFF;
    --gray-100: #F1F5F9;
    --gray-200: #E2E8F0;
    --gray-300: #CBD5E1;
    --gray-400: #94A3B8;
    --gray-500: #64748B;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1E293B;
    --gray-900: #0F172A;
    --shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    --radius: 16px;
    --transition: all 0.3s ease;
}

body {
    font-family: 'Vazirmatn', sans-serif;
    background: var(--bg);
    color: var(--gray-800);
    direction: rtl;
}

/* ===== صفحه ورود ===== */
.admin-login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ECFDF5 0%, #F1F5F9 100%);
}

.login-container {
    width: 100%;
    padding: 20px;
}

.login-box {
    max-width: 400px;
    margin: 0 auto;
    background: var(--white);
    border-radius: var(--radius);
    padding: 40px 32px;
    box-shadow: var(--shadow);
}

.login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 28px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
}
.login-logo i {
    color: var(--primary);
}
.login-logo span {
    color: var(--primary);
}

.login-box h2 {
    text-align: center;
    font-size: 22px;
    margin-top: 4px;
}
.login-box p {
    text-align: center;
    color: var(--gray-500);
    font-size: 14px;
    margin-bottom: 28px;
}

.form-group {
    margin-bottom: 18px;
}
.form-group label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    color: var(--gray-700);
    margin-bottom: 6px;
}
.form-group label i {
    color: var(--gray-400);
    margin-left: 8px;
}
.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--gray-200);
    border-radius: 10px;
    font-size: 15px;
    font-family: inherit;
    transition: var(--transition);
    background: var(--gray-100);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}
.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.btn-login {
    width: 100%;
    padding: 14px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}
.btn-login:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
}

.login-error {
    color: #EF4444;
    font-size: 14px;
    text-align: center;
    margin-top: 14px;
    display: none;
}
.login-error.show {
    display: block;
}

.login-footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--gray-200);
}
.login-footer a {
    color: var(--gray-500);
    font-size: 14px;
    text-decoration: none;
    transition: var(--transition);
}
.login-footer a:hover {
    color: var(--primary);
}

/* ===== داشبورد ===== */
.admin-dashboard {
    min-height: 100vh;
    background: var(--bg);
}

.admin-header {
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
}
.admin-header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}
.admin-header .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 800;
}
.admin-header .logo i {
    color: var(--primary);
}
.admin-header .logo span {
    color: var(--primary);
}
.admin-header .admin-user {
    display: flex;
    align-items: center;
    gap: 16px;
}
.admin-header .admin-user span {
    font-weight: 500;
}
.admin-header .admin-user .logout-btn {
    background: none;
    border: none;
    color: #EF4444;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    transition: var(--transition);
}
.admin-header .admin-user .logout-btn:hover {
    color: #DC2626;
}

.admin-content {
    padding: 30px 0 60px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px 60px;
}

.admin-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 8px;
}
.admin-subtitle {
    color: var(--gray-500);
    margin-bottom: 30px;
}

/* کارت‌های آمار */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.stat-card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 24px 20px;
    box-shadow: var(--shadow);
    text-align: center;
    transition: var(--transition);
    border: 1px solid var(--gray-100);
}
.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}
.stat-card .stat-icon {
    font-size: 32px;
    color: var(--primary);
    margin-bottom: 8px;
}
.stat-card .stat-number {
    font-size: 32px;
    font-weight: 800;
    color: var(--gray-900);
}
.stat-card .stat-label {
    color: var(--gray-500);
    font-size: 14px;
}

/* منوی مدیریت */
.admin-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--gray-200);
}
.admin-nav button {
    padding: 10px 24px;
    border-radius: 10px;
    border: 2px solid var(--gray-200);
    background: var(--white);
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-600);
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
}
.admin-nav button:hover {
    border-color: var(--primary);
    color: var(--primary);
}
.admin-nav button.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}

/* بخش‌های مدیریت */
.admin-section {
    display: none;
}
.admin-section.active {
    display: block;
}

.admin-section .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
}
.admin-section .section-header h3 {
    font-size: 20px;
    font-weight: 700;
}
.admin-section .section-header .btn-add {
    padding: 10px 20px;
    border-radius: 10px;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
}
.admin-section .section-header .btn-add:hover {
    background: var(--primary-dark);
}
.admin-section .section-header .btn-save-settings {
    padding: 10px 20px;
    border-radius: 10px;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
}
.admin-section .section-header .btn-save-settings:hover {
    background: var(--primary-dark);
}

.admin-table {
    width: 100%;
    background: var(--white);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
}
.admin-table table {
    width: 100%;
    border-collapse: collapse;
}
.admin-table th {
    background: var(--gray-100);
    padding: 12px 16px;
    text-align: right;
    font-weight: 700;
    color: var(--gray-700);
    font-size: 14px;
}
.admin-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--gray-100);
    font-size: 14px;
    vertical-align: middle;
}
.admin-table tr:hover td {
    background: var(--gray-50);
}
.admin-table .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.admin-table .actions button {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
}
.admin-table .actions .btn-edit {
    background: #DBEAFE;
    color: #2563EB;
}
.admin-table .actions .btn-edit:hover {
    background: #BFDBFE;
}
.admin-table .actions .btn-delete {
    background: #FEE2E2;
    color: #DC2626;
}
.admin-table .actions .btn-delete:hover {
    background: #FECACA;
}
.admin-table .actions .btn-approve {
    background: #D1FAE5;
    color: #059669;
}
.admin-table .actions .btn-approve:hover {
    background: #A7F3D0;
}
.admin-table .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
}
.admin-table .status-badge.active {
    background: #D1FAE5;
    color: #059669;
}
.admin-table .status-badge.inactive {
    background: #FEE2E2;
    color: #DC2626;
}
.admin-table .status-badge.pending {
    background: #FEF3C7;
    color: #D97706;
}

/* ===== مودال ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    display: none;
}
.modal-overlay.show {
    display: flex;
}

.modal-box {
    background: var(--white);
    border-radius: var(--radius);
    max-width: 560px;
    width: 100%;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    max-height: 90vh;
    overflow-y: auto;
}
.modal-box .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.modal-box .modal-header h3 {
    font-size: 20px;
    font-weight: 700;
}
.modal-box .modal-header .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--gray-400);
    cursor: pointer;
    transition: var(--transition);
}
.modal-box .modal-header .close-btn:hover {
    color: var(--gray-800);
}

.modal-box .form-group {
    margin-bottom: 16px;
}
.modal-box .form-group label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    color: var(--gray-700);
    margin-bottom: 4px;
}
.modal-box .form-group input,
.modal-box .form-group select,
.modal-box .form-group textarea {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid var(--gray-200);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: var(--transition);
    background: var(--gray-50);
}
.modal-box .form-group input:focus,
.modal-box .form-group select:focus,
.modal-box .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.modal-box .form-group textarea {
    resize: vertical;
    min-height: 100px;
}
.modal-box .form-group .helper {
    font-size: 12px;
    color: var(--gray-400);
}

.modal-box .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}
.modal-box .form-actions button {
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-family: inherit;
}
.modal-box .form-actions .btn-save {
    background: var(--primary);
    color: white;
}
.modal-box .form-actions .btn-save:hover {
    background: var(--primary-dark);
}
.modal-box .form-actions .btn-cancel {
    background: var(--gray-200);
    color: var(--gray-600);
}
.modal-box .form-actions .btn-cancel:hover {
    background: var(--gray-300);
}

/* ===== تنظیمات ===== */
.settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.settings-grid .form-group {
    margin-bottom: 0;
}
.settings-grid .full-width {
    grid-column: 1 / -1;
}

/* ===== ریسپانسیو ===== */
@media (max-width: 992px) {
    .settings-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .login-box {
        padding: 28px 20px;
    }
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .admin-table {
        overflow-x: auto;
    }
    .admin-nav {
        gap: 6px;
    }
    .admin-nav button {
        padding: 8px 14px;
        font-size: 13px;
    }
    .modal-box {
        padding: 24px 16px;
    }
    .admin-section .section-header {
        flex-direction: column;
        align-items: stretch;
    }
}
