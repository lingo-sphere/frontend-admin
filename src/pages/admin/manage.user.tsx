import { Typography } from 'antd';
import TableUser from "@/components/admin/user/table.user";

const { Title } = Typography;

const ManageUserPage = () => {
    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: '#000' }}>
                User Management
            </Title>
            <TableUser />
        </div>
    )
}

export default ManageUserPage;
