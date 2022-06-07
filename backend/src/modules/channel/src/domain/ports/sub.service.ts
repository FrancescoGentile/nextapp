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
  create_sub(user_id: UserID, channel_id: ChannelID): Promise<SubID>;

  /**
   * Returns the subscriptions of a given user
   * @param user_id
   * @param options
   */
  get_user_subscriptions(
    user_id: UserID,
    options: SearchOptions
  ): Promise<Sub[] | null>;

  /**
   * Removes the subscriptions with the given id only if was made by the passed user or by a channel president.
   * @param user_id
   * @param sub_id
   */
  delete_subscriber(user_id: UserID, sub_id: SubID): Promise<void>;

  /**
   * Get users subscribed to the given Channel.
   * Returns an error if the requester is not a president of the given channel
   * @param user_id
   * @param channel_id
   */
  get_club_subscribers(user_id: UserID, channel_id: ChannelID): Promise<Sub[]>;
}
