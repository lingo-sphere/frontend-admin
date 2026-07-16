import { Typography } from 'antd';
import TableUser from "@/components/admin/user/table.user";
import { useI18n } from '@/context/i18n.context';

const { Title } = Typography;

const ManageUserPage = () => {
    const { isDarkMode, t } = useI18n();

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                {t.users.title}
            </Title>
            <TableUser />
        </div>
    )
}

export default ManageUserPage;
