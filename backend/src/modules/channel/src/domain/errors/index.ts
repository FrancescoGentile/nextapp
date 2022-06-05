//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';
import { Channel } from '../models/channel';

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
}

function get_channel_type(type: ChannelErrorTypes): string {
  return `room-${String(type).padStart(3, '0')}`;
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
      'Invalid channel name',
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
       This number not meet the following conditions: ` +
        `The number of presidents must be at least ${Channel.MIN_PRESIDENTS} and ${Channel.MAX_PRESIDENTS} at most` +
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

// ---------------------------------------------------------------
// ---------------------------- SUBS -----------------------------
// ---------------------------------------------------------------

enum SubErrorTypes {
  INVALID_SUB_ID = 1,
  INVALID_CHANNEL,
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
      get_sub_type(SubErrorTypes.INVALID_CHANNEL),
      StatusCodes.BAD_REQUEST,
      'Channel not found',
      `Your subscription is for a channel that does not exist.`,
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
  NEWS_NOT_FOUND,
  NEWS_CREATION_NOT_AUTHORIZED,
  NEWS_UPDATE_NOT_AUTHORIZED,
  INVALID_BODY,
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
  public constructor() {
    super(
      get_news_type(NewsErrorTypes.NEWS_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a news' +
        'You have to be a channel administator to create a news.'
    );
  }
}

export class NewsDeletionNotAuthorized extends NextError {
  public constructor() {
    super(
      get_news_type(NewsErrorTypes.NEWS_CREATION_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to create a news' +
        'You have to be a channel administator to create a news.'
    );
  }
}

export class NewsUpdateNotAuthorized extends NextError {
  public constructor() {
    super(
      get_news_type(NewsErrorTypes.NEWS_UPDATE_NOT_AUTHORIZED),
      StatusCodes.FORBIDDEN,
      'Missing authorization to update a news' +
        'You have to be a channel administator to create a news.'
    );
  }
}

export class NewsNotFound extends NextError {
  public constructor(id: string, options?: ErrorOptions) {
    super(
      get_news_type(NewsErrorTypes.NEWS_NOT_FOUND),
      StatusCodes.NOT_FOUND,
      'News not found',
      `${id} is not a valid id for a news`,
      options
    );
  }
}
