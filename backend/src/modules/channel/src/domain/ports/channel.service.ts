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
}
