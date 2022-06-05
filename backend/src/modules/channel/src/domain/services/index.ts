//
//
//

import { EventBroker } from '../ports/event.broker';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { NextChannelInfoService } from './channel';
import { NextUserService } from './user';
import { NewsRepository } from '../ports/news.repository';
import { NextNewsInfoService } from './news';
import { NewsInfoService } from '../ports/news.service';

export function init_services(
  user_repo: UserRepository,
  channel_repo: ChannelRepository,
  news_repo: NewsRepository,
  broker: EventBroker
): { channel_service: ChannelInfoService; news_service: NewsInfoService } {
  const channel_service = new NextChannelInfoService(channel_repo, user_repo);
  const news_service = new NextNewsInfoService(news_repo, user_repo);

  const _ = new NextUserService(broker, user_repo);

  return { channel_service, news_service };
}
