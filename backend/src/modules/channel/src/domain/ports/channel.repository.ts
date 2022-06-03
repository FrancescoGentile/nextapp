//
//
//

import { UserID } from '@nextapp/common/user';
import { Channel, ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';

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

   /**
   * Gets the channel list.
   * @param options
   */
  get_channel_list(options: SearchOptions): Promise<Channel[]>;

  /**
   * Gets the presidents of a channel
   * @param channel_id
   */
  get_channel_presidents(channel_id: ChannelID): Promise<UserID[]>

  /**
   * Deletes from the repository the channel with the given id.
   * This method returns false if no channel with the given id is found.
   * @param channel_id
   */
   delete_channel(channel_id: ChannelID): Promise<boolean>;

}
