//
//
//


import { UserInfoService } from '../ports/user.service';
import { AuthService } from '../ports/auth.service';
import { UserRepository } from '../ports/user.repository';
import { SessionStore } from '../ports/session.store';
import { NextAuthService } from './auth';
import { NextUserInfoService } from './user';

export function init_services(
  user_repo: UserRepository,
  session_store: SessionStore
): { 
    user_service: UserInfoService; 
    auth_service: AuthService; 
} {
  const user_service = new NextUserInfoService(user_repo);
  const auth_service = new NextAuthService(user_repo, session_store);
  return { user_service, auth_service };
}