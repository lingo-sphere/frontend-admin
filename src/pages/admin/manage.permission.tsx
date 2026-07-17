import { Typography } from 'antd';
import TablePermission from "@/components/admin/permission/table.permission";

const { Title } = Typography;

const ManagePermissionPage = () => {
    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: '#000' }}>
                Permission Management
            </Title>
            <TablePermission />
        </div>
    )
}

export default ManagePermissionPage;
