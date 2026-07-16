import { Modal, Select, Space } from "antd";

interface IProps {
    title: string;
    openRoleModal: boolean;
    setOpenRoleModal: (open: boolean) => void;
    selectedUser: IUserTable | null;
    selectedRole: string | null;
    setSelectedRole: (role: string | null) => void;
    allRoles: IRoleTable[];
    loadingRoles: boolean;
    assigningRoles: boolean;
    handleAssignRole: () => void;
    isSuperAdmin: () => boolean;
    onText: string;
}

const PermissionUser = (props: IProps) => {
    const {
        title,
        openRoleModal,
        setOpenRoleModal,
        selectedUser,
        selectedRole,
        setSelectedRole,
        allRoles,
        loadingRoles,
        assigningRoles,
        handleAssignRole,
        isSuperAdmin,
        onText,
    } = props;
    return (
        <Modal
            title={title}
            open={openRoleModal}
            onOk={handleAssignRole}
            onCancel={() => setOpenRoleModal(false)}
            confirmLoading={assigningRoles}
            okText={onText}
            cancelText="Hủy"
            width={500}
        >
            <div style={{ marginBottom: 16 }}>
                <p>
                    <strong>User:</strong> {selectedUser?.name}
                </p>
                <p>
                    <strong>Email:</strong> {selectedUser?.email}
                </p>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: 8,
                        fontWeight: 500,
                    }}
                >
                    Chọn Role:
                </label>
                <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn role..."
                    value={selectedRole}
                    onChange={setSelectedRole}
                    loading={loadingRoles}
                    allowClear
                >
                    {allRoles.map((role) => (
                        <Select.Option key={role._id} value={role._id}>
                            <Space>
                                {role.description && (
                                    <span style={{ color: "#999" }}>
                                        {role.description}
                                    </span>
                                )}
                            </Space>
                        </Select.Option>
                    ))}
                </Select>
                <p style={{ marginTop: 8, color: "#999", fontSize: 12 }}>
                    {isSuperAdmin()
                        ? "Super Admin có tất cả các quyền"
                        : "Quyền được cấp dựa trên các Role được chọn"}
                </p>
            </div>
        </Modal>
    );
};

export default PermissionUser;
