/**
 * Permission Management Page
 *
 * Page for managing permissions.
 * Requires PERMISSIONS_READ permission.
 */

import { Typography } from 'antd';
import TablePermission from "@/components/admin/permission/table.permission";
import { useI18n } from '@/context/i18n.context';

const { Title } = Typography;

const ManagePermissionPage = () => {
    const { t, isDarkMode } = useI18n();

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                {t.permissions.title}
            </Title>
            <TablePermission />
        </div>
    )
}

export default ManagePermissionPage;
