//
//
//

import { UserInfoService } from '../ports/user.service';
import { AuthService } from '../ports/auth.service';
import { UserRepository } from '../ports/user.repository';
import { NextAuthService } from './auth';
import { NextUserInfoService } from './user';
import { AuthKey } from '../models/auth';
import { EventBroker } from '../ports/event.broker';
import { FileStorage } from '../ports/file.storage';

export function init_services(
  user_repo: UserRepository,
  storage: FileStorage,
  key: string,
  broker: EventBroker
): {
  user_service: UserInfoService;
  auth_service: AuthService;
} {
  const user_service = new NextUserInfoService(user_repo, storage, broker);
  const auth_service = new NextAuthService(user_repo, new AuthKey(key));
  return { user_service, auth_service };
}
