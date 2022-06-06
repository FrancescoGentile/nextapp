//
//
//

import { UserID } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import {
  InvalidSubscribeChannel,
  UserNotAPresident,
  SubNotFound,
  ChannelNotFound
} from '../errors';
import { ChannelID } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { SubService } from '../ports/sub.service';
import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';
import { SubRepository } from '../ports/sub.repository';

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
    
    const subscription: Sub = 
      {
        id: SubID.generate(),
        user: user_id, 
        channel: channel_id 
      };
    const sub_id = await this.sub_repo.create_sub(subscription);
    if (sub_id === undefined) {
      throw new InternalServerError();
    }

    return sub_id;
  
  }
  
  public async get_user_subscriptions(user_id: UserID, options: SearchOptions): Promise<Sub[] | null> {
    return await this.sub_repo.get_user_subscriptions(user_id, options);
  }
  
  public async delete_subscriber(requester: UserID, sub_id: SubID): Promise<void> {
    const sub = await this.sub_repo.get_subscription_info(sub_id);
    if(sub! === null){
      throw new SubNotFound(sub_id.to_string());
     }
     //console.log(sub);
     const channel_id = sub!.channel;
     const subscriber_id = sub!.user;
     const is_pres = await this.channel_repo.is_president(requester, channel_id);
      //is the requester the user to be unsubscribed ?
      //OR
      //is the requester a president of the interested channel ?
       if(requester.to_string() !== subscriber_id.to_string() && !is_pres!){
         throw new UserNotAPresident(requester.to_string());
      }

    await this.sub_repo.delete_subscriber(subscriber_id, sub_id);
    //  console.log("---------------------------------------------------------------");

  }

  public async get_club_subscribers(requester: UserID, channel_id: ChannelID): Promise<Sub[]> {
    const channel_exists: boolean = 
      await this.channel_repo.get_channel(channel_id) == null
        ? false
        : true;
    if(!channel_exists){
      throw new ChannelNotFound(channel_id.to_string());
    }
    
    const is_pres = await this.channel_repo.is_president(requester, channel_id);
    if(!is_pres){
      throw new UserNotAPresident(requester.to_string());
    }
    
    return await this.sub_repo.get_club_subscribers(channel_id);
  }

}