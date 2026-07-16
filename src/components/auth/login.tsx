/**
 * Login Component
 *
 * Shared login form component with dark mode support
 */

import { Button, Divider, Form, Input, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useI18n } from '@/context/i18n.context';

const { Title, Text } = Typography;

interface IProps {
    form: any;
    onFinish: (values: { username: string; password: string }) => void;
}

const Login = (props: IProps) => {
    const { form, onFinish } = props;
    const { isDarkMode, t } = useI18n();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: isDarkMode ? '#141414' : '#f0f2f5'
        }}>
            <div style={{
                width: 400,
                padding: 24,
                background: isDarkMode ? '#1f1f1f' : '#fff',
                borderRadius: 8,
                boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                border: isDarkMode ? '1px solid #303030' : 'none'
            }}>
                <Title level={3} style={{
                    textAlign: 'center',
                    marginBottom: 8,
                    color: isDarkMode ? '#e8e8e8' : '#000'
                }}>
                    LingoSphere Admin
                </Title>
                <Text style={{
                    textAlign: 'center',
                    display: 'block',
                    marginBottom: 24,
                    color: isDarkMode ? '#a6a6a6' : '#666'
                }}>
                    {t.auth.login} {isDarkMode ? '' : 'để quản lý hệ thống'}
                </Text>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: isDarkMode ? '#666' : '#999' }} />}
                            placeholder="Email"
                            size="large"
                            style={{
                                backgroundColor: isDarkMode ? '#262626' : '#fff',
                                borderColor: isDarkMode ? '#434343' : '#d9d9d9',
                                color: isDarkMode ? '#e8e8e8' : '#000'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: isDarkMode ? '#666' : '#999' }} />}
                            placeholder="Mật khẩu"
                            size="large"
                            style={{
                                backgroundColor: isDarkMode ? '#262626' : '#fff',
                                borderColor: isDarkMode ? '#434343' : '#d9d9d9',
                                color: isDarkMode ? '#e8e8e8' : '#000'
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{ width: '100%' }}
                        >
                            {t.auth.login}
                        </Button>
                    </Form.Item>
                </Form>

                <Divider plain style={{ color: isDarkMode ? '#666' : '#999' }}>hoặc</Divider>

                <div style={{ textAlign: 'center' }}>
                    <GoogleLogin
                        onSuccess={() => {
                            // TODO: Implement Google login
                        }}
                        onError={() => {
                            console.error('Google login failed');
                        }}
                    />
                </div>

                <div style={{
                    marginTop: 24,
                    textAlign: 'center',
                    fontSize: 14,
                    color: isDarkMode ? '#a6a6a6' : '#666'
                }}>
                    <a href="/forgot-password" style={{ color: isDarkMode ? '#1890ff' : undefined }}>Quên mật khẩu?</a>
                    <span style={{ margin: '0 8px', color: isDarkMode ? '#434343' : '#d9d9d9' }}>|</span>
                    <a href="/register" style={{ color: isDarkMode ? '#1890ff' : undefined }}>Đăng ký</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
