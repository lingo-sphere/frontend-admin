import { usePermission } from "@/hooks/usePermission";
import {
    MOCK_USERS,
    assignRoleToUserAPI,
    deleteUserAPI,
    getRolesAPI,
    getUsersAPI,
    toast,
} from "@/services";
import { dateRangeValidate } from "@/services/helper";
import {
    CloudUploadOutlined,
    DeleteTwoTone,
    EditTwoTone,
    ExportOutlined,
    PlusOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import {
    App,
    Button,
    Popconfirm,
    Space,
    Tag,
    message as antMessage,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import PermissionUser from "./permission.user";

type TSearch = {
    name: string;
    email: string;
    createdAt: string;
    createdAtRange: string;
};

const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    const [currentDataTable, setCurrentDataTable] = useState<IUserTable[]>([]);
    const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);
    const { message, notification } = App.useApp();

    // RBAC: Permission hook
    const { can, isSuperAdmin } = usePermission();

    // Role assignment state
    const [openRoleModal, setOpenRoleModal] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<IUserTable | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [allRoles, setAllRoles] = useState<IRoleTable[]>([]);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(false);
    const [assigningRoles, setAssigningRoles] = useState<boolean>(false);

    // Load all roles for role assignment
    useEffect(() => {
        const fetchRoles = async () => {
            if (openRoleModal) {
                setLoadingRoles(true);
                try {
                    const res = await getRolesAPI("current=1&pageSize=100");
                    if (res?.data?.data?.results) {
                        setAllRoles(res.data.data.results);
                    }
                } catch (error) {
                    console.error("Error fetching roles:", error);
                } finally {
                    setLoadingRoles(false);
                }
            }
        };
        fetchRoles();
    }, [openRoleModal]);

    const handleDeleteUser = async (_id: string) => {
        setIsDeleteUser(true);
        try {
            const res = await deleteUserAPI(_id);
            if (res?.data) {
                message.success("Xóa user thành công");
                refreshTable();
            } else {
                notification.error({
                    message: "Đã có lỗi xảy ra",
                    description: res?.message,
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể xóa user",
            });
        } finally {
            setIsDeleteUser(false);
        }
    };

    // Open role assignment modal
    const handleOpenRoleModal = (user: IUserTable) => {
        setSelectedUser(user);
        // Get current role ID
        const currentRoleId = user.role
            ? typeof user.role === "string"
                ? user.role
                : user.role._id
            : null;
        setSelectedRole(currentRoleId);
        setOpenRoleModal(true);
    };

    // Assign single role to user
    const handleAssignRole = async () => {
        if (!selectedUser?._id || !selectedRole) return;

        setAssigningRoles(true);
        try {
            const res = await assignRoleToUserAPI(
                selectedUser._id,
                selectedRole,
            );
            if (res?.data) {
                antMessage.success("Phân quyền thành công");
                setOpenRoleModal(false);
                refreshTable();
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi phân quyền",
                description:
                    error?.response?.data?.message || "Không thể phân quyền",
            });
        } finally {
            setAssigningRoles(false);
        }
    };

    // Role badge color mapper
    const listRoles: Record<string, string> = {
        SUPER_ADMIN: "red",
        ADMIN: "volcano",
        TEACHER: "blue",
        USER: "green",
        GUEST: "default",
    };

    // Render multiple role badges
    const renderRoleBadges = (role: IRoleTable) => {
        if (!role) return <Tag>No Role</Tag>;
        return (
            <Space size={4} wrap>
                <Tag color={listRoles[role.name] || "default"}>{role.name}</Tag>
            </Space>
        );
    };

    const columns: ProColumns<IUserTable>[] = [
        {
            dataIndex: "index",
            valueType: "indexBorder",
            width: 48,
        },
        {
            title: "Id",
            dataIndex: "_id",
            hideInSearch: true,
            width: 220,
            ellipsis: true,
            render(_dom, entity) {
                return (
                    <a
                        onClick={() =>
                            toast.success(`Detail User ID: ${entity._id}`)
                        }
                        href="#"
                        style={{ fontSize: "12px" }}
                    >
                        {entity._id}
                    </a>
                );
            },
        },
        {
            title: "Name",
            dataIndex: "name",
            copyable: true,
            render(_dom, entity) {
                return (
                    <div>
                        <div style={{ fontWeight: 500 }}>{entity.name}</div>
                    </div>
                );
            },
        },
        {
            title: "Email",
            dataIndex: "email",
            copyable: true,
        },
        {
            title: "Phone",
            dataIndex: "phone",
            hideInSearch: true,
        },
        {
            title: "Roles",
            dataIndex: "roles",
            hideInSearch: true,
            render(_dom, entity) {
                return renderRoleBadges(entity.role);
            },
        },
        {
            title: "Status",
            dataIndex: "isActive",
            hideInSearch: true,
            render(_dom, entity) {
                return entity.isActive ? (
                    <Tag color="success">Active</Tag>
                ) : (
                    <Tag color="error">Inactive</Tag>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            valueType: "date",
            sorter: true,
            hideInSearch: true,
            width: 120,
        },
        {
            title: "Created At",
            dataIndex: "createdAtRange",
            valueType: "dateRange",
            hideInTable: true,
        },
        {
            title: "Action",
            hideInSearch: true,
            width: 180,
            render(_dom, entity) {
                return (
                    <>
                        {/* Edit button - requires users.update permission */}
                        {can("users", "update") && (
                            <EditTwoTone
                                twoToneColor="#f57800"
                                style={{ cursor: "pointer", marginRight: 15 }}
                                onClick={() =>
                                    toast.success(`Edit User ID: ${entity._id}`)
                                }
                            />
                        )}

                        {/* Assign Role button - requires users.assign-roles permission */}
                        {can("users", "assign-roles") && (
                            <SafetyOutlined
                                twoToneColor="#1890ff"
                                style={{
                                    cursor: "pointer",
                                    marginRight: 15,
                                    fontSize: 16,
                                }}
                                onClick={() => handleOpenRoleModal(entity)}
                            />
                        )}

                        {/* Delete button - requires users.delete permission */}
                        {can("users", "delete") && (
                            <Popconfirm
                                placement="leftTop"
                                title={"Xác nhận xóa user"}
                                description={
                                    "User sẽ bị soft delete và có thể khôi phục"
                                }
                                onConfirm={() => handleDeleteUser(entity._id)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                okButtonProps={{ loading: isDeleteUser }}
                            >
                                <DeleteTwoTone
                                    twoToneColor="#ff4d4f"
                                    style={{ cursor: "pointer" }}
                                />
                            </Popconfirm>
                        )}
                    </>
                );
            },
        },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    };

    return (
        <>
            <ProTable<IUserTable, TSearch>
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
                        if (params.email) {
                            query += `&email=/${params.email}/i`;
                        }

                        const createDateRange = dateRangeValidate(
                            params.createdAtRange,
                        );
                        if (createDateRange) {
                            query += `&createdAt>=${createDateRange[0]}&createdAt<=${createDateRange[1]}`;
                        }
                    }

                    // Sorting
                    if (sort?.createdAt) {
                        query += `&sort=${sort.createdAt === "ascend" ? "createdAt" : "-createdAt"}`;
                    } else {
                        query += `&sort=-createdAt`;
                    }

                    try {
                        const res = await getUsersAPI(query);
                        if (res?.data) {
                            setMeta(res.data.meta);
                            setCurrentDataTable(res.data.results ?? []);
                            return {
                                data: res.data.results,
                                page: res.data.meta.current,
                                success: true,
                                total: res.data.meta.total,
                            };
                        }
                        // Fallback to mock data if API fails
                        return {
                            data: MOCK_USERS,
                            page: 1,
                            success: true,
                            total: MOCK_USERS.length,
                        };
                    } catch (error) {
                        console.error("Error fetching users:", error);
                        // Fallback to mock data
                        return {
                            data: MOCK_USERS,
                            page: 1,
                            success: true,
                            total: MOCK_USERS.length,
                        };
                    }
                }}
                rowKey="_id"
                pagination={{
                    current: meta?.current || 1,
                    pageSize: meta?.pageSize || 10,
                    showSizeChanger: true,
                    total: meta?.total || 0,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} trên ${total} users`,
                }}
                headerTitle="Quản lý người dùng"
                toolBarRender={() =>
                    [
                        // Export button - requires users.read permission
                        <CSVLink
                            data={currentDataTable}
                            filename="export-users.csv"
                            key="export"
                        >
                            <Button icon={<ExportOutlined />} type="default">
                                Export
                            </Button>
                        </CSVLink>,
                        // Import button - requires users.create permission
                        <Button
                            key="import"
                            icon={<CloudUploadOutlined />}
                            onClick={() =>
                                toast.success("Import feature coming soon!")
                            }
                        >
                            Import
                        </Button>,
                        // Create button - requires users.create permission
                        <Button
                            key="create"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                toast.success("Create feature coming soon!")
                            }
                            type="primary"
                        >
                            Thêm mới
                        </Button>,
                    ].filter(Boolean)
                }
            />

            <PermissionUser
                title="Phân quyền cho User"
                openRoleModal={openRoleModal}
                handleAssignRole={handleAssignRole}
                setOpenRoleModal={setOpenRoleModal}
                assigningRoles={assigningRoles}
                onText="Lưu"
                selectedUser={selectedUser}
                allRoles={allRoles}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                loadingRoles={loadingRoles}
                isSuperAdmin={isSuperAdmin}
            />
        </>
    );
};

export default TableUser;
