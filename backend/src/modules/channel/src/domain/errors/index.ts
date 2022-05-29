//
//
//

import { NextError, StatusCodes } from '@nextapp/common/error';
import { Interval } from 'luxon';

export { InternalServerError } from '@nextapp/common/error';

enum ChannelErrorTypes {
    INVALID_ID = 1,
    INVALID_NAME,
    INVALID_DESCRIPTION
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