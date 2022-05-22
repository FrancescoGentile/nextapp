//
//
//


import { UserInfoService } from '../ports/user.service';
import { AuthService } from '../ports/auth.service';
import { UserRepository } from '../ports/user.repository';
import { NextAuthService } from './auth';
import { NextUserInfoService } from './user';
import { AuthKey } from '../models/auth';

export function init_services(
  user_repo: UserRepository,
  key: AuthKey
): { 
    user_service: UserInfoService; 
    auth_service: AuthService; 
} {
  const user_service = new NextUserInfoService(user_repo);
  const auth_service = new NextAuthService(user_repo, key);
  return { user_service, auth_service };
}