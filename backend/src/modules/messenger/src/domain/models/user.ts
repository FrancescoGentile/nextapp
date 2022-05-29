//
//
//

import { UserID } from '@nextapp/common/user';
import { EmailID } from './email';

export interface User {
  id: UserID;
  emails: EmailID[];
}
