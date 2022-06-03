//
//
//

import { UserID } from '@nextapp/common/user';
import {} from 'express-serve-static-core';
import { ChannelInfoService } from '../../domain/ports/channel.service';
import { SubService } from '../../domain/ports/sub.service';

declare module 'express-serve-static-core' {
  export interface Request {
    user_id?: UserID;
    channel_service?: ChannelInfoService;
    sub_service?: SubService;
  }
}
