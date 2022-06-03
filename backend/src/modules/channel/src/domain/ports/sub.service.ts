//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Channel, ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';

export interface SubService {
  
  /**
   * Creates a new subscription for the given user and channel.
   * This method throw an error if the given information are not correct.
   * @param user_id
   * @param channel_id
   */
  create_sub(
    user_id: UserID,
    channel_id: ChannelID
  ): Promise<SubID>;

  get_user_subscriptions(
    user_id: UserID,
    options: SearchOptions
  ): Promise<Channel[] | null>

}
