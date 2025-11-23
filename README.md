# RPaas on Retail

[![GitHub repo size](https://img.shields.io/github/repo-size/wikiepeidia/Group-project-AI-ML)](https://github.com/wikiepeidia/Group-project-AI-ML)
[![GitHub last commit](https://img.shields.io/github/last-commit/wikiepeidia/Group-project-AI-ML)](https://github.com/wikiepeidia/Group-project-AI-ML/commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Tổng quan hệ thống

Hệ thống quản lý AI Agent với ba vai trò chính và cấu trúc phân cấp rõ ràng:

```
Chủ Web (Admin)
    ↓ quản lý
Manager
    ↓ cấp quyền
User
```

### Vai trò trong hệ thống

- **Chủ Web (Admin)**:
  - Quản lý cao nhất
  - Thêm/xóa Manager
  - Có toàn bộ quyền trong hệ thống

- **Manager**:
  - Được Chủ Web giao quyền
  - Cấp/thu hồi quyền cho User
  - Quản lý tài nguyên, báo cáo

- **User**:
  - Sử dụng hệ thống sau khi được cấp quyền
  - Truy cập các module: KH, SP, Nhập hàng, Xuất hàng
  - Sử dụng SE (tự động hóa) và Workspace

### Kiến trúc hệ thống

```
[Quản lý phân quyền]     [Dữ liệu nghiệp vụ]        [Tự động hóa & Workspace]
        ↓                         ↓                            ↓
Admin → Manager          KH/SP/Nhập/Xuất              SE + Workspace sáng tạo
        ↓                         ↓                            ↓
    Cấp quyền            Quản lý thông tin            AI Agent + Automation
        ↓                         ↓                            ↓
      User                 CRUD operations                   Output
```

## Chức năng chính

### 1. Menu hệ thống (Sidebar Navigation)

#### A. Chủ Web (Admin)

- **Quản lý Manager**: Thêm/xóa Manager
- **Thống kê hệ thống**: Tổng quan users, workspaces, tasks

#### B. Manager  

- **Cấp quyền User**: Grant/Revoke permissions cho User

#### C. Menu chính (Dành cho User có quyền)

- **Khách hàng (KH)**: Quản lý thông tin khách hàng (code, tên, SĐT, email, địa chỉ)
- **Sản phẩm (SP)**: Quản lý sản phẩm (code, tên, danh mục, đơn vị, giá, tồn kho)
- **Nhập hàng**: Tạo phiếu nhập hàng từ nhà cung cấp
- **Xuất hàng**: Tạo phiếu xuất hàng cho khách hàng

#### D. SE - Tự động hóa (Scenarios & Events)

- **Tự động nhập hàng**: Cấu hình automation nhập hàng tự động theo điều kiện
- **Báo cáo thu chi**: Gửi báo cáo định kỳ (ngày/tuần/tháng) về doanh thu, chi phí

#### E. Workspace

- **Không gian sáng tạo**: User tự do tạo bot, AI agent không cần gợi ý template

### 2. Phân quyền chi tiết

Manager có thể duyệt và cấp quyền cho User truy cập vào các chức năng cụ thể:

- **export**: Xuất dữ liệu
- **import**: Nhập dữ liệu  
- **view_reports**: Xem báo cáo
- **manage_data**: Quản lý dữ liệu (KH, SP)
- **create_scenarios**: Tạo scenarios tự động
- **delete_items**: Xóa items

Manager truy cập giao diện quản lý quyền tại `/manager/permissions` để:

- Xem danh sách user và quyền hiện tại
- Cấp quyền mới cho user (Grant)
- Thu hồi quyền đã cấp (Revoke)

## Thông tin quan trọng

### API Endpoints

Tất cả API JSON được định nghĩa trong `app.py` và sử dụng Flask-Login session. Mặc định phải đăng nhập mới gọi được, riêng các route admin yêu cầu role `admin`.

### API Endpoints

Tất cả API JSON được định nghĩa trong `app.py` và sử dụng Flask-Login session. Mặc định phải đăng nhập mới gọi được, riêng các route admin yêu cầu role `admin`.

#### Admin APIs (Chủ Web)

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/admin/users` | GET | Lấy danh sách tất cả user kèm role | admin |
| `/api/admin/stats` | GET | Thống kê hệ thống (users, workspaces, tasks) | admin |
| `/api/admin/create-manager` | POST | Tạo Manager mới (body: email, name, password) | admin |
| `/api/admin/users/<id>` | DELETE | Xóa user/manager | admin |

#### Manager Permission APIs

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/manager/users-permissions` | GET | Lấy danh sách user với permissions | admin/manager |
| `/api/manager/permissions/grant` | POST | Cấp quyền (body: user_id, permission_type) | admin/manager |
| `/api/manager/permissions/revoke` | POST | Thu hồi quyền (body: user_id, permission_type) | admin/manager |
| `/api/user/permissions` | GET | Lấy quyền của user hiện tại | logged-in |

**Permission Types**: `export`, `import`, `view_reports`, `manage_data`, `create_scenarios`, `delete_items`

#### Customers APIs (Khách hàng)

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/customers` | GET | Lấy danh sách khách hàng | logged-in |
| `/api/customers` | POST | Tạo khách hàng (body: code, name, phone, email, address, notes) | logged-in |
| `/api/customers/<id>` | PUT | Cập nhật thông tin khách hàng | logged-in |
| `/api/customers/<id>` | DELETE | Xóa khách hàng | logged-in |

#### Products APIs (Sản phẩm)

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/products` | GET | Lấy danh sách sản phẩm | logged-in |
| `/api/products` | POST | Tạo sản phẩm (body: code, name, category, unit, price, stock_quantity, description) | logged-in |
| `/api/products/<id>` | PUT | Cập nhật sản phẩm | logged-in |
| `/api/products/<id>` | DELETE | Xóa sản phẩm | logged-in |

#### Import/Export Transaction APIs

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/imports` | GET | Lấy danh sách phiếu nhập hàng | logged-in |
| `/api/exports` | GET | Lấy danh sách phiếu xuất hàng | logged-in |

#### Workspace & Item APIs

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/workspaces` | GET | Lấy danh sách workspace của user | logged-in |
| `/api/workspace/<id>/items` | GET | Lấy items trong workspace | logged-in + owner |
| `/api/workspace/<id>/items` | POST | Tạo item mới | logged-in + owner |
| `/api/items/<id>` | PUT | Cập nhật item | logged-in + assignee |
| `/api/items/<id>` | DELETE | Xóa item | logged-in + assignee |
| `/api/workspace` | POST | Tạo workspace mới | logged-in |

#### Scenario APIs

| Endpoint | Method | Mô tả | Quyền |
|----------|--------|-------|-------|
| `/api/scenarios` | GET | Lấy danh sách scenario | logged-in |
| `/api/scenarios` | POST | Tạo scenario mới | logged-in |
| `/api/scenarios/<id>` | PUT | Cập nhật scenario | logged-in + owner |
| `/api/scenarios/<id>` | DELETE | Xóa scenario | logged-in + owner |

> **Ghi chú**: Các route `/auth` (đăng ký/đăng nhập) và giao diện (dashboard, workspace, customers, products, imports, exports, SE) là HTML render, không nằm trong danh sách API JSON ở trên.

## Cài đặt và Chạy

```powershell
# Tạo database
python create_database.py

# Migrate database (nếu cần)
python migrate_database.py

# Chạy ứng dụng
python app.py
```

## Demo Accounts

Sau khi chạy `create_database.py`, hệ thống tạo sẵn 3 tài khoản demo:

| Email | Password | Role | Chức năng |
|-------|----------|------|-----------|
| <admin@fun.com> | admin123 | admin | Chủ Web - Quản lý Manager, full quyền |
| <manager@fun.com> | manager123 | manager | Cấp quyền cho User |
| <user@fun.com> | user123 | user | User thông thường, cần được cấp quyền |

## Sử dụng hệ thống

### 1. Chủ Web (Admin) quản lý Manager

1. Đăng nhập với `admin@fun.com`
2. Truy cập `/admin/managers`
3. Click "Thêm Manager" để tạo Manager mới
4. Xóa Manager không cần thiết

### 2. Manager cấp quyền cho User

1. Đăng nhập với `manager@fun.com`
2. Truy cập `/manager/permissions`
3. Chọn user và click "Cấp quyền"
4. Chọn loại quyền (export, import, view_reports, v.v.)
5. Có thể thu hồi quyền bằng nút "X" trên badge

### 3. User sử dụng các module

1. Đăng nhập với `user@fun.com`
2. Truy cập các module trong menu:
   - **Khách hàng**: `/customers` - CRUD khách hàng
   - **Sản phẩm**: `/products` - CRUD sản phẩm
   - **Nhập hàng**: `/imports` - Quản lý phiếu nhập
   - **Xuất hàng**: `/exports` - Quản lý phiếu xuất
   - **SE - Tự động nhập hàng**: `/se/auto-import`
   - **SE - Báo cáo thu chi**: `/se/reports`
   - **Workspace**: `/workspace` - Không gian sáng tạo tự do

### 4. Sử dụng Permission Decorator trong Code

```python
from core.auth import AuthManager

@app.route('/api/export-data')
@login_required
@AuthManager.permission_required('export')
def export_data():
    # Chỉ user có quyền 'export' mới gọi được
    return jsonify({'data': '...'})
```

## Cấu trúc thư mục

```
├── app.py                      # Main application với routes và APIs
├── core/                       # Core modules
│   ├── auth.py                # Authentication & permission decorators
│   ├── config.py              # Configuration
│   ├── database.py            # Database management & schema
│   └── utils.py               # Utilities
├── ui/templates/               # HTML templates
│   ├── components/
│   │   └── sidebar.html       # Menu navigation chính
│   ├── admin_managers.html    # Admin quản lý Manager
│   ├── manager_permissions.html # Manager cấp quyền User
│   ├── customers.html         # Quản lý Khách hàng (TODO)
│   ├── products.html          # Quản lý Sản phẩm (TODO)
│   ├── imports.html           # Nhập hàng (TODO)
│   ├── exports.html           # Xuất hàng (TODO)
│   ├── se_auto_import.html    # SE - Tự động nhập (TODO)
│   ├── se_reports.html        # SE - Báo cáo thu chi (TODO)
│   ├── workspace.html         # Workspace sáng tạo
│   ├── signin.html            # Đăng nhập
│   ├── signup.html            # Đăng ký
│   └── base.html              # Base template
├── static/                     # CSS, JS files
│   ├── style.css
│   ├── script.js
│   └── ...
├── create_database.py          # Khởi tạo database
├── migrate_database.py         # Migration script
└── README.md
```

## Database Schema

### Tables

- **users**: id, email, password, name, avatar, theme, role (admin/manager/user), created_at
- **user_permissions**: id, user_id, permission_type, granted_by, granted_at, revoked
- **customers**: id, code, name, phone, email, address, notes, created_by, created_at
- **products**: id, code, name, category, unit, price, stock_quantity, description, created_by
- **import_transactions**: id, code, supplier_name, total_amount, notes, status, created_by
- **import_details**: id, import_id, product_id, quantity, unit_price, total_price
- **export_transactions**: id, code, customer_id, total_amount, notes, status, created_by
- **export_details**: id, export_id, product_id, quantity, unit_price, total_price
- **se_automations**: id, name, type, config, enabled, last_run, created_by
- **workspaces**: id, user_id, name, type, description, settings, created_at
- **items**: id, workspace_id, title, description, type, status, priority, assignee_id
- **scenarios**: id, workspace_id, name, description, steps, conditions, status
- **channels**: id, from_workspace_id, to_workspace_id, channel_type, config, active

## Roadmap

- [ ] Hoàn thiện giao diện Customers, Products, Imports, Exports
- [ ] Xây dựng module SE (Tự động nhập hàng, Báo cáo thu chi định kỳ)
- [ ] Tích hợp AI Agent vào Workspace
- [ ] Thêm dashboard analytics
- [ ] Export/Import dữ liệu Excel/CSV
- [ ] API documentation với Swagger
- [ ] Unit tests

## License

MIT License - see [LICENSE](LICENSE) file for details.
