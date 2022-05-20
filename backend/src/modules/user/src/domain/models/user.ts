//
//
//

import { UserRole } from "@nextapp/common/user";
import { customAlphabet } from 'nanoid';
import { 
    Username, 
    Password 
} from "./user.credentials";
import { DateTime } from 'luxon';
import { InvalidUserID } from '../errors/errors.index';

export class UserID{
    public static readonly LENGTH = 10;
    private constructor(private readonly id: string) {}

    /**
     * Generate a random UserID.
     * @returns
     */
    public static generate(): UserID {
      const nanoid = customAlphabet('1234567890', UserID.LENGTH);
      return new UserID(nanoid());
    }
  
    public static from_string(id: string): UserID {
      if (/^[0-9]{10}$/.test(id)) {
        return new UserID(id);
      }
      throw new InvalidUserID(id);
    }
  
    public to_string(): string {
      return this.id;
    }
  
    public equals(other: UserID): boolean {
      return this.id === other.id;
    }
  }

export class User{

    public id?: UserID;
    public readonly userRole: UserRole;
    public readonly timestamp: DateTime;
    public readonly first_name: string;
    public readonly last_name: string;
    public readonly middle_name: string;
    public readonly username: Username;
    // private readonly password: Promise<Password>;
    private password?: Password;
    private password_ready: boolean = false;

    public constructor(
        id: UserID,
        first_name: string,
        last_name: string,
        isAdmin: boolean,
        username: string,
        password:string,
        middle_name?: string
    ){  
        this.username = Username.from_string(username);
        // this.password = Password.from_clear(password, this.username);
        Password.from_clear(password, this.username).then((value) => {
            this.password = value;
            this.password_ready = true;
        })
        this.first_name = first_name;
        this.last_name = last_name;
        if (isAdmin) {
            this.userRole = UserRole.SYS_ADMIN;
        } else {
            this.userRole = UserRole.SIMPLE;
        }
        this.middle_name = middle_name ?? "";
        this.id = UserID.generate();
        this.timestamp = DateTime.utc();
    }

    //returns Password asynchronously
    // public async get_password(): Promise<Password> {
    //     return this.password;
    // }

    //TODO: check password ready

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
