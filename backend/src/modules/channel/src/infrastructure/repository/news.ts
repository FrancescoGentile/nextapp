//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { Driver } from 'neo4j-driver';
import {
  DateTime as NeoDateTime,
  Integer,
  int,
  Neo4jError,
} from 'neo4j-driver-core';
import { ChannelID } from '../../domain/models/channel';
import { News, NewsID } from '../../domain/models/news';
import { SearchOptions } from '../../domain/models/search';
import { NewsRepository } from '../../domain/ports/news.repository';

function luxon_to_neo4j(dt: DateTime): NeoDateTime {
  return new NeoDateTime<Integer>(
    int(dt.year),
    int(dt.month),
    int(dt.day),
    int(dt.hour),
    int(dt.minute),
    int(dt.second),
    int(0),
    int(dt.offset)
  );
}

function neo4j_to_luxon(dt: NeoDateTime): DateTime {
  return DateTime.fromISO(dt.toString()).toUTC();
}

export class Neo4jNewsRepository implements NewsRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jNewsRepository> {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_news_id IF NOT EXISTS
           FOR (n:CHANNEL_News)
           REQUIRE n.id IS UNIQUE`
        )
      );

      return new Neo4jNewsRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_news(news: News): Promise<NewsID> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = NewsID.generate();

        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `MATCH (u:CHANNEL_User), (c:CHANNEL_Channel)
               WHERE u.id = $author, c.id = $channel
               CREATE (u)-[:CHANNEL_AUTHOR]-(r:CHANNEL_News { id: $id, date: $date, title: $title, body: $body })-[:CHANNEL_POST]-(c)
            })`,
              {
                author: news.author.to_string(),
                channel: news.channel.to_string(),
                id: id.to_string(),
                date: luxon_to_neo4j(news.date),
                title: news.title,
                body: news.body,
              }
            )
          );

          return id;
        } catch (e) {
          const error = e as Neo4jError;
          if (
            error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed'
          ) {
            throw e;
          }
        }
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_news(news_id: NewsID): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (n:CHANNEL_News { id: $id })
           DETACH DELETE n`,
          { id: news_id.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async update_news(news: News): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (n:CHANNEL_News { id: $id })
           SET n.title = $title, n.body = $body`,
          { id: news.id!.to_string(), title: news.title, body: news.body }
        )
      );

      return res.summary.counters.updates().propertiesSet > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_news_list(
    user_id: UserID,
    options: SearchOptions
  ): Promise<News[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User { id: $id })--(c:CHANNEL_Channel)--(n:CHANNEL_News)--(a:CHANNEL_User)
           RETURN a.id as author, c.id AS channel, n
           ORDER BY n.date DESC
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const news = res.records.map((record) => {
        const channel = record.get('channel');
        const author = record.get('author');
        const { id, date, title, body } = record.get('n').properties;

        return new News(
          ChannelID.from_string(channel),
          new UserID(author),
          neo4j_to_luxon(date),
          title,
          body,
          NewsID.from_string(id)
        );
      });

      return news;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_news_list_by_channel(
    channel_id: ChannelID,
    options: SearchOptions
  ): Promise<News[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (n:CHANNEL_News)--(c:CHANNEL_Channel { id: $id }, (n)--(u:CHANNEL_User)
           RETURN n, u.id as author
           ORDER BY n.date DESC
           SKIP $skip
           LIMIT $limit`,
          {
            id: channel_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const news = res.records.map((record) => {
        const author = record.get('author');
        const { id, date, title, body } = record.get('n').properties;

        return new News(
          channel_id,
          new UserID(author),
          neo4j_to_luxon(date),
          title,
          body,
          NewsID.from_string(id)
        );
      });

      return news;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_news_info(news_id: NewsID): Promise<News | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (n:CHANNEL_News { id: $id }), (n)--(c:CHANNEL_Channel), (n)--(u:CHANNEL_User)
           RETURN n, c.id AS channel, u.id AS author`,
          { id: news_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const channel = res.records[0].get('channel');
      const author = res.records[0].get('author');
      const { id, date, title, body } = res.records[0].get('n').properties;

      return new News(
        ChannelID.from_string(channel),
        new UserID(author),
        neo4j_to_luxon(date),
        title,
        body,
        NewsID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}
