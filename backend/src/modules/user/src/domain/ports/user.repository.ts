import { UserID, UserRole } from '@nextapp/common/user';
import { User } from '../models/user';

export interface UserRepository {
    /**
     * Gets the user list.
     * @param user_id the user id who wants to get the list of all users
     */
    get_user_list(user_id: UserID): Promise<User[]>;
}