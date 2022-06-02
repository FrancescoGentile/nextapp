import { NextError, StatusCodes } from '@nextapp/common/error';
import { Channel } from '../models/channel';
import { DateTime } from 'luxon';
import { RoomID } from '@nextapp/common/room';
export { InternalServerError } from '@nextapp/common/error';

enum EventErrorTypes {
    INVALID_ID = 1,
    INVALID_NAME,
    INVALID_DESCRIPTION,
    EVENT_NOT_FOUND,
    EVENT_CREATION_NOT_AUTHORIZED,
    NAME_ALREADY_USED,
    INVALID_PRESIDENT_NUMBERS
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
        `${id} is not a valid id for an event`,
        options
        );
    }
}

export class InvalidEventName extends NextError {
    public constructor(name: string, options?: ErrorOptions) {
        super(
        get_event_type(EventErrorTypes.INVALID_NAME),
        StatusCodes.BAD_REQUEST,
        'Invalid event name',
        `${name} does not meet on or both of the following conditions: ` +
        `length between 5 and 100 characters, ` +
        `only lowercase and uppercase Latin letters, Arabic numerals, underscores and dashes.`,
      options
        );
    }
}

export class InvalidEventDate extends NextError {
    public constructor(start: DateTime, end : DateTime, options?: ErrorOptions) {
        super(
        get_event_type(EventErrorTypes.INVALID_DESCRIPTION),
        StatusCodes.BAD_REQUEST,
        'Invalid event date',
        `${start}  (start date/time) follows ${end} (end date/time) `,
      options
        );
    }
}

export class InvalidRoomID extends NextError {
    public constructor(id: RoomID, options?: ErrorOptions) {
        super(
        get_event_type(EventErrorTypes.INVALID_ID),
        StatusCodes.BAD_REQUEST,
        'Invalid room id',
        `${id} is not a valid id for a room`,
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
        'You have to be a system administator to create an event.',
        options
        );
    }
}

export class EventNameAlreadyUsed extends NextError {
    public constructor(name: string, options?: ErrorOptions) {
        super(
        get_event_type(EventErrorTypes.NAME_ALREADY_USED),
        StatusCodes.CONFLICT,
        'Name already used',
        `${name} is already assigned to another event. Try another name.`,
        options
        );
    }
}

export class EventDeletionNotAuthorized extends NextError{
  public constructor(options?: ErrorOptions){
    super(
        get_event_type(EventErrorTypes.NAME_ALREADY_USED),
        StatusCodes.CONFLICT,
        'Name already used',
        `${name} is already assigned to another event. Try another name.`,
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
        `${id} is not a valid id for an event`,
        options
        );
    }
}
