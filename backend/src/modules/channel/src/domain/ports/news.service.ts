//
//
//

import { UserID } from '@nextapp/common/user';
import { ChannelID } from '../models/channel';
import { News, NewsID } from '../models/news';
import { SearchOptions } from '../models/search';

export interface NewsInfoService {
  /**
   * Creates a new news
   */
  create_news(news: News): Promise<NewsID>;

  /**
   * Deletes a news
   * @param user_id the user who wants to delete the news
   * @param news_id the news to delete
   */
  delete_news(user_id: UserID, news_id: NewsID): Promise<void>;

  /**
   * Updates a news
   * @param user_id the user who wants to update the news
   * @param news_id the news to update
   * @param title the new title
   * @param date the new date
   * @param content the new content
   */
  update_news(
    user_id: UserID,
    news_id: NewsID,
    title?: string,
    content?: string
  ): Promise<void>;

  /**
   * Gets a list oif all the news.
   * @param requester the user who wants to get the news list
   */
  get_news_list(requester: UserID, options: SearchOptions): Promise<News[]>;

  /**
   * Gets all the news from a specific channel.
   * @param requester the user who wants to get the news list
   * @param channel_id the channel where the news will be taken from
   */
  get_news_list_by_channel(
    requester: UserID,
    channel_id: ChannelID,
    options: SearchOptions
  ): Promise<News[]>;

  /**
   * Retrieves the info about a specific news.
   * @param requester the user who wants to get the news
   * @param news_id the news to retrieve
   *
   */
  get_news_info(requester: UserID, news_id: NewsID): Promise<News>;
}
