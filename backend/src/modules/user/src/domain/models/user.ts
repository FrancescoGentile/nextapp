//
//
//

import { UserID, UserRole } from "@nextapp/common/user";
import { UserInfo, IdentityInfo } from "./user.info";
import { Credentials } from "./user.credentials";

export class User{

    public id?: UserID;
    public readonly identityInfo: IdentityInfo;
    public readonly credentials: Credentials;
    public readonly userRole: UserRole;

    public readonly userInfo: UserInfo;
    public constructor(
        userInfo: UserInfo,
        identityInfo: IdentityInfo,
        credentials: Credentials,
        userRole: UserRole
    ){
        this.userInfo = userInfo;
        this.identityInfo = identityInfo;
        this.credentials = credentials;
        this.userRole = userRole;
    }

}