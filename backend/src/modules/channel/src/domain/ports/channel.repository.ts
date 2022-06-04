//
//
//

import { UserID } from '@nextapp/common/user';
import { Channel, ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';

export interface ChannelRepository {
  /**
   * Returns the channel with the given id if it exists.
   * @param ids
   */
  get_channel(
    id: ChannelID
    ): Promise<Channel | null>;

  /**
   * Adds a channel to the repository and
   * returns the new unique id associated to the channel.
   * This method returns undefined if a channel with the same name
   * already exists in the repository.
   * @param channel
   */
  create_channel(
    channel: Channel
    ): Promise<ChannelID | undefined>;

  /**
   * Gets the channel list.
   * @param options
   */
  get_channel_list(
    options: SearchOptions
    ): Promise<Channel[]>;

  /**
   * Deletes from the repository the channel with the given id.
   * This method returns false if no channel with the given id is found.
   * @param channel_id
   */
   delete_channel(
    channel_id: 
    ChannelID
    ): Promise<boolean>;

   /**
   * Gets the list of channel managed by the requester.
   * @param requester
   * @param options
   */
   get_pres_channels(
    requester: UserID, 
    options: SearchOptions
    ): Promise<Channel[]>

   /**
   * Returns true if the user is a president of a given channel; otherwise false.
   * @param user_id
   * @param channel_id
   */
  is_president(
    user_id: UserID, 
    channel_id: ChannelID
    ): Promise<boolean | null>;

    /**
   * Updates an already existing channel.
   * Returns true if channel has been updated.
   * @param channel
   */
  update_channel(
    channel: Channel
  ): Promise<boolean>;

  /**
   * Returns the channel with the given channel_name if it exists; null otherwise.
   * @param channel_name
   */
   get_channel_by_name(
    channel_name : string
  ): Promise<Channel | null>

}
