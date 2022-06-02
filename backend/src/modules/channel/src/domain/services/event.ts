//
//
//

import { UserID } from "@nextapp/common/user";
import { DateTime } from "luxon";
import { ChannelID } from "../models/channel";
import { Event, EventID } from "../models/event";
import { RoomID} from "@nextapp/common/room";
import { EventInfoService } from "../ports/event.service";
import { EventRepository } from "../ports/event.repository";
import { UserRepository } from '../ports/user.repository';
import { User } from "../models/user";
import { 
    EventCreationNotAuthorized,
    InternalServerError,
    EventNameAlreadyUsed,
    EventDeletionNotAuthorized,
    EventNotFound
} from "../errors/event";

export class NextEventInfoService implements EventInfoService {
    public constructor(
        private readonly events_repo: EventRepository,
        private readonly user_repo: UserRepository
    ) {}

    public async create_event(user: UserID, channel: ChannelID, event: Event): Promise<EventID> {
        if (!(await this.is_channel_admin(user,channel))) {
            throw new EventCreationNotAuthorized();
          }
          const id = await this.events_repo.create_event(event, channel);
          if (id === undefined) {
            throw new EventNameAlreadyUsed(event.name);
          }
          return id;
    }

    public async remove_event(user: UserID, event: EventID): Promise<void> {

         const event_channel = (await this.events_repo.get_event(event)).channel;

        if (!(await this.is_channel_admin(user,event_channel))) {
            throw new EventDeletionNotAuthorized();
          }

          const deleted = await this.events_repo.remove_event(event);
          if (!deleted) {
            throw new EventNotFound(event.to_string());
          }
    }
    public async update_event(
        user: UserID, 
        event: EventID,
        name?: string,
        description?: string, 
        start?: DateTime, 
        end?: DateTime, 
        room?: RoomID
        ): Promise<void> {
            const event_channel = (await this.events_repo.get_event(event)).channel;
            if (!(await this.is_channel_admin(user,event_channel))) {
                throw new EventDeletionNotAuthorized();
              }
            
            if (name === undefined && description === undefined && start === undefined && end === undefined && room === undefined) {
                return;
              }
            
            const event_obj = await this.events_repo.get_event(event);
            if (event_obj===null)
            {
                throw new EventNotFound(event.to_string());
            }

            const new_event = new Event(
                event_obj.channel,
                name ?? event_obj.name,
                description ?? event_obj.description,
                start ?? event_obj.start,
                end ?? event_obj.end,
                room ?? event_obj.room,                
                event_obj.id,
            );

            const updated = await this.events_repo.update_event(new_event);
            if (!updated) {
                throw new EventNameAlreadyUsed(new_event.name);
              }
    }
    public async get_event_list(user: UserID): Promise<Event[]> {
        return this.events_repo.get_event_list();
    }
    public async get_event_list_by_channel(user: UserID, channel: ChannelID): Promise<Event[]> {
        return this.events_repo.get_event_list_by_channel(channel);
    }
    public async get_event(user: UserID, event: EventID): Promise<Event> {
        return this.events_repo.get_event(event);
    }

    private async is_channel_admin(id: UserID,channel_id:ChannelID): Promise<boolean>{
        
      const role = await this.user_repo.is_channel_admin(id,channel_id);
      if (role === null) {
        throw new InternalServerError();
      }
      return role;
    }


}