//
//
//

import { Channel, ChannelID } from '../models/channel';

export interface ChannelRepository {
  /**
   * Returns the channel with the given id if it exists.
   * @param ids
   */
  get_channel(id: ChannelID): Promise<Channel | null>;

}
