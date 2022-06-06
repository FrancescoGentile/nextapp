//
//
//

import { UserID } from '@nextapp/common/user';
import { EmailAddress } from '../../src/domain/models/email';
import { WebDevice } from '../../src/domain/models/device';

export interface User {
  id: UserID;
  emails: EmailAddress[];
  devices: WebDevice[];
}
