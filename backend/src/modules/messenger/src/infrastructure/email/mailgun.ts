//
//
//

import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import Client from 'mailgun.js/client';
import { InternalServerError } from '@nextapp/common/error';
import { Email, EmailAddress } from '../../domain/models/email';
import { EmailSender } from '../../domain/ports/email.sender';

export class MailgunEmailSender implements EmailSender {
  private readonly mg: Client;

  private readonly domain: string;

  public constructor(key: string, domain: string) {
    this.domain = domain;
    const mailgun = new Mailgun(FormData);
    this.mg = mailgun.client({ username: 'api', key });
  }

  public async send_email(to: EmailAddress[], email: Email): Promise<void> {
    try {
      await this.mg.messages.create(this.domain, {
        from: `NextApp Team <nextapp@${this.domain}>`,
        to: to.map((e) => e.to_string()),
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } catch {
      throw new InternalServerError();
    }
  }
}
