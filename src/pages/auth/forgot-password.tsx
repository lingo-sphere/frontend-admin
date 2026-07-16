import { useNavigate } from 'react-router-dom';
import { App, Button, Form, Input } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { retryPasswordAPI } from '@/services';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const onFinish = async (values: { email: string }) => {
        try {
            const res = await retryPasswordAPI(values.email);
            if (res?.data?.statusCode === 200) {
                notification.success({
                    message: 'Gửi yêu cầu thành công',
                    description: 'Vui lòng kiểm tra email để đặt lại mật khẩu!'
                });
                navigate('/login');
            } else {
                notification.error({
                    message: 'Gửi yêu cầu thất bại',
                    description: res?.data?.message || 'Có lỗi xảy ra'
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Gửi yêu cầu thất bại',
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: 16 }}>
                    Quên mật khẩu
                </h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
                    Nhập email của bạn để nhận mã đặt lại mật khẩu
                </p>

                <Form
                    name="forgot-password"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập email của bạn"
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
                            Gửi mã xác nhận
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

export default ForgotPasswordPage;
