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
                    "Error loading dashboard data",
                    "Please try again later.",
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
        background: "#fff",
        borderColor: "#d9d9d9",
    };

    const statisticTitleStyle = {
        color: "rgba(0,0,0,0.65)",
    };
    const statistics: StatisticItem[] = [
        {
            title: "Total Users",
            value: dataDashboard.totalUsers,
            color: "#1890ff",
        },
        {
            title: "Active Users",
            value: dataDashboard.activeUsers,
            color: "#52c41a",
        },
        {
            title: "Inactive Users",
            value: dataDashboard.inactiveUsers,
            color: "#722ed1",
        },
        {
            title: "Roles",
            value: dataDashboard.totalRoles,
            color: "#722ed1",
        },
        {
            title: "Permissions",
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
                    color: "#000",
                }}
            >
                Dashboard
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
