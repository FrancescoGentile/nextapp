//
//
//

import { UserID } from '@nextapp/common/user';
import { Event, EventID } from '../models/event';
import { ChannelID } from '../models/channel';
import { SearchOptions } from '../models/search';
import { Participation, ParticipationID } from '../models/participation';

export interface EventRepository {
  /**
   * Gets the event with the given id if it exists.
   * @param event_id The id of the event to get.
   */
  get_event(event_id: EventID): Promise<Event | null>;

  /**
   * gets the list of events associated with a channel
   * @param channel The channel where the events are.
   */
  get_channel_events(
    channel: ChannelID,
    options: SearchOptions,
    past: boolean
  ): Promise<Event[]>;

  /**
   * Updates an event
   * @param event The new event
   */
  update_event(event: Event): Promise<boolean>;

  /**
   * Creates a new event in the specified channel.
   * @param event The event to create
   */
  create_event(event: Event): Promise<EventID>;

  /**
   * Removes an event
   * @param event The id of the event to remove
   */
  remove_event(event: EventID): Promise<boolean>;

  // -----------------------------------------------------------------

  /**
   * Returns the number of participants if this event exists.
   * @param event_id
   */
  get_participants_count(event_id: EventID): Promise<number | null>;

  /**
   * Returns a list of participants.
   * @param event_id
   * @param options
   */
  get_participants(
    event_id: EventID,
    options: SearchOptions
  ): Promise<UserID[]>;

  /**
   *
   * @param user_id
   * @param participation_id
   */
  get_user_participation(
    user_id: UserID,
    participation_id: ParticipationID
  ): Promise<Participation | null>;

  /**
   * Gets a list of participations of the user.
   * @param user_id
   * @param options
   */
  get_user_participations(
    user_id: UserID,
    options: SearchOptions,
    past: boolean
  ): Promise<Participation[]>;

  /**
   * Adds a new participation
   * @param participation
   */
  add_participation(participation: Participation): Promise<ParticipationID>;

  /**
   * Removes a participation if it exists.
   * @param user_id
   * @param participation_9d
   */
  delete_participation(
    user_id: UserID,
    participation_id: ParticipationID
  ): Promise<boolean>;
}
