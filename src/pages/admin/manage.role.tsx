/**
 * Role Management Page
 *
 * Page for managing roles and their permissions.
 * Requires ROLES_READ permission.
 */

import { Typography } from 'antd';
import TableRole from "@/components/admin/role/table.role";
import { useI18n } from '@/context/i18n.context';

const { Title } = Typography;

const ManageRolePage = () => {
    const { isDarkMode, t } = useI18n();

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                {t.roles.title}
            </Title>
            <TableRole />
        </div>
    )
}

export default ManageRolePage;
