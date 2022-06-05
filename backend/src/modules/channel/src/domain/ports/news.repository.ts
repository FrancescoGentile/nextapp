//
//
//

import { UserID } from '@nextapp/common/user';
import { ChannelID } from '../models/channel';
import { NewsID, News } from '../models/news';
import { SearchOptions } from '../models/search';

export interface NewsRepository {
  /**
   * Creates a new news
   * @param news the news to create
   * @returns the id of the news
   */
  create_news(news: News): Promise<NewsID>;

  /**
   * Deletes a news
   * @param news_id the news to delete
   * @returns failure or success
   */
  delete_news(news_id: NewsID): Promise<boolean>;

  /**
   * Updates a news
   * @param news the news to update
   */
  update_news(news: News): Promise<boolean>;

  /**
   * Retrieves a list of all news
   *
   */
  get_news_list(user_id: UserID, options: SearchOptions): Promise<News[]>;

  /**
   * gets all the news from a specific channel
   * @param channel_id the channel where the news will be taken from
   */
  get_news_list_by_channel(
    channel_id: ChannelID,
    options: SearchOptions
  ): Promise<News[]>;

  /**
   * Gets a specific news if it exists.
   * @param news_id the news to retrieve
   */
  get_news_info(news_id: NewsID): Promise<News | null>;
}
