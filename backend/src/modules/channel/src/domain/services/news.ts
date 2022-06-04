//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { DateTime } from 'luxon';
import {
    NewsDeletionNotAuthorized, 
    NewsCreationNotAuthorized,
    NewsNotFound,
    NewsNameAlreadyUsed,
    NewsUpdateNotAuthorized,
} from '../errors';
import { NewsRepository } from '../ports/news.repository';
import { UserRepository } from '../ports/user.repository';
import { NewsInfoService } from '../ports/news.service';
import { ChannelID } from '../models/channel';
import { News, NewsID } from '../models/news';


export class NextNewsInfoService implements NewsInfoService {
    public constructor(
      private readonly news_repo: NewsRepository,
      private readonly user_repo: UserRepository
    ) {}

    public async create_news(user_id: UserID, channel: ChannelID, news: News): Promise<NewsID> {
        if (!(await this.is_channel_admin(user_id,channel))) {
            throw new NewsCreationNotAuthorized();
          }

        const id = await this.news_repo.create_news(news);
        if (id === undefined) {
            throw new NewsNameAlreadyUsed(news.title);
        }
        return id;

    }

    public async delete_news(user_id: UserID, news_id: NewsID): Promise<void> {
        const news_channel = (await this.news_repo.get_news_info(news_id)).channel;

        if (!(await this.is_channel_admin(user_id,news_channel))) {
            throw new NewsDeletionNotAuthorized();
          }

          const deleted = await this.news_repo.delete_news(news_id);
          if (!deleted) {
            throw new NewsNotFound(news_id.to_string());
          }
    }

    public async update_news(
        user_id: UserID, 
        news_id: NewsID, 
        title?: string, 
        date?: DateTime, 
        content?: string): Promise<void> {
            if (!(await this.is_channel_admin(user_id,(await this.news_repo.get_news_info(news_id)).channel))) {
                throw new NewsUpdateNotAuthorized();

            }
        
            if (title === undefined && date === undefined && content === undefined) {
                return;
            }

            const news = await this.news_repo.get_news_info(news_id);
            if (news === null) {
            throw new NewsNotFound(news_id.to_string());
            }

            const new_news = new News (
                news.title,
                news.author,
                news.date,
                news.body,
                news.channel,
                news.id
            );

            const updated = await this.news_repo.update_news(new_news);
            if (!updated) {
              throw new NewsNameAlreadyUsed(new_news.title);
            }


            
            }

        

    public async get_news_list(requester: UserID): Promise<News[]> {
        return this.news_repo.get_news_list();
    }

    public async get_news_info(requester: UserID, news_id: NewsID): Promise<News> {
        const news = await this.news_repo.get_news_info(news_id);
        if (news === null) {
            throw new NewsNotFound(news_id.to_string());
            }
        return news;
    }

    public async get_news_list_by_channel(requester: UserID, channel_id: string): Promise<News[]> {
        return this.news_repo.get_news_list_by_channel(channel_id);
    }   

    private async is_channel_admin(id: UserID,channel_id:ChannelID): Promise<boolean>{
        const role = await this.user_repo.is_channel_admin(id,channel_id);
        if (role === null) {
          throw new InternalServerError();
        }
        return role;
      }
}


