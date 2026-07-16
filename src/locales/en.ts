/**
 * English Translations
 */

import { Translations } from './vi';

export const en: Translations = {
    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        refresh: 'Refresh',
        export: 'Export',
        import: 'Import',
        active: 'Active',
        inactive: 'Inactive',
    },

    // Menu
    menu: {
        dashboard: 'Dashboard',
        users: 'User Management',
        roles: 'Role Management',
        permissions: 'Permission Management',
        books: 'Book Management',
        orders: 'Order Management',
        settings: 'System Settings',
        profile: 'My Profile',
        logout: 'Logout',
    },

    // Auth
    auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        loginSuccess: 'Login successful',
        loginFailed: 'Login failed',
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        totalUsers: 'Total Users',
        totalBooks: 'Total Books',
        totalOrders: 'Total Orders',
        activeUsers: 'Active Users',
        recentUsers: 'Recent Users',
    },

    // Users
    users: {
        title: 'User Management',
        addUser: 'Add User',
        editUser: 'Edit User',
        deleteUser: 'Delete User',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        role: 'Role',
        status: 'Status',
        createdAt: 'Created At',
        assignRoles: 'Assign Roles',
        confirmDelete: 'Confirm delete user',
        deleteWarning: 'User will be soft deleted and can be recovered',
    },

    // Roles
    roles: {
        title: 'Role Management',
        addRole: 'Add Role',
        editRole: 'Edit Role',
        deleteRole: 'Delete Role',
        name: 'Role Name',
        description: 'Description',
        permissions: 'Permissions',
        isSystem: 'System Role',
        systemRoleWarning: 'System roles cannot be edited or deleted',
    },

    // Permissions
    permissions: {
        title: 'Permission Management',
        addPermission: 'Add Permission',
        editPermission: 'Edit Permission',
        deletePermission: 'Delete Permission',
        code: 'Permission Code',
        module: 'Module',
        action: 'Action',
        description: 'Description',
    },

    // Settings
    settings: {
        title: 'System Settings',
        general: 'General',
        appearance: 'Appearance',
        language: 'Language',
        theme: 'Theme',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        systemDefault: 'System Default',
    },

    // Profile
    profile: {
        title: 'My Profile',
        personalInfo: 'Personal Information',
        accountInfo: 'Account Information',
        changePassword: 'Change Password',
    },
};
