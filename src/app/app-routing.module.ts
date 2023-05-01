import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FormControlService } from './form-control.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'url',
    loadChildren: () => import('./url/url.module').then(m => m.UrlPageModule)
  },
  {
    path: 'url-config',
    loadChildren: () => import('./url-config/url-config.module').then(m => m.UrlConfigPageModule)

  },

  {
    path: 'menu-list',
    loadChildren: () => import('./menu-list/menu-list.module').then(m => m.MenuListPageModule)
    , canLoad: [FormControlService]


  },
  {
    path: 'menu-new',
    loadChildren: () => import('./menu-new/menu-new.module').then(m => m.MenuNewPageModule)
    , canLoad: [FormControlService]

  },
  {
    path: 'popover',
    loadChildren: () => import('./popover/popover.module').then(m => m.PopoverPageModule)

  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'user-list',
    loadChildren: () => import('./user-list/user-list.module').then(m => m.UserListPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'role',
    loadChildren: () => import('./role/role.module').then(m => m.RolePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'role-list',
    loadChildren: () => import('./role-list/role-list.module').then(m => m.RoleListPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.module').then(m => m.ShopPageModule)
    , canLoad: [FormControlService]

  },
  {
    path: 'security',
    loadChildren: () => import('./security/security.module').then(m => m.SecurityPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'stock',
    loadChildren: () => import('./stock/stock.module').then(m => m.StockPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'zone',
    loadChildren: () => import('./zone/zone.module').then(m => m.ZonePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'team',
    loadChildren: () => import('./team/team.module').then(m => m.TeamPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'brand',
    loadChildren: () => import('./brand/brand.module').then(m => m.BrandPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'brand-owner',
    loadChildren: () => import('./brand-owner/brand-owner.module').then(m => m.BrandOwnerPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'category',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'sub-category',
    loadChildren: () => import('./sub-category/sub-category.module').then(m => m.SubCategoryPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'packtype',
    loadChildren: () => import('./packtype/packtype.module').then(m => m.PacktypePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'packsize',
    loadChildren: () => import('./packsize/packsize.module').then(m => m.PacksizePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'flover',
    loadChildren: () => import('./flover/flover.module').then(m => m.FloverPageModule)
    , canLoad: [FormControlService]
  },

  {
    path: 'mapping',
    loadChildren: () => import('./mapping/mapping.module').then(m => m.MappingPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'town',
    loadChildren: () => import('./town/town.module').then(m => m.TownPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'district',
    loadChildren: () => import('./district/district.module').then(m => m.DistrictPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'tsp',
    loadChildren: () => import('./tsp/tsp.module').then(m => m.TspPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'ward',
    loadChildren: () => import('./ward/ward.module').then(m => m.WardPageModule)
    , canLoad: [FormControlService]
  },

  {
    path: 'campaigntask',
    loadChildren: () => import('./campaigntask/campaigntask.module').then(m => m.CampaigntaskPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'campaignbrand',
    loadChildren: () => import('./campaignbrand/campaignbrand.module').then(m => m.CampaignbrandPageModule)
    , canLoad: [FormControlService]
  },

  {
    path: 'image-crop',
    loadChildren: () => import('./image-crop/image-crop.module').then(m => m.ImageCropPageModule)
  },

  {
    path: 'campaign-shop',
    loadChildren: () => import('./campaign-shop/campaign-shop.module').then(m => m.CampaignShopPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then(m => m.MapPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.module').then(m => m.OrderPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'order-report',
    loadChildren: () => import('./order-report/order-report.module').then(m => m.OrderReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'order-report-by-summary',
    loadChildren: () => import('./order-report-by-summary/order-report-by-summary.module').then(m => m.OrderReportBySummaryPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'inventory-report',
    loadChildren: () => import('./inventory-report/inventory-report.module').then(m => m.InventoryReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'survey-transaction-report',
    loadChildren: () => import('./survey-transaction-report/survey-transaction-report.module').then(m => m.SurveyTransactionReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'vendor',
    loadChildren: () => import('./vendor/vendor.module').then(m => m.VendorPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'merchandise',
    loadChildren: () => import('./merchandise/merchandise.module').then(m => m.MerchandisePageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'transaction-report',
    loadChildren: () => import('./transaction-report/transaction-report.module').then(m => m.TransactionReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'average-order-amount',
    loadChildren: () => import('./average-order-amount/average-order-amount.module').then(m => m.AverageOrderAmountPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'redflag-report',
    loadChildren: () => import('./redflag-report/redflag-report.module').then(m => m.RedflagReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'system-setting',
    loadChildren: () => import('./system-setting/system-setting.module').then(m => m.SystemSettingPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'delievery-order',
    loadChildren: () => import('./delievery-order/delievery-order.module').then(m => m.DelieveryOrderPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'surveyor',
    loadChildren: () => import('./surveyor/surveyor.module').then(m => m.SurveyorPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'surveyor-response',
    loadChildren: () => import('./surveyor-response/surveyor-response.module').then(m => m.SurveyorResponsePageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'surveyor-routing',
    loadChildren: () => import('./surveyor-routing/surveyor-routing.module').then(m => m.SurveyorRoutingPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'surveyor-header',
    loadChildren: () => import('./surveyor-header/surveyor-header.module').then( m => m.SurveyorHeaderPageModule), 
    canLoad:[FormControlService]
  },
  {
    path: 'shop-transfer-report',
    loadChildren: () => import('./shop-transfer-report/shop-transfer-report.module').then( m => m.ShopTransferReportPageModule), 
    canLoad:[FormControlService]
  },
  {
    path: 'google-map',
    loadChildren: () => import('./google-map/google-map.module').then( m => m.GoogleMapPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'surveyor-summary',
    loadChildren: () => import('./surveyor-summary/surveyor-summary.module').then( m => m.SurveyorSummaryPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'export-recomended-sku',
    loadChildren: () => import('./export-recomended-sku/export-recomended-sku.module').then( m => m.ExportRecomendedSKUPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'discount-type',
    loadChildren: () => import('./discount-type/discount-type.module').then( m => m.DiscountTypePageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'void-report' ,
    loadChildren: () => import('./void-report/void-report.module').then( m => m.VoidReportPageModule),
    canLoad:[FormControlService]
  },
  {
  	path: 'volume-discount' ,
    loadChildren: () => import('./volume-discount/volume-discount.module').then( m => m.VolumeDiscountPageModule),
    canLoad:[FormControlService]
  },
  {
  	path: 'volume-discount-inkind-popup' ,
    loadChildren: () => import('./volume-discount-inkind-popup/volume-discount-inkind-popup.module').then( m => m.VolumeDiscountInkindPopupPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'gift',
    loadChildren: () => import('./gift/gift.module').then( m => m.GiftPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'loyalty-discount',
    loadChildren: () => import('./loyalty-discount/loyalty-discount.module').then( m => m.LoyaltyDiscountPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'loyalty-report',
    loadChildren: () => import('./loyalty-report/loyalty-report.module').then( m => m.LoyaltyReportPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'loyalty-discount-run',
    loadChildren: () => import('./loyalty-discount-run/loyalty-discount-run.module').then( m => m.LoyaltyDiscountRunPageModule)
  },
  {
    path: 'coupon-entry',
    loadChildren: () => import('./coupon-entry/coupon-entry.module').then( m => m.CouponEntryPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'invoice-discount',
    loadChildren: () => import('./invoice-discount/invoice-discount.module').then( m => m.InvoiceDiscountPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'price-zone',
    loadChildren: () => import('./price-zone/price-zone.module').then( m => m.PriceZonePageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'invoice-discount',
    loadChildren: () => import('./invoice-discount/invoice-discount.module').then( m => m.InvoiceDiscountPageModule),
    canLoad:[FormControlService]
  },
  {
    path: 'loyalty-transaction-report',
    loadChildren: () => import('./loyalty-transaction-report/loyalty-transaction-report.module').then( m => m.LoyaltyTransactionReportPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'transaction-detail-report',
    loadChildren: () => import('./transaction-detail-report/transaction-detail-report.module').then( m => m.TransactionDetailReportPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'order-delivery-report',
    loadChildren: () => import('./order-delivery-report/order-delivery-report.module').then( m => m.OrderDeliveryReportPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'checkin-report',
    loadChildren: () => import('./checkin-report/checkin-report.module').then( m => m.CheckinReportPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'store-routing',
    loadChildren: () => import('./store-routing/store-routing.module').then( m => m.StoreRoutingPageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'assign-user-store',
    loadChildren: () => import('./assign-user-store/assign-user-store.module').then( m => m.AssignUserStorePageModule)
    ,canLoad:[FormControlService]
  },
  {
    path: 'sap-customer',
    loadChildren: () => import('./sap-customer/sap-customer.module').then( m => m.SapCustomerPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'sap',
    loadChildren: () => import('./sap/sap.module').then( m => m.SapPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'sap-material',
    loadChildren: () => import('./sap-material/sap-material.module').then( m => m.SapMaterialPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'sap-ar',
    loadChildren: () => import('./sap-ar/sap-ar.module').then( m => m.SapArPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'uom',
    loadChildren: () => import('./uom/uom.module').then( m => m.UOMPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'empty-bottle-report',
    loadChildren: () => import('./empty-bottle-report/empty-bottle-report.module').then( m => m.EmptyBottleReportPageModule)
    , canLoad: [FormControlService]
  },
  {
    path: 'survey-transaction-archive-report',
    loadChildren: () => import('./survey-transaction-archive-report/survey-transaction-archive-report.module').then( m => m.SurveyTransactionArchiveReportPageModule)
  },
  {
    path: 'credit-request-form',
    loadChildren: () => import('./credit-request-form/credit-request-form.module').then(m => m.CreditRequestFormPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'credit-limit',
    loadChildren: () => import('./credit-limit/credit-limit.module').then(m => m.CreditLimitPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'payment-collection',
    loadChildren: () => import('./payment-collection/payment-collection.module').then( m => m.PaymentCollectionPageModule),
    canLoad: [FormControlService]
  },
  {
    path: 'sap-return-sku',
    loadChildren: () => import('./sap-return-sku/sap-return-sku.module').then( m => m.SapReturnSkuPageModule)
  },  {
    path: 'audit-log',
    loadChildren: () => import('./audit-log/audit-log.module').then( m => m.AuditLogPageModule)
  },
  {
    path: 'zone-sku-mapping',
    loadChildren: () => import('./zone-sku-mapping/zone-sku-mapping.module').then( m => m.ZoneSkuMappingPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
