//
//
//

import { NotificationToken, Notification } from '../models/notification';

export interface NotificationSender {
  send_notification(
    to: NotificationToken[],
    notification: Notification
  ): Promise<number>;
}
