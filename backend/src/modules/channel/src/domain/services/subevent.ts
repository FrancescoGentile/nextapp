//
//
//

import { UserID,  } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import {
  SubEventNotFound,
  InvalidSubscribeEvent
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { SubEventService } from '../ports/subevent.service';
import { EventSubID,EventSub } from '../models/subevent';
import { EventID } from '../models/event';
import { EventRepository } from '../ports/event.repository';

import { EventSubRepository } from '../ports/subevent.repository';

export class NextEventSubService implements SubEventService {
  public constructor(
    private readonly sub_event_repo:EventSubRepository,
    private readonly event_repo: EventRepository
  ) {}
  
  public async create_event_sub(user_id: UserID, event_id: EventID): Promise<EventSubID> {
    const channel = await this.event_repo.get_event(event_id);
    if (channel === null) {
      throw new InvalidSubscribeEvent(event_id);
    }
    
    const subscription: EventSub = { user: user_id, event: event_id };

    const sub_id = await this.sub_event_repo.create_event_sub(subscription);
    if (sub_id === undefined) {
      throw new InternalServerError();
    }

    return sub_id;
  
  }


  public async  delete_event_sub(user_id : UserID,sub_id: EventSubID): Promise<void> {
    const deleted = await this.sub_event_repo.delete_event_sub(sub_id);
    if (!deleted) {
      throw new SubEventNotFound(sub_id.to_string());
    }

  }


  public async get_sub_event_list(user_id: UserID): Promise<EventSub[]> {
    const sub_list = await this.sub_event_repo.get_sub_event_list(user_id);
    if (sub_list === null) {
      throw new InternalServerError();
    }
    return sub_list;
  }


}