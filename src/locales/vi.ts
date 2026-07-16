/**
 * Vietnamese Translations
 */

export const vi = {
    // Common
    common: {
        save: 'Lưu',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        delete: 'Xóa',
        edit: 'Sửa',
        create: 'Tạo mới',
        search: 'Tìm kiếm',
        loading: 'Đang tải...',
        success: 'Thành công',
        error: 'Lỗi',
        warning: 'Cảnh báo',
        info: 'Thông tin',
        yes: 'Có',
        no: 'Không',
        close: 'Đóng',
        refresh: 'Làm mới',
        export: 'Xuất',
        import: 'Nhập',
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
    },

    // Menu
    menu: {
        dashboard: 'Dashboard',
        users: 'Quản lý Users',
        roles: 'Quản lý Roles',
        permissions: 'Quản lý Permissions',
        books: 'Quản lý Books',
        orders: 'Quản lý Orders',
        settings: 'Cài đặt hệ thống',
        profile: 'Hồ sơ cá nhân',
        logout: 'Đăng xuất',
    },

    // Auth
    auth: {
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất',
        email: 'Email',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        noAccount: 'Chưa có tài khoản?',
        hasAccount: 'Đã có tài khoản?',
        loginSuccess: 'Đăng nhập thành công',
        loginFailed: 'Đăng nhập thất bại',
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        totalUsers: 'Tổng Users',
        totalBooks: 'Tổng Books',
        totalOrders: 'Tổng Đơn hàng',
        activeUsers: 'Users hoạt động',
        recentUsers: 'Users gần đây',
    },

    // Users
    users: {
        title: 'Quản lý người dùng',
        addUser: 'Thêm User',
        editUser: 'Sửa User',
        deleteUser: 'Xóa User',
        name: 'Tên',
        email: 'Email',
        phone: 'Số điện thoại',
        role: 'Vai trò',
        status: 'Trạng thái',
        createdAt: 'Ngày tạo',
        assignRoles: 'Phân quyền',
        confirmDelete: 'Xác nhận xóa user',
        deleteWarning: 'User sẽ bị xóa mềm và có thể khôi phục',
    },

    // Roles
    roles: {
        title: 'Quản lý Roles',
        addRole: 'Thêm Role',
        editRole: 'Sửa Role',
        deleteRole: 'Xóa Role',
        name: 'Tên Role',
        description: 'Mô tả',
        permissions: 'Quyền hạn',
        isSystem: 'Role hệ thống',
        systemRoleWarning: 'Role hệ thống không thể sửa hoặc xóa',
    },

    // Permissions
    permissions: {
        title: 'Quản lý Permissions',
        addPermission: 'Thêm Permission',
        editPermission: 'Sửa Permission',
        deletePermission: 'Xóa Permission',
        code: 'Mã Permission',
        module: 'Module',
        action: 'Action',
        description: 'Mô tả',
    },

    // Settings
    settings: {
        title: 'Cài đặt hệ thống',
        general: 'Cài đặt chung',
        appearance: 'Giao diện',
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        lightMode: 'Chế độ sáng',
        darkMode: 'Chế độ tối',
        systemDefault: 'Mặc định hệ thống',
    },

    // Profile
    profile: {
        title: 'Hồ sơ cá nhân',
        personalInfo: 'Thông tin cá nhân',
        accountInfo: 'Thông tin tài khoản',
        changePassword: 'Đổi mật khẩu',
    },
};

export type Translations = typeof vi;
