import { PaginationData } from "../com-interface";

export interface getAvariableShopAll {
    current: number,
    maxrow: number,
    name: string,
    zonesyskey: string
}
export interface check_store {
    syskey: string,
    name: string,
    code: string,
    check: boolean,
    inactive: boolean,
    checked_index: number
}
export interface check_store_list {
    page: number,
    list: any
}
export interface store_from_server {
    add: string
    code: string
    currcode: string
    curroptr: string
    currrate: number
    cussyskey: string
    email: string
    name: string
    pband: string
    phoneno: string
    route: string
    rownum: number
    terms: string
    totalcount: number
    visited: string
}

export interface sku {
    stockSyskey: string
    stockCode: string
    stockDesc: string
    boSyskey: string
    boDesc: string
    brandSyskey: string
    brandDesc: string
    selected: boolean
}

export interface zone extends PaginationData{
    
    syskey: string,
    code: string,
    description: string,
    createDate: string,
    modifiedDate: string,
    recordStatus: number,
    n1: string,
    n2: string,
    n3: string,
    n4: string,
    n5: string,
    t1: string,
    t2: string,
    t3: string,
    t4: string,
    t5: string,
    shopList :any,
    skuList : any
}