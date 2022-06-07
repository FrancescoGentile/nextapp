//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';

export { InternalServerError } from '@nextapp/common/error';

// ---------------------------------------------------------------
// -------------------------- CHANNEL ----------------------------
// ---------------------------------------------------------------

enum ChannelErrorTypes {
  INVALID_ID = 1,
  INVALID_NAME,
  INVALID_DESCRIPTION,
  CHANNEL_NOT_FOUND,
  CHANNEL_CREATION_NOT_AUTHORIZED,
  NAME_ALREADY_USED,
  INVALID_PRESIDENT_NUMBERS,
  CHANNEL_DELETION_NOT_AUTHORIZED,
  NO_CHANNEL_AVAILABLE,
  CHANNEL_NAME_NOT_FOUND,
  PRESIDENT_NOT_USER,
}

function get_channel_type(type: ChannelErrorTypes): string {
  return `channel-${String(type).padStart(3, '0')}`;
}

export class InvalidChannelID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.INVALID_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid channel id',
      `${id} is not a valid id for a channel`,
      options
    );
  }
}

export class InvalidChannelName extends NextError {
  public constructor(name: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.INVALID_NAME),
      StatusCodes.BAD_REQUEST,
      'Invalid channel name',
      `${name} does not meet on or both of the following conditions: ` +
        `length between 5 and 100 characters, ` +
        `only lowercase and uppercase Latin letters, Arabic numerals, underscores and dashes.`,
      options
    );
  }
}

export class InvalidChannelDescription extends NextError {
  public constructor(description: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.INVALID_DESCRIPTION),
      StatusCodes.BAD_REQUEST,
      'Invalid channel description',
      `${description} does not meet on or both of the following conditions: ` +
        `length between 5 and 300 characters, ` +
        `only lowercase and uppercase Latin letters, Arabic numerals, underscores and dashes.`,
      options
    );
  }
}

export class ChannelNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.CHANNEL_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Channel not found',
      `Channel with id ${id} was not found.`,
      options
    );
  }
}

export class ChannelCreationNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.CHANNEL_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a channel',
      'You have to be a system administator to create a channel.',
      options
    );
  }
}

export class ChannelNameAlreadyUsed extends NextError {
  public constructor(name: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.NAME_ALREADY_USED),
      StatusCodes.CONFLICT,
      'Name already used',
      `${name} is already assigned to another channel. Try another name.`,
      options
    );
  }
}

export class InvalidPresidentsNumber extends NextError {
  public constructor(presidents_number: number, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.INVALID_PRESIDENT_NUMBERS),
      StatusCodes.BAD_REQUEST,
      'Invalid number of presidents',
      `You requested ${presidents_number} users to be assigned the role of club president.
       This number does not meet the following conditions: ` +
        `The number of presidents must be at least 1 and 4 at most` +
        `only lowercase and uppercase Latin letters, Arabic numerals, underscores and dashes.`,
      options
    );
  }
}

export class ChannelDeletionNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.CHANNEL_DELETION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to delete a channel',
      'You have to be a system administator to delete a channel.',
      options
    );
  }
}

export class NoChannelAvailable extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.NO_CHANNEL_AVAILABLE),
      StatusCodes.NOT_FOUND,
      'There is no channel available',
      `Cannot find any channel.`,
      options
    );
  }
}

export class ChannelNameNotFound extends NextError {
  public constructor(channel_name: string, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.CHANNEL_NAME_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Channel not found',
      `Channel with name ${channel_name} was not found.`,
      options
    );
  }
}

export class PresidentNotAUser extends NextError {
  public constructor(user_id: UserID, options?: ErrorOptions) {
    super(
      get_channel_type(ChannelErrorTypes.PRESIDENT_NOT_USER),
      StatusCodes.NOT_FOUND,
      'President is not a user',
      `User id${user_id} was not found.`,
      options
    );
  }
}

// ---------------------------------------------------------------
// ---------------------------- SUBS -----------------------------
// ---------------------------------------------------------------

enum SubErrorTypes {
  INVALID_SUB_ID = 1,
  INVALID_SUB_CHANNEL,
  SUBSCRIPTION_NOT_FOUND,
}

function get_sub_type(type: SubErrorTypes): string {
  return `subscription-${String(type).padStart(3, '0')}`;
}

export class InvalidSubID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_sub_type(SubErrorTypes.INVALID_SUB_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid subscription id',
      `${id} is not a valid subscription id.`,
      options
    );
  }
}

export class InvalidSubscribeChannel extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_sub_type(SubErrorTypes.INVALID_SUB_CHANNEL),
      StatusCodes.BAD_REQUEST,
      'Channel not found',
      `Your subscription is for a channel that does not exist.`,
      options
    );
  }
}

export class SubNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_sub_type(SubErrorTypes.SUBSCRIPTION_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Subscription not found',
      `There is no subscription with id ${id}.`,
      options
    );
  }
}

// ------------------------------------------------------------
// -------------------------- NEWS ----------------------------
// ------------------------------------------------------------

enum NewsErrorTypes {
  INVALID_ID = 1,
  INVALID_TITLE,
  INVALID_BODY,
  NEWS_NOT_FOUND,
  NEWS_CREATION_NOT_AUTHORIZED,
  NEWS_UPDATE_NOT_AUTHORIZED,
  NEWS_VIEW_NOT_AUTHORIZED,
}

function get_news_type(type: NewsErrorTypes): string {
  return `news-${String(type).padStart(3, '0')}`;
}

export class InvalidNewsID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.INVALID_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid news id',
      `${id} is not a valid id for a news`,
      options
    );
  }
}

export class InvalidNewsTitle extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.INVALID_TITLE),
      StatusCodes.BAD_REQUEST,
      'Invalid news title',
      `The title of a news cannot be empty or longer than 100 characters.`,
      options
    );
  }
}

export class InvalidNewsBody extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.INVALID_BODY),
      StatusCodes.BAD_REQUEST,
      'Invalid news body',
      `The body of a news cannot be empty or longer than 5000 characters.`,
      options
    );
  }
}

export class NewsCreationNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a news',
      'You have to be a channel president to create a news.',
      options
    );
  }
}

export class NewsDeletionNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a news',
      'You have to be a channel president to delete a news.',
      options
    );
  }
}

export class NewsUpdateNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_UPDATE_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to update a news',
      'You have to be a channel administator to update a news.',
      options
    );
  }
}

export class NewsViewNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_UPDATE_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to view news',
      'You have to be subscribed to a channel to see its news.',
      options
    );
  }
}

export class NewsNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'News not found',
      `No news with id ${id} was found.`,
      options
    );
  }
}

// -----------------------------------------------
// -------------------- EVENT --------------------
// -----------------------------------------------

enum EventErrorTypes {
  INVALID_ID = 1,
  EVENT_NOT_FOUND,
  INVALID_NAME,
  INVALID_DESCRIPTION,
  EVENT_CREATION_NOT_AUTHORIZED,
  EVENT_DELETION_NOT_AUTHORIZED,
  EVENT_UPDATE_NOT_AUTHORIZED,
  EVENT_VIEW_NOT_AUTHORIZED,
  EVENT_PARTICIPANTS_NOT_AUTHORIZED,
  INVALID_INTERVAL,
}

function get_event_type(type: EventErrorTypes): string {
  return `event-${String(type).padStart(3, '0')}`;
}

export class InvalidEventID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.INVALID_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid event id',
      `${id} is not a valid id for an event.`,
      options
    );
  }
}

export class EventNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Event not found',
      `No event with ${id} was found.`,
      options
    );
  }
}

export class InvalidEventName extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.INVALID_NAME),
      StatusCodes.BAD_REQUEST,
      'Invalid event name',
      `The name of an event cannot be empty or longer than 100 characters.`,
      options
    );
  }
}

export class InvalidEventDescription extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.INVALID_DESCRIPTION),
      StatusCodes.BAD_REQUEST,
      'Invalid event name',
      `The description of an event cannot be empty or longer than 5000 characters.`,
      options
    );
  }
}

export class EventCreationNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create an event',
      `You have to be a channel's president to create an event.`,
      options
    );
  }
}

export class EventDeletionNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_DELETION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Deletion not authorized',
      `You have to be a channel's president to delete an event.`,
      options
    );
  }
}

export class EventUpdateNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_UPDATE_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Update not authorized',
      `You have to be a channel's president to update an event.`,
      options
    );
  }
}

export class EventViewNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_VIEW_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'View not authorized',
      `You have to be subscribed to a channel to see its events.`,
      options
    );
  }
}

export class EventParticipantsNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.EVENT_PARTICIPANTS_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'View not authorized',
      `You have to be a president of the channel to views the participants of an event.`,
      options
    );
  }
}

export class InvalidInterval extends NextError {
  public constructor(details: any, options?: ErrorOptions) {
    super(
      get_event_type(EventErrorTypes.INVALID_INTERVAL),
      StatusCodes.BAD_REQUEST,
      'Invalid search interval',
      details,
      options
    );
  }
}

// ---------------------------------------------------------------
// ---------------------------- PRES -----------------------------
// ---------------------------------------------------------------

enum PresErrorTypes {
  NOT_A_PRESIDENT,
}

function get_pres_type(type: PresErrorTypes): string {
  return `president-${String(type).padStart(3, '0')}`;
}

export class UserNotAPresident extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_pres_type(PresErrorTypes.NOT_A_PRESIDENT),
      StatusCodes.FORBIDDEN,
      'You do not manage any channel',
      `Cannot find a channel you do manage.`,
      options
    );
  }
}

// ---------------------------------------------------------------
// ------------------------ PARTICIPATION ------------------------
// ---------------------------------------------------------------

enum ParticipationErrorTypes {
  INVALID_ID = 1,
  NOT_FOUND,
  EVENT_FULL,
  PARTICIPATION_NOT_AUTHORIZED,
}

function get_participation_type(type: ParticipationErrorTypes): string {
  return `participation-${String(type).padStart(3, '0')}`;
}

export class InvalidParticipationID extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_participation_type(ParticipationErrorTypes.INVALID_ID),
      StatusCodes.BAD_REQUEST,
      'Invalid pariticipation id',
      `${id} is not a valid id for a participation.`,
      options
    );
  }
}

export class ParticipationNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_participation_type(ParticipationErrorTypes.NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'Not found',
      `No participation with id ${id} was found among your participation`,
      options
    );
  }
}

export class EventFullyOccupied extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_participation_type(ParticipationErrorTypes.EVENT_FULL),
      StatusCodes.CONFLICT,
      'Event fully booked',
      `You cannot participate to the event with id ${id} because it is already fully booked.`,
      options
    );
  }
}

export class ParticipationNotAuthorized extends NextError {
  public constructor(options?: ErrorOptions) {
    super(
      get_participation_type(
        ParticipationErrorTypes.PARTICIPATION_NOT_AUTHORIZED
      ),
      StatusCodes.FORBIDDEN,
      'Cannot participate',
      'You cannot participate to ane event of a channel you are not subscribed to.',
      options
    );
  }
}
