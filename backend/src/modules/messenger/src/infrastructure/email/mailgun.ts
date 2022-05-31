//
//
//

import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import Client from 'mailgun.js/client';
import { InternalServerError } from '@nextapp/common/error';
import { EmailAddress } from '../../domain/models/email';
import { EmailSender } from '../../domain/ports/email.sender';

export class MailgunEmailSender implements EmailSender {
  private readonly mg: Client;

  private readonly domain: string;

  public constructor(key: string, domain: string) {
    this.domain = domain;
    const mailgun = new Mailgun(FormData);
    this.mg = mailgun.client({ username: 'api', key });
  }

  public async send_account_created(
    email: EmailAddress,
    fullname: string,
    username: string,
    password: string
  ): Promise<void> {
    await this.mg.messages.create(this.domain, {
      from: `NextApp Team <nextapp@${this.domain}>`,
      to: [email.to_string()],
      subject: 'Account created',
      text:
        `Welcome to NextApp\n` +
        `Hi ${fullname}, we are happy to have you in the NextApp family.\n` +
        `Your account has been created. Your username is ${username} and the temporary password is ${password}.\n` +
        `For security reasons, please change it as soon as you can.\n`,
      html:
        `<h1>Welcome to NextApp</h1>` +
        `<p>Hi ${fullname}, we are happy to have you in the NextApp family.</p>` +
        `Your account has been created. Your username is ${username} and the temporary password is ${password}.<p>` +
        `<p>For security reasons, please change it as soon as you can.</p>`,
    });
  }

  public async send_email(
    to: EmailAddress[],
    subject: string,
    body: string,
    html: string
  ): Promise<void> {
    try {
      await this.mg.messages.create(this.domain, {
        from: `NextApp Team <nextapp@${this.domain}>`,
        to: to.map((e) => e.to_string()),
        subject,
        text: body,
        html,
      });
    } catch {
      throw new InternalServerError();
    }
  }
}
