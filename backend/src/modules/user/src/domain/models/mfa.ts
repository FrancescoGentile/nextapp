//
//
//

import { customAlphabet } from 'nanoid';

import * as OTPAUTH from 'otpauth';

export class MFAID {
  private static readonly LENGTH = 10;

  public constructor(private readonly id: string) {}

  /**
   * Generates an id of length 10 consisting only of Arabic digits.
   * @returns
   */
  public static generate(): MFAID {
    const nanoid = customAlphabet('1234567890', MFAID.LENGTH);
    return new MFAID(nanoid());
  }

  public to_string(): string {
    return this.id;
  }

  public equals(other: MFAID): boolean {
    return this.id === other.id;
  }
}

export interface MFA {
  id: MFAID,
  method: TOTP | Messenger
}

export class TOTP {
  private constructor(private readonly totp: OTPAUTH.TOTP) {}

  public static create(user: string): TOTP {
    const totp = new OTPAUTH.TOTP({
      issuer: 'NextApp',
      label: user,
      algorithm: 'SHA3-512',
      digits: 6,
      period: 30,
      secret: new OTPAUTH.Secret(),
    });
    return new TOTP(totp);
  }

  public static from_uri(uri: string): TOTP {
    return new TOTP(OTPAUTH.URI.parse(uri) as OTPAUTH.TOTP);
  }

  public to_uri(): string {
    return this.totp.toString();
  }

  public generate(): string {
    return this.totp.generate();
  }

  public validate(token: string): boolean {
    return this.totp.validate({ token }) === 0;
  }
}

export class MessengerID {
  public constructor(private readonly id: string) {}

  public to_string(): string {
    return this.id;
  }

  public equals(other: MessengerID): boolean {
    return this.id === other.id;
  }
}

export class Messenger {
  private static readonly LENGTH = 6;

  public constructor(
    public readonly id: MessengerID,
    private token?: string,
  ) {}

  public generate() {
    const nanoid = customAlphabet('1234567890', Messenger.LENGTH);
    this.token = nanoid();
  }

  public get_token(): string {
    if (this.token === undefined) {
      this.generate();
    }
    return this.token!;
  }

  public validate(token: string): boolean {
    return this.token === token;
  }
}
