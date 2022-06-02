//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Channel, ChannelID } from '../models/channel';
import { Event, EventID} from '../models/event';
import { RoomID } from '@nextapp/common/room';

export interface EventInfoService {
/**
   * Creates a new event in the specified channel.
   * @param user The user who wants to create the event
   * @param channel The channel where the event will be created
   * @param event The event to create
   */
 create_event(user: UserID, channel : ChannelID, event: Event): Promise<EventID>;


 /**
  * Removes a specific event
  * @param user The user who wants to remove the event
  * @param event The event to remove
  */
 remove_event(user: UserID, event: EventID): Promise<void>;

 /**
  * Updates a specific event
  * @param user The user who wants to update the event
  * @param name The new name of the event
  * @param description The new description of the event
  * @param start The new start date-time of the event
  * @param end The new end date-time of the event
  * @param room The new room of the event
  */
 update_event(user: UserID, event_id:EventID,name ?: string, description ?: string, start ?: DateTime, end ?: DateTime, room ?: RoomID): Promise<void>;


 /**
  * Returns a list of all the events
  * @param user The user who wants to get the event list.
  */
 get_event_list(user: UserID): Promise<Event[]>;

 /**
  * Returns a list of all the events in a specific channel
  * @param user The user who wants to get the event list.
  * @param channel The channel where the events are.
  */
 get_event_list_by_channel(user: UserID, channel: ChannelID): Promise<Event[]>;

 /**
  * Gets a specific event
  * @param user The user who wants to get the event.
  * @param event The id of the event to get.
  */
 get_event(user: UserID, event: EventID): Promise<Event>;


}
