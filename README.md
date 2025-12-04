# AI Agent Management System

[![GitHub repo size](https://img.shields.io/github/repo-size/wikiepeidia/Group-project-AI-ML)](https://github.com/wikiepeidia/Group-project-AI-ML)
[![GitHub last commit](https://img.shields.io/github/last-commit/wikiepeidia/Group-project-AI-ML)](https://github.com/wikiepeidia/Group-project-AI-ML/commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ⚡ TL;DR

- **Vai trò:** Chủ Web → Manager → User, truyền quyền theo tầng.
- **Chuỗi giá trị:** Dữ liệu (KH/SP/NP/XP + Webhook + API Maker) → AI Agent + Template → Workspace/Bot + Dashboard.
- **Admin:** Quản lý người dùng, workspace, model AI, quota bot/sub-bot, dataset gán cho từng agent.
- **Một câu:** *"Hệ thống gồm: Người quản lý → Dữ liệu → AI Agent → Workspace → Dashboard, kèm API & Webhook để lấy dữ liệu tự động."*

---

## 🔹 Vai trò & Các phần chính

### Vai trò

- **Chủ Web (Admin):** Quyền cao nhất, thêm/xóa Manager, điều phối tài nguyên, chọn model AI.
- **Manager:** Nhận quyền từ Admin, cấp/thu hồi permission cho User, quản lý báo cáo và nguồn dữ liệu.
- **User:** Dùng hệ thống sau khi được cấp quyền; tạo bot, thao tác workspace, đặt câu hỏi cho AI.

### 3 phần của hệ thống

**(A) Dữ liệu đầu vào**  

- Danh mục chuẩn: KH (Khách hàng), SP (Sản phẩm), NP (Nhập), XP (Xuất), …
- Bổ sung qua **Webhook** hoặc **API Maker**, hỗ trợ dữ liệu thủ công/CSV.

**(B) Xử lý**  

- AI Agent đọc dữ liệu, Template dựng bot nhanh, builder kéo-thả để điều chỉnh logic.
- Chat box hiển thị câu hỏi/đáp realtime để test bot.

**(C) Đầu ra**  

- **Workspace:** Chứa bot/agent, trạng thái chạy, nhật ký.
- **Dashboard:** KPI nhập/xuất/bot, có thể phát Webhook/API ra ngoài.

### Flow tóm tắt

```text
Chủ Web → Manager → User ───────────────┐
                                        ↓
           [INPUT] Datasets / Webhook / API Maker
                                        ↓
                        AI Agent + Templates + Builder
                                        ↓
           Workspace (Bot runtime) + Dashboard (Reports)
                                        ↓
                    API / Webhook / Chat Output Layer
```

---

## 📦 Implementation Status (Nov 2025)

| Domain | Trạng thái | Đã có | Còn thiếu |
| --- | --- | --- | --- |
| **Authentication & Roles** | ✅ Live | Flask auth, login/signup, Manager permission UI (`/manager/permissions`) | MFA, audit log, invitation flow |
| **Data Modules (KH/SP/NP/XP)** | ⚙️ Backend ready | REST APIs + DB schema (`app.py`, `core/database.py`) | Hoàn thiện UI customers/products/import/export |
| **Workspace & Builder** | ✅ UI v1 | Drag-drop builder (`workspace_builder.html`, `static/builder.css`), light/dark theme, property panel | Lưu đồ nodes/edges, execution engine, collaboration |
| **Scenarios / Automation** | ⚙️ Basic | Scenario list page, theme sync, placeholder CRUD API | Scheduler, webhook triggers, runtime logs |
| **AI Layer** | 💤 Not started | Slots để chọn model trong config | Model hosting, prompt orchestration, grounding pipeline |
| **Integrations (API/Webhook)** | 💤 Not started | Concept + README mô tả | Connector marketplace, OAuth handshake, webhook listener |
| **Dashboard & Reporting** | 💤 Not started | `/api/admin/stats` cho số liệu thô | UI dashboard, biểu đồ, export CSV/PDF |

---

## 📋 Chức năng & Điều hướng

### Menu chính

- **Admin:** Quản lý Manager, xem thống kê.
- **Manager:** Giao/thu hồi quyền cho user, quản lý dataset và báo cáo.
- **User có quyền:**
  - **Khách hàng (KH):** CRUD khách hàng.
  - **Sản phẩm (SP):** CRUD sản phẩm.
  - **Nhập/Xuất hàng:** Lập phiếu, kiểm soát tồn kho.
  - **Scenarios & Events (SE):** Automation nhập hàng, báo cáo định kỳ.
  - **Workspace:** Xây bot/agent tự do, thử nghiệm trong builder.

### Phân quyền chi tiết

Các permission hiện có: `export`, `import`, `view_reports`, `manage_data`, `create_scenarios`, `delete_items`.  
Manager dùng `/manager/permissions` để xem, cấp (Grant) hoặc thu hồi (Revoke) từng quyền cho user.

---

## 🔌 API Endpoints (JSON)

> Tất cả API yêu cầu đăng nhập (Flask-Login). Route quản trị bắt buộc role `admin`.

### Admin APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/admin/users` | GET | Danh sách user + role | admin |
| `/api/admin/stats` | GET | Tổng quan users/workspaces/tasks | admin |
| `/api/admin/create-manager` | POST | Tạo Manager (email, name, password) | admin |
| `/api/admin/users/<id>` | DELETE | Xóa user/manager | admin |

### Manager Permission APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/manager/users-permissions` | GET | User + danh sách permission | admin/manager |
| `/api/manager/permissions/grant` | POST | Cấp quyền (user_id, permission_type) | admin/manager |
| `/api/manager/permissions/revoke` | POST | Thu hồi quyền | admin/manager |
| `/api/user/permissions` | GET | Quyền của user hiện tại | logged-in |

### Customers APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/customers` | GET | Danh sách khách hàng | logged-in |
| `/api/customers` | POST | Tạo khách hàng mới | logged-in |
| `/api/customers/<id>` | PUT | Cập nhật thông tin | logged-in |
| `/api/customers/<id>` | DELETE | Xóa khách hàng | logged-in |

### Products APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/products` | GET | Danh sách sản phẩm | logged-in |
| `/api/products` | POST | Tạo sản phẩm mới | logged-in |
| `/api/products/<id>` | PUT | Cập nhật sản phẩm | logged-in |
| `/api/products/<id>` | DELETE | Xóa sản phẩm | logged-in |

### Import/Export APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/imports` | GET | Danh sách phiếu nhập hàng | logged-in |
| `/api/exports` | GET | Danh sách phiếu xuất hàng | logged-in |

### Workspace & Items APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/workspaces` | GET | Workspaces của user | logged-in |
| `/api/workspace/<id>/items` | GET | Items trong workspace | logged-in + owner |
| `/api/workspace/<id>/items` | POST | Tạo item mới | logged-in + owner |
| `/api/items/<id>` | PUT | Cập nhật item | logged-in + assignee |
| `/api/items/<id>` | DELETE | Xóa item | logged-in + assignee |
| `/api/workspace` | POST | Tạo workspace mới | logged-in |

### Scenario APIs

| Endpoint | Method | Mô tả | Quyền |
| --- | --- | --- | --- |
| `/api/scenarios` | GET | Danh sách scenario | logged-in |
| `/api/scenarios` | POST | Tạo scenario mới | logged-in |
| `/api/scenarios/<id>` | PUT | Cập nhật scenario | logged-in + owner |
| `/api/scenarios/<id>` | DELETE | Xóa scenario | logged-in + owner |

> Các route `/auth/*` và giao diện HTML (dashboard, workspace, customers, products, imports, exports, SE) render server-side nên không liệt kê trong bảng API JSON.

---

## 🚀 Cài đặt & Chạy

```powershell
# Tạo database
python create_database.py

# Migration (nếu cần)
python migrate_database.py

# Chạy ứng dụng
python app.py
```

## 🔑 Demo Accounts

| Email | Password | Role | Chức năng |
| --- | --- | --- | --- |
| `admin@fun.com` | `admin123` | admin | Chủ Web – quản lý Manager, toàn quyền |
| `manager@fun.com` | `manager123` | manager | Cấp quyền người dùng |
| `user@fun.com` | `user123` | user | User thường, cần được cấp quyền |

## 👣 Hướng dẫn nhanh

1. **Admin:** Đăng nhập → `/admin/managers` → thêm/xóa Manager.
2. **Manager:** Đăng nhập → `/manager/permissions` → chọn user → Grant/Revoke quyền.
3. **User:** Đăng nhập → truy cập các module (KH/SP/Imports/Exports/SE/Workspace) → thao tác CRUD hoặc builder.
4. **Decorator mẫu:**

```python
from core.auth import AuthManager

@app.route('/api/export-data')
@login_required
@AuthManager.permission_required('export')
def export_data():
    return jsonify({'data': '...'})
```

---

## 📁 Cấu trúc thư mục

```text
├── app.py                      # Main Flask app + routes/APIs
├── core/
│   ├── auth.py                 # Auth helpers & decorators
│   ├── config.py               # App configuration
│   ├── database.py             # DB helpers & schema
│   └── utils.py
├── ui/templates/
│   ├── base.html
│   ├── components/sidebar.html
│   ├── admin_managers.html
│   ├── manager_permissions.html
│   ├── customers.html (TODO)
│   ├── products.html (TODO)
│   ├── imports.html (TODO)
│   ├── exports.html (TODO)
│   ├── se_auto_import.html (TODO)
│   ├── se_reports.html (TODO)
│   ├── workspace.html
│   └── auth pages (signin/signup)
├── templates/                  # Legacy dashboards
├── static/
│   ├── style.css
│   ├── workspace.css / builder.css / scenarios.css
│   └── script.js (toast + theme + drag-drop)
├── create_database.py
├── migrate_database.py
└── README.md
```

## 🗄️ Database Schema (hiện tại)

- `users`, `user_permissions`, `customers`, `products`
- `import_transactions`, `import_details`, `export_transactions`, `export_details`
- `se_automations`, `workspaces`, `items`, `scenarios`, `channels`

> Lưu ý: hiện dùng SQLite (file) để demo; chuyển sang PostgreSQL/MongoDB khi mở rộng multi-tenant.

---

## 🛣️ Roadmap

- [ ] Hoàn thiện UI Customers/Products/Imports/Exports.
- [ ] Lưu/publish workflow trong builder (nodes/edges + execution engine).
- [ ] Thiết kế Automation runtime: scheduler, webhook listener, retry.
- [ ] Thêm AI Assistant (model selection, prompt orchestration, grounding).
- [ ] Xây integration hub (OAuth/API key vault, connector marketplace).
- [ ] Dashboard analytics + export CSV/PDF.
- [ ] Swagger/OpenAPI docs & unit tests.

## 📄 License

MIT License – xem [LICENSE](LICENSE) để biết chi tiết.
