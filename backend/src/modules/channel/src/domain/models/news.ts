//
//
//

import { UserID } from '@nextapp/common/user';
import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';
import { ChannelID } from './channel';
import { InvalidNewsID, InvalidNewsBody, InvalidNewsTitle } from '../errors';

/**
 * ID associated to a news.
 * It is a string of 11 characters (similar to Youtube videos ids)
 */
export class NewsID {
  public static readonly LENGTH = 11;

  private constructor(private readonly id: string) {}

  /**
   * Generate a random NewsID.
   * @returns
   */
  public static generate(): NewsID {
    const nanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-',
      NewsID.LENGTH
    );
    return new NewsID(nanoid());
  }

  public static from_string(id: string): NewsID {
    if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
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

/**
 * Class that contains all the info associated to a news.
 */
export class News {
  public id?: NewsID;

  public readonly channel: ChannelID;

  public readonly author: UserID;

  public readonly date: DateTime;

  public readonly title: string;

  public readonly body: string;

  public constructor(
    channel: ChannelID,
    author: UserID,
    date: DateTime,
    title: string,
    body: string,
    id?: NewsID
  ) {
    if (title.trim() === '' || title.length > 100) {
      throw new InvalidNewsTitle();
    }
    if (body.trim() === '' || body.length > 5000) {
      throw new InvalidNewsBody();
    }

    this.title = title;
    this.body = body;
    this.author = author;
    this.channel = channel;
    this.date = date;
    this.id = id;
  }

  public set_id(id: NewsID) {
    this.id = id;
  }
}
