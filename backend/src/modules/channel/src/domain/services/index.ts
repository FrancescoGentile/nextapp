//
//
//

import { EventBroker } from '../ports/event.broker';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { NextChannelInfoService } from './channel';
import { NextUserService } from './user';
import { SubRepository } from '../ports/sub.repository';
import { SubService } from '../ports/sub.service';
import { NextSubService } from './sub';

export function init_services(
  user_repo: UserRepository,
  channel_repo: ChannelRepository,
  sub_repo: SubRepository,
  broker: EventBroker
): { channel_service: ChannelInfoService; sub_service: SubService } {
  const channel_service = new NextChannelInfoService(
    channel_repo,
    user_repo,
    sub_repo
  );
  const sub_service = new NextSubService(
    sub_repo, 
    channel_repo
  );
  const _ = new NextUserService(
    broker, 
    user_repo
  );

  return { channel_service, sub_service };
}
