//
//
//


import { UserInfoService } from '../ports/user.service';
import { UserRepository } from '../ports/user.repository';
import { NextUserInfoService } from './user';

export function init_services(
  user_repo: UserRepository,
): { 
    user_service: UserInfoService; 
} {
  const user_service = new NextUserInfoService(user_repo);

  return { user_service };
}