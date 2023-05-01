import { PaginationData } from "../com-interface";

export interface getSaleOrderTran{
    date:string,
	currentRow:number,
	maxRow:number,
	estiDeliDate: string,
	shopNameCri: any,
	soUsers: any
}
export interface RoutingData{
    shopCode : string,
	shopName: string,
	address: string,
	date: string,
	type: string,	
	shopSyskey: string,
	userSyskey: string
}
export interface ShopPersonData extends PaginationData{
    userSysKey: string,
	shopSysKeyList: any,
	teamSysKey: string,
	shopSysKey1: string,
	shopList: any,
	t1: string,
	t2: string,
	createdDate: string,
	modifiedDate: string,
	recordStatus: number,
	n1: string,
	n2: string,
	n3: string,
	userName: string,
	shopName: string,
	type: string,
	id: string,
	descr: string,
	teamName: string,
	typeDataList: any,
}
export interface myStoreData{
	no:number,
	shop_syskey:string,
	shop_code:string,
	shop_name:string,
	shop_address:string,
	order_syskey:string,
	order_date:any,
	delivery_date:any,
	order_no: string,
	check:boolean
}
export interface RoutingScheduleData {
	shopCode : string,
	shopName: string,
	address: string,
	date: string,
	type: string,	
	n1: string,
	n2: string,
	n3: string,
	t1: string,
	t2: string,
	t3: string,
	recordStatus: number,
	shopSyskey: string,
	savestatus,
	userId: string,
	userName: string,
	userSyskeyrSk: string,
	syskey:string,
	

}