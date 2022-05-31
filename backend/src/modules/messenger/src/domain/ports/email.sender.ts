//
//
//

import { Email } from '../models/email';

export interface EmailSender {
  send_account_created(
    email: Email,
    fullname: string,
    username: string,
    password: string
  ): Promise<void>;
}
