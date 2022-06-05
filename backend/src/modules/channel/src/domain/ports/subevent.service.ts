//
//
//

import { UserID } from '@nextapp/common/user';
import { DateTime } from 'luxon';
import {  EventID } from '../models/event';
import { EventSub, EventSubID } from '../models/subevent';

export interface SubEventService {
  
  /**
   * Creates a new subscription for the given user and event
   * This method throw an error if the given information are not correct.
   * @param user_id
   * @param event_id
   */
  create_event_sub(
    user_id: UserID,
    EventID: EventID
  ): Promise<EventSubID>;


  /**
   * Delete the given subscription.
   * 
   * 
   * 
   */
  delete_event_sub(
    user_id: UserID,
    sub_id: EventSubID): Promise<void>;


  /**
   * returns the list of event subscriptions for the given user.
   * @param user_id
   */
  get_sub_event_list(
    user_id: UserID,
  ): Promise<EventSub[]>;


}

