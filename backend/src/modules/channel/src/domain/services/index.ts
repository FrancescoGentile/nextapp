//
//
//

import { EventBroker } from '../ports/event.broker';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { NextChannelInfoService } from './channel';
import { NextUserService } from './user';

export function init_services(
  user_repo: UserRepository,
  channel_repo: ChannelRepository,
  broker: EventBroker
): { channel_service: ChannelInfoService} {
  const channel_service = new NextChannelInfoService(
    channel_repo,
    user_repo
  );

  const _ = new NextUserService(broker, user_repo);

  return { channel_service };
}
