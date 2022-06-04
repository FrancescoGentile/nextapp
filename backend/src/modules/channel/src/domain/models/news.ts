//
//
//

import { UserID } from '@nextapp/common/user';
import { ChannelID } from './channel';
import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';
import {
    InvalidNewsID,
    InvalidNewsName,
    InvalidNewsBody
} from '../errors/';

export class NewsID {
    public static readonly LENGTH = 10;
  
    private constructor(private readonly id: string) {}
  
    /**
     * Generate a random NewsID.
     * @returns
     */
    public static generate(): NewsID {
      const nanoid = customAlphabet('1234567890', NewsID.LENGTH);
      return new NewsID(nanoid());
    }
  
    public static from_string(id: string): NewsID {
      if (/^[0-9]{10}$/.test(id)) {
        return new NewsID(id);
      }
      throw new InvalidNewsID(id);
    }
  
    public to_string(): string {
      return this.id;
    }
  
    public equals(other: NewsID): boolean {
      return this.id === other.id;
    }  

}
  
export class News {
  
    public static readonly MAX_PRESIDENTS = 4;
    public static readonly MIN_PRESIDENTS = 1;
    
    public id?: NewsID;

    public readonly title: string;

    public readonly author: UserID;

    public readonly date: DateTime;

    public readonly body: string;

    public readonly channel: ChannelID;

    public constructor(
        title: string,
        author: UserID,
        date: DateTime,
        body: string,
        channel: ChannelID,
        id?: NewsID
    ){
        if (!/^[a-zA-Z0-9_-]{5,100}$/.test(title)) {
            throw new InvalidNewsName(title);
        }
        if (!/^[a-zA-Z0-9_-]{5,5000}$/.test(body)) {
            throw new InvalidNewsBody(body);
        }

        this.title = title;
        this.body= body;
        this.author = author;
        this.channel = channel;
        this.date = date;
        this.id = id;
    }

    public set_id(id: NewsID) {
        this.id = id;
      }

}