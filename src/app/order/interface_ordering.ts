interface BrandOwner_ui {
    autokey: string,
    createddate: string,
    n1: string,
    n5: number,
    n6: number,
    n7: number,
    n8: number,
    n9: number,
    n11: string,
    n12: number,
    n14: number,
    syskey: string,
    t1: string,
    t4: string,
    t5: string,
    transDetailsData: any,
    skuOrderType: {
        order: any,
        return: any,
        promotion: any
    },
    transType: number,
    userid: string,
    username: string,
    normalSkuTotalAmount: number,
    returnSkuTotalAmount: number,
    total100Percent: number,
    specialDiscount: number,
    invDiscount: number,
    hide: boolean,
    recordStatus: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n35: number,
    n36: number,
    n37: number,
    n38: number,
    promotionList: any

}
interface Sop003 {

    autokey: string,
    recordStatus: number,
    modifieddate: string,
    n1: string,
    n5: number,
    n6: number,
    n7: number,
    n8: number,
    n9: number,
    n11: string,
    n12: number,
    n14: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n35: number,
    n36: number,
    n37: number,
    n38: number,
    syskey: string,
    t1: string,
    t5: string,
    transDetailsData: any,
    transType: 0,
    userid: string,
    username: string,
    promotionList: any
}

interface Sop002 {
    syskey: string,
    recordStatus: number,
    ref1: string,
    ref2: string,
    ref3: string,
    parentid: string,
    t1: string,
    t2: string,//stock code
    t3: string,//stock name
    t4: string
    t6: string,
    t7: string,
    t15: string,
    n1: string,//stock sysksy
    n2: string,
    n3: string,
    n6: number,//qty
    n7: string,
    n8: number,
    n9: number,
    n10: number,//price
    n11: number,// discount
    n12: number,
    n13: number,
    n14: number,
    n23: number,
    n34: number,
    n35: string,
    n36: number,
    n37: number,
    n39: number,
    n40: number,// return or order
    n42: number,
    stockPromotionDetailData: any
}
interface Sop002_Interface {
    syskey: string,
    recordStatus: number,
    ref1: string,
    ref2: string,
    ref3: string,
    parentid: string,
    parentSkuSyskey: string,
    t2: string,//stock code
    t3: string,//stock name
    t7: string,
    n1: string,//stock sysksy
    n2: string,
    n3: string,
    n6: number,//qty
    n7: string,
    n8: number,
    n9: number,
    n10: number,//price
    n11: number,// discount
    n12: number,
    n13: number,
    n14: number,
    n23: number,
    n34: number,
    n35: string,
    n36: number,
    n37: number,
    n39: number,
    n40: number,// return or order
    n42: number,
    stockPromotionDetailData: any, // child for parent
    stockPromotionSubDetailData: any, //subchild for child
    isEndTypeTotalItem: boolean,
    discountItemEndType: string, // OR, AND, END
    maxQty: number
}
interface MultiDiscount {
    giftList: any,
    discountPercent: number,
    itemSyskey: string,
    beforeDiscountTotal: number,
    discountDetailSyskey: string,
    beforeDisItemAmt: number,
    afterDisItemAmt: number,
    discountAmount: number,
    itemDesc: string,
    afterDiscountTotal: number
}
interface MultiDiscount_Gift {
    discountItemEndType: string,
    discountStockCode: string,
    discountItemDesc: string,
    discountItemQty: number,
    discountItemType: string,
    discountStockSyskey: string,
    discountItemSyskey: string,
    discountGiftCode: string,
    discountItemRuleType: string
}