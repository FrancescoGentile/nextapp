//
//
//

import { UserID } from '@nextapp/common/user';
import { Email } from './email';

export interface User {
  id: UserID;
  email: Email;
}
