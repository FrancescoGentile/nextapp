//
//
//

import admin, { ServiceAccount } from 'firebase-admin';
import {
  NotificationToken,
  Notification,
} from '../../domain/models/notification';
import { NotificationSender } from '../../domain/ports/notification.sender';

export class FCMNotificationSender implements NotificationSender {
  private readonly admin;

  public constructor(config: ServiceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(config),
    });
    this.admin = admin;
  }

  public async send_notification(
    to: NotificationToken[],
    notification: Notification
  ): Promise<number> {
    const BATCH_SIZE = 500;
    let total_sent = 0;
    for (let i = 0; i < to.length; i += BATCH_SIZE) {
      const tokens = to.slice(i, i + BATCH_SIZE);
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await this.admin.messaging().sendMulticast({
          tokens: tokens.map((token) => token.to_string()),
          notification,
        });
        total_sent += res.successCount;
      } catch {
        // TODO: write log error
      }
    }

    return total_sent;
  }
}
