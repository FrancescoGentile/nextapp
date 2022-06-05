//
//
//

import { UserID } from '@nextapp/common/user';
import { Event, EventID } from '../models/event';
import { EventSub, EventSubID } from '../models/subevent';

export interface EventSubRepository {

  /**
   * Adds the given subscription to the repository.
   * This method returns undefined if the user or the channel do not exist in the repo.
   * @param sub
   */
  create_event_sub(sub: EventSub): Promise<EventSubID | undefined>;


  /**
   * Deletes the given subscription.
   * @param sub_id id of the subscription to delete
   */
  delete_event_sub(sub_id: EventSubID): Promise<boolean>;



  /**
   * returns the list of event subscriptions for the given user.
   * @param user_id
   */
  get_sub_event_list(user_id: UserID): Promise<EventSub[]>;

}