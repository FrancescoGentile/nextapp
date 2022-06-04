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

}
