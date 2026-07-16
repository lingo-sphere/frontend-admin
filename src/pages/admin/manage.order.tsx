import { Typography } from 'antd';
import TableOrder from "@/components/admin/order";
import { useI18n } from '@/context/i18n.context';

const { Title } = Typography;

const ManageOrderPage = () => {
    const { isDarkMode, t } = useI18n();

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                {t.menu.orders}
            </Title>
            <TableOrder />
        </div>
    )
}

export default ManageOrderPage;
