export interface UserData {
    syskey: string,
    loginUserId: string,
    loginUserName: string,
    userId: string,
    userName: string,
    password: string,
    orgId: string,
    status: string,
    phone: string,
    otp: string,
    location: string,
    deviceId: string,
    email: string,
    teamSyskey: string,
    usertype: number,
    merchandizer: number,
    requestType: number,
    address: string,
    dob: string,
    webSite: string,
    sex: string,
    mmName: string,
    nrc: string,
    imageUrl: string,
    otherID: string,
    roleData: any,
    teamtype: number,
    loginUserRoles: any,
    multiUserType: any
}
export interface UserAndUTypeJunctionData {
    syskey: string,
    autokey: number,
    createddate: string,
    modifieddate: string,
    userid: string,
    username: string,
    RecordStatus: number,
    SyncStatus: number,
    SyncBatch: number,
    t1: string,
    t2: string,
    t3: string,
    t4: string,
    t5: string,
    t6: string,
    t7: string,
    t8: string,
    t9: string,
    t10: string,
    t11: string,
    t12: string,
    t13: string,
    t14: string,
    t15: string,
    t16: string,
    t17: string,
    t18: string,
    t19: string,
    t20: string,
    n1: string,
    n2: string,
    n3: string,
    n4: string,
    n5: string,
    n6: string,
    n7: string,
    n8: string,
    n9: string,
    n10: string,
    n11: number,
    n12: number,
    n13: number,
    n14: number,
    n15: number,
    UserSysKey: string,
    n16: number,
    n17: number,
    n18: number,
    n19: number,
    n20: number,
    n21: number,
    n22: number,
    n23: number,
    n24: number,
    n25: number,
    n26: number,
    n27: number,
    n28: number,
    n29: number,
    n30: number,
    team : TeamData
}
export interface TeamData {
    syskey : string,
    code : string, 
    description : string,
    t1 : string,
    t2 : string ,
    createDate : string,
    modifiedDate :string
    recordStatus : number
}