//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';
import { Interval } from 'luxon';

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
    NAME_ALREADY_USED
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
