//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {
  
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';

export class NextChannelInfoService implements ChannelInfoService {
  public constructor(
    private readonly channel_repo: ChannelRepository,
  ) {}

}
