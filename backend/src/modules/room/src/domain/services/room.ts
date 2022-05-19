//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import {
  InternalServerError,
  RoomCreationNotAuthorized,
  RoomDeletionNotAuthorized,
  RoomNameAlreadyUsed,
  RoomNotFound,
} from '../errors';
import { RoomID, Room } from '../models/room';
import { RoomRepository } from '../ports/room.repository';
import { RoomInfoService } from '../ports/room.service';
import { UserRepository } from '../ports/user.repository';

export class NextRoomInfoService implements RoomInfoService {
  public constructor(
    private readonly room_repo: RoomRepository,
    private readonly user_repo: UserRepository
  ) {}

  public async get_rooms(ids: RoomID[]): Promise<Room[]> {
    return this.room_repo.get_rooms(ids);
  }

  public async create_room(admin: UserID, room: Room): Promise<RoomID> {
    if (!(await this.is_admin(admin))) {
      throw new RoomCreationNotAuthorized();
    }

    const id = await this.room_repo.create_room(room);
    if (id === undefined) {
      throw new RoomNameAlreadyUsed(room.name);
    }
    return id;
  }

  public async delete_room(admin: UserID, room_id: RoomID): Promise<void> {
    if (!(await this.is_admin(admin))) {
      throw new RoomDeletionNotAuthorized();
    }

    const deleted = await this.room_repo.delete_room(room_id);
    if (!deleted) {
      throw new RoomNotFound(room_id.to_string());
    }
  }

  private async is_admin(user_id: UserID): Promise<boolean> {
    const role = await this.user_repo.get_user_role(user_id);
    if (role === null) {
      // the user with the given id has still not been created
      throw new InternalServerError();
    }
    return role === UserRole.SYS_ADMIN;
  }
}
