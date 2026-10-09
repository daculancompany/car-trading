import api from "../api";

export interface Notification {
  id: number;
  sender_user_id: number | null;
  receiver_user_id: number;
  title: string;
  message: string;
  notification_type:
    | "reservation"
    | "payment"
    | "financing"
    | "vehicle"
    | "service"
    | "job_order"
    | "system"
    | "message";
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  current_page: number;
  data: Notification[];
  last_page: number;
  total: number;
}

export interface CreateNotificationData {
  receiver_user_id: number;
  title: string;
  message: string;
  notification_type: Notification["notification_type"];
}

export const createNotification = async (
  data: CreateNotificationData,
): Promise<void> => {
  await api.post("/notifications", data);
};

export const fetchNotifications = async (): Promise<NotificationResponse> => {
  const response = await api.get("/notifications");

  return response.data.data;
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get("/notifications/unread-count");

  return response.data.unread_count;
};

export const markNotificationAsRead = async (
  id: number
): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};

export const deleteNotification = async (
  id: number
): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};