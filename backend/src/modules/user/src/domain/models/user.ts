//
//
//

import { UserID, UserRole } from "@nextapp/common/user";
import { 
    Username, 
    Password 
} from "./user.credentials";
import { DateTime } from 'luxon';

// TODO: check first_name, last_name not empty

export class User{

    public id?: UserID;
    public readonly userRole: UserRole;
    public readonly timestamp: DateTime;
    public readonly first_name: string;
    public readonly last_name: string;
    public readonly middle_name: string;
    public readonly username: Username;
    private password?: Password;

    public constructor(
        first_name: string,
        last_name: string,
        isAdmin: boolean,
        username: Username,
        password: Password,
        id?: UserID,
        middle_name?: string
    ){  
        this.username = username;
        // this.password = Password.from_clear(password, this.username);
        this.password = password
        this.first_name = first_name;
        this.last_name = last_name;
        if (isAdmin) {
            this.userRole = UserRole.SYS_ADMIN;
        } else {
            this.userRole = UserRole.SIMPLE;
        }
        this.middle_name = middle_name ?? "";
        this.id = id;
        this.timestamp = DateTime.utc();
    }

    //TODO: check Password

    public toJson() {
        if (this.userRole === UserRole.SYS_ADMIN) {
            return {
                id: this.id,
                name: this.first_name,
                surname: this.last_name,
                isAdmin: true,
                username: this.username.to_string(),
                password: this.password?.to_string()
            };
        } else {
            return {
                id: this.id,
                name: this.first_name,
                surname: this.last_name,
                isAdmin: false,
                username: this.username.to_string(),
                password: this.password?.to_string()
            };
        }
    }
}
