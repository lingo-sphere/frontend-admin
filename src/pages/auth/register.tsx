import { useNavigate } from "react-router-dom";
import { App } from "antd";
import Register from "@/components/auth/register";
import { registerAPI } from "@/services";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();

    const onFinish = async (values: {
        email: string;
        password: string;
        confirmPassword: string;
        name?: string;
    }) => {
        try {
            const res = await registerAPI(
                values.email,
                values.password,
                values.name,
            );
            if (res?.data?.statusCode === 201) {
                notification.success({
                    message: "Đăng ký thành công",
                    description:
                        "Vui lòng kiểm tra email để kích hoạt tài khoản!",
                });
                navigate("/login");
            } else {
                notification.error({
                    message: "Đăng ký thất bại",
                    description: res?.data?.message || "Có lỗi xảy ra",
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Đăng ký thất bại",
                description: error?.response?.data?.message || "Có lỗi xảy ra",
            });
        }
    };

    return <Register onFinish={onFinish} />;
};

export default RegisterPage;
