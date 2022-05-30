//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Channel, ChannelID } from '../models/channel';

export interface ChannelInfoService {
  /**
   * Returns the channel with the given id if it exists.
   * @param id
   */
  get_channel(id: ChannelID): Promise<Channel>;

  /**
   * Creates a new channel with the given information.
   * This method can be executed only by an admin.
   * This method throw and error if the channel name is already used.
   * @param admin
   * @param channel
   */
  create_channel(admin: UserID, channel: Channel): Promise<ChannelID>;
}
