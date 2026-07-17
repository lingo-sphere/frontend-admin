/**
 * Login Component
 *
 * Shared login form component - English only, light theme
 */

import { Button, Form, Input, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface IProps {
    form: any;
    onFinish: (values: { username: string; password: string }) => void;
}

const Login = (props: IProps) => {
    const { form, onFinish } = props;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5'
        }}>
            <div style={{
                width: 400,
                padding: 24,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: 'none'
            }}>
                <Title level={3} style={{
                    textAlign: 'center',
                    marginBottom: 8,
                    color: '#000'
                }}>
                    LingoSphere Admin
                </Title>
                <Text style={{
                    textAlign: 'center',
                    display: 'block',
                    marginBottom: 24,
                    color: '#666'
                }}>
                    Login to manage the system
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
                            { required: true, message: 'Please enter email!' },
                            { type: 'email', message: 'Invalid email!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#999' }} />}
                            placeholder="Email"
                            size="large"
                            style={{
                                backgroundColor: '#fff',
                                borderColor: '#d9d9d9',
                                color: '#000'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter password!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#999' }} />}
                            placeholder="Password"
                            size="large"
                            style={{
                                backgroundColor: '#fff',
                                borderColor: '#d9d9d9',
                                color: '#000'
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
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{
                    marginTop: 24,
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#666'
                }}>
                    <a href="/forgot-password">Forgot password?</a>
                    <span style={{ margin: '0 8px', color: '#d9d9d9' }}>|</span>
                    <a href="/register">Register</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
