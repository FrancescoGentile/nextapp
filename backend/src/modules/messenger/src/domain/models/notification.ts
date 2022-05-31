//
//
//

/**
 * Token used to send a notification to the assocuated device.
 */
export class NotificationToken {
  public constructor(private readonly token: string) {}

  public to_string(): string {
    return this.token;
  }
}
