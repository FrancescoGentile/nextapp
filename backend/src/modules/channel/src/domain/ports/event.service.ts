//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { ChannelID } from '../models/channel';
import { Event, EventID, RoomID } from '../models/event';
import { Participation, ParticipationID } from '../models/participation';
import { SearchOptions } from '../models/search';

export interface EventInfoService {
  /**
   * Gets a specific event.
   * This method fails if the user is not subscribed to the channel that published that event.
   * @param user
   * @param event
   */
  get_event(user: UserID, event: EventID): Promise<Event>;

  /**
   * Returns a list of all the events in a specific channel.
   * This method fails if the user is not subscribed to the channel.
   * @param user
   * @param channel
   */
  get_channel_events(
    user: UserID,
    channel: ChannelID,
    options: SearchOptions,
    past: boolean
  ): Promise<Event[]>;

  /**
   * Updates a specific event
   * @param user The user who wants to update the event
   * @param name The new name of the event
   * @param description The new description of the event
   */
  update_event(
    user: UserID,
    event_id: EventID,
    name?: string,
    description?: string
  ): Promise<void>;

  /**
   * Creates a new event in the specified channel.
   * @param user The user who wants to create the event
   * @param channel The channel where the event will be created
   * @param event The event to create
   */
  create_event(
    user: UserID,
    channel: ChannelID,
    name: string,
    description: string,
    room: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<EventID>;

  /**
   * Removes a specific event
   * @param user The user who wants to remove the event
   * @param event The event to remove
   */
  remove_event(user: UserID, event: EventID): Promise<void>;

  // --------------------------------------------------

  /**
   * Returns the list of participants.
   * @param event_id
   */
  get_participants(
    requester: UserID,
    event_id: EventID,
    options: SearchOptions
  ): Promise<UserID[]>;

  /**
   * Returns a user participation if it exists.
   * @param user_id
   */
  get_user_participation(
    user_id: UserID,
    partecipation_id: ParticipationID
  ): Promise<Participation>;

  /**
   * Returns a list of all user participations.
   * @param user The user who wants to get the event list.
   */
  get_user_participations(
    user: UserID,
    options: SearchOptions,
    past: boolean
  ): Promise<Participation[]>;

  /**
   * Adds the user partecipation to the event if they can.
   * @param user_id
   * @param event_id
   */
  add_participation(
    user_id: UserID,
    event_id: EventID
  ): Promise<ParticipationID>;

  /**
   * Removes the user as participant of the event.
   * @param user_id
   * @param part_id
   */
  delete_participation(
    user_id: UserID,
    part_id: ParticipationID
  ): Promise<void>;
}
