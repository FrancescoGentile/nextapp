import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';
import {
    InvalidEventID,
    InvalidEventName,
    InvalidEventDate,
    InvalidRoomID
} from '../errors/event';

import { ChannelID } from './channel';
import { RoomID} from '@nextapp/common/room';

export class EventID{
    public static readonly LENGTH = 10;
  
    private constructor(private readonly id: string) {
      
    }
  
    /**
     * Generate a random ChannelID.
     * @returns
     */
    public static generate(): EventID {
      const nanoid = customAlphabet('1234567890', EventID.LENGTH);
      return new EventID(nanoid());
    }
  
    public static from_string(id: string): EventID {
      if (/^[0-9]{10}$/.test(id)) {
        return new EventID(id);
      }
      throw new InvalidEventID(id);
    }
  
    public to_string(): string {
      return this.id;
    }
  
    public equals(other: EventID): boolean {
      return this.id === other.id;


}
}

export class Event{
    public id? : EventID;
    public readonly channel : ChannelID;
    public readonly name: string;
    public readonly description: string;
    public readonly start: DateTime;
    public readonly end: DateTime;
    public readonly room: RoomID;

    public constructor(
        channel : ChannelID,
        name : string,
        description : string,
        start : DateTime,
        end : DateTime,
        room : RoomID,
        id? : EventID
    ){
          if (!/^[a-zA-Z0-9_-]{5,100}$/.test(name)) {
            throw new InvalidEventName(name);
          }
        
        if (start > end) {
            throw new InvalidEventDate(start, end);
          }
        this.channel = channel;
        this.name = name;
        this.description = description;
        this.start = start;
        this.end = end;
        this.room = room;
        this.id= id;
    }
    public set_id(id: EventID) {
        this.id = id;
      }

}