//
//
//

import { UserID } from '@nextapp/common/user';
import { Channel, ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';

export interface SubRepository {

  /**
   * Adds the given subscription to the repository.
   * This method returns undefined if the user or the channel do not exist in the repo.
   * @param sub
   */
  create_sub(
    sub: Sub
    ): Promise<SubID | undefined>;

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
   * Returns the subscription with the given SubID
   * @param sub_id
   */
  get_subscription_info(
    sub_id : SubID
    ): Promise<Sub | null>

  /**
   * Removes the subscriptions with the given id.
   * Returns true if the subscription has been deleted.
   * @param user_id
   * @param sub_id
   */
  delete_subscriber(
    user_id: UserID, 
    sub_id: SubID
 ): Promise<boolean>;

 /**
   * Get users subscribed to the given Channel.
   * Returns an error if the requester is not a president of the given channel
   * @param user_id
   * @param channel_id
   */
  get_club_subscribers(
    channel_id: ChannelID
  ): Promise<UserID[]>;
    
  /**
   * Returns true if the user is subscribed to the given channel.
   * False otherwise.
   * @param user_id
   * @param channel_id
   */
  is_sub(
    user_id: UserID,
    channel_id: ChannelID
  ): Promise<boolean>;

}
