import ProtectedRoute from '@/components/auth';
import { usePermission } from '@/hooks/usePermission';
import {
    AppstoreOutlined,
    DollarCircleOutlined,
    ExceptionOutlined,
    LockOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
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

    const location = useLocation();
    const navigate = useNavigate();

    const items: MenuItem[] = useMemo(() => {
        const menuItems: MenuItem[] = [];
        const isAdminRole = isAdmin();
        const hasAnyPermission = (user?.permissions?.length || 0) > 0;
        menuItems.push({
            label: <Link to='/'>{'Dashboard'}</Link>,
            key: '/',
            icon: <AppstoreOutlined />,
        });
        if (can('users', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/user'>{'Users'}</Link>,
                key: '/user',
                icon: <TeamOutlined />,
            });
        }

        if ((can('roles', 'read') || (isAdminRole && !hasAnyPermission)) && isAdmin()) {
            menuItems.push({
                label: <Link to='/role'>{'Roles'}</Link>,
                key: '/role',
                icon: <SafetyCertificateOutlined />,
            });
        }

        if ((can('permissions', 'read') || (isAdminRole && !hasAnyPermission)) && isAdmin()) {
            menuItems.push({
                label: <Link to='/permission'>{'Permissions'}</Link>,
                key: '/permission',
                icon: <LockOutlined />,
            });
        }

        if (can('books', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/book'>{'Books'}</Link>,
                key: '/book',
                icon: <ExceptionOutlined />,
            });
        }

        if (can('orders', 'read') || (isAdminRole && !hasAnyPermission)) {
            menuItems.push({
                label: <Link to='/order'>{'Orders'}</Link>,
                key: '/order',
                icon: <DollarCircleOutlined />,
            });
        }

        if (isSuperAdmin()) {
            menuItems.push({
                label: <Link to='/settings'>{'Settings'}</Link>,
                key: '/settings',
                icon: <SettingOutlined />,
            });
        }

        return menuItems;
    }, [can, isAdmin, isSuperAdmin, user?.permissions]);

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
                    Profile
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
                    Logout
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
        <ProtectedRoute requiredRole="ADMIN">
            <Layout style={{ minHeight: '100vh' }} className="layout-admin">
                <Sider
                    theme="light"
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
                        color: '#000'
                    }}>
                        {collapsed ? 'Admin' : 'LingoSphere Admin'}
                    </div>
                    <Menu
                        theme="light"
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
                            borderBottom: "1px solid #ebebeb",
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
                                    style: { color: '#000', cursor: 'pointer' },
                                    onClick: () => setCollapsed(!collapsed),
                                }
                            )}
                        </span>
                        <Space size="middle">
                            <Tooltip title={`Role: ${user?.role || 'None'}`}>
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
                                    <span style={{ color: '#000' }}>{user?.name}</span>
                                </Space>
                            </Dropdown>
                        </Space>
                    </div>
                    <Content style={{ padding: '15px', backgroundColor: '#f5f5f5' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ProtectedRoute>
    );
};

export default LayoutAdmin;
