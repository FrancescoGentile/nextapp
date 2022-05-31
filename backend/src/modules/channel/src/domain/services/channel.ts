//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { DateTime } from 'luxon';
import {
  ChannelNotFound, 
  ChannelCreationNotAuthorized,
  ChannelNameAlreadyUsed,
  InvalidPresidentsNumber
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';

export class NextChannelInfoService implements ChannelInfoService {
  public constructor(
    private readonly channel_repo: ChannelRepository,
    private readonly user_repo: UserRepository
  ) {}
  
  public async get_channel(id: ChannelID): Promise<Channel> {
    const channel = await this.channel_repo.get_channel(id);
    if (channel === null) {
      throw new ChannelNotFound(id.to_string());
    }
    return channel;
  }
  
  public async create_channel(admin: UserID, channel: Channel): Promise<ChannelID> {
    if (!(await this.is_admin(admin))) {
      throw new ChannelCreationNotAuthorized();
    }
    if (
      channel.presID_array.length > Channel.MAX_PRESIDENTS 
      || channel.presID_array.length < Channel.MIN_PRESIDENTS 
    ) {
      throw new InvalidPresidentsNumber(channel.presID_array.length);
    }
    const id = await this.channel_repo.create_channel(channel);
    if (id === undefined) {
      throw new ChannelNameAlreadyUsed(channel.name);
    }
    return id;
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
