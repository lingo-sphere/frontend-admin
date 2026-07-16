import { useSearchParams, useNavigate } from 'react-router-dom';
import { App, Button, Form, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changePasswordAPI } from '@/services';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const email = searchParams.get('email') || '';
    const code = searchParams.get('code') || '';

    const onFinish = async (values: {
        password: string;
        confirmPassword: string;
    }) => {
        if (values.password !== values.confirmPassword) {
            notification.error({
                message: 'Mật khẩu không khớp',
                description: 'Vui lòng xác nhận mật khẩu đúng.'
            });
            return;
        }

        try {
            const res = await changePasswordAPI(
                email,
                code,
                values.password,
                values.confirmPassword
            );
            if (res?.data?.statusCode === 200) {
                notification.success({
                    message: 'Đặt lại mật khẩu thành công',
                    description: 'Bạn có thể đăng nhập với mật khẩu mới!'
                });
                navigate('/login');
            } else {
                notification.error({
                    message: 'Đặt lại mật khẩu thất bại',
                    description: res?.data?.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Đặt lại mật khẩu thất bại',
                description: error?.response?.data?.message || 'Có lỗi xảy ra'
            });
        }
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
                boxShadow: '0 0 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: 16 }}>
                    Đặt lại mật khẩu
                </h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
                    Nhập mật khẩu mới cho tài khoản<br />
                    <strong>{email}</strong>
                </p>

                <Form
                    name="reset-password"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="password"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Xác nhận mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a href="/login"> Quay lại đăng nhập</a>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
