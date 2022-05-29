//
//
//

import { User } from '../models/user';

export interface InfoRepository {
  /**
   * Adds a new user to the repositor only if their id
   * does not already exist.
   * @param user
   */
  create_user(user: User): Promise<boolean>;
}
