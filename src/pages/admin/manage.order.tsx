import { Typography } from 'antd';
import TableOrder from "@/components/admin/order";

const { Title } = Typography;

const ManageOrderPage = () => {
    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: '#000' }}>
                Order Management
            </Title>
            <TableOrder />
        </div>
    )
}

export default ManageOrderPage;
