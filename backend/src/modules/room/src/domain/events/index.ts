//
//
//

import { NextEvent } from '@nextapp/common/event';
import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'neo4j-driver-core';

export interface UserCreatedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
  fullname: string;
  username: string;
  email: string;
}

export interface UserDeletedEvent extends NextEvent {
  user_id: UserID;
}

export interface UserRoleChangedEvent extends NextEvent {
  user_id: UserID;
  role: UserRole;
}

export interface CreateBookingRequestEvent extends NextEvent {
  request_id: string;
  requester_id: string;
  room_id: string;
  start: DateTime;
  end: DateTime;
}

export interface CreateBookingResponseEvent extends NextEvent {
  request_id: string;
  confirmed: boolean;
  booking_id?: string; // this is set only if confirmed is set to true
}

export interface DeleteBookingRequestEvent extends NextEvent {
  request_id: string;
  requester_id: string;
  booking_id: string;
}

export interface DeleteBookingResponseEvent extends NextEvent {
  request_id: string;
  confirmed: boolean;
}
