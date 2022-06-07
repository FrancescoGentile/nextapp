//
//
//

import { UserID } from '@nextapp/common/user';
import {
  NewsDeletionNotAuthorized,
  NewsCreationNotAuthorized,
  NewsNotFound,
  NewsUpdateNotAuthorized,
  NewsViewNotAuthorized,
} from '../errors';
import { NewsRepository } from '../ports/news.repository';
import { NewsInfoService } from '../ports/news.service';
import { News, NewsID } from '../models/news';
import { SearchOptions } from '../models/search';
import { ChannelID } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { SubRepository } from '../ports/sub.repository';

export class NextNewsInfoService implements NewsInfoService {
  public constructor(
    private readonly news_repo: NewsRepository,
    private readonly channel_repo: ChannelRepository,
    private readonly sub_repo: SubRepository
  ) {}

  public async create_news(news: News): Promise<NewsID> {
    if (!(await this.channel_repo.is_president(news.author, news.channel))) {
      throw new NewsCreationNotAuthorized();
    }

    const id = await this.news_repo.create_news(news);
    return id;
  }

  public async delete_news(user_id: UserID, news_id: NewsID): Promise<void> {
    const news = await this.news_repo.get_news_info(news_id);
    if (news === null) {
      throw new NewsNotFound(news_id.to_string());
    }

    if (!(await this.channel_repo.is_president(user_id, news.channel))) {
      throw new NewsDeletionNotAuthorized();
    }

    const deleted = await this.news_repo.delete_news(news_id);
    if (!deleted) {
      // it should not happend
      throw new NewsNotFound(news_id.to_string());
    }
  }

  public async update_news(
    user_id: UserID,
    news_id: NewsID,
    title?: string,
    body?: string
  ): Promise<void> {
    const news = await this.news_repo.get_news_info(news_id);
    if (news === null) {
      throw new NewsNotFound(news_id.to_string());
    }

    if (!(await this.channel_repo.is_president(user_id, news.channel))) {
      throw new NewsUpdateNotAuthorized();
    }

    if (title === undefined && body === undefined) {
      return;
    }

    const new_news = new News(
      news.channel,
      news.author,
      news.date,
      title || news.title,
      body || news.body,
      news.id!
    );

    const updated = await this.news_repo.update_news(new_news);
    if (!updated) {
      // it should not happen
      throw new NewsNotFound(news_id.to_string());
    }
  }

  public async get_news_info(
    requester: UserID,
    news_id: NewsID
  ): Promise<News> {
    const news = await this.news_repo.get_news_info(news_id);
    if (news === null) {
      throw new NewsNotFound(news_id.to_string());
    }

    const is_sub = await this.sub_repo.is_sub(requester, news.channel);
    if (!is_sub) {
      throw new NewsViewNotAuthorized();
    }

    return news;
  }

  public async get_news_list(
    requester: UserID,
    options: SearchOptions
  ): Promise<News[]> {
    return this.news_repo.get_news_list(requester, options);
  }

  public async get_news_list_by_channel(
    requester: UserID,
    channel_id: ChannelID,
    options: SearchOptions
  ): Promise<News[]> {
    const is_sub = await this.sub_repo.is_sub(requester, channel_id);
    if (!is_sub) {
      throw new NewsViewNotAuthorized();
    }
    return this.news_repo.get_news_list_by_channel(channel_id, options);
  }
}
