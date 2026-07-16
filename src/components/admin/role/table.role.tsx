/**
 * Role Table Component
 *
 * Backend: GET /api/v1/roles (paginated list)
 * Backend: POST /api/v1/roles (create role)
 * Backend: PATCH /api/v1/roles/:id (update role)
 * Backend: DELETE /api/v1/roles/:id (delete role)
 * Backend: POST /api/v1/roles/:id/permissions (add permissions)
 * Backend: DELETE /api/v1/roles/:id/permissions (remove permissions)
 *
 * RBAC Features:
 * - Permission-based action buttons
 * - Role creation/editing with permission assignment
 * - System role protection (can't edit/delete system roles)
 */

import {
    deleteRoleAPI,
    getRolesAPI,
    createRoleAPI,
    updateRoleAPI,
    getPermissionsAPI,
    addPermissionsToRoleAPI,
    removePermissionsFromRoleAPI,
} from '@/services';
import {
    DeleteTwoTone,
    EditTwoTone,
    PlusOutlined,
    SafetyOutlined,
    LockOutlined
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
    App,
    Button,
    Popconfirm,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    Space,
    TreeSelect,
    message as antMessage,
    Divider,
    Card,
    Row,
    Col,
    Typography,
    Descriptions,
    Badge,
    Alert
} from 'antd';
import { useRef, useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';

const { Text, Title } = Typography;

type TSearch = {
    name: string;
    description: string;
}

interface IExtendedRoleTable extends IRoleTable {
    isSystem?: boolean;
}

const TableRole = () => {
    const actionRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const [permissionForm] = Form.useForm();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    });

    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [openPermissionModal, setOpenPermissionModal] = useState<boolean>(false);

    const [dataUpdate, setDataUpdate] = useState<IRoleTable | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<IPermissionTable[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    // RBAC: Permission hook
    const { can, isSuperAdmin, permissions: userPerms } = usePermission();

    // Debug: Check permissions
    console.log('[TableRole] isSuperAdmin():', isSuperAdmin());
    console.log('[TableRole] can(roles, update):', can('roles', 'update'));
    console.log('[TableRole] user permissions:', userPerms);

    /**
     * RBAC: Check if current user can manage a specific role's permissions
     * - SUPER_ADMIN: can manage ALL roles
     * - ADMIN (not SUPER_ADMIN): can manage ALL roles EXCEPT SUPER_ADMIN (priority >= 100)
     */
    const canManageRolePermissions = (role: IRoleTable): boolean => {
        const isAdmin = isSuperAdmin();
        const canUpdate = can('roles', 'update');
        console.log('[canManageRolePermissions] role:', role.name, 'priority:', role.priority);
        console.log('[canManageRolePermissions] isSuperAdmin():', isAdmin);
        console.log('[canManageRolePermissions] can(roles, update):', canUpdate);

        // SUPER_ADMIN can manage all roles (bypass permission check)
        if (isAdmin) {
            console.log('[canManageRolePermissions] returning TRUE - isSuperAdmin');
            return true;
        }

        // User must have roles.update permission
        if (!canUpdate) {
            console.log('[canManageRolePermissions] returning FALSE - no permission');
            return false;
        }

        // ADMIN (not SUPER_ADMIN) cannot manage SUPER_ADMIN role (priority >= 100)
        if (role.priority >= 100) {
            console.log('[canManageRolePermissions] returning FALSE - protected role');
            return false;
        }

        console.log('[canManageRolePermissions] returning TRUE - has permission');
        return true;
    };

    // All permissions for assignment
    const [allPermissions, setAllPermissions] = useState<IPermissionTable[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);

    // Load all permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            setLoadingPermissions(true);
            try {
                const res = await getPermissionsAPI('current=1&pageSize=100');
                if (res?.data) {
                    // Backend returns paginated response: { meta, results }
                    const data = res.data.data || res.data;
                    const results = data.results || [];
                    setAllPermissions(results);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            } finally {
                setLoadingPermissions(false);
            }
        };
        fetchPermissions();
    }, []);

    // Create role
    const handleCreateRole = async (values: any) => {
        setIsLoading(true);
        try {
            // Ensure permissions is always an array
            const data = {
                ...values,
                permissions: values.permissions || []
            };
            console.log('[handleCreateRole] Sending data:', data);
            const res = await createRoleAPI(data);
            if (res?.data) {
                message.success('Tạo role thành công');
                setOpenModalCreate(false);
                form.resetFields();
                actionRef.current?.reload();
            }
        } catch (error: any) {
            console.error('[handleCreateRole] Error:', error);
            notification.error({
                message: 'Lỗi tạo role',
                description: error?.response?.data?.message || 'Không thể tạo role'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Update role
    const handleUpdateRole = async (values: any) => {
        if (!dataUpdate?._id) {
            message.error('Không tìm thấy thông tin role');
            return;
        }

        // Validate _id format (MongoDB ObjectId is 24 hex characters)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(dataUpdate._id)) {
            console.error('Invalid _id format:', dataUpdate._id);
            message.error('ID role không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            // Remove _id from values before sending
            const { _id, ...updateData } = { ...values };
            const res = await updateRoleAPI(dataUpdate._id, updateData);
            if (res?.data) {
                message.success('Cập nhật role thành công');
                setOpenModalUpdate(false);
                setDataUpdate(null);
                form.resetFields();
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi cập nhật role',
                description: error?.response?.data?.message || 'Không thể cập nhật role'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete role
    const handleDeleteRole = async (_id: string) => {
        setIsDeleting(true);
        try {
            const res = await deleteRoleAPI(_id);
            if (res?.data) {
                message.success('Xóa role thành công');
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi xóa role',
                description: error?.response?.data?.message || 'Không thể xóa role'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Open permission management modal
    const handleOpenPermissionModal = (role: IRoleTable) => {
        setDataUpdate(role);
        setCurrentPermissions(role.permissions || []);
        setOpenPermissionModal(true);
    };

    // Add permissions to role
    const handleAddPermissions = async (permissionIds: string[]) => {
        if (!dataUpdate?._id || !permissionIds.length) return;

        setIsLoading(true);
        try {
            const res = await addPermissionsToRoleAPI(dataUpdate._id, permissionIds);
            if (res?.data) {
                message.success('Thêm permissions thành công');
                actionRef.current?.reload();
                // Refresh permission modal
                const roleRes = await getRolesAPI(`_id=${dataUpdate._id}`);
                if (roleRes?.data?.data?.results?.[0]) {
                    setCurrentPermissions(roleRes.data.data.results[0].permissions || []);
                }
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi thêm permissions',
                description: error?.response?.data?.message || 'Không thể thêm permissions'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Remove permission from role
    const handleRemovePermission = async (permissionId: string) => {
        if (!dataUpdate?._id) return;

        setIsLoading(true);
        try {
            const res = await removePermissionsFromRoleAPI(dataUpdate._id, [permissionId]);
            if (res?.data) {
                message.success('Xóa permission thành công');
                setCurrentPermissions(prev => prev.filter(p => p._id !== permissionId));
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi xóa permission',
                description: error?.response?.data?.message || 'Không thể xóa permission'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Role badge color
    const getRoleColor = (priority: number) => {
        if (priority >= 100) return 'red';      // SUPER_ADMIN
        if (priority >= 80) return 'volcano';   // ADMIN
        if (priority >= 60) return 'blue';      // TEACHER
        if (priority >= 40) return 'green';    // USER
        return 'default';                        // GUEST
    };

    // Module badge color
    const getModuleColor = (module: string) => {
        const colors: Record<string, string> = {
            'users': 'blue',
            'roles': 'green',
            'permissions': 'cyan',
            'books': 'orange',
            'courses': 'purple',
            'orders': 'magenta',
            'students': 'geekblue',
            'system': 'red'
        };
        return colors[module] || 'default';
    };

    const columns: ProColumns<IRoleTable>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Role Name',
            dataIndex: 'name',
            copyable: true,
            render(_dom, entity) {
                return (
                    <Space>
                        <Tag color={getRoleColor(entity.priority)}>
                            {entity.name}
                        </Tag>
                        {entity.isSystem && (
                            <LockOutlined style={{ color: '#999' }} />
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            hideInSearch: true,
            width: 100,
            sorter: true,
            render(_dom, entity) {
                return <Tag>{entity.priority}</Tag>;
            }
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            hideInSearch: true,
            width: 300,
            render(_dom, entity) {
                const perms = entity.permissions || [];
                if (!perms.length) return <Text type="secondary">No permissions</Text>;

                // Show first 5 permissions
                const shown = perms.slice(0, 5);
                const remaining = perms.length - 5;

                return (
                    <Space size={4} wrap>
                        {shown.map((p, index) => (
                            <Tag key={index} color={getModuleColor(p.module)}>
                                {p.code}
                            </Tag>
                        ))}
                        {remaining > 0 && (
                            <Tag>+{remaining} more</Tag>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            hideInSearch: true,
            width: 100,
            render(_dom, entity) {
                return entity.isActive
                    ? <Badge status="success" text="Active" />
                    : <Badge status="default" text="Inactive" />;
            },
        },
        {
            title: 'Action',
            hideInSearch: true,
            width: 180,
            render(_dom, entity) {
                return (
                    <>
                        {/* Manage Permissions button */}
                        <SafetyOutlined
                            twoToneColor="#1890ff"
                            style={{ cursor: "pointer", marginRight: 15, fontSize: 16 }}
                            onClick={() => handleOpenPermissionModal(entity)}
                            title="Quản lý Permissions"
                        />

                        {/* Edit button */}
                        <EditTwoTone
                            twoToneColor="#f57800"
                            style={{ cursor: "pointer", marginRight: 15 }}
                            onClick={() => {
                                setDataUpdate(entity);
                                setOpenModalUpdate(true);
                            }}
                        />

                        {/* Delete button */}
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa role"}
                            description={"Role và quyền của user sẽ bị ảnh hưởng"}
                            onConfirm={() => handleDeleteRole(entity._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleting }}
                        >
                            <DeleteTwoTone
                                twoToneColor="#ff4d4f"
                                style={{ cursor: "pointer" }}
                            />
                        </Popconfirm>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <ProTable<IRoleTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort) => {
                    let query = "";
                    if (params) {
                        query += `current=${params.current || 1}&pageSize=${params.pageSize || 10}`;

                        if (params.name) {
                            query += `&name=/${params.name}/i`;
                        }
                        if (params.description) {
                            query += `&description=/${params.description}/i`;
                        }
                    }

                    // Sorting
                    if (sort?.priority) {
                        query += `&sort=${sort.priority === "ascend" ? "priority" : "-priority"}`;
                    }

                    try {
                        const res = await getRolesAPI(query);
                        if (res?.data) {
                            // Backend returns paginated response: { meta, results } or direct array
                            const data = res.data.data || res.data;
                            const results = Array.isArray(data) ? data : (data.results || []);
                            const metaData = Array.isArray(data)
                                ? { current: 1, pageSize: results.length, total: results.length }
                                : (data.meta || { current: 1, pageSize: 10, total: 0 });

                            setMeta(metaData);
                            return {
                                data: results,
                                page: metaData.current,
                                success: true,
                                total: metaData.total
                            };
                        }
                        
                    } catch (error) {
                      
                    }
                }}
                rowKey="_id"
                pagination={{
                    current: meta?.current || 1,
                    pageSize: meta?.pageSize || 10,
                    showSizeChanger: true,
                    total: meta?.total || 0,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} roles`
                }}
                headerTitle="Quản lý Roles"
                toolBarRender={() => [
                    <Button
                        key="create"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            form.resetFields();
                            setOpenModalCreate(true);
                        }}
                        type="primary"
                    >
                        Tạo Role mới
                    </Button>
                ]}
            />

            {/* Create Role Modal */}
            <Modal
                title="Tạo Role mới"
                open={openModalCreate}
                onOk={() => form.submit()}
                onCancel={() => setOpenModalCreate(false)}
                confirmLoading={isLoading}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateRole}
                >
                    <Form.Item
                        name="name"
                        label="Tên Role"
                        rules={[{ required: true, message: 'Vui lòng nhập tên role' }]}
                    >
                        <Input placeholder="VD: MODERATOR" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea placeholder="Mô tả role..." rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority (1-100)"
                        rules={[{ required: true, message: 'Vui lòng nhập priority' }]}
                        initialValue={50}
                    >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="permissions"
                        label="Permissions"
                    >
                        <TreeSelect
                            treeData={allPermissions.map(p => ({
                                title: `${p.code} (${p.action})`,
                                value: p._id,
                            }))}
                            placeholder="Chọn permissions..."
                            treeDefaultExpandAll
                            allowClear
                            treeCheckable
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Update Role Modal */}
            <Modal
                title="Cập nhật Role"
                open={openModalUpdate}
                onOk={() => form.submit()}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                }}
                confirmLoading={isLoading}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateRole}
                    initialValues={{
                        name: dataUpdate?.name,
                        description: dataUpdate?.description,
                        priority: dataUpdate?.priority,
                        isActive: dataUpdate?.isActive
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Tên Role"
                        rules={[{ required: true, message: 'Vui lòng nhập tên role' }]}
                    >
                        <Input placeholder="VD: MODERATOR" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea placeholder="Mô tả role..." rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority (1-100)"
                        rules={[{ required: true, message: 'Vui lòng nhập priority' }]}
                    >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Permission Management Modal */}
            <Modal
                title={
                    <Space>
                        <SafetyOutlined />
                        <span>Quản lý Permissions cho Role</span>
                        {dataUpdate && (
                            <Tag color={getRoleColor(dataUpdate.priority)}>
                                {dataUpdate.name}
                            </Tag>
                        )}
                    </Space>
                }
                open={openPermissionModal}
                onCancel={() => {
                    setOpenPermissionModal(false);
                    setDataUpdate(null);
                    setCurrentPermissions([]);
                }}
                footer={null}
                width={800}
            >
                {dataUpdate && (
                    <div>
                        <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Tên Role">
                                <Tag color={getRoleColor(dataUpdate.priority)}>
                                    {dataUpdate.name}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Priority">
                                {dataUpdate.priority}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {dataUpdate.description || '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        {/* Current Permissions */}
                        <Title level={5}>Permissions hiện tại ({currentPermissions.length})</Title>
                        {currentPermissions.length > 0 ? (
                            <div style={{ marginBottom: 24 }}>
                                {currentPermissions.map((perm, index) => (
                                    <Tag
                                        key={index}
                                        closable={canManageRolePermissions(dataUpdate) && !dataUpdate.isSystem}
                                        onClose={() => handleRemovePermission(perm._id)}
                                        color={getModuleColor(perm.module)}
                                        style={{ marginBottom: 8, marginRight: 8 }}
                                    >
                                        <Space size={4}>
                                            <span>{perm.code}</span>
                                            <span style={{ color: '#999', fontSize: 11 }}>
                                                ({perm.description})
                                            </span>
                                        </Space>
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            <Text type="secondary">Role này chưa có permission nào</Text>
                        )}

                        <Divider />

                        {/* Add Permissions - RBAC check */}
                        {canManageRolePermissions(dataUpdate) && !dataUpdate.isSystem && (
                            <>
                                <Title level={5}>Thêm Permissions</Title>
                                <Row gutter={[16, 16]}>
                                    {/* Group by module */}
                                    {['users', 'roles', 'permissions', 'books', 'courses', 'orders'].map(module => {
                                        const modulePerms = allPermissions.filter(p => p.module === module);
                                        const availablePerms = modulePerms.filter(
                                            mp => !currentPermissions.find(cp => cp._id === mp._id)
                                        );

                                        if (!availablePerms.length) return null;

                                        return (
                                            <Col span={8} key={module}>
                                                <Card
                                                    size="small"
                                                    title={
                                                        <Space>
                                                            <Tag color={getModuleColor(module)}>
                                                                {module.toUpperCase()}
                                                            </Tag>
                                                            <Badge
                                                                count={availablePerms.length}
                                                                style={{ backgroundColor: '#52c41a' }}
                                                            />
                                                        </Space>
                                                    }
                                                >
                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                        {availablePerms.map((perm, index) => (
                                                            <Button
                                                                key={index}
                                                                size="small"
                                                                type="text"
                                                                block
                                                                onClick={() => handleAddPermissions([perm._id])}
                                                                style={{
                                                                    textAlign: 'left',
                                                                    height: 'auto',
                                                                    padding: '4px 8px'
                                                                }}
                                                            >
                                                                <Space>
                                                                    <Tag color={getModuleColor(module)} style={{ marginRight: 4 }}>
                                                                        {perm.action}
                                                                    </Tag>
                                                                </Space>
                                                            </Button>
                                                        ))}
                                                    </Space>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>

                                <Divider />

                                {/* Quick Add All */}
                                <Button
                                    onClick={() => {
                                        const availableIds = allPermissions
                                            .filter(mp => !currentPermissions.find(cp => cp._id === mp._id))
                                            .map(p => p._id);
                                        if (availableIds.length) {
                                            handleAddPermissions(availableIds);
                                        }
                                    }}
                                >
                                    Thêm tất cả Permissions còn lại
                                </Button>
                            </>
                        )}

                        {/* RBAC: Show warning if user can't manage this role */}
                        {dataUpdate.priority >= 100 && !isSuperAdmin() && (
                            <Alert
                                message="Không có quyền"
                                description="Bạn không thể chỉnh sửa permissions của SUPER_ADMIN"
                                type="warning"
                                showIcon
                                icon={<LockOutlined />}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {dataUpdate.isSystem && (
                            <Text type="warning">
                                <LockOutlined /> Role hệ thống không thể sửa permissions
                            </Text>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default TableRole;
