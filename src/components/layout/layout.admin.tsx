import ProtectedRoute from '@/components/auth';
import { useI18n } from '@/context/i18n.context';
import { usePermission } from '@/hooks/usePermission';
import {
    AppstoreOutlined,
    DollarCircleOutlined,
    ExceptionOutlined,
    GlobalOutlined,
    LockOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MoonOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    SunOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Layout, Menu, Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentApp } from '../context/app.context';

type MenuItem = Required<MenuProps>['items'][number];

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('/');

    const {
        user,
        isAuthenticated,
        handleLogout: contextLogout,
        isAdmin,
        isSuperAdmin
    } = useCurrentApp();

    const { can } = usePermission();
    const { t, language, setLanguage, theme, setTheme, isDarkMode } = useI18n();

    const location = useLocation();
    const navigate = useNavigate();

    const items: MenuItem[] = useMemo(() => {
        const menuItems: MenuItem[] = [];
        const isAdminRole = isAdmin();
        const hasAnyPermission = (user?.permissions?.length || 0) > 0;
        menuItems.push({
            label: <Link to='/'>{t.menu.dashboard}</Link>,
            key: '/',
            icon: <AppstoreOutlined />,
        });
        if (can('users', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/user'>{t.menu.users}</Link>,
                key: '/user',
                icon: <TeamOutlined />,
            });
        }

        if ((can('roles', 'read') || (isAdminRole && !hasAnyPermission)) && isAdmin()) {
            menuItems.push({
                label: <Link to='/role'>{t.menu.roles}</Link>,
                key: '/role',
                icon: <SafetyCertificateOutlined />,
            });
        }

        if ((can('permissions', 'read') || (isAdminRole && !hasAnyPermission)) && isAdmin()) {
            menuItems.push({
                label: <Link to='/permission'>{t.menu.permissions}</Link>,
                key: '/permission',
                icon: <LockOutlined />,
            });
        }

        if (can('books', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/book'>{t.menu.books}</Link>,
                key: '/book',
                icon: <ExceptionOutlined />,
            });
        }

        if (can('orders', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/order'>{t.menu.orders}</Link>,
                key: '/order',
                icon: <DollarCircleOutlined />,
            });
        }

        if (isSuperAdmin()) {
            menuItems.push({
                label: <Link to='/settings'>{t.menu.settings}</Link>,
                key: '/settings',
                icon: <SettingOutlined />,
            });
        }

        return menuItems;
    }, [can, isAdmin, isSuperAdmin, user?.permissions, t]);

    useEffect(() => {
        const currentItem = items.find(
            item => location.pathname === (item?.key as string)
        );
        if (currentItem) {
            setActiveMenu(currentItem.key as string);
        }
    }, [location, items]);

    const handleLogout = async () => {
        await contextLogout();
        navigate('/login');
    };

    const itemsDropdown = [
        {
            label: (
                <label
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/profile')}
                >
                    <AppstoreOutlined style={{ marginRight: 8 }} />
                    Hồ sơ cá nhân
                </label>
            ),
            key: 'profile',
        },
        {
            type: 'divider',
        },
        {
            label: (
                <label
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLogout()}
                >
                    <LogoutOutlined style={{ marginRight: 8 }} />
                    Đăng xuất
                </label>
            ),
            key: 'logout',
        },
    ];

    const urlAvatar = user?.image
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.image}`
        : undefined;
    const showAvatar = urlAvatar && !urlAvatar.includes('undefined');

    if (isAuthenticated === false) {
        return <Outlet />;
    }

    const hasAdminAccess = isAdmin() || !!user?.role;

    if (!hasAdminAccess) {
        return <Outlet />;
    }

    const getRoleDisplay = () => {
        const role = user?.role || '';
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        if (role === 'ADMIN') return 'Admin';
        if (role === 'TEACHER') return 'Teacher';
        if (role === 'USER') return 'User';
        return role || 'Guest';
    };

    const getRoleColor = () => {
        const role = user?.role || '';
        if (role === 'SUPER_ADMIN') return 'red';
        if (role === 'ADMIN') return 'orange';
        if (role === 'TEACHER') return 'blue';
        if (role === 'USER') return 'green';
        return 'default';
    };

    return (
        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
            <Layout style={{ minHeight: '100vh' }} className="layout-admin">
                <Sider
                    theme={isDarkMode ? 'dark' : 'light'}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <div style={{
                        height: 32,
                        margin: 16,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: collapsed ? 14 : 18,
                        color: isDarkMode ? '#e8e8e8' : '#000'
                    }}>
                        {collapsed ? 'Admin' : 'LingoSphere Admin'}
                    </div>
                    <Menu
                        theme={isDarkMode ? 'dark' : 'light'}
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => setActiveMenu(e.key as string)}
                    />
                </Sider>
                <Layout>
                    <div
                        className='admin-header'
                        style={{
                            height: "50px",
                            borderBottom: `1px solid ${isDarkMode ? '#404040' : '#ebebeb'}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 15px",
                        }}
                    >
                        <span>
                            {React.createElement(
                                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                                {
                                    className: 'trigger',
                                    style: { color: isDarkMode ? '#e8e8e8' : '#000', cursor: 'pointer' },
                                    onClick: () => setCollapsed(!collapsed),
                                }
                            )}
                        </span>
                        <Space size="middle">
                            {/* Theme Toggle */}
                            <Tooltip title={isDarkMode ? 'Light mode' : 'Dark mode'} color={isDarkMode ? '#2a2a2a' : '#ffffff'}>
                                {isDarkMode ? (
                                    <SunOutlined
                                        style={{ fontSize: 16, cursor: 'pointer', color: '#faad14' }}
                                        onClick={() => setTheme('light')}
                                    />
                                ) : (
                                    <MoonOutlined
                                        style={{ fontSize: 16, cursor: 'pointer', color: '#722ed1' }}
                                        onClick={() => setTheme('dark')}
                                    />
                                )}
                            </Tooltip>

                            {/* Language Selector */}
                            <Tooltip title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'} color={isDarkMode ? '#2a2a2a' : '#ffffff'}>
                                <GlobalOutlined
                                    style={{ fontSize: 16, cursor: 'pointer', color: isDarkMode ? '#e8e8e8' : '#000' }}
                                    onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                                />
                            </Tooltip>

                            {/* Role badge */}
                            <Tooltip title={`Vai trò: ${user?.role || 'Không có'}`} color={isDarkMode ? '#2a2a2a' : '#ffffff'}>
                                <Tag color={getRoleColor()}>
                                    {getRoleDisplay()}
                                </Tag>
                            </Tooltip>
                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    {showAvatar ? (
                                        <Avatar src={urlAvatar} />
                                    ) : (
                                        <Avatar style={{ backgroundColor: '#1890ff' }}>
                                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </Avatar>
                                    )}
                                    <span style={{ color: isDarkMode ? '#e8e8e8' : '#000' }}>{user?.name}</span>
                                </Space>
                            </Dropdown>
                        </Space>
                    </div>
                    <Content style={{ padding: '15px', backgroundColor: isDarkMode ? '#141414' : '#f5f5f5' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ProtectedRoute>
    );
};

export default LayoutAdmin;
