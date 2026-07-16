import { useSearchParams, useNavigate } from 'react-router-dom';
import { App, Button, Form, Input } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { checkCodeAPI } from '@/services';

const ActivationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const userId = searchParams.get('_id') || '';
    const email = searchParams.get('email') || '';

    const onFinish = async (values: { code: string }) => {
        try {
            const res = await checkCodeAPI(userId, values.code);
            if (res?.data?.statusCode === 200) {
                notification.success({
                    message: 'Kích hoạt thành công',
                    description: 'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập!'
                });
                navigate('/login');
            } else {
                notification.error({
                    message: 'Kích hoạt thất bại',
                    description: res?.data?.message || 'Mã kích hoạt không đúng hoặc đã hết hạn'
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Kích hoạt thất bại',
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
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <h2 style={{ marginTop: 16 }}>Kích hoạt tài khoản</h2>
                    <p style={{ color: '#666' }}>
                        Vui lòng nhập mã kích hoạt đã được gửi đến email<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <Form
                    name="activation"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã kích hoạt!' },
                            { len: 6, message: 'Mã kích hoạt gồm 6 chữ số!' }
                        ]}
                    >
                        <Input.OTP
                            length={6}
                            style={{ width: '100%' }}
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
                            Kích hoạt
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

export default ActivationPage;
