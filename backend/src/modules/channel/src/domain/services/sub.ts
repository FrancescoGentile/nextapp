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
  InvalidPresidentsNumber,
  InvalidSubscribeChannel,
  UserNotAPresident
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { SubService } from '../ports/sub.service';
import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';
import { SubRepository } from '../ports/sub.repository';
import { User } from '../models/user';

export class NextSubService implements SubService {
  public constructor(
    private readonly sub_repo: SubRepository,
    private readonly channel_repo: ChannelRepository
  ) {}
  
  public async create_sub(user_id: UserID, channel_id: ChannelID): Promise<SubID> {
    const channel = await this.channel_repo.get_channel(channel_id);
    if (channel === null) {
      throw new InvalidSubscribeChannel();
    }
    
    const subscription: Sub = { user: user_id, channel: channel_id };
    const sub_id = await this.sub_repo.create_sub(subscription);
    if (sub_id === undefined) {
      throw new InternalServerError();
    }

    return sub_id;
  
  }
  
  public async get_user_subscriptions(user_id: UserID, options: SearchOptions): Promise<Sub[] | null> {
    return await this.sub_repo.get_user_subscriptions(user_id, options);
  }
  
  public async delete_subscriber(user_id: UserID, sub_id: SubID): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private async is_president(user_id: UserID, channel_id: ChannelID): Promise<boolean | null>{
    const is_pres = await this.sub_repo.is_president(user_id, channel_id);
    return is_pres;
  }

}