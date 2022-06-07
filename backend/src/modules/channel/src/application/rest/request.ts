//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { ChannelInfoService } from '../../domain/ports/channel.service';
import { EventInfoService } from '../../domain/ports/event.service';
import { NewsInfoService } from '../../domain/ports/news.service';
import { SubService } from '../../domain/ports/sub.service';

declare module 'express-serve-static-core' {
  export interface Request {
    version: string;
    user_id: UserID;
    channel_service: ChannelInfoService;
    sub_service: SubService;
    news_service: NewsInfoService;
    event_service: EventInfoService;
  }
}
