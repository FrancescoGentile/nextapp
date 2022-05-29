//
//
//

import { Email } from '../models/email';

export interface EmailSender {
  send_account_created(
    email: Email,
    name: string,
    password: string
  ): Promise<void>;
}
