//
//
//

import { Email, EmailAddress } from '../models/email';

export interface EmailSender {
  send_email(to: EmailAddress[], email: Email): Promise<void>;
}
