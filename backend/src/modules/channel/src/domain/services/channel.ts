//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  ChannelNotFound
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';

export class NextChannelInfoService implements ChannelInfoService {
  public constructor(
    private readonly channel_repo: ChannelRepository,
  ) {}

  public async get_channel(id: ChannelID): Promise<Channel> {
    const room = await this.channel_repo.get_channel(id);
    if (room === null) {
      throw new ChannelNotFound(id.to_string());
    }
    return room;
  }
  
}
