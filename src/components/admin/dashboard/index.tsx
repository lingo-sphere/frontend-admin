import { useI18n } from "@/context/i18n.context";
import { getDashboardAPI, toast } from "@/services";
import { Card, Col, Row, Statistic, Typography } from "antd";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

const { Title } = Typography;

interface StatisticItem {
    title: string;
    value: number;
    color: string;
}

const AdminDashboard = () => {
    const { t, isDarkMode } = useI18n();
    const [dataDashboard, setDataDashboard] = useState<IDashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalRoles: 0,
        totalPermissions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            try {
                const res = await getDashboardAPI();
                if (res?.data) {
                    setDataDashboard(res.data);
                }
            } catch (error) {
                toast.notifyError(
                    "Lỗi khi tải dữ liệu dashboard",
                    "Vui lòng thử lại sau.",
                );
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, []);

    const formatter = (value: number | string) => (
        <CountUp end={Number(value ?? 0)} separator="," />
    );
    const cardStyle = {
        background: isDarkMode ? "#1f1f1f" : "#fff",
        borderColor: isDarkMode ? "#303030" : "#d9d9d9",
    };

    const statisticTitleStyle = {
        color: isDarkMode ? "#a6a6a6" : "rgba(0,0,0,0.65)",
    };
    const statistics: StatisticItem[] = [
        {
            title: t.dashboard.totalUsers,
            value: dataDashboard.totalUsers,
            color: "#1890ff",
        },
        {
            title: t.dashboard.activeUsers,
            value: dataDashboard.activeUsers,
            color: "#52c41a",
        },
        {
            title: "inactiveUsers",
            value: dataDashboard.inactiveUsers,
            color: "#722ed1",
        },
        {
            title: t.roles.title,
            value: dataDashboard.totalRoles,
            color: "#722ed1",
        },
        {
            title: t.permissions.title,
            value: dataDashboard.totalPermissions,
            color: "#faad14",
        },
    ];

    return (
        <div>
            <Title
                level={3}
                style={{
                    marginBottom: 24,
                    color: isDarkMode ? "#e8e8e8" : "#000",
                }}
            >
                {t.dashboard.title}
            </Title>
            <Row gutter={[24, 24]}>
                {statistics.map((item) => (
                    <Col key={item.title} xs={24} sm={12} lg={6}>
                        <Card
                            bordered={false}
                            loading={loading}
                            style={cardStyle}
                        >
                            <Statistic
                                title={
                                    <span style={statisticTitleStyle}>
                                        {item.title}
                                    </span>
                                }
                                value={item.value}
                                formatter={formatter}
                                valueStyle={{
                                    color: item.color,
                                }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default AdminDashboard;
