import { usePermission } from '@/hooks/usePermission';
import {
    createPermissionAPI,
    deletePermissionAPI,
    getPermissionsAPI,
    updatePermissionAPI
} from '@/services';
import {
    DeleteTwoTone,
    EditTwoTone,
    PlusOutlined
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
    App,
    Button,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Tag
} from 'antd';
import { useRef, useState } from 'react';

type TSearch = {
    code: string;
    module: string;
    description: string;
}

// Available modules
const MODULES = [
    { value: 'users', label: 'Users' },
    { value: 'roles', label: 'Roles' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'books', label: 'Books' },
    { value: 'courses', label: 'Courses' },
    { value: 'orders', label: 'Orders' },
    { value: 'students', label: 'Students' },
    { value: 'system', label: 'System' },
    { value: 'dashboard', label: 'Dashboard' },
];

// Available actions
const ACTIONS = [
    { value: 'read', label: 'Read (Xem)' },
    { value: 'create', label: 'Create (Tạo)' },
    { value: 'update', label: 'Update (Sửa)' },
    { value: 'delete', label: 'Delete (Xóa)' },
    { value: 'manage', label: 'Manage (Quản lý)' },
    { value: 'export', label: 'Export (Xuất)' },
    { value: 'import', label: 'Import (Nhập)' },
    { value: 'assign-roles', label: 'Assign Roles (Phân quyền)' },
    { value: 'manage-permissions', label: 'Manage Permissions (Quản lý quyền)' },
];

const TablePermission = () => {
    const actionRef = useRef<ActionType>();
    const [form] = Form.useForm();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    });

    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);

    const [dataUpdate, setDataUpdate] = useState<IPermissionTable | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    // RBAC: Permission hook
    const { can, isSuperAdmin } = usePermission();

    // Create permission
    const handleCreatePermission = async (values: any) => {
        setIsLoading(true);
        try {
            // Generate code from module and action if not provided
            const code = values.code || `${values.module}.${values.action}`;

            const res = await createPermissionAPI({
                ...values,
                code
            });
            if (res?.data) {
                message.success('Tạo permission thành công');
                setOpenModalCreate(false);
                form.resetFields();
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi tạo permission',
                description: error?.response?.data?.message || 'Không thể tạo permission'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Update permission
    const handleUpdatePermission = async (values: any) => {
        if (!dataUpdate?._id) return;

        setIsLoading(true);
        try {
            const res = await updatePermissionAPI(dataUpdate._id, values);
            if (res?.data) {
                message.success('Cập nhật permission thành công');
                setOpenModalUpdate(false);
                setDataUpdate(null);
                form.resetFields();
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi cập nhật permission',
                description: error?.response?.data?.message || 'Không thể cập nhật permission'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete permission
    const handleDeletePermission = async (_id: string) => {
        setIsDeleting(true);
        try {
            const res = await deletePermissionAPI(_id);
            if (res?.data) {
                message.success('Xóa permission thành công');
                actionRef.current?.reload();
            }
        } catch (error: any) {
            notification.error({
                message: 'Lỗi xóa permission',
                description: error?.response?.data?.message || 'Không thể xóa permission'
            });
        } finally {
            setIsDeleting(false);
        }
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
            'system': 'red',
            'dashboard': 'gold'
        };
        return colors[module] || 'default';
    };

    // Action badge color
    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            'read': 'green',
            'create': 'blue',
            'update': 'orange',
            'delete': 'red',
            'manage': 'purple',
            'export': 'cyan',
            'import': 'geekblue',
            'assign-roles': 'magenta',
            'manage-permissions': 'volcano'
        };
        return colors[action] || 'default';
    };

    const columns: ProColumns<IPermissionTable>[] = [
        {
            title: 'STT',
            dataIndex: 'index',
            valueType: 'index',
            width: 60,
            render: (text, record, index) => {
                // Calculate correct index based on current page
                const currentPage = meta?.current || 1;
                const pageSize = meta?.pageSize || 10;
                return (currentPage - 1) * pageSize + index + 1;
            }
        },
        {
            title: 'Permission Code',
            dataIndex: 'code',
            copyable: true,
            render(_dom, entity) {
                return (
                    <Space>
                        <Tag color={getActionColor(entity.action)}>
                            {entity.code}
                        </Tag>
                    </Space>
                );
            }
        },
        {
            title: 'Module',
            dataIndex: 'module',
            hideInSearch: true,
            width: 120,
            render(_dom, entity) {
                return (
                    <Tag color={getModuleColor(entity.module)}>
                        {(entity.module || 'N/A').toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Module',
            dataIndex: 'module',
            valueType: 'select',
            hideInTable: true,
            fieldProps: {
                options: MODULES
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            hideInSearch: true,
            width: 100,
            render(_dom, entity) {
                return (
                    <Tag color={getActionColor(entity.action)}>
                        {(entity.action || 'N/A').toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            hideInSearch: true,
            width: 100,
            render(_dom, entity) {
                return entity.isActive
                    ? <Tag color="success">Active</Tag>
                    : <Tag color="default">Inactive</Tag>;
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
            width: 120,
        },
        {
            title: 'Action',
            hideInSearch: true,
            width: 120,
            render(_dom, entity) {
                return (
                    <>
                        {/* Edit button */}
                        {can('permissions', 'update') && (
                            <EditTwoTone
                                twoToneColor="#f57800"
                                style={{ cursor: "pointer", marginRight: 15 }}
                                onClick={() => {
                                    setDataUpdate(entity);
                                    setOpenModalUpdate(true);
                                }}
                            />
                        )}

                        {/* Delete button */}
                        {can('permissions', 'delete') && (
                            <Popconfirm
                                placement="leftTop"
                                title={"Xác nhận xóa permission"}
                                description={"Permission sẽ bị xóa khỏi tất cả các role"}
                                onConfirm={() => handleDeletePermission(entity._id)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                okButtonProps={{ loading: isDeleting }}
                            >
                                <DeleteTwoTone
                                    twoToneColor="#ff4d4f"
                                    style={{ cursor: "pointer" }}
                                />
                            </Popconfirm>
                        )}
                    </>
                );
            }
        }
    ];

    return (
        <>
            <ProTable<IPermissionTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort) => {
                    let query = "";
                    if (params) {
                        query += `current=${params.current || 1}&pageSize=${params.pageSize || 10}`;

                        if (params.code) {
                            query += `&code=/${params.code}/i`;
                        }
                        if (params.module) {
                            query += `&module=${params.module}`;
                        }
                        if (params.description) {
                            query += `&description=/${params.description}/i`;
                        }
                    }

                    // Sorting
                    if (sort?.createdAt) {
                        query += `&sort=${sort.createdAt === "ascend" ? "createdAt" : "-createdAt"}`;
                    }

                    try {
                        const res = await getPermissionsAPI(query);

                        if (res?.data) {
                            // Backend returns paginated response: { meta, results }
                            const data = res.data.data || res.data;
                            const results = data.results || [];
                            const metaData = data.meta || { current: 1, pageSize: 10, total: results.length };

                            // Update meta state for correct pagination display
                            setMeta(metaData);

                            return {
                                data: results,
                                success: true,
                                total: metaData.total
                            };
                        }
                        // Return empty if no data
                        return {
                            data: [],
                            success: true,
                            total: 0
                        };
                    } catch (error: any) {
                        console.error('[Permission] Error fetching permissions:', error);
                        return {
                            data: [],
                            success: false,
                            total: 0
                        };
                    }
                }}
                rowKey="_id"
                pagination={{
                    current: meta?.current || 1,
                    pageSize: meta?.pageSize || 10,
                    showSizeChanger: true,
                    total: meta?.total || 0,
                    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} trên ${total} permissions`
                }}
                headerTitle="Quản lý Permissions"
                toolBarRender={() => [
                    // Create button - requires permissions.create permission
                    can('permissions', 'create') && (
                        <Button
                            key="create"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                form.resetFields();
                                setOpenModalCreate(true);
                            }}
                            type="primary"
                        >
                            Tạo Permission mới
                        </Button>
                    )
                ].filter(Boolean)}
            />

            {/* Create Permission Modal */}
            <Modal
                title="Tạo Permission mới"
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
                    onFinish={handleCreatePermission}
                >
                    <Form.Item
                        name="module"
                        label="Module"
                        rules={[{ required: true, message: 'Vui lòng chọn module' }]}
                    >
                        <Select
                            placeholder="Chọn module..."
                            options={MODULES}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="action"
                        label="Action"
                        rules={[{ required: true, message: 'Vui lòng chọn action' }]}
                    >
                        <Select
                            placeholder="Chọn action..."
                            options={ACTIONS}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Permission Code"
                        tooltip="Tự động tạo từ module.action nếu để trống"
                    >
                        <Input placeholder="VD: users.read (tự động tạo nếu để trống)" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea placeholder="Mô tả permission..." rows={3} />
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

            {/* Update Permission Modal */}
            <Modal
                title="Cập nhật Permission"
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
                    onFinish={handleUpdatePermission}
                    initialValues={{
                        module: dataUpdate?.module,
                        action: dataUpdate?.action,
                        code: dataUpdate?.code,
                        description: dataUpdate?.description,
                        isActive: dataUpdate?.isActive
                    }}
                >
                    <Form.Item
                        name="module"
                        label="Module"
                        rules={[{ required: true, message: 'Vui lòng chọn module' }]}
                    >
                        <Select
                            placeholder="Chọn module..."
                            options={MODULES}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="action"
                        label="Action"
                        rules={[{ required: true, message: 'Vui lòng chọn action' }]}
                    >
                        <Select
                            placeholder="Chọn action..."
                            options={ACTIONS}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Permission Code"
                        rules={[{ required: true, message: 'Vui lòng nhập code' }]}
                    >
                        <Input placeholder="VD: users.read" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea placeholder="Mô tả permission..." rows={3} />
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
        </>
    );
};

export default TablePermission;
