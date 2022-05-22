//
//
//

import { UserID, UserRole } from "@nextapp/common/user";
import { 
    Username, 
    Password 
} from "./user.credentials";
import { DateTime } from 'luxon';
import { Email } from "./email";

// TODO: check first_name, last_name not empty

export class User{

    public id?: UserID;
    public readonly userRole: UserRole;
    public readonly timestamp: DateTime;
    public readonly first_name: string;
    public readonly last_name: string;
    public readonly middle_name: string;
    public readonly username: Username;
    public readonly password: Password;
    public readonly email: Email;

    public constructor(
        first_name: string,
        last_name: string,
        isAdmin: boolean,
        username: Username,
        password: Password,
        email: string,
        id?: UserID,
        middle_name?: string
    ){  
        this.username = username;
        // this.password = Password.from_clear(password, this.username);
        this.password = password
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = Email.from_string(email);
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
                first_name: this.first_name,
                middle_name: this.middle_name,
                last_name: this.last_name,
                isAdmin: true,
                username: this.username.to_string(),
                password: this.password.to_string(),
                email: this.email.to_string(),
            };
        } else {
            return {
                id: this.id,
                first_name: this.first_name,
                middle_name: this.middle_name,
                last_name: this.last_name,
                isAdmin: false,
                username: this.username.to_string(),
                password: this.password.to_string(),
                email: this.email.to_string(),
            };
        }
    }
}
// NOT USED

// export interface SecurityInfo {
//     username: Username,
//     password: Password,
//     mfa: MFAInfo
//   }

//NOT USED
//   export interface MFAInfo {
//     enabled: boolean,
//     // mfa methods activated by the user
//     methods: MFA[],
//     // main messenger
//     // a messenger for 2fa cannot coincide with the main messenger
//     main?: MessengerID,
//     // ids of messenger channels registered by the user
//     // they will be communicated by the message service through an event
//     messengers: MessengerID[]
//  }