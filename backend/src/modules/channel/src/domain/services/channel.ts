//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import {
  ChannelNotFound, 
  ChannelCreationNotAuthorized,
  ChannelNameAlreadyUsed,
  InvalidPresidentsNumber,
  NoChannelAvailable,
  UserNotAPresident,
  ChannelNameNotFound,
  PresidentNotAUser
} from '../errors';
import { ChannelID, Channel } from '../models/channel';
import { ChannelRepository } from '../ports/channel.repository';
import { ChannelInfoService } from '../ports/channel.service';
import { UserRepository } from '../ports/user.repository';
import { SearchOptions } from '../models/search';
import { SubRepository } from '../ports/sub.repository';
import { Sub, SubID } from '../models/sub';

export class NextChannelInfoService implements ChannelInfoService {
  public constructor(
    private readonly channel_repo: ChannelRepository,
    private readonly user_repo: UserRepository,
    private readonly sub_repo: SubRepository
  ) {}

  public async get_channel_by_name(channel_name: string): Promise<Channel> {
    const channel = await this.channel_repo.get_channel_by_name(channel_name);
    if (channel === null) {
      throw new ChannelNameNotFound(channel_name);
    }
    return channel;
  }

  public async update_channel(requester: UserID, channel: Channel): Promise<boolean> {
    
    const is_pres = this.channel_repo.is_president(requester, channel.id!);

    if(!is_pres){
      throw new UserNotAPresident(requester.to_string());
    }

    const updated = await this.channel_repo.update_channel(channel);
    if (!updated) {
      throw new ChannelNameAlreadyUsed(channel.name);
    }
    
    return updated;
    
  }
  
  public async get_channel(id: ChannelID): Promise<Channel> {
    const channel = await this.channel_repo.get_channel(id);
    if (channel === null) {
      throw new ChannelNotFound(id.to_string());
    }
    return channel;
  }
  
  public async create_channel(admin: UserID, channel: Channel): Promise<ChannelID> {
    if (!(await this.is_admin(admin))) {
      throw new ChannelCreationNotAuthorized();
    }
    if (
      channel.presID_array.length > Channel.MAX_PRESIDENTS 
      || channel.presID_array.length < Channel.MIN_PRESIDENTS 
    ) {
      throw new InvalidPresidentsNumber(channel.presID_array.length);
    }
    for(const pres of channel.presID_array){
      const role = await this.user_repo.get_user_role(pres);
      if(role === null){
        throw new PresidentNotAUser(pres);
      }
    }
    const id = await this.channel_repo.create_channel(channel);
    if (id === undefined) {
      throw new ChannelNameAlreadyUsed(channel.name);
    }
    for(const pres of channel.presID_array){
      if(! await this.sub_repo.is_sub(pres, id)){
        const subscription: Sub = 
            {
              id: SubID.generate(),
              user: pres,
              channel: id,
            };
        await this.sub_repo.create_sub(subscription);
      }
    }
    return id;
  }
  
  
  public async get_channel_list(requester: UserID, options: SearchOptions): Promise<Channel[]> {
    const channels = await this.channel_repo.get_channel_list(options);
    if(channels == null){
      throw new NoChannelAvailable();
    }
    return channels;
  }

  public async delete_channel(user_id: UserID, channel_id: ChannelID): Promise<void> {
    if (!(await this.is_admin(user_id))) {
      throw new ChannelCreationNotAuthorized();
    }
    const deleted = await this.channel_repo.delete_channel(channel_id);
    if (!deleted) {
      throw new ChannelNotFound(channel_id.to_string());
    }
  }
  
  public async get_pres_channels(requester: UserID, options: SearchOptions): Promise<Channel[]> {
    const channels = await this.channel_repo.get_channel_list(options);
    if(channels == null){
      throw new UserNotAPresident(requester.to_string());
    }
    return channels;
  }
  
  private async is_admin(user_id: UserID): Promise<boolean> {
    const role = await this.user_repo.get_user_role(user_id);
    if (role === null) {
      // the user with the given id has still not been created
      throw new InternalServerError();
    }
    return role === UserRole.SYS_ADMIN;
  }
  
  public async is_president(user_id: UserID, channel_id: ChannelID): Promise<boolean | null>{
    const is_pres = await this.channel_repo.is_president(user_id, channel_id);
    return is_pres;
  }
  

}
