# 🛡️ LingoSphere Frontend Admin - Portal & Management Technical Manual

> **Tài liệu chuẩn kỹ thuật Frontend Admin:** Hướng dẫn toàn diện về Trang Quản trị Hệ thống & Cổng Giáo viên LingoSphere (`frontend-admin`), bao gồm quy chuẩn đặt tên biến, cấu trúc tệp tin, phong cách viết component, 11 màn hình quản trị nghiệp vụ, hệ thống phân quyền động Dynamic RBAC, và cấu trúc bảng dữ liệu Generic DataTable.

---

## 🛠️ 1. Công Nghệ & Tiêu Chuẩn Kỹ Thuật

* **Core Framework:** React 19 + Vite 8.2 + TypeScript (Strict Mode - 100% Type Safety)
* **Styling:** TailwindCSS + Custom Dark/Light Glassmorphism Design Tokens
* **State Management:** Zustand (`src/store/admin-store.ts`, `toast-store.ts`)
* **HTTP Client:** Axios với Token Interceptor (`src/services/api-client.ts`)
* **Thành phần Bảng dữ liệu cốt lõi:** Generic DataTable Component (`src/components/common/DataTable.tsx`)
* **Port Mặc Định:** **`5173`** (`http://localhost:5173`)

---

## 🏷️ 2. Quy Chuẩn Đặt Tên & Phong Cách Viết Code (Frontend Admin Standards)

### 2.1. Quy Chuẩn Đặt Tên Tệp Tin & Thư Mục
* **Admin Pages:** `PascalCasePage.tsx` đặt trong `src/pages/` (ví dụ: `DashboardPage.tsx`, `LearnersPage.tsx`, `CoursesPage.tsx`, `CourseFormPage.tsx`, `RolesPage.tsx`).
* **Modal Dialogs:** `PascalCaseModal.tsx` đặt trong `src/components/modals/` hoặc `src/components/common/` (ví dụ: `ConfirmModal.tsx`, `UserDetailModal.tsx`).
* **Shared Admin Components:** `PascalCase.tsx` đặt trong `src/components/common/` (ví dụ: `DataTable.tsx`, `Pagination.tsx`, `StatCard.tsx`).
* **Services Layer:** `kebab-case.service.ts` đặt trong `src/services/` (ví dụ: `user.service.ts`, `course.service.ts`, `role.service.ts`).
* **Types Definition:** `api.types.ts` đặt trong `src/types/`.

### 2.2. Quy Chuẩn Bảng Dữ Liệu Generic `DataTable<T extends object>`
Mọi bảng dữ liệu trên toàn bộ trang Admin đều sử dụng chung `DataTable<T extends object>` để đảm bảo tính tái sử dụng và type-safe:

```tsx
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import type { UserProfile } from '@/types/api.types'

export function LearnersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const columns: DataTableColumn<UserProfile>[] = [
    {
      key: 'full_name',
      label: 'Họ và tên',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <img src={user.avatar_url || '/default-avatar.png'} className="h-8 w-8 rounded-full" />
          <span className="font-medium text-text-primary">{user.full_name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (user) => (
        <span className={user.is_active ? 'text-emerald-500' : 'text-rose-500'}>
          {user.is_active ? 'Hoạt động' : 'Bị khóa'}
        </span>
      ),
    },
  ]

  return <DataTable data={users} columns={columns} isLoading={isLoading} searchPlaceholder="Tìm học viên..." />
}
```

---

## 📂 3. Chi Tiết 11 Màn Hình Quản Trị Hệ Thống (`src/pages/`)

```
frontend-admin/src/pages/
├── DashboardPage.tsx     # Báo cáo KPI: Tổng học viên, Khóa học, Doanh thu, Dung lượng R2
├── AdminUsersPage.tsx    # Quản lý tài khoản Quản trị viên & Phân quyền cán bộ
├── LearnersPage.tsx      # Quản lý Học viên, Khóa/Mở tài khoản, Xem chi tiết tiến độ
├── CoursesPage.tsx       # Danh sách Khóa học, Lọc theo Category/Level, Trạng thái duyệt
├── CourseFormPage.tsx    # Trình tạo/sửa Khóa học, Chương (Modules), Bài giảng Video
├── VocabularyPage.tsx    # Quản lý Từ vựng, Chủ đề (Topics), Bộ thẻ Flashcard SRS
├── ExamsPage.tsx         # Quản lý Đề thi TOEIC ETS 2024 (Part 1-7, Audio mp3, Hình ảnh)
├── RolesPage.tsx         # Quản lý Vai trò & Ma trận Phân quyền động (Dynamic RBAC)
├── NotificationsPage.tsx # Quản lý Thông báo, Gửi chiến dịch Push & Email hàng loạt
├── ReportsPage.tsx       # Báo cáo học tập, Tỷ lệ đỗ bài thi, Tỷ lệ hoàn thành khóa học
└── UserProfilePage.tsx   # Hồ sơ cá nhân của Quản trị viên
```

### 3.1. `CourseFormPage.tsx` - Trình Tạo Khóa Học Đa Cấp
* **Bước 1 - Thông tin khóa học:** Tên khóa học, Slug, Mô tả, Mục tiêu điểm (Target score), Giá gốc, Giá khuyến mãi, Ảnh bìa.
* **Bước 2 - Quản lý Chương (Modules):** Thêm mới chương, sắp xếp thứ tự chương (`module_order`).
* **Bước 3 - Quản lý Bài giảng (Lessons):** Thêm bài giảng vào từng chương, nhúng link video bài giảng, thời lượng và bài kiểm tra cuối bài.

### 3.2. `VocabularyPage.tsx` - Quản Lý Từ Vựng & Flashcard
* **Tab 1 - Từ vựng (Words):** Thêm mới từ vựng kèm loại từ (Noun, Verb...), cấp độ CEFR (A1-C2), phiên âm IPA US/UK, link audio và câu ví dụ.
* **Tab 2 - Chủ đề (Topics):** Thêm danh mục chủ đề kèm icon và mô tả.
* **Tab 3 - Bộ thẻ (Decks):** Quản lý bộ thẻ Flashcard phục vụ chu kỳ lặp lại ngắt quãng SRS.

### 3.3. `RolesPage.tsx` - Ma Trận Phân Quyền Động (Dynamic RBAC)
* Quản lý vai trò (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
* Bảng ma trận phân quyền chi tiết theo từng phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`) trên từng route dịch vụ.

---

## 📝 4. Quy Chuẩn Kiểm Tra Trước Khi Bàn Giao (Validation Checklist)

```bash
# Kiểm tra biên dịch TypeScript toàn bộ Frontend Admin
npm run build
# Phải đạt Exit Code 0 hoàn hảo (0 errors)
```
