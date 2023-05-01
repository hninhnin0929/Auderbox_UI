import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';
import { MatSelect } from '@angular/material';
import { Workbook } from 'exceljs';
import { FormControl } from '@angular/forms';
import * as FileSaver from 'file-saver';

declare var google: any;
declare var $: any;
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.page.html',
  styleUrls: ['./google-map.page.scss'],
})


export class GoogleMapPage implements OnInit {
  @ViewChild('placeType', { static: false }) placeType: MatSelect;
  @ViewChild('mapContainer', {static: false}) gmap: ElementRef;
  _self = this;
  map: any;
  currentPosition = this.getCurrentPosition();
  menuBar = {
    mapType: {
      region: [
        { desc: 'None', value: '0' },
        { desc: 'State', value: '1' },
        { desc: 'District', value: '2' },
        { desc: 'Township', value: '3' },
      ],
      regionVal: '0',
      grid: false
    },
    marker: {
      list: [
        { desc: 'LatLng', value: '1' },
        { desc: 'PlusCode', value: '2' }
      ],
      type: '2',
      pluscodeType: this.currentPosition.pluscode.type
    },
    searchVal: ''
  }
  operation = {
    list: [
      { desc: 'None', value: '0' },
      { desc: 'Neighbourhood', value: '1' },
      { desc: '10 Minutes nearby', value: '2' }
    ],
    value: '0',
    nearBy: false
  }
  neighbourhood = {
    typeList: [],
    shopSyskey: ''

  }
  nearbySearchList: any = [];
  nearbySearchTypes: any = [
    'airport',
    'atm',
    'bakery',
    'bank',
    'bar',
    'beauty_salon',
    'bicycle_store',
    'book_store',
    'bus_station',
    'cafe',
    'car_repair',
    'car_wash',
    'casino',
    'cemetery',
    'church',
    'city_hall',
    'clothing_store',
    'convenience_store',
    'courthouse',
    'dentist',
    'department_store',
    'doctor',
    'drugstore',
    'electrician',
    'electronics_store',
    'embassy',
    'fire_station',
    'florist',
    'funeral_home',
    'furniture_store',
    'gas_station',
    'gym',
    'hair_care',
    'hardware_store',
    'hindu_temple',
    'home_goods_store',
    'hospital',
    'insurance_agency',
    'jewelry_store',
    'laundry',
    'lawyer',
    'library',
    'light_rail_station',
    'liquor_store',
    'local_government_office',
    'locksmith',
    'lodging',
    'meal_delivery',
    'meal_takeaway',
    'mosque',
    'movie_rental',
    'movie_theater',
    'moving_company',
    'museum',
    'night_club',
    'painter',
    'park',
    'parking',
    'pet_store',
    'pharmacy',
    'physiotherapist',
    'plumber',
    'police',
    'post_office',
    'primary_school',
    'real_estate_agency',
    'restaurant',
    'roofing_contractor',
    'rv_park',
    'school',
    'secondary_school',
    'shoe_store',
    'shopping_mall',
    'spa',
    'stadium',
    'storage',
    'store',
    'subway_station',
    'supermarket',
    'synagogue',
    'taxi_stand',
    'tourist_attraction',
    'train_station',
    'transit_station',
    'travel_agency',
    'university',
    'veterinary_care',
    'zoo'
  ];
  nearbySearchTypeSelected: any = 'restaurant';
  infoWindow: any;
  nearbySearchSpinner = false;
  shopSearchSpinner = false;
  exportSpinner = false;
  regionTsp: any;
  progressbar: any = this.getProgressBarData();

  marker_icon = {
    // blue_dot: {
    //   url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    // },
    // pink_dot: {
    //   url: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
    // },
    // yellow_dot: {
    //   url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
    // },
    // purple_dot: {
    //   url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
    // },
    blue_marker: this.getMarkerIcon('assets/marker/blue_marker.png'),
    pin_marker: this.getMarkerIcon('assets/marker/pin_marker.png')
  }
  marker_symbol = {
    BACKWARD_CLOSED_ARROW: {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 10
    },
    BACKWARD_OPEN_ARROW: {
      path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
      scale: 10
    }

  }

  shopSearch: FormControl = new FormControl();
  stateSearch: FormControl = new FormControl();
  districtSearch: FormControl = new FormControl();
  townshipSearch: FormControl = new FormControl();

  shopList: any = [];
  stateList: any = [];
  districtList: any = [];
  townshipList: any = [];

  criteria: any = this.getShopObj();
  globalSearchObj: any = this.getShopObj();

  searchLoadingFlat: boolean = false;

  //excel export


  constructor(
    private manager: ControllerService, 
    private http: HttpClient, 
    private tostCtrl: ToastController, 
    private loadCtrl: LoadingController) { 

  }

  private getMarkerIcon(patch) {
    return {
      url: patch,
      size: new google.maps.Size(20, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 0),
      scaledSize: new google.maps.Size(20, 32)
    };
 
  }
  private getCurrentPosition() {
    let myLatlngBound: any;
    let myRegion: any;
    let mk: any;
    return {
      pluscode: {
        type: [
          { desc: '4', len: 4, definedLen: 4 },
          { desc: '6', len: 6, definedLen: 6 },
          { desc: '8', len: 9, definedLen: 8 },
          { desc: '10', len: 11, definedLen: 10 }
          /// { desc: '11', len: 12, definedLen: 11 }
        ],
        code: '',
        codeLength: 8
      },
      latLng: { lat: '', lng: '' },
      latLngBound: myLatlngBound,
      region: myRegion,
      marker: mk,
      markerList: [],
      retangleList: [],
      circleList: []
    }

  }
  private getGeojsonStyle(): {
    fillOpacity,
    fillColor,
    strokeWeight,
    strokeColor,
    clickable
  } {
    return {
      fillOpacity: 0.0,
      fillColor: 'green',
      strokeWeight: 1,
      strokeColor: "#EC7063",
      clickable: false
    }
  }
  private getProgressBarData() {
    return {
      progress: 0,
      progressHund: 0,
      progressLoaded: 0,
      totalProgress: 0,
      response: false
    }
  }
  private getShopObj() {
    return {
      shopSysKey: "",
      shopName: "",
      shopCode: "",
      address: "",
      phno: "",
      email: "",
      personName: "",
      n20: "",
      n21: "",
      n22: "",
      n23: "",
      n24: "",
    }
  }
  private getShopFormat() {
    return {
      syskey: "",
      business_status: "",
      geometry: { location: { lat: 0, lng: 0 }, viewport: '' },
      html_attributions: [],
      icon: "",
      name: "",
      opening_hours: { isOpen: false },
      photos: [],
      place_id: "",
      plus_code: { compound_code: "", global_code: "" },
      price_level: 0,
      rating: 0.0,
      reference: "",
      scope: "",
      types: [],
      user_ratings_total: 0,
      vicinity: "",
      marker: undefined
    }
  }
  private getInfoContent_One() {
    let content =
      '<div class="card border-0">'
      + '<div class="card-body px-1 py-1 ">'
      + '<h6>'
      + 'Current Selection'
      + '</h6>'
      + '<p>' + this.currentPosition.pluscode.code + '</p>'
      + '<p>' + ('' + this.currentPosition.latLng.lat).substr(0, 7) + ',' + ('' + this.currentPosition.latLng.lng).substr(0, 7) + '</p>'
      + '</div>'
      + '</div>';
    return content;

  }
  private getInfoContent_Two(shopName) {
    let content =
      '<div class="card border-0">'
      + '<div class="card-body px-1 py-1 ">'
      + '<h6>'
      + 'Current Selection'
      + '</h6>'
      + '<p>' + shopName + '</p>'
      + '</div>'
      + '</div>';
    return content;

  }
  private getInfoContent_Three(shopName) {
    let content =
      '<div class="card border-0">'
      + '<div class="card-body px-1 py-1 ">'
      + '<h6>'
      + 'Name'
      + '</h6>'
      + '<p>' + shopName + '</p>'
      + '</div>'
      + '</div>';
    return content;

  }
  private getInfoContent_Five(name, address, btnNeighbourhood: boolean, btnTenMinSearch: boolean) {
    var contentString =
      '<div class="card border-0" style="max-width: 200px">'
      + '<div class="card-body ">'
      + '<h6>'
      + name
      + '</h6>'
      + '<p>' + address + '</p>'
      + '</div>'
      + '</div>';

    var boxText = document.createElement("div");
    boxText.innerHTML = contentString;
    var card_footer = document.createElement("div");
    card_footer.className = "card-footer border-0 bg-transparent py-0";
    var tenMinuteButton = document.createElement("button");
    tenMinuteButton.className = 'btn btn-sm btn-primary';
    tenMinuteButton.innerText = "10 min search";
    var nbh = document.createElement("button");
    nbh.className = 'btn btn-sm btn-primary mr-2';
    nbh.innerText = "Neighbourhood";
    if (btnNeighbourhood)
      card_footer.appendChild(nbh);
    if (btnTenMinSearch)
      card_footer.appendChild(tenMinuteButton);
    boxText.appendChild(card_footer);
    return {
      content: boxText,
      btnNbh: nbh,
      btnTenMin: tenMinuteButton
    }
  }
  private getInfoContent_Four(name, distance, duration, address) {
    let content =
      '<div class="card border-0" style=" max-width: 200px" >'
      + '<div class="card-body px-1 py-1 ">'
      + '<h6>'
      + name
      + '</h6>'
      + '<p>' + distance + '</p>'
      + '<p>' + duration + '</p>'
      + '<p>' + address + '</p>'
      + '</div>'
      + '</div>';
    return content;

  }

  async ngOnInit() {
    this.manager.getPosition().then(latlng => {
      this.initsMap(10, latlng);
    }).catch(
      err => {
        this.initsMap();
      }
    );
    this.http.get('assets/resources/tsp.json', {
      reportProgress: true,
      responseType: 'json',
      observe: "events"
    }).subscribe(
      (data: any) => {
        let status = this.manager.getStatusMessage(data);
        //   console.log(status)
        if (status.response) {
          this.progressbar = status
          this.regionTsp = status.body.body;
          console.log(status)
        } else {
          this.progressbar = status
        }
      },
      error => {
      }
    );
  }

  initsMap(z?, c?) {
    // const loader = new Loader({
    //   apiKey: "AIzaSyB0_0cXJJlAZPBhxF4wQtiAAZmwzUdw2Z8",
    //   version: "weekly"
    // });
    
    this.map = new google.maps.Map(
      this.gmap.nativeElement,
      {
        center: c ? c : { lat: 16.83, lng: 96.13 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: z ? z : 10,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.VERTICALL_BAR,
          position: google.maps.ControlPosition.TOP_LEFT
        },
        zoomControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.LEFT_TOP
        }
      }
    );
    $('#detail_col').show();
    this.min();
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log("map click");
      this.currentPosition.latLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      let latLngServiceObj = this.manager.latLngService(this.currentPosition.latLng, this.currentPosition.pluscode.codeLength);
      this.currentPosition.latLngBound = latLngServiceObj.bounds;
      this.currentPosition.pluscode.code = latLngServiceObj.pluscode;
      let featureObj = this.manager.isContain(this.regionTsp, [this.currentPosition.latLng.lng, this.currentPosition.latLng.lat]);
      if (featureObj.status) {
        this.currentPosition.region = featureObj.geojson;
        let style = this.getGeojsonStyle();
        style.strokeWeight = 1;
        this.addRegionLayer(this.currentPosition.region, false, style);
      } else {
        this.currentPosition.region = undefined;
      }
      if (this.menuBar.marker.type == '2') {
        //by pluscode
        this.setRetangle(this.currentPosition.latLngBound, true, true);
      } else {
        //by latlng
        if (this.currentPosition.marker !== undefined) {
          this.currentPosition.marker.setMap(null);
        }
        
        this.currentPosition.marker = this.setMarker(this.currentPosition.latLng, "2", "My Location", false);
        
        const latlngString = this.currentPosition.latLng.lat + ', ' + this.currentPosition.latLng.lng;
      }

      //neighbourhood
      this.neighbourhood.typeList = [];
      this.neighbourhood.shopSyskey = '';
    });
  }

  searchAutoComShop(e){
    if(e.key == "Enter"){
      // if (this.criteria.shopName != '') {

        /*
        this.manager.shopNameSearchAutoFill(this.criteria.shopName).subscribe(
          data => {
            this.shopList = data as any[];
            this.shopList.sort((a, b) => {return a.shopName > b.shopName ? 1 : -1});
          }
        );
        */

      // }

      this.globalSearch();
    }
  }

  searchAutoComState(e){
    if(e.key == "Enter"){
      // if (this.criteria.n20 != '') {
        this.manager.stateNameSearchAutoFill(this.criteria.n20).subscribe(
          data => {
            this.stateList = data as any[];
            this.stateList.sort((a, b) => {return a.t2 > b.t2 ? 1 : -1});
          }
        );
      // }
    }
  }

  searchAutoComDistrict(e){
    if(e.key == "Enter"){
      // if (this.criteria.n21 != '') {
        this.manager.districtNameSearchAutoFill(this.criteria.n21).subscribe(
          data => {
            this.districtList = data as any[];
            this.districtList.sort((a, b) => {return a.t2 > b.t2 ? 1 : -1});
          }
        );
      // }
    }
  }

  searchAutoComTownship(e){
    if(e.key == "Enter"){
      // if (this.criteria.n22 != '') {
        this.manager.townshipNameSearchAutoFill(this.criteria.n22).subscribe(
          data => {
            this.townshipList = data as any[];
            this.townshipList.sort((a, b) => {return a.t2 > b.t2 ? 1 : -1});
          }
        );
      // }
    }
  }

  onSelectionChange(){
    // let temp = "";
    this.globalSearchObj = this.getShopObj();

    if (this.menuBar.mapType.regionVal == '1') {
      this.globalSearchObj.shopName = "";
      this.globalSearchObj.n20 = this.criteria.n20;
      this.globalSearchObj.n21 = "";
      this.globalSearchObj.n22 = "";

      this.criteria.n20 = this.stateList.filter(
        data => {
          return data.syskey == this.criteria.n20;
        }
      )[0].t2;

      $("#stateL").val(this.criteria.n20);
    } else if (this.menuBar.mapType.regionVal == '2') {
      this.globalSearchObj.shopName = "";
      this.globalSearchObj.n20 = "";
      this.globalSearchObj.n21 = this.criteria.n21;
      this.globalSearchObj.n22 = "";

      this.criteria.n21 = this.districtList.filter(
        data => {
          return data.syskey == this.criteria.n21;
        }
      )[0].t2;

      $("#districtL").val(this.criteria.n21);
    } else if (this.menuBar.mapType.regionVal == '3') {
      this.globalSearchObj.shopName = "";
      this.globalSearchObj.n20 = "";
      this.globalSearchObj.n21 = "";
      this.globalSearchObj.n22 = this.criteria.n22;

      this.criteria.n22 = this.townshipList.filter(
        data => {
          return data.syskey == this.criteria.n22;
        }
      )[0].t2;

      $("#townshipL").val(this.criteria.n22);
    } else {
      this.globalSearchObj.shopName = this.criteria.shopName;
      this.globalSearchObj.n20 = "";
      this.globalSearchObj.n21 = "";
      this.globalSearchObj.n22 = "";
    }

    this.stateList = [];
    this.districtList = [];
    this.townshipList = [];
  }

  async globalSearch() {  //  val
    this.removeAll();
    this.operation.nearBy = true;

    let val = "";
    let shopFlag = false;

    // let shopSearchObj = this.getShopObj();

    // shopSearchObj.shopName = val;

    if (this.menuBar.mapType.regionVal == '1') {
      val = this.globalSearchObj.n20;
    } else if (this.menuBar.mapType.regionVal == '2') {
      val = this.globalSearchObj.n21;
    } else if (this.menuBar.mapType.regionVal == '3') {
      val = this.globalSearchObj.n22;
    } else {
      shopFlag = true;
      this.globalSearchObj.shopName = this.criteria.shopName;
      this.globalSearchObj.n20 = "";
      this.globalSearchObj.n21 = "";
      this.globalSearchObj.n22 = "";
      val = this.globalSearchObj.shopName;
    }

    const url = this.manager.appConfig.apiurl + 'shop/shoplist';

    this.searchLoadingFlat = true;

    await new Promise<void>(p => {
      this.http.post(url, this.globalSearchObj, this.manager.getOptions()).subscribe(
        (data: any) => {
          p();
          data.forEach(
            s => {
              let shop = this.getShopFormat();
              shop.syskey = s.shopSysKey;
              shop.geometry.location.lat = parseFloat('' + s.locationData.lat);
              shop.geometry.location.lng = parseFloat('' + s.locationData.lon);
              shop.plus_code.global_code = s.locationData.t1;
              shop.name = s.shopName;
              shop.vicinity = s.address;

              let m;
              if (s.locationData.lat > 0 && s.locationData.lon > 0) {
                m = new google.maps.Marker({
                  map: this.map,
                  label: "AB",
                  position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
                });
                this._listenerMarker(m, shop);
                this.currentPosition.markerList.push(m);
              }
              if (m !== undefined) {
                shop.marker = m;
                this.nearbySearchList.push(shop);
              } else {
                this.nearbySearchList.push(shop);
              }
            }
          );

          this.searchLoadingFlat = false;
        }
      )
    });

    if(shopFlag){
      const request = {
        query: val,
        fields: ["name", "geometry", "formatted_address", "photos", "plus_code", "place_id", "types"]
      };
      let place_service = new google.maps.places.PlacesService(this.map)
      place_service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
  
          for (let i = 0; i < results.length; i++) {
            let mk = this.setMarker(results[i].geometry.location, '' + i, results[i].name, true);
            this.currentPosition.markerList.push(mk);
            results[i].marker = mk;
            if (results[i].types.includes("plus_code", 0)) {
              let serviceObj = this.manager.latLngServiceByPluscode(results[i].plus_code.global_code);
              this.setRetangle(
                serviceObj.bounds,
                false, false);
            }
            this.nearbySearchList.push(results[i]);
          }
  
        }
      });
    }
  }

  async nearbySearchBounds(retangle) {
    this.nearbySearchSpinner = true;
    await this.getShopWithinBound();
    let request = {
      bounds: retangle.getBounds(),
      type: [this.nearbySearchTypeSelected]
    }
    this.nearbySearchService(request);
  }

  async nearbySearchLatLng(latLng, types: [], radi) {
    this.nearbySearchSpinner = true;
    if(this.currentPosition.marker!== undefined) this.currentPosition.marker.setMap(null);
    let circle = this.setCircle(this.currentPosition.latLng, 1000, false);
    this.currentPosition.circleList.push(circle);

    await this.getShopWithinCircle(latLng.lat, latLng.lng,  1);
    let request = {
      location: latLng,
      radius: radi,
      type: types
    };
    this.nearbySearchService(request);
    this.nearbySearchSpinner = false;
  }

  nearbySearchService(request) {
    let service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(
      request
      , (results, status) => {
        this.nearbySearchSpinner = false;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          if (this.operation.value == '2') {
            console.log(results);
          } else {
            for (let i = 0; i < results.length; i++) {
              results[i].syskey = '';
              let mk = this.setMarker(results[i].geometry.location, '' + i, results[i].name, true);
              this._listenerMarker(mk, results[i]);
              this.currentPosition.markerList.push(mk);
              results[i].marker = mk;
              this.nearbySearchList.push(results[i]);
            }
          }

        }
      });
  }

  async getShopWithinRegion() {
    this.operation.nearBy = true;
    if (this.currentPosition.region !== undefined) {
      this.shopSearchSpinner = true;
      let mimu = this.currentPosition.region.properties.TS_PCODE;
      let shopSearchObj = this.getShopObj();
      const url = this.manager.appConfig.apiurl + 'shop/shoplist';
      await new Promise<void>(p => {
        this.http.post(url, shopSearchObj, this.manager.getOptions()).subscribe(
          (data: any) => {

            data.forEach(s => {
              if (s.locationData.lat > 0 && s.locationData.lon > 0) {
                let shop = this.getShopFormat();
                shop.syskey = s.shopSysKey;
                shop.geometry.location.lat = parseFloat('' + s.locationData.lat);
                shop.geometry.location.lng = parseFloat('' + s.locationData.lon);
                shop.plus_code.global_code = s.locationData.t1;
                shop.name = s.shopName;
                shop.vicinity = s.address;

                if (this.manager.isContain({ features: [this.currentPosition.region] }, [s.locationData.lon, s.locationData.lat]).status) {
                  let m = new google.maps.Marker({
                    map: this.map,
                    label: "AB",
                    position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
                  });
                  this._listenerMarker(m, shop);
                  this.currentPosition.markerList.push(m);
                  if (m !== undefined) {
                    shop.marker = m;
                    this.nearbySearchList.push(shop);
                  } else {
                    this.nearbySearchList.push(shop);
                  }
                }

              }

            });
            p();
          },
          error => {
            this.nearbySearchSpinner = false;
            this.manager.showToast(this.tostCtrl, "Message", "Something went wrong", 200);
            p();
          }
        )
      });
      this.shopSearchSpinner = false;
    }
  }

  async getShopWithinBound() {
    await new Promise<void>(p => {
      const url = this.manager.appConfig.apiurl + 'shop/getshop-withinbound/' + this.currentPosition.pluscode.code;
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {

          data.forEach(s => {
            let shop = this.getShopFormat();
            shop.syskey = s.shopSysKey;
            shop.geometry.location.lat = parseFloat('' + s.locationData.lat);
            shop.geometry.location.lng = parseFloat('' + s.locationData.lon);
            shop.plus_code.global_code = s.locationData.t1;
            shop.name = s.shopName;
            shop.vicinity = s.address;

            let m;
            if (s.locationData.lat > 0 && s.locationData.lon > 0) {
              m = new google.maps.Marker({
                map: this.map,
                label: 'AB',
                // icon: this.marker_icon.pin_marker,
                position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
              });
              this._listenerMarker(m, shop);
              this.currentPosition.markerList.push(m);
            }
            if (m !== undefined) {
              shop.marker = m;
              this.nearbySearchList.push(shop);
            } else {
              this.nearbySearchList.push(shop);
            }
          });
          p();
        }
      )
    })
  }

  async getShopWithinCircle(lat, lng, radius) {
    await new Promise<void>(p => {
      const url = this.manager.appConfig.apiurl + 'neighbourhood/get-shop-within-circle';
      let shop_request = {
        centerX: '' + lat,
        centerY: '' + lng,
        radiusInKilo: '' + radius
      }
      this.http.post(url, shop_request, this.manager.getOptions()).subscribe(
        (data: any) => {
          data.forEach(s => {
            if (s.locationData.lat > 0 && s.locationData.lon > 0) {
              let shop = this.getShopFormat();
              shop.syskey = s.shopSysKey;
              shop.geometry.location.lat = parseFloat('' + s.locationData.lat);
              shop.geometry.location.lng = parseFloat('' + s.locationData.lon);
              shop.plus_code.global_code = s.locationData.t1;
              shop.name = s.shopName;
              shop.vicinity = s.address;

              let m = new google.maps.Marker({
                map: this.map,
                label: "AB",
                position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
              });
              this._listenerMarker(m, shop);
              this.currentPosition.markerList.push(m);
              if (m !== undefined) {
                shop.marker = m;
                this.nearbySearchList.push(shop);
              } else {
                this.nearbySearchList.push(shop);
              }
            }
          });
          p();
        },
        error=>{
          this.manager.showToast(this.tostCtrl, "Message", "Cannot get auderbox shops within range!", 200);
          p();
        }
      );
    });
  }

  async nearchbySearchClick() {
    this.operation.nearBy = true;
    this.nearbySearchList = [];
    this.manager.remove_Markers(this.currentPosition.markerList);
    if (this.menuBar.marker.type == "2") {
      for (let i = 0; i < this.currentPosition.retangleList.length; i++) {
        let ran = this.currentPosition.retangleList[i];
        this.nearbySearchBounds(ran);
      }
    } else if (this.menuBar.marker.type == '1') {
      this.nearbySearchLatLng(this.currentPosition.latLng, this.nearbySearchTypeSelected, 1000);
    }
  }

  getNeighbourhoodTypeByAreaClick() {
    this.loadCtrl.create({
      message: 'wait..',
      backdropDismiss: false
    }).then(async el => {
      el.present();
      await this.getNeighbourhoodType();
      await new Promise<void>(promise => {
        const url = this.manager.appConfig.apiurl + 'neighbourhood/get-nbh-type/' + this.currentPosition.pluscode.code;
        this.http.get(url, this.manager.getOptions()).subscribe(
          (data: any) => {
            promise();
            for (let i = 0; i < this.neighbourhood.typeList.length; i++) {
              for (let y = 0; y < data.length; y++) {
                if (data[y].n2 === this.neighbourhood.typeList[i].syskey) {
                  this.neighbourhood.typeList[i].check = true;
                } else {

                }
              }
            }
          }
        )
      })
      el.dismiss();
    });

  }

  regionChange() {
    this.criteria = this.getShopObj();

    if (this.menuBar.mapType.regionVal == '0') {
      this.removeRegion();
    }
  }

  neighbourhoodTabChange(e) {
    this.removeAll();
    this.neighbourhood.typeList = [];
    this.neighbourhood.shopSyskey = '';
    if (e.index == 1) {
      this.getNeighbourhoodType();
    } else {
      this.neighbourhood.typeList = [];
    }
  }

  neighbourhoodDetailOpenEvent() {

  }

  getNeighbourhoodType() {
    return new Promise<void>(promise => {
      const url = this.manager.appConfig.apiurl + "neighbourhood/get-nbh-type";
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {

          this.neighbourhood.typeList = data;
          this.neighbourhood.typeList = data.map(p => {
            p.check = false;
            return p;
          });
          promise();
        }
        , error => {
          promise();
        }
      )
    })

  }

  getCoefficientPlacesByType(id) {
    const url = this.manager.appConfig.apiurl + "neighbourhood/get-coefficient-nbh";
    this.http.post(url, id, this.manager.getOptions()).subscribe(
      (data: any) => {
        data.forEach(rtn => {
          if (rtn.t1 !== '') {
            let area = this.manager.latLngServiceByPluscode(rtn.t1);
            this.setRetangle(area.bounds, true, false);
          }

        });
        this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
      }
    )
  }

  saveCoefficientClick() {
    if (this.currentPosition.pluscode.code.length == 12) {
      this.saveCoefficient(this.currentPosition.pluscode.code, this.neighbourhood.shopSyskey);
    } else {
      this.saveCoefficient(this.currentPosition.pluscode.code, '0');
    }
  }

  saveCoefficient(pluscode, shopsyskey) {
    this.loadCtrl.create({
      message: 'Operation is in progress..',
      backdropDismiss: true,
    }).then(
      el => {
        el.present();
        let body = [];
        for (let i = 0; i < this.neighbourhood.typeList.length; i++) {
          if (this.neighbourhood.typeList[i].check) {
            let obj = {
              "syskey": "0",
              "createdDate": "",
              "modifiedDate": "",
              "ReordStatus": 1,
              "SaveStatus": 1,
              "userId": "",
              "userName": "",
              "t1": "",
              "t2": "",
              "t3": "",
              "t4": "",
              "t5": "",
              "t6": "",
              "n1": "0",
              "n2": this.neighbourhood.typeList[i].syskey,
              "n3": "0",
              "n4": "0",
              "n5": 0,
              "n6": 0
            }
            body.push(obj);
          }
        }
        const url = this.manager.appConfig.apiurl + 'neighbourhood/save-coefficient-nbh/' + pluscode + '/' + shopsyskey;
        this.http.post(url, body, this.manager.getOptions()).subscribe(
          (data: any) => {
            el.dismiss();
            if (data.message == 'SUCCESS') {
              this.manager.showToast(this.tostCtrl, "Message", 'Success', 1000);
            } else {
              this.manager.showToast(this.tostCtrl, "Message", data.message, 1000);
            }
          },
          error => {
            el.dismiss();
          }
        )
      }
    )

  }

  saveNeighbourhoodType(type, matInput) {
    //let name = this.nbh.typeSetup.name;
    const url = this.manager.appConfig.apiurl + "neighbourhood/save-nbh-type";
    const obj = {
      "syskey": "0",
      "createdDate": "",
      "modifiedDate": "",
      "reordStatus": 1,
      "saveStatus": 1,
      "userId": "",
      "userName": "",
      "t1": type,
      "t2": "",
      "t3": "",
      "t4": "",
      "t5": "",
      "t6": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "n4": "0",
      "n5": 0,
      "n6": 0

    }
    this.http.post(url, obj, this.manager.getOptions()).subscribe(
      (data: any) => {
        if (data.message == "SUCCESS") {
          this.manager.showToast(this.tostCtrl, "Message", 'Success', 1000);
          this.neighbourhood.typeList = [];
          this.getNeighbourhoodType();
          matInput.value = "";
        }
      }
    )
  }

  async deleteNeighbourhoodType(id) {
    const url = this.manager.appConfig.apiurl + "neighbourhood/save-nbh-type";
    for (let i = 0; i < id.length; i++) {
      const obj = {
        "syskey": id[i],
        "createdDate": "",
        "modifiedDate": "",
        "recordStatus": 4,
        "saveStatus": 1,
        "userId": "",
        "userName": "",
        "t1": '',
        "t2": "",
        "t3": "",
        "t4": "",
        "t5": "",
        "t6": "",
        "n1": "0",
        "n2": "0",
        "n3": "0",
        "n4": "0",
        "n5": 0,
        "n6": 0

      }
      await new Promise<void>(p => {
        this.http.post(url, obj, this.manager.getOptions()).subscribe(
          (data: any) => {
            if (data.message == "SUCCESS") {
              this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
            };
            p();
          },
          error => {
            p();
          }
        )
      })
      this.neighbourhood.typeList = [];
      this.getNeighbourhoodType();
    }

  }
  showSearchDetail(index) {
    let detail = this.nearbySearchList[index];
    if (this.infoWindow !== undefined) this.infoWindow.close();
    if (detail.marker !== undefined) {
      let contentName = detail.name;
      this.setInfoWindow(detail.marker.getPosition(), this.getInfoContent_Three(contentName), false, detail.marker);
      this.setZoom(detail.marker, 13);
    }
  }
  setZoom(marker, zoomLvl: number) {
    if (this.map.getZoom() < zoomLvl) {
      this.map.setZoom(zoomLvl);
    }
    this.map.panTo(marker.getPosition())
  }
  grid() {
    const cur_zoom = this.map.zoom;
    const cur_loc = this.map.center;

    if (!this.menuBar.mapType.grid) {
      this.map.overlayMapTypes.clear();
    } else {
      this.map.overlayMapTypes.clear();
      this.manager.add_pluscode_grid(this.map);
    }
  }
  setMarker(latlng: { lat, lng }, myId: string, myTitle: string, isMultiple: boolean, micon?) {
    if (!isMultiple) this.manager.remove_Markers(this.currentPosition.markerList);

    if (micon) {

      return new google.maps.Marker({
        position: latlng,
        id: myId,
        map: this.map,
        title: myTitle,
        icon: micon
      });
    } else {
      return new google.maps.Marker({
        position: latlng,
        id: myId,
        map: this.map,
        title: myTitle,
      });
    }
  }
  setInfoWindow(latLng, contentString, isMultiple: boolean, marker?) {
    if (!isMultiple) {
      if (this.infoWindow !== undefined) this.infoWindow.close();
    }
    this.infoWindow = new google.maps.InfoWindow({
      disableAutoPan: true
      , isHidden: false
      , closeBoxURL: ""
      , pane: "mapPane"
      , enableEventPropagation: true,
      position: latLng
    });

    this.infoWindow.setContent(contentString);
    if (marker) {
      this.infoWindow.open(this.map, marker);
    } else {
      this.infoWindow.open(this.map);
    }

  }
  setRetangle(latLngBound, isMultiple: boolean, setListener: boolean) {
    if (!isMultiple) this.manager.remove_Rentagle(this.currentPosition.retangleList);
    let retangle =
      new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.1,
        map: this.map,
        bounds: latLngBound.toJSON(),
        clickable: true,
      })
    if (setListener) this._listenerRetangle(retangle);
    this.currentPosition.retangleList.push(retangle);
  }
  setCircle(p_center, rad, isMultiple) {
    if (!isMultiple) {
      this.manager.removeCircle(this.currentPosition.circleList);
    }
    return new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: "#FF0000",
      fillOpacity: 0.0,
      map: this.map,
      center: p_center,
      radius: rad
    });
  }
  async addRegion() {
    let feature;
    await new Promise<void>(promise => {
      if (this.menuBar.mapType.regionVal == '1') {
        this.manager.get_state_data().then(state => {
          feature = state;
          this.addRegionLayer(feature, true);
          promise();
        })
      } else if (this.menuBar.mapType.regionVal == '2') {
        this.manager.get_district_data().then(dis => {
          feature = dis;
          this.addRegionLayer(feature, true);
          promise();
        })
      } else if (this.menuBar.mapType.regionVal == '3') {
        this.manager.get_tsp_data().then(tsp => {
          feature = tsp;
          this.addRegionLayer(feature, true);
          promise();
        })
      } else {
        this.removeRegion();
        promise();
      }
    });
  }

  addRegionLayer(layer, isMultiple: boolean, style?: {
    fillOpacity,
    fillColor,
    strokeWeight,
    strokeColor,
    clickable
  }) {
    if (!isMultiple) this.removeRegion();
    this.map.data.addGeoJson(layer);
    if (style) {
      this.map.data.setStyle(style);
    } else {
      this.map.data.setStyle({
        fillOpacity: 0.0,
        fillColor: 'green',
        strokeWeight: 0.5,
        strokeColor: "#EC7063"
      });
    }
    this._listenerRegion();
  }
  removeRegion() {
    this.map.data.forEach((feature) => {
      this.map.data.remove(feature);
      google.maps.event.clearListeners(feature, 'click');
    });
  }
  removeAll() {
    this.operation.value = '0';
    if (this.currentPosition.marker !== undefined) {
      this.currentPosition.marker.setMap(null);
    }
    if (this.infoWindow !== undefined) {
      this.infoWindow.close()
    }
    this.removeRegion();
    this.manager.remove_Rentagle(this.currentPosition.retangleList);
    this.manager.remove_Markers(this.currentPosition.markerList);
    this.manager.removeCircle(this.currentPosition.circleList);
    this.currentPosition.markerList = [];
    this.currentPosition.retangleList = [];
    this.nearbySearchList = [];
  }
  processPoints(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {
      callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {
      callback.call(thisArg, geometry.get());
    } else {
      geometry.getArray().forEach((g) => {
        this.processPoints(g, callback, thisArg);
      });
    }
  }
  private _listenerMarker(marker, shop?) {
    google.maps.event.addListener(marker, 'click', async m => {
      let latLng = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
      this.neighbourhood.typeList = [];
      let latLngServiceObj = this.manager.latLngService({ lat: marker.getPosition().lat(), lng: marker.getPosition().lng() }, 11);
      this.currentPosition.pluscode.code = latLngServiceObj.pluscode;
      if (shop) {
        //this.setInfoWindow(marker.getPosition(), this.getInfoContent_Three(shop.shopName == undefined ? shop.name : shop.shopName), false, marker);
        let contentObj = this.getInfoContent_Five(shop.name, shop.vicinity, shop.syskey == '' ? false : true, true);
        this.setInfoWindow(marker.getPosition(), contentObj.content, false, marker);
        google.maps.event.addDomListener(contentObj.btnTenMin, 'click', async () => {
          //remove neighbourhoodtab
          this.operation.value = '0';
          this.manager.remove_Markers(this.currentPosition.markerList);
          this.manager.remove_Rentagle(this.currentPosition.retangleList);
          this.manager.removeCircle(this.currentPosition.circleList);
          this.nearbySearchList = [];
          this.currentPosition.markerList.push(this.setMarker(latLng, "001", "Current Location", false))

          let shopList = [];
          let shop_request = {
            centerX: '' + latLng.lat(),
            centerY: '' + latLng.lng(),
            radiusInKilo: '' + 1
          }
          const url = this.manager.appConfig.apiurl + 'neighbourhood/get-shop-within-circle';
          await new Promise<void>(p => {
            this.http.post(url, shop_request, this.manager.getOptions()).subscribe(
              (data: any) => {

                for (let x = 0; x < data.length; x++) {
                  let shop = this.getShopFormat();
                  shop.syskey = data[x].shopSysKey;
                  shop.geometry.location.lat = parseFloat('' + data[x].locationData.lat);
                  shop.geometry.location.lng = parseFloat('' + data[x].locationData.lon);
                  shop.plus_code.global_code = data[x].locationData.t1;
                  shop.name = data[x].shopName;
                  shop.vicinity = data[x].address;
                  let m;
                  if (data[x].locationData.lat > 0 && data[x].locationData.lon > 0) {
                    shopList.push(shop);
                  }
                }
                p();

              });
          });


          let request = {
            location: latLng,
            radius: 1000,
            type: this.nearbySearchTypeSelected
          };
          let service = new google.maps.places.PlacesService(this.map);
          service.nearbySearch(
            request
            , async (results, status) => {
              this.nearbySearchSpinner = false;
              if (status === google.maps.places.PlacesServiceStatus.OK) {


                let finalResults = shopList.concat(results);
                let finalShopList = [];
                let endpoints = [];
                let startPoints = [latLng];

                for (let i = 0; i < finalResults.length; i++) {
                  if (finalResults[i].syskey == undefined) {
                    finalResults[i].syskey = '';
                  }
                  endpoints.push(finalResults[i].geometry.location);
                }

                let splitEndPoint = this.adjustMaxRequest(endpoints, 20);
                let index = 0;
                for (let y = 0; y < splitEndPoint.length; y++) {
                  let dis = [];
                  await new Promise<void>(promise => {
                    this.distanceMaterix(startPoints, splitEndPoint[y]).then(
                      (resp: any) => {
                        dis = resp;
                        promise();
                      }
                    )
                  })
                  for (let x = 0; x < dis.length; x++) {
                    finalResults[index].myDistance = {
                      distance: dis[x].distance,
                      duration: dis[x].duration,
                      address: dis[x].destinationAddresses
                    };
                    if (finalResults[index].myDistance.duration.value <= 600) {
                      // finalShopList.push(finalResults[index]);
                      finalShopList.push(finalResults[index]);
                    }
                    index++;
                  }
                }
                console.log(finalResults);


                finalShopList.forEach(shop => {
                  let myMarker = this.setMarker(shop.geometry.location, "id", shop.name, true);
                  myMarker.setLabel(shop.myDistance.duration.text);
                  shop.marker = myMarker;
                  google.maps.event.addListener(myMarker, 'click', async m => {
                    if (this.infoWindow !== undefined) this.infoWindow.close();
                    this.setInfoWindow(shop.geometry.location, this.getInfoContent_Four(
                      shop.name,
                      shop.myDistance.distance.text,
                      shop.myDistance.duration.text,
                      shop.myDistance.address),
                      true, myMarker
                    )
                  });
                  this.currentPosition.markerList.push(myMarker);
                  this.nearbySearchList.push(shop)
                })

              }
            });

        });
        google.maps.event.addDomListener(contentObj.btnNbh, 'click', () => {
          if (shop) {
            this.operation.value = '1';
            this.neighbourhood.shopSyskey = shop.syskey;
            this.setInfoWindow(marker.getPosition(), this.getInfoContent_Two(shop.name), false, marker);
            this.getNeighbourhoodTypeByAreaClick();
          }
        });
      } else {
        const latlngString = ('' + this.currentPosition.latLng.lat).substr(0, 8) + ', ' + ('' + this.currentPosition.latLng.lng).substr(0, 8);
        this.setInfoWindow(marker.getPosition(), latlngString, false, marker);
      }
    });
  }
  private async _listenerRetangle(retangle) {
    retangle.addListener('click', (event) => {
      console.log("retangle click")
      this.currentPosition.latLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      let latLngServiceObj = this.manager.latLngService(this.currentPosition.latLng, this.currentPosition.pluscode.codeLength);
      this.currentPosition.latLngBound = latLngServiceObj.bounds;
      this.currentPosition.pluscode.code = latLngServiceObj.pluscode;

      this.neighbourhood.typeList = [];
      if (this.currentPosition.pluscode.code.length !== 12) {
        this.operation.value = '1';
        this.setInfoWindow(latLngServiceObj.center, this.getInfoContent_One(), false)
      } else {
        this.operation.value = '0';
      }

    })
    retangle.addListener('rightclick', event => {
      retangle.setMap(null);
      google.maps.event.clearListeners(retangle, 'click');
      let index = this.currentPosition.retangleList.indexOf(retangle);
      this.currentPosition.retangleList.splice(index, 1);
    });



  }
  private _listenerRegion() {
    google.maps.event.clearListeners(this.map.data, 'click');
    google.maps.event.clearListeners(this.map.data, 'rightclick');
    this.map.data.addListener('click', (event) => {
      console.log("region click");
      console.log(event)

      this.currentPosition.latLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      let latLngServiceObj = this.manager.latLngService(this.currentPosition.latLng, this.currentPosition.pluscode.codeLength);
      this.currentPosition.latLngBound = latLngServiceObj.bounds;
      this.currentPosition.pluscode.code = latLngServiceObj.pluscode;
      // this.currentPosition.region = { properties: event.feature.j };
      this.currentPosition.region = { properties: event.feature.h };
      console.log("before setretangle");
      this.setRetangle(this.currentPosition.latLngBound, false, true);

    });
  }
  min() {
    $("#detail_col").animate({ height: "50px", width: "100px" });
  }
  max() {
    $("#detail_col").animate({ height: "550px", width: "400px" });
  }
  close() {
    $('#detail_col').hide();
  }
  //test case
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  async distanceMaterix(startPoints, endPoints) {
    let list = [];
    await new Promise<void>(promise => {
      var service = new google.maps.DistanceMatrixService;
      service.getDistanceMatrix({
        origins: startPoints,
        destinations: endPoints,
        travelMode: 'WALKING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status !== 'OK') {

          alert('Error was: ' + status);
          promise();
        } else {
          let res = response.rows[0].elements;
          list = res;
          console.log(response)
          for (let i = 0; i < res.length; i++) {
            res[i].destinationAddresses = response.destinationAddresses[i];
          }
          promise();
        }
      });
    });
    return list;
  }

  //utility
  adjustMaxRequest(paramArray, maxValue) {
    let finalArray = [];
    var i, j;
    for (i = 0, j = paramArray.length; i < j; i += maxValue) {
      finalArray.push(paramArray.slice(i, i + maxValue));
    }
    return finalArray;
  }
  //export
  print() {

    this.exportSpinner = true;

    const url = this.manager.appConfig.apiurl + 'placecode/neighborhoodreport';
    this.http.post(url, {
      "syskey": "0",
      "createdDate": "",
      "modifiedDate": "",
      "ReordStatus": 1,
      "SaveStatus": 1,
      "userId": "",
      "userName": "",
      "t1": "",
      "t2": "",
      "t3": "",
      "t4": "",
      "t5": "",
      "t6": "",
      "n1": "0",
      "n2": "0",
      "n3": "0",
      "n4": "0",
      "n5": 0,
      "n6": 0
    }, this.manager.getOptions()).subscribe(

      (data: any) => {
        let cri_flag = 0;
        let excel_date = "";

        let type_flag = "";

        let excelTitle = "NeighborHood Report";
        let excelHeaderData = [
          "NeighborHood", "PlusCode "

        ];

        let excelDataList: any = [];
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet('NeighborHood and PlusCode Data');

        let titleRow = worksheet.addRow(["", "", excelTitle]);
        titleRow.font = { bold: true };
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(excelHeaderData);
        headerRow.font = { bold: true };

        for (var exCount = 0; exCount < data.dataList.length; exCount++) {
          excelDataList = [];
          for (var exCount1 = 0; exCount1 < data.dataList.length; exCount1++) {
            let excelData: any = [];
            excelData.push(data.dataList[exCount1].t1);
            excelData.push(data.dataList[exCount1].t2);
            excelDataList.push(excelData);
          }

          for (var i_data = 0; i_data < excelDataList.length; i_data++) {
            worksheet.addRow(excelDataList[i_data]);
          }
        }
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: EXCEL_TYPE });
          FileSaver.saveAs(blob, "NeighborHood_export_" + new Date().getTime() + EXCEL_EXTENSION);
        });
        this.exportSpinner = false;
      }
    );
  }
}