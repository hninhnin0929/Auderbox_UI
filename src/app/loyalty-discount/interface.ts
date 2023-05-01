export interface MyStore {
    no:number,
    shop_name: string,
    shop_code:string,
    shop_syskey:string,
    shop_address:string,
    check:boolean,
    red_reb:number,
    active:boolean,
    state_syskey:string,
    state_name:string,
    district_syskey:string,
    district_name:string,
    township_syskey:string,
    township_name:string
    town_syskey:string,
    town_name:string,
    ward_village_name:string,
    ward_village_syskey:string,
}
export interface ResultData<T>{
    totalCount:number,
    dataList:any,
    data:T,
    status:string,
    cause:string
}