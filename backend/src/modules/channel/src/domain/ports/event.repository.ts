//
//
//
import {Event, EventID} from '../models/event'
import { Channel, ChannelID } from '../models/channel';

export interface EventRepository {
    
    /**
     * Creates a new event in the specified channel.
     * @param event The event to create
     * @param channel The channel where the event will be created
     */
    create_event(event: Event, channel:ChannelID): Promise<EventID>;

    /**
     * Removes an event
     * @param event The id of the event to remove
     */
    remove_event(event: EventID): Promise<boolean>;

    /**
     * Updates an event
     * @param event_id The id of the event to update
     * @param event The new event
     */
    update_event(event: Event): Promise<boolean>;

    /**
     * lists all the events
     */
    get_event_list():Promise <Event[]>;

    /**
     * gets the list of events associated with a channel
     * @param channel The channel where the events are.
     */
    get_event_list_by_channel(channel: ChannelID):Promise <Event[]>;

    /**
     * gets the single event
     * @param event_id The id of the event to get.
     */
    get_event(event_id : EventID): Promise <Event>;


}