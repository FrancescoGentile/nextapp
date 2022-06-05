//
//
//

import { UserID } from '@nextapp/common/user';
import {
  NewsDeletionNotAuthorized,
  NewsCreationNotAuthorized,
  NewsNotFound,
  NewsUpdateNotAuthorized,
} from '../errors';
import { NewsRepository } from '../ports/news.repository';
import { UserRepository } from '../ports/user.repository';
import { NewsInfoService } from '../ports/news.service';
import { News, NewsID } from '../models/news';
import { SearchOptions } from '../models/search';
import { ChannelID } from '../models/channel';

export class NextNewsInfoService implements NewsInfoService {
  public constructor(
    private readonly news_repo: NewsRepository,
    private readonly user_repo: UserRepository
  ) {}

  public async create_news(news: News): Promise<NewsID> {
    if (!(await this.user_repo.is_channel_admin(news.author, news.channel))) {
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

    if (!(await this.user_repo.is_channel_admin(user_id, news.channel))) {
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

    if (!(await this.user_repo.is_channel_admin(user_id, news.channel))) {
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

  public async get_news(
    requester: UserID,
    options: SearchOptions
  ): Promise<News[]> {
    return this.news_repo.get_news_list(requester, options);
  }

  public async get_news_info(
    requester: UserID,
    news_id: NewsID
  ): Promise<News> {
    const news = await this.news_repo.get_news_info(news_id);
    if (news === null) {
      throw new NewsNotFound(news_id.to_string());
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
    return this.news_repo.get_news_list_by_channel(channel_id, options);
  }
}
