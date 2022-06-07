//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { EventInfoService } from '../ports/event.service';
import { EventRepository } from '../ports/event.repository';
import { EventBroker } from '../ports/event.broker';
import { ChannelID } from '../models/channel';
import { EventID, Event, RoomID } from '../models/event';
import { SearchOptions } from '../models/search';
import {
  EventCreationNotAuthorized,
  EventDeletionNotAuthorized,
  EventFullyOccupied,
  EventNotFound,
  EventParticipantsNotAuthorized,
  EventUpdateNotAuthorized,
  EventViewNotAuthorized,
  InternalServerError,
  InvalidEventID,
  ParticipationNotAuthorized,
  ParticipationNotFound,
} from '../errors';
import { SubRepository } from '../ports/sub.repository';
import { ChannelRepository } from '../ports/channel.repository';
import { ParticipationID, Participation } from '../models/participation';
import { NextInterval } from '../models/interval';

export class NextEventInfoService implements EventInfoService {
  public constructor(
    private readonly events_repo: EventRepository,
    private readonly sub_repo: SubRepository,
    private readonly channel_repo: ChannelRepository,
    private readonly broker: EventBroker
  ) {}

  public async get_event(user: UserID, event_id: EventID): Promise<Event> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new EventNotFound(event_id.to_string());
    }

    const subscribed = this.sub_repo.is_sub(user, event.channel);
    if (!subscribed) {
      throw new EventViewNotAuthorized();
    }

    return event;
  }

  public async get_channel_events(
    user: UserID,
    channel: ChannelID,
    options: SearchOptions,
    past: boolean
  ): Promise<Event[]> {
    const subscribed = this.sub_repo.is_sub(user, channel);
    if (!subscribed) {
      throw new EventViewNotAuthorized();
    }
    return this.events_repo.get_channel_events(channel, options, past);
  }

  public async update_event(
    user: UserID,
    event_id: EventID,
    name?: string | undefined,
    description?: string | undefined
  ): Promise<void> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new EventNotFound(event_id.to_string());
    }

    const is_president = await this.channel_repo.is_president(
      user,
      event.channel
    );
    if (!is_president) {
      throw new EventUpdateNotAuthorized();
    }

    if (name === undefined || description === undefined) {
      return;
    }
    const new_event = new Event(
      event.channel,
      name || event.name,
      description || event.description,
      event.interval,
      event.room,
      event.seats,
      event.id
    );

    await this.events_repo.update_event(new_event);
  }

  // TODO: terminate
  public async create_event(
    user: UserID,
    channel: ChannelID,
    name: string,
    description: string,
    room: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<EventID> {
    const _ = new Event(
      channel,
      name,
      description,
      NextInterval.from_dates(start, end, true),
      room,
      0 // temporary value
    );

    const is_president = this.channel_repo.is_president(user, channel);
    if (!is_president) {
      throw new EventCreationNotAuthorized();
    }

    return EventID.generate();

    // TODO: send event
  }

  // TODO:
  public async remove_event(user: UserID, event_id: EventID): Promise<void> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new EventNotFound(event_id.to_string());
    }

    const is_president = this.channel_repo.is_president(user, event.channel);
    if (!is_president) {
      throw new EventDeletionNotAuthorized();
    }

    // TODO: send event
  }

  // -----------------------------------------------------------------

  public async get_participants(
    requester: UserID,
    event_id: EventID,
    options: SearchOptions
  ): Promise<UserID[]> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new EventNotFound(event_id.to_string());
    }

    const is_president = await this.channel_repo.is_president(
      requester,
      event.channel
    );
    if (!is_president) {
      throw new EventParticipantsNotAuthorized();
    }

    return this.events_repo.get_participants(event_id, options);
  }

  public async get_user_participation(
    user_id: UserID,
    participation_id: ParticipationID
  ): Promise<Participation> {
    const participation = await this.events_repo.get_user_participation(
      user_id,
      participation_id
    );

    if (participation === null) {
      throw new ParticipationNotFound(participation_id.to_string());
    }

    return participation;
  }

  public async get_user_participations(
    user: UserID,
    options: SearchOptions,
    past: boolean
  ): Promise<Participation[]> {
    return this.events_repo.get_user_participations(user, options, past);
  }

  public async add_participation(
    user_id: UserID,
    event_id: EventID
  ): Promise<ParticipationID> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new InvalidEventID(event_id.to_string());
    }

    const is_sub = await this.sub_repo.is_sub(user_id, event.channel);
    if (!is_sub) {
      throw new ParticipationNotAuthorized();
    }

    const part_count = await this.events_repo.get_participants_count(event_id);
    if (part_count === null) {
      throw new InternalServerError();
    }

    if (part_count < event.seats) {
      const id = await this.events_repo.add_participation({
        user_id,
        event_id,
      });
      return id;
    }

    throw new EventFullyOccupied(event_id.to_string());
  }

  public async delete_participation(
    user_id: UserID,
    part_id: ParticipationID
  ): Promise<void> {
    const deleted = await this.events_repo.delete_participation(
      user_id,
      part_id
    );
    if (!deleted) {
      throw new ParticipationNotFound(part_id.to_string());
    }
  }
}
