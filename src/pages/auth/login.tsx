import { useNavigate } from 'react-router-dom';
import { Form, App } from 'antd';
import Login from '@/components/auth/login';
import { useCurrentApp } from '@/components/context/app.context';

const LoginPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const { handleLogin } = useCurrentApp();

    const onFinish = async (values: { username: string; password: string }) => {
        const result = await handleLogin(values.username, values.password);
        if (result.success) {
            notification.success({
                message: 'Đăng nhập thành công',
                description: 'Chào mừng bạn quay trở lại!'
            });
            navigate('/');
        } else {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: result.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }
    };

    return (
        <Login
            form={form}
            onFinish={onFinish}
        />
    );
};

export default LoginPage;
