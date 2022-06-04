import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import { News, NewsID } from '../models/news';
import { ChannelID } from '../models/channel';

export interface NewsInfoService {


    /**
     * Creates a new news 
     * @param user_id the user who wants to create the news
     * @param channel the channel where the news will be published
     * @param news the news to create
     */
    create_news(user_id: UserID, channel: ChannelID, news:News): Promise<NewsID>;

    /**
     * Deletes a news
     * @param user_id the user who wants to delete the news
     * @param news_id the news to delete
     */
    delete_news(user_id: UserID, news_id: NewsID): Promise<void>;

    /**
     * Updates a news
     * @param user_id the user who wants to update the news
     *  @param news_id the news to update
     * @param title the new title
     * @param date the new date
     * @param content the new content
     */
    update_news(user_id: UserID,news_id:NewsID, title:string, date:DateTime, content:string): Promise<void>;

    /**
     * Gets a list oif all the news.
     * @param requester the user who wants to get the news list
     */
    get_news_list(requester: UserID): Promise<News[]>;

    /**
     * Gets all the news from a specific channel.
     * @param requester the user who wants to get the news list
     * @param channel_id the channel where the news will be taken from
     */
    get_news_list_by_channel(requester: UserID, channel_id: string): Promise<News[]>;

    /**
     * Retrieves the info about a specific news.
     * @param requester the user who wants to get the news
     * @param news_id the news to retrieve
     * 
     */
    get_news_info(requester: UserID,news_id: NewsID): Promise<News >;

}
