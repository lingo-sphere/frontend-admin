import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

let messageApi: MessageInstance;
let notificationApi: NotificationInstance;

export const setAppInstance = (
    message: MessageInstance,
    notification: NotificationInstance
) => {
    messageApi = message;
    notificationApi = notification;
};

export const toast = {
    success(content: string) {
        messageApi.success(content);
    },

    error(content: string) {
        messageApi.error(content);
    },

    notifyError(title: string, description: string) {
        notificationApi.error({
            message: title,
            description,
        });
    },

    notifySuccess(title: string, description: string) {
        notificationApi.success({
            message: title,
            description,
        });
    },
};