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
import { NewsRepository } from '../ports/news.repository';
import { NextNewsInfoService } from './news';
import { NewsInfoService } from '../ports/news.service';
import { EventInfoService } from '../ports/event.service';
import { NextEventInfoService } from './event';
import { EventRepository } from '../ports/event.repository';
import { EventCache } from '../ports/event.cache';

export function init_services(
  user_repo: UserRepository,
  channel_repo: ChannelRepository,
  sub_repo: SubRepository,
  news_repo: NewsRepository,
  event_repo: EventRepository,
  cache: EventCache,
  broker: EventBroker
): {
  channel_service: ChannelInfoService;
  sub_service: SubService;
  news_service: NewsInfoService;
  event_service: EventInfoService;
} {
  const _ = new NextUserService(broker, user_repo);

  const channel_service = new NextChannelInfoService(
    channel_repo,
    user_repo,
    sub_repo
  );
  const sub_service = new NextSubService(sub_repo, channel_repo);
  const news_service = new NextNewsInfoService(
    news_repo,
    channel_repo,
    sub_repo,
    broker
  );
  const event_service = new NextEventInfoService(
    event_repo,
    sub_repo,
    channel_repo,
    cache,
    broker
  );

  return { channel_service, sub_service, news_service, event_service };
}
