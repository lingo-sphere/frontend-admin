import { useCurrentApp } from '@/components/context/app.context';
import { Card, Avatar, Tag, Space, Descriptions, Typography, Divider } from 'antd';
import { SafetyOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user } = useCurrentApp();

    const getRoleColor = (roleName: string) => {
        const colors: Record<string, string> = {
            'SUPER_ADMIN': 'red',
            'ADMIN': 'orange',
            'TEACHER': 'blue',
            'USER': 'green',
            'GUEST': 'default'
        };
        if (/^[a-f0-9]{24}$/i.test(roleName)) {
            return 'default';
        }
        return colors[roleName] || 'default';
    };

    const getRoleDisplayName = (role: string) => {
        if (/^[a-f0-9]{24}$/i.test(role)) {
            return 'Unresolved Role';
        }
        const names: Record<string, string> = {
            'SUPER_ADMIN': 'Super Admin',
            'ADMIN': 'Admin',
            'TEACHER': 'Teacher',
            'USER': 'User',
            'GUEST': 'Guest'
        };
        return names[role] || role;
    };

    const isUnresolvedRole = (role: string) => {
        return /^[a-f0-9]{24}$/i.test(role);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={3} style={{ color: '#000' }}>
                <Space>
                    <LockOutlined />
                    Profile
                </Space>
            </Title>

            <Card
                style={{
                    background: '#fff',
                    borderColor: '#d9d9d9'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <Avatar
                        size={80}
                        src={user?.image ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.image}` : undefined}
                        style={{ backgroundColor: '#1890ff' }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </Avatar>
                    <div style={{ marginLeft: 24 }}>
                        <Title level={3} style={{ margin: 0, color: '#000' }}>
                            {user?.name}
                        </Title>
                        <Text type="secondary">{user?.email}</Text>
                    </div>
                </div>

                <Divider style={{ borderColor: '#d9d9d9' }} />

                <Descriptions
                    column={1}
                    bordered
                    labelStyle={{ background: '#fafafa', color: 'rgba(0,0,0,0.65)' }}
                    contentStyle={{ background: '#fff', color: 'rgba(0,0,0,0.88)' }}
                >
                    <Descriptions.Item label="ID">{user?._id}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                    <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>
                    <Descriptions.Item label="Role">
                        <Space wrap>
                            {user?.role && (
                                <Tag
                                    color={getRoleColor(user.role)}
                                    icon={user.role === 'SUPER_ADMIN' ? <SafetyOutlined /> : undefined}
                                >
                                    {getRoleDisplayName(user.role)}
                                </Tag>
                            )}
                        </Space>
                        {isUnresolvedRole(user?.role || '') && (
                            <div style={{
                                marginTop: 12,
                                padding: 12,
                                background: '#fffbe6',
                                border: '1px solid #ffe58f',
                                borderRadius: 4
                            }}>
                                <Text type="warning">
                                    ⚠️ Backend has not populated role. Role is showing ObjectId.
                                </Text>
                            </div>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Permissions">
                        {user?.permissions?.length ? (
                            <div style={{ maxHeight: 150, overflow: 'auto' }}>
                                <Space wrap>
                                    {user.permissions.map((perm, index) => (
                                        <Tag key={index} color="blue">{perm}</Tag>
                                    ))}
                                </Space>
                            </div>
                        ) : (
                            <Text type="secondary">
                                {isUnresolvedRole(user?.role || '')
                                    ? 'None (backend has not populated role)'
                                    : 'No permissions'}
                            </Text>
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Divider style={{ borderColor: '#d9d9d9' }} />

                <Text type="secondary">
                    Permissions loaded from backend via JWT token.
                    Contact admin if you need additional permissions.
                </Text>
            </Card>
        </div>
    );
};

export default ProfilePage;
