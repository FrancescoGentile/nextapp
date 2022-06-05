//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { ChannelInfoService } from '../../domain/ports/channel.service';
import { EventInfoService } from '../../domain/ports/event.service';
import { SubEventService } from '../../domain/ports/subevent.service';

declare module 'express-serve-static-core' {
  export interface Request {
    user_id?: UserID;
    channel_service?: ChannelInfoService;
    event_service?: EventInfoService;
    sub_event_service?: SubEventService;
  }
}
