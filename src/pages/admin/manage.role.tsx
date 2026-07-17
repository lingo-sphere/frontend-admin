import { Typography } from 'antd';
import TableRole from "@/components/admin/role/table.role";

const { Title } = Typography;

const ManageRolePage = () => {
    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: '#000' }}>
                Role Management
            </Title>
            <TableRole />
        </div>
    )
}

export default ManageRolePage;
