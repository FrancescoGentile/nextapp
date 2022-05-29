//
//
//

import { customAlphabet } from 'nanoid';
import {
    InvalidChannelID,
    InvalidChannelName,
    InvalidChannelDescription
} from '../errors';

export class ChannelID {
    public static readonly LENGTH = 10;
  
    private constructor(private readonly id: string) {}
  
    /**
     * Generate a random ChannelID.
     * @returns
     */
    public static generate(): ChannelID {
      const nanoid = customAlphabet('1234567890', ChannelID.LENGTH);
      return new ChannelID(nanoid());
    }
  
    public static from_string(id: string): ChannelID {
      if (/^[0-9]{10}$/.test(id)) {
        return new ChannelID(id);
      }
      throw new InvalidChannelID(id);
    }
  
    public to_string(): string {
      return this.id;
    }
  
    public equals(other: ChannelID): boolean {
      return this.id === other.id;
    }  

}
  
export class Channel {
    public id?: ChannelID;

    public readonly name: string;

    public readonly description: string;

    public constructor(
        name: string,
        description: string,
        id?: ChannelID
    ){
        if (!/^[a-zA-Z0-9_-]{5,100}$/.test(name)) {
            throw new InvalidChannelName(name);
        }
        if (!/^[a-zA-Z0-9_-]{5,300}$/.test(description)) {
            throw new InvalidChannelDescription(description);
        }
        this.name = name;
        this.description = description;
        this.id = id;
    }

    public set_id(id: ChannelID) {
        this.id = id;
      }

}