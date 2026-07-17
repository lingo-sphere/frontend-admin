import { Card, Typography, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage = () => {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: 24, color: '#000' }}>
                <Space>
                    <SettingOutlined />
                    Settings
                </Space>
            </Title>

            <Card
                title="Settings"
                style={{
                    background: '#fff',
                    borderColor: '#d9d9d9',
                }}
            >
                <Text type="secondary">
                    Application settings are configured on the server side.
                </Text>
            </Card>
        </div>
    );
};

export default SettingsPage;
