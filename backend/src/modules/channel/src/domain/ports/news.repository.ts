//
//
//

import { UserID } from '@nextapp/common/user';
import {NewsID, News } from '../models/news';

import { SearchOptions } from '../models/search';
import { Sub, SubID } from '../models/sub';



export interface NewsRepository {

    /**
     * Creates a new news
     * @param news the news to create
     * @returns the id of the news
     */
    create_news(news: News): Promise<NewsID | undefined>;

    /**
     * Deletes a news
     * @param news_id the news to delete
     * @returns failure or success
     */
    delete_news(news_id : NewsID): Promise<boolean>;

    /**
     * Updates a news
     * @param news the news to update
     */
    update_news(news: News): Promise<boolean>;

    /**
     * Retrieves a list of all news
     * 
     */
    get_news_list(): Promise<News[]>;

    /**
     * gets all the news from a specific channel
     * @param channel_id the channel where the news will be taken from
     */
    get_news_list_by_channel(channel_id: string): Promise<News[]>;

    /**
     * Gets a specific news
     * @param news_id the news to retrieve
     */
    get_news_info(news_id: NewsID): Promise<News>;


}