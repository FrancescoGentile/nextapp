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

  /**
   * Adds a channel to the repository and
   * returns the new unique id associated to the channel.
   * This method returns undefined if a channel with the same name
   * already exists in the repository.
   * @param channel
   */
   create_channel(channel: Channel): Promise<ChannelID | undefined>;

}
