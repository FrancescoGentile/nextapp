//
//
//

import { EmailAddress } from '../models/email';

export interface EmailSender {
  send_account_created(
    email: EmailAddress,
    fullname: string,
    username: string,
    password: string
  ): Promise<void>;

  send_email(
    to: EmailAddress[],
    subject: string,
    body: string,
    html: string
  ): Promise<void>;
}
