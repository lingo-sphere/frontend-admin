import { Card, Form, Select, Space, Typography, Divider, List, theme as antdTheme } from 'antd';
import { GlobalOutlined, BgColorsOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useI18n } from '@/context/i18n.context';

const { Title, Text } = Typography;

const SettingsPage = () => {
    const { t, language, setLanguage, theme, setTheme, isDarkMode } = useI18n();

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: 24, color: isDarkMode ? '#e8e8e8' : '#000' }}>
                <Space>
                    <GlobalOutlined />
                    {t.settings.title}
                </Space>
            </Title>

            {/* Appearance Section */}
            <Card
                title={
                    <Space>
                        <BgColorsOutlined />
                        {t.settings.appearance}
                    </Space>
                }
                style={{
                    background: isDarkMode ? '#1f1f1f' : '#fff',
                    borderColor: isDarkMode ? '#303030' : '#d9d9d9',
                    marginBottom: 24
                }}
            >
                <Form layout="vertical">
                    <Form.Item label={t.settings.theme}>
                        <Select
                            value={theme}
                            onChange={setTheme}
                            style={{ width: 280 }}
                            options={[
                                {
                                    value: 'light',
                                    label: (
                                        <Space>
                                            <span style={{ fontSize: 16 }}>☀️</span>
                                            <span>{t.settings.lightMode}</span>
                                            {theme === 'light' && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 'auto' }} />}
                                        </Space>
                                    ),
                                },
                                {
                                    value: 'dark',
                                    label: (
                                        <Space>
                                            <span style={{ fontSize: 16 }}>🌙</span>
                                            <span>{t.settings.darkMode}</span>
                                            {theme === 'dark' && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 'auto' }} />}
                                        </Space>
                                    ),
                                },
                                {
                                    value: 'system',
                                    label: (
                                        <Space>
                                            <span style={{ fontSize: 16 }}>💻</span>
                                            <span>{t.settings.systemDefault}</span>
                                            {theme === 'system' && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 'auto' }} />}
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Form.Item>

                    <Divider style={{ borderColor: isDarkMode ? '#303030' : '#d9d9d9' }} />

                    <Form.Item label={t.settings.language}>
                        <Select
                            value={language}
                            onChange={setLanguage}
                            style={{ width: 280 }}
                            options={[
                                {
                                    value: 'vi',
                                    label: (
                                        <Space>
                                            <span style={{ fontSize: 16 }}>🇻🇳</span>
                                            <span>Tiếng Việt</span>
                                            {language === 'vi' && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 'auto' }} />}
                                        </Space>
                                    ),
                                },
                                {
                                    value: 'en',
                                    label: (
                                        <Space>
                                            <span style={{ fontSize: 16 }}>🇺🇸</span>
                                            <span>English</span>
                                            {language === 'en' && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 'auto' }} />}
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Card>

            {/* Current Settings Info */}
            <Card
                title="Current Settings"
                style={{
                    background: isDarkMode ? '#1f1f1f' : '#fff',
                    borderColor: isDarkMode ? '#303030' : '#d9d9d9'
                }}
            >
                <List size="small" bordered={false}>
                    <List.Item style={{ borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'} !important` }}>
                        <Text style={{ color: isDarkMode ? '#a6a6a6' : 'rgba(0,0,0,0.65)' }}>Theme</Text>
                        <Text style={{ color: isDarkMode ? '#e8e8e8' : '#000' }}>
                            {theme === 'light' && '☀️ Light Mode'}
                            {theme === 'dark' && '🌙 Dark Mode'}
                            {theme === 'system' && '💻 System Default'}
                        </Text>
                    </List.Item>
                    <List.Item style={{ borderBottom: 'none' }}>
                        <Text style={{ color: isDarkMode ? '#a6a6a6' : 'rgba(0,0,0,0.65)' }}>Language</Text>
                        <Text style={{ color: isDarkMode ? '#e8e8e8' : '#000' }}>
                            {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                        </Text>
                    </List.Item>
                </List>

                <Divider style={{ borderColor: isDarkMode ? '#303030' : '#d9d9d9' }} />

                <Text type="secondary" style={{ fontSize: 12 }}>
                    Settings are saved automatically and persisted across sessions.
                </Text>
            </Card>
        </div>
    );
};

export default SettingsPage;
