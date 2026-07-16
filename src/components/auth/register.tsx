/**
 * Register Component
 *
 * Shared registration form component
 */

import { Button, Form, Input, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

interface IProps {
    onFinish: (values: {
        email: string;
        password: string;
        confirmPassword: string;
        name?: string;
    }) => void;
}

const Register = (props: IProps) => {
    const { onFinish } = props;
    const [form] = Form.useForm();

    const validatePasswordMatch = (_: any, value: string) => {
        if (value && value !== form.getFieldValue('password')) {
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
        }
        return Promise.resolve();
    };

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
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
                    Đăng ký tài khoản Admin
                </h2>

                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập họ và tên"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            { validator: validatePasswordMatch }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Xác nhận mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản!'))
                            }
                        ]}
                    >
                        <Checkbox>
                            Tôi đồng ý với <a href="/terms">Điều khoản sử dụng</a>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{
                    marginTop: 16,
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#666'
                }}>
                    Đã có tài khoản? <a href="/login">Đăng nhập</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
