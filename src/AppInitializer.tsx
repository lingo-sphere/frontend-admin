import { App } from 'antd';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { setAppInstance } from '@/services';

export default function AppInitializer() {
    const { message, notification } = App.useApp();

    useEffect(() => {
        setAppInstance(message, notification);
    }, [message, notification]);

    return <Outlet />;
}