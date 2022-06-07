//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { ModuleID } from '@nextapp/common/event';
import { nanoid } from 'nanoid';
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
import { EventCache } from '../ports/event.cache';
import {
  CreateBookingResponseEvent,
  DeleteBookingResponseEvent,
} from '../events';

export class NextEventInfoService implements EventInfoService {
  public constructor(
    private readonly events_repo: EventRepository,
    private readonly sub_repo: SubRepository,
    private readonly channel_repo: ChannelRepository,
    private readonly cache: EventCache,
    private readonly broker: EventBroker
  ) {
    this.broker.on_create_booking_response(
      'create_booking_response',
      this.terminate_creation,
      this
    );

    this.broker.on_delete_booking_response(
      'delete_booking_response',
      this.terminate_delete,
      this
    );
  }

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
      event.booking,
      event.id
    );

    await this.events_repo.update_event(new_event);
  }

  public async create_event(
    user: UserID,
    channel: ChannelID,
    name: string,
    description: string,
    room: RoomID,
    start: DateTime,
    end: DateTime
  ): Promise<void> {
    const event = new Event(
      channel,
      name,
      description,
      NextInterval.from_dates(start, end, true),
      room,
      0, // temporary value,
      '' // temporary value
    );

    const is_president = this.channel_repo.is_president(user, channel);
    if (!is_president) {
      throw new EventCreationNotAuthorized();
    }

    const key = this.cache.save_event(event);
    this.broker.emit_create_booking_request({
      name: 'create_booking_request',
      module: ModuleID.CHANNEL,
      timestamp: DateTime.utc(),
      request_id: key,
      requester_id: event.channel.to_string(),
      room_id: event.room.to_string(),
      start: event.interval.start,
      end: event.interval.end,
    });
  }

  public async delete_event(user: UserID, event_id: EventID): Promise<void> {
    const event = await this.events_repo.get_event(event_id);
    if (event === null) {
      throw new EventNotFound(event_id.to_string());
    }

    const is_president = this.channel_repo.is_president(user, event.channel);
    if (!is_president) {
      throw new EventDeletionNotAuthorized();
    }

    this.broker.emit_delete_booking_request({
      name: 'delete_booking_request',
      module: ModuleID.CHANNEL,
      timestamp: DateTime.utc(),
      request_id: nanoid(),
      requester_id: event.channel.to_string(),
      booking_id: event.booking,
    });

    const subs = await this.sub_repo.get_club_subscribers(event.channel);
    const users = subs.map((s) => s.user);

    this.broker.emit_send_message({
      name: 'send_message',
      module: ModuleID.CHANNEL,
      timestamp: DateTime.utc(),
      users,
      type: 'notification',
      title: 'Event cancelled',
      body: `Event '${event.name}' is cancelled.`,
    });
  }

  private async terminate_creation(event: CreateBookingResponseEvent) {
    try {
      const e = this.cache.get_event(event.request_id);
      if (e === null) {
        // TODO: write log error
        return;
      }
      this.cache.delete_event(event.request_id);

      if (event.confirmed) {
        const channel = await this.channel_repo.get_channel(e.channel);
        if (channel === null) {
          // TODO: write log error
          return;
        }

        const new_event = new Event(
          e.channel,
          e.name,
          e.description,
          e.interval,
          e.room,
          event.seats!,
          event.booking_id!
        );

        await this.events_repo.create_event(new_event);

        const pres = channel.presID_array;
        this.broker.emit_send_message({
          name: 'send_message',
          module: ModuleID.CHANNEL,
          timestamp: DateTime.utc(),
          users: pres,
          type: 'notification',
          title: 'Event created',
          body: `The event ${new_event.name} has been successfully created.`,
        });

        const subs = await this.sub_repo.get_club_subscribers(e.channel);
        const users = subs.map((s) => s.user);

        this.broker.emit_send_message({
          name: 'send_message',
          module: ModuleID.CHANNEL,
          timestamp: DateTime.utc(),
          users,
          type: 'notification',
          title: new_event.name,
          body: new_event.description,
        });
      } else {
        const channel = await this.channel_repo.get_channel(e.channel);
        if (channel === null) {
          // TODO: write log error
          return;
        }

        const pres = channel.presID_array;
        this.broker.emit_send_message({
          name: 'send_message',
          module: ModuleID.CHANNEL,
          timestamp: DateTime.utc(),
          users: pres,
          type: 'notification',
          title: 'Event not created',
          body: `The event ${event.name} could not be created for the following reason: ${event.error}`,
        });
      }
    } catch {
      // TODO: write log error
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async terminate_delete(event: DeleteBookingResponseEvent) {
    if (!event.confirmed) {
      // TODO: write log error
    }
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
