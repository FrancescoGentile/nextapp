//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Channel, ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';

export interface ChannelInfoService {
  /**
   * Returns the channel with the given id if it exists.
   * @param id
   */
  get_channel(
    id: ChannelID
  ): Promise<Channel>;

  /**
   * Creates a new channel with the given information.
   * This method can be executed only by an admin.
   * This method throw and error if the channel name is already used.
   * @param admin
   * @param channel
   */
  create_channel(
    admin: UserID, 
    channel: Channel
  ): Promise<ChannelID | undefined>;

  /**
   * Return the list of all channels.
   * @param requester the user who wants to get the list of all channels
   */
  get_channel_list(
    requester: UserID, 
    options: SearchOptions
  ): Promise<Channel[]>;

   /**
   * Removes the channel with the given id only if it was made by the passed user.
   * Can throw an error if the passed user is not an admin.
   * @param user_id
   * @param channel_id
   */
  delete_channel(
    user_id: UserID, 
    channel_id: ChannelID
  ): Promise<void>;


  /**
   * Return the list of the channels that are managed by the requester.
   * @param requester the user who wants to get the list of all channels
   */
  get_pres_channels(
    requester: UserID, 
    options: SearchOptions
  ): Promise<Channel[]>;

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
   * This method can be executed only by a president.
   * This method throw and error if the channel does not exist or 
   * the requester is not a president.
   * Returns true if channel has been updated.
   * @param requester
   * @param channel
   */
  update_channel(
    requester: UserID, 
    channel: Channel
  ): Promise<boolean>;

  /**
   * Returns the channel with the given channel_name if it exists.
   * Can throw an error if the channel name deos not exist.
   * @param channel_name
   */
  get_channel_by_name(
    channel_name : string
  ): Promise<Channel>

}
