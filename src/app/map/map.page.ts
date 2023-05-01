import { Component, OnInit, ViewChild } from '@angular/core';
import { ControllerService } from '../controller.service';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { MatAccordion, MatExpansionPanel, MatDialog, MatTabGroup, MatChipInputEvent, MatInput, MatTab } from '@angular/material';
import { geoContains } from 'd3-geo'
declare var google: any;
declare var $: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})

export class MapPage implements OnInit {
  @ViewChild('exmimu', { static: false }) ex_mimu: MatExpansionPanel;
  @ViewChild('exmarker', { static: false }) ex_marker: MatExpansionPanel;
  @ViewChild('exdetail', { static: false }) ex_detail: MatExpansionPanel;
  @ViewChild('exnbh', { static: false }) ex_nbh: MatExpansionPanel;
  @ViewChild('mattabgroup', { static: false }) matTabGroup: MatTabGroup;
  @ViewChild('newtype', { static: false }) inputNewNbhType: MatInput;
  @ViewChild('pluscodeTab', { static: false }) matTab_pluscode: MatTab;


  map: any;
  curMap: any = {
    m_zoom: 10,
    m_center: { lat: 16.83, lng: 96.13 }
  }
  //interface
  map_style = {
    stl_grid: false,
    stl_region: "0"
  }
  marker = {
    use_marker: false,
    marker_type: "2",
    is_nearbysearch: false,
    pc_len: "8",
    latlng: '',
    pluscode: ''
  }
  //cri
  region_search_cri = {
    state: {
      syskey: '',
      t1: '',
      t2: ''
    },
    district: {
      syskey: '',
      t1: '',
      t2: ''
    },
    tsp: {
      syskey: '',
      t1: '',
      t2: ''
    }
  }
  mimu_detail = {
    state: {
      t1: '',
      t2: '',
      t3: ''
    },
    district: {
      t1: '',
      t2: '',
      t3: ''
    },
    tsp: {
      t1: '',
      t2: '',
      t3: ''
    }

  }
  //list 
  ply_list: any = [];
  marker_list: any = [];
  rantagle_list: any = [];
  state_list: any = [];
  district_list: any = [];
  tsp_list: any = [];
  nearby_search_details = [];
  searchVal: string = "";
  info: any = new google.maps.InfoWindow({
    content: ""
  });
  retangle_detail: any = {
    latlng: '',
    pluscode: ''
  }
  extension_pannel = {
    mimu: false,
    marker: false,
    detail: false
  }
  place_service: any;
  icons: any = {
    my_store: 'assets/icon/mapicon.png'
  }
  nbh: any = this.getNbhObj();
  nbhFormControl = new FormControl('', [
    Validators.required,
  ]);
  //
  detail = {
    mimu: false,
    marker: false,
    search: false,
    nbh: false
  }
  tsp: any;
  constructor(private manager: ControllerService,
    public http: HttpClient,
    public loadEl: LoadingController,
    public dialog: AlertController,
    public tostCtrl: ToastController,

  ) { }

  ngOnInit() {
    this.manager.getPosition().then(latlng => {
      this.initMap(10, latlng);
    }).catch(
      err => {
        this.initMap();
      }
    )
    this.getState();
  }
  ngAfterViewInit() {

  }
  ionViewWillEnter() {
    $('#detail_col').hide();
  }
  private isContain(geoJson, latLng) {
    var features = geoJson.features;
    for (let i = 0; i < features.length; i++) {
      if (geoContains(features[i].geometry, latLng)) {
        return {
          geojson: features[i],
          status: true
        };
      }
    }
    return {
      geojson: [],
      status: false
    };


  }
  initMap(z?, c?) {
    this.map = new google.maps.Map(
      document.getElementById('map'),
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
    )
    return;
    google.maps.event.addListener(this.map, 'click', (event) => {
      if (this.marker.use_marker) {
        let lg = event.latLng;
        this.marker.latlng = event.latLng;
        this.marker.pluscode = this.manager.openlocEncode(event.latLng.lat(), event.latLng.lng(), 11);
        this.nbh.setUp.pluscode = this.marker.pluscode.substr(0, parseInt(this.nbh.pluscodeLength));

        if (this.nbh.multiSelectGrid) {
          this.nbh.specialPluscode.retangle.push(this.setMultiSelectMarkers(lg));
          return;
        }
        if(this.detail.nbh){
          this.rantagle_list.push(this.setNbhRetangle(lg));
        }else {
          this.set_Marker(this.marker.marker_type, lg);
        }
        
      }
    });
    this.map.addListener('zoom_changed', () => {
    });
  }
  genPluscodeRegion() {

  }

  setCurMap(z, c) {
    this.curMap.m_zoom = z;
    this.curMap.m_center = c;
  }
  mapStyleChange() {
    const cur_zoom = this.map.zoom;
    const cur_loc = this.map.center;
    this.setCurMap(cur_zoom, cur_loc);

    if (!this.map_style.stl_grid) {
      this.map.overlayMapTypes.clear();
    } else {
      this.map.overlayMapTypes.clear();
      this.manager.add_pluscode_grid(this.map);
    }
  }

  //clean list
  cleanPlyList() {
    this.manager.remove_polygon(this.ply_list);
  }
  cleanMimuDetail() {
    return {
      state: {
        t1: '',
        t2: '',
        t3: ''
      },
      district: {
        t1: '',
        t2: '',
        t3: ''
      },
      tsp: {
        t1: '',
        t2: '',
        t3: ''
      }
    }
  }

  //change event
  stl_Region_Change() {
    this.loadEl.create({
      message: 'Please wait..',
      backdropDismiss: false
    }).then(el => {
      el.present();
      this.remove_Geojson();
      if (this.map_style.stl_region == "1") {
        this.manager.get_state_data().then(state_geojson => {
          this.add_Geojson(state_geojson);
          el.dismiss();
        });

      } else if (this.map_style.stl_region == "2") {
        this.manager.get_district_data().then(district_geojson => {
          this.add_Geojson(district_geojson);
          el.dismiss();
        })

      } else if (this.map_style.stl_region == "3") {
        this.manager.get_tsp_data().then(tsp_geojson => {
          this.add_Geojson(tsp_geojson);
          el.dismiss();
        });

      } else if (this.map_style.stl_region == "0") {
        this.remove_Geojson();
        ;
        $('#detail_col').hide();
        el.dismiss();
      }
      $('#mstyleDropDown').dropdown('hide')
    })

  }
  useMarkerChange() {
    this.clearMarkers();
    this.manager.remove_Rentagle(this.rantagle_list);
  }
  //geo json
  add_Geojson(gojson) {
    this.map.data.addGeoJson(gojson);
    this.map.data.setStyle({
      fillOpacity: 0.1,
      fillColor: 'green',
      strokeWeight: 0.5,
      strokeColor: "#EC7063"
    });
    let click_feature_stl = { fillColor: 'red', fillOpacity: 0.5, strokeColor: "red" }
    let def_feature_stl = { fillColor: '#F1948A ', fillOpacity: 0.2, strokeColor: "red" }
    this.map.data.addListener('click', (event) => {
      $('#detail_col').show();
      if (this.marker.use_marker) {

        this.set_Marker(this.marker.marker_type, event.latLng);

        this.map.data.revertStyle();
        this.map.data.overrideStyle(event.feature, def_feature_stl);

      } else {
        var bounds = new google.maps.LatLngBounds();
        this.processPoints(event.feature.getGeometry(), bounds.extend, bounds);
        this.map.setCenter(bounds.getCenter());
        this.map.fitBounds(bounds);
        this.map.data.revertStyle();
        this.map.data.overrideStyle(event.feature, click_feature_stl);
      }


      this.bindMimuDetailObj(event.feature);
      if (!this.marker.use_marker) {
        this.ex_mimu.open();
      }



    });
  }
  remove_Geojson() {
    this.map.data.forEach((feature) => {
      this.map.data.remove(feature);
    });
  }
  clearMarkers() {
    for (let i = 0; i < this.marker_list.length; i++) {
      this.marker_list[i].setMap(null);
    }
    this.marker_list = [];
  }
  set_rentagle(marker) {
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();

    let plusCode = this.manager.openlocEncode(lat, lng, parseInt(this.marker.pc_len));
    const areaCode = this.manager.openlocDecode(plusCode);
    const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
    const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
    let latlngBound = new google.maps.LatLngBounds(sw, ne);
    let latlngBoundLateral = latlngBound.toJSON();
    let retangle = this.manager.setRentagle(this.map, latlngBoundLateral);
    this.rantagle_list.push(retangle);

    //set detail retangle
    this.retangle_detail.latlng = { lat: lat, lng: lng };
    this.retangle_detail.pluscode = this.manager.fixLengthPlusCodeByLength(plusCode, this.marker.pc_len);
    if (this.detail.nbh)
      this.coeInputChangeEvent();
    return retangle;
  }
  set_Marker(markerType: string, latlng: { lat: any, lng: any }) {
    this.clearMarkers();
    this.mimu_detail = this.cleanMimuDetail();
    this.searchVal = '';
    this.detailClose();
    this.manager.remove_Rentagle(this.rantagle_list);
    $('#detail_col').show();
    let marker = new google.maps.Marker({
      position: latlng,

    });
    switch (markerType) {
      case "1":
        marker.setMap(this.map);
        this.marker_list.push(marker)
        this.set_zoom(marker, 13);
        this.retangle_detail.latlng = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
        this.retangle_detail.pluscode = this.manager.openlocEncode(marker.getPosition().lat(), marker.getPosition().lng(), parseInt(this.marker.pc_len))
          ;
        // this.manager.showToast(this.tostCtrl,"message",""+this.isContain(this.tsp,[marker.getPosition().lng(),marker.getPosition().lat()]),2000);
        break;
      case "2":
        let ret = this.set_rentagle(marker);
        switch (this.marker.pc_len) {
          case '8': this.set_zoom(marker, 13); break;
          case '6': this.set_zoom(marker, 13); break;
          case '4': this.set_zoom(marker, 9); break;
        }

        if (this.marker.is_nearbysearch) {
          this.nearBySearchByRetangle(ret, marker);
        };
        break;
    }
    this.marker_list.push(marker);

    this.ex_marker.open();
  }

  getSearchObj() {
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
  getState() {
    return new Promise(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/getstate';
      this.http.post(url, { code: "", description: "" }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.state_list = [];
          data.stateList.forEach(e => {
            this.state_list.push({ syskey: e.syskey, t1: e.t1, t2: e.t2 });
          });
          this.state_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }
  async stateChange() {

    if (this.map_style.stl_region == '2' || this.map_style.stl_region == '3') {
      this.district_list = [];
      this.getDistrict(this.region_search_cri.state.syskey);
    }
  }
  getDistrict(state: string) {
    return new Promise(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/getdistrict';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: state,
        districtSyskey: ""
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.district_list = [];
          data.districtList.forEach(e => {
            this.district_list.push({ syskey: e.syskey, t1: e.t1, t2: e.t2 });
          });
          this.district_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }
  async disChange() {
    this.tsp_list = [];
    this.getTsp(this.region_search_cri.district.syskey);
  }
  getTsp(dis: string) {
    return new Promise(done => {
      const url = this.manager.appConfig.apiurl + 'placecode/gettsp';
      this.http.post(url, {
        code: "",
        description: "",
        stateSyskey: "",
        districtSyskey: dis
      }, this.manager.getOptions()).subscribe(
        (data: any) => {
          done();
          this.tsp_list = [];
          data.tspList.forEach(e => {
            this.tsp_list.push({ syskey: e.syskey, t1: e.t1, t2: e.t2 });
          });
          this.tsp_list.sort((a, b) => (a.t2 > b.t2) ? 1 : -1);
        },
        error => {
          done();
        }
      )
    })
  }
  set_zoom(marker, zoomLvl: number) {
    //this.map.setCenter(marker.getPosition());
    if (this.map.getZoom() < zoomLvl) {
      this.map.setZoom(zoomLvl);
    }
    this.map.panTo(marker.getPosition())
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
  search() {
    $('#searchDropDown').dropdown('hide')
    this.remove_Geojson();
    this.mimu_detail = this.cleanMimuDetail();
    if (this.map_style.stl_region == "1") {

      this.manager.get_state_data(this.region_search_cri.state.t1).then(a_state => {
        this.add_Geojson(a_state);
        this.map.data.forEach((f) => {
          if (f.j.ST_PCODE === this.region_search_cri.state.t1) {
            this.map.data.overrideStyle(f, { fillColor: 'red', fillOpacity: 0.5, strokeColor: "red" });
            var bounds = new google.maps.LatLngBounds();
            this.processPoints(f.getGeometry(), bounds.extend, bounds);
            this.map.setCenter(bounds.getCenter());
            this.map.fitBounds(bounds);
            this.bindMimuDetailObj(f);
            this.ex_mimu.open();
            $('#detail_col').show();
            return false;
          }

        });
      })



    } else if (this.map_style.stl_region == "2") {
      this.manager.get_district_data(this.region_search_cri.district.t1 == '' ? this.region_search_cri.state.t1 : this.region_search_cri.district.t1).then(a_dist => {
        this.add_Geojson(a_dist);
        this.map.data.forEach((f) => {
          if (f.j.DT_PCODE === this.region_search_cri.district.t1) {
            this.map.data.overrideStyle(f, { fillColor: 'red', fillOpacity: 0.5, strokeColor: "red" });
            var bounds = new google.maps.LatLngBounds();
            this.processPoints(f.getGeometry(), bounds.extend, bounds);
            this.map.setCenter(bounds.getCenter());
            this.map.fitBounds(bounds);
            this.bindMimuDetailObj(f);
            this.ex_mimu.open();
            $('#detail_col').show();
            return false;
          }

        });
      })

    } else if (this.map_style.stl_region == "3") {
      let pcode = '';
      if (this.region_search_cri.tsp.t1 == '' && (this.region_search_cri.state.t1 !== '' && this.region_search_cri.district.t1 !== '')) {
        pcode = this.region_search_cri.district.t1;
      } else if ((this.region_search_cri.tsp.t1 == '' && this.region_search_cri.district.t1 == '') && this.region_search_cri.state.t1 !== '') {
        pcode = this.region_search_cri.state.t1;
      } else {
        pcode = this.region_search_cri.tsp.t1;
      }
      this.manager.get_tsp_data(pcode).then(a_tsp => {
        this.add_Geojson(a_tsp);
        this.map.data.forEach((f) => {
          if (f.j.TS_PCODE === pcode) {
            this.map.data.overrideStyle(f, { fillColor: 'red', fillOpacity: 0.5, strokeColor: "red" });
            var bounds = new google.maps.LatLngBounds();
            this.processPoints(f.getGeometry(), bounds.extend, bounds);
            this.map.setCenter(bounds.getCenter());
            this.map.fitBounds(bounds);
            this.bindMimuDetailObj(f);
            this.ex_mimu.open();
            $('#detail_col').show();
            return false;
          }

        });
      })

    }
  }
  bindMimuDetailObj(f) {
    this.mimu_detail = this.cleanMimuDetail();
    let h = f.j.ST_PCODE ? f.j.ST_PCODE : '';
    this.mimu_detail.state.t1 = h;
    if (f.j.ST) {
      this.mimu_detail.state.t2 = f.j.ST;

    }
    if (f.j.Name_MMR4) {
      this.mimu_detail.state.t3 = f.j.Name_MMR4;

    }
    if (f.j.DT_PCODE) {
      this.mimu_detail.district.t1 = f.j.DT_PCODE;

    }
    if (f.j.DT) {
      this.mimu_detail.district.t2 = f.j.DT;

    }
    if (f.j.DT_MMR4) {
      this.mimu_detail.district.t3 = f.j.DT_MMR4;

    }
    if (f.j.TS_PCODE) {
      this.mimu_detail.tsp.t1 = f.j.TS_PCODE;

    }
    if (f.j.TS) {
      this.mimu_detail.tsp.t2 = f.j.TS;

    }
    if (f.j.TS_MMR4) {
      this.mimu_detail.tsp.t3 = f.j.TS_MMR4;

    }
  }
  async nearBySearchByRetangle(retangle, marker) {
    this.clearMarkers();
    this.nearby_search_details = [];
    //our shop
    let plus = this.manager.openlocEncode(marker.getPosition().lat(), marker.getPosition().lng(), parseInt(this.marker.pc_len));
    const url = this.manager.appConfig.apiurl + 'shop/getshop-withinbound/' + plus;
    await new Promise(p => {
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          p();
          data.forEach(s => {
            let m;
            if (s.locationData.lat > 0 && s.locationData.lon > 0) {

              var image = new google.maps.MarkerImage(
                this.icons.my_store,
                new google.maps.Size(43, 59),
                new google.maps.Point(0, 0),
                new google.maps.Point(17, 34),
                new google.maps.Size(43, 59));
              m = new google.maps.Marker({
                map: this.map,
                label: "AB",
                // icon: image,
                position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
              });
              this.addListenerToMarker(m);
              this.marker_list.push(m);
            }
            if (m !== undefined) {
              this.nearby_search_details.push({ shop: s, marker: m });
            } else {
              this.nearby_search_details.push({ shop: s });
            }
          });
        }
      )
    })

    let request = {
      bounds: retangle.getBounds(),
      type: ['restaurant']
    }
    var service = new google.maps.places.PlacesService(this.map);

    service.nearbySearch(
      request
      , (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {


          for (let i = 0; i < results.length; i++) {
            let marker = new google.maps.Marker({
              position: (results[i].geometry).location,
              map: this.map,
              title: results[i].name,
            });
            results[i].marker = marker;
            this.nearby_search_details.push(results[i]);
            this.marker_list.push(marker);
          }
          this.ex_detail.open();
          $('#detail_col').show();

        }
      });
  }
  async searchBox() {
    let shopCri = this.getSearchObj();
    shopCri.shopName = this.searchVal;
    this.nearby_search_details = [];
    this.manager.remove_Rentagle(this.rantagle_list);
    this.clearMarkers();

    //our shop first
    const url = this.manager.appConfig.apiurl + 'shop/shoplist';
    await new Promise(p => {
      this.http.post(url, shopCri, this.manager.getOptions()).subscribe(
        (data: any) => {
          p();
          data.forEach(s => {
            let m;
            if (s.locationData.lat > 0 && s.locationData.lon > 0) {
              m = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
              });
              this.addListenerToMarker(m);
              this.marker_list.push(m);
            }
            if (m !== undefined) {
              this.nearby_search_details.push({ shop: s, marker: m });
            } else {
              this.nearby_search_details.push({ shop: s });
            }
          });
        }
      )
    })

    //then places
    const request = {

      query: this.searchVal,
      fields: ["name", "geometry", "formatted_address", "photos", "plus_code", "place_id"]
    };
    this.place_service = new google.maps.places.PlacesService(this.map)
    this.place_service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        //console.log(results)
        //this.nearby_search_details = [];
        for (let i = 0; i < results.length; i++) {
          const marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: results[i].geometry.location
          });

          this.map.setCenter(results[0].geometry.location);
          this.marker_list.push(marker);
          results[i].marker = marker;
          this.nearby_search_details.push(results[i]);
          if (results.length - 1 == i) {

          }
          if (this.searchVal.includes("+") && this.searchVal.length >= 8) {
            this.set_Marker("2", results[i].geometry.location);
          }
        }
      }
    });

    $('#detail_col').show();
    this.ex_detail.open();
  }
  showMarkerDetail(index) {
    let detail = this.nearby_search_details[index];
    this.info.close();
    if (detail.marker !== undefined) {
      this.info = new google.maps.InfoWindow({
        content: detail.name == undefined ? detail.shop.shopName : detail.name
      });
      this.info.open(this.map, detail.marker);
      //this.map.setCenter(detail.marker.getPosition());
      this.set_zoom(detail.marker, 13);
    }

  }
  detailClose() {

    this.nearby_search_details = [];
    this.manager.remove_Rentagle(this.rantagle_list);
    this.clearMarkers();
    $('#detail_col').hide();
  }
  addListenerToMarker(marker) {
    marker.addListener('click', e => {
      if (this.marker.is_nearbysearch) {
        this.set_Marker(this.marker.marker_type, e.latLng);
      }
    });

  }
  nearbyCbChange() {
    console.log("change");
    // this.tabIndex = 0;
  }


  async infoTabChange(event) {
    // if (event.index == 0) {
    //   this.getNbhTypeByPlusCode(this.nbh.setUp.pluscode);
    // } else {
    //   await this.getNeighbourhoodType();
    // }
  }
  getNeighbourhoodType() {
    return new Promise(promise => {
      const url = this.manager.appConfig.apiurl + "neighbourhood/get-nbh-type";
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {

          this.nbh.nbhtype = data;
          this.nbh.nbhtype = data.map(p => {
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

  private _nbhFilter(value: string) {
    const filterValue = value.toLowerCase();
    this.nbh.nbhtype_autocomplete = this.nbh.nbhtype.filter(option => option.t1.toLowerCase().includes(filterValue));
  }
  nbhTypeChange() {
    $('#nbh-setup-model').appendTo("body").modal('show');
  }
  saveCoefficient() {
    if (this.nbh.pluscodeLength == '12')
      this.saveCoefficientToService(this.nbh.setUp.pluscode, this.nbh.specialPluscode.shopSyskey);
    else
      this.saveCoefficientToService(this.nbh.setUp.pluscode, '0');
  }
  saveCoefficientToService(pluscode, shopsyskey) {
    this.loadEl.create({
      message: 'Saving..',
      backdropDismiss: false
    }).then(e => {
      e.present();
      let body = [];
      let coefficient = this.nbh.nbhtype.filter(t => {
        return t.check == true;
      })
      for (let i = 0; i < coefficient.length; i++) {

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
          "n2": coefficient[i].syskey,
          "n3": "0",
          "n4": "0",
          "n5": 0,
          "n6": 0
        }
        body.push(obj);
      }
      const url = this.manager.appConfig.apiurl + 'neighbourhood/save-coefficient-nbh/' + pluscode + '/' + shopsyskey;
      this.http.post(url, body, this.manager.getOptions()).subscribe(
        (data: any) => {
          e.dismiss();
          if (data.message == 'SUCCESS') {
            this.manager.showToast(this.tostCtrl, "Message", 'Success', 1000);
          } else {
            this.manager.showToast(this.tostCtrl, "Message", data.message, 1000);
          }
        }
      )
    })

  }
  newNbhTypeSave(type, matInput) {
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
          this.nbh = this.getNbhObj();
          this.getNeighbourhoodType();
          matInput.value = "";
        }
      }
    )
  }
  private getNbhObj() {
    return {
      nbhtype: [],
      nbhtypeByPluscode: [],
      isSetup: false,
      pluscodeLength: "9",
      setUp: {
        pluscode: "",
        nbh_type: []
      },
      typeSetup: {
        name: ""
      },
      tabIndex: 0,
      showCoefficientList: false,
      allowCoeffToSave: true,
      multiSelectGrid: false,
      specialPluscode: {
        retangle: [],
        shoplist: [],
        shopSyskey: ''
      }

    }
  }
  getNbhPlusObj() {
    return {

    }
  }
  getNbhTypeByPlusCode(plu: string) {

    if (plu == '') {
      return;

    }
    for (let i = 0; i < this.nbh.nbhtype.length; i++) {
      this.nbh.nbhtype[i].check = false;
    }
    this.loadEl.create({
      message: 'wait..',
      backdropDismiss: false
    }).then(el => {
      el.present();
      const url = this.manager.appConfig.apiurl + 'neighbourhood/get-nbh-type/' + plu;
      this.http.get(url, this.manager.getOptions()).subscribe(
        (data: any) => {
          this.nbh.nbhtypeByPluscode = data;
          for (let i = 0; i < this.nbh.nbhtype.length; i++) {
            this.nbh.nbhtype[i].check = false;
            for (let y = 0; y < this.nbh.nbhtypeByPluscode.length; y++) {
              if (this.nbh.nbhtypeByPluscode[y].n2 === this.nbh.nbhtype[i].syskey) {
                this.nbh.nbhtype[i].check = true;
              } else {

              }
            }
          }
          el.dismiss();
          this.nbh.showCoefficientList = true;
        }
      )
    })

  }
  nbhExpandEvent(e) {
    this.getNeighbourhoodType();
  }
  async deleteNbhType(id) {
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
      await new Promise(p => {
        this.http.post(url, obj, this.manager.getOptions()).subscribe(
          (data: any) => {
            if (data.message == "SUCCESS") {

            };
            p();
          },
          error => {
            p();
          }
        )
      })
      this.nbh = this.getNbhObj();
      this.getNeighbourhoodType();
    }

  }
  searchByNbhTypeList(val) {
    const list = val;
  }
  min() {
    $("#detail_col").animate({ height: "50px", width: "150px" });
  }
  max() {
    $("#detail_col").animate({ height: "500px", width: "400px" });
  }
  getCoefficientPlacesByType(id) {
    const url = this.manager.appConfig.apiurl + "neighbourhood/get-coefficient-nbh";
    this.http.post(url, id, this.manager.getOptions()).subscribe(
      (data: any) => {
        console.log(data);
        this.manager.remove_Rentagle(this.rantagle_list);
        data.forEach(rtn => {
          const areaCode = this.manager.openlocDecode(this.manager.fixLengthPlusCodeByLength(rtn.t1, '' + rtn.t1.length));
          const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
          const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
          let latlngBound = new google.maps.LatLngBounds(sw, ne);
          let latlngBoundLateral = latlngBound.toJSON();
          let retangle = this.manager.setRentagle(this.map, latlngBoundLateral);
          this.rantagle_list.push(retangle);
        });
        this.manager.showToast(this.tostCtrl, "Message", "Success", 1000);
      }
    )
  }
  coeInputChangeEvent() {
    this.nbh.showCoefficientList = false
  }
  plusCodeTypeChange() {

  }
  selectRegion(val) {
    this.nbh.multiSelectGrid = val;
    this.nearby_search_details = [];
    this.manager.remove_Rentagle(this.rantagle_list);
    this.clearMarkers();
    this.nbh.retangle = [];
    this.tostCtrl.create({
      header: 'Tap select grids',
      position: 'top',
      cssClass: 'info',
      mode: "md",
      color: 'primary',
      buttons: [
        {
          text: 'Done',
          handler: () => {
            console.log("shopcoefficient")
            this.getShopsForCoeff(this.nbh.specialPluscode.retangle);
          }
        }
      ]
    }).then(tost => {
      tost.present();
    })
  }
  setMultiSelectMarkers(latlng) {

    let marker = new google.maps.Marker({
      position: latlng,

    });
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();

    let plusCode = this.manager.openlocEncode(lat, lng, 8);
    const areaCode = this.manager.openlocDecode(plusCode);
    const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
    const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
    let latlngBound = new google.maps.LatLngBounds(sw, ne);
    let latlngBoundLateral = latlngBound.toJSON();
    let rtn = this.manager.setRentagle(this.map, latlngBoundLateral);
    return {
      retan: rtn,
      pluscode: plusCode,
      marker: [],
    };

  }
  setNbhRetangle(latlng) {
    this.manager.remove_Rentagle(this.rantagle_list)
    let marker = new google.maps.Marker({
      position: latlng,

    });
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();

    let plusCode = this.manager.openlocEncode(lat, lng, this.getlen());
    const areaCode = this.manager.openlocDecode(plusCode);
    const sw = { lat: areaCode.latitudeLo, lng: areaCode.longitudeLo };
    const ne = { lat: areaCode.latitudeHi, lng: areaCode.longitudeHi };
    let latlngBound = new google.maps.LatLngBounds(sw, ne);
    let latlngBoundLateral = latlngBound.toJSON();
    return this.manager.setRentagle(this.map, latlngBoundLateral);

  }
  getlen(){
    if(this.nbh.pluscodeLength == '9'){
      return 8;
    }else if(this.nbh.pluscodeLength == '11'){
      return 10;
    }else if(this.nbh.pluscodeLength == '12'){
      return 11;
    }else{
      return parseInt(this.nbh.pluscodeLength);
    }
  }

  async getShopsForCoeff(retangleObjList) {
    let infoList = [];

    for (let i = 0; i < retangleObjList.length; i++) {
      let plu = retangleObjList[i].pluscode;
      await new Promise(p => {
        const url = this.manager.appConfig.apiurl + 'shop/getshop-withinbound/' + plu;
        this.http.get(url, this.manager.getOptions()).subscribe(
          (data: any) => {
            this.nbh.specialPluscode.shoplist = data;
            data.forEach(s => {
              if (s.locationData.lat > 0 && s.locationData.lon > 0) {
                let m = new google.maps.Marker({
                  map: this.map,
                  title: s.shopName,
                  id: s.shopSysKey,
                  position: new google.maps.LatLng({ lat: parseFloat(s.locationData.lat), lng: parseFloat(s.locationData.lon) })
                });
                google.maps.event.addListener(m, 'click', (marker, i) => {
                  var infowindow = new google.maps.InfoWindow({
                    disableAutoPan: true
                    , isHidden: false
                    , closeBoxURL: ""
                    , pane: "mapPane"
                    , enableEventPropagation: true
                  });
                  var contentString =
                    '<div class="card border-0">'
                    + '<div class="card-body ">'
                    + '<h6>'
                    + m.title
                    + '</h6>'
                    + '<p>' + s.t5 + '</p>'
                    + '<p>' + s.shopCode + '</p>'
                    + '<p>' + s.locationData.lat + ',' + s.locationData.lon + '</p>'

                    + '</div>'

                    + '</div>';

                  var boxText = document.createElement("div");
                  boxText.innerHTML = contentString;
                  boxText.id = i;
                  var card_footer = document.createElement("div");
                  card_footer.className = "card-footer border-0 bg-transparent";
                  var button = document.createElement("button");
                  button.className = 'btn btn-sm btn-primary';
                  button.innerText = "Select";
                  card_footer.appendChild(button);
                  boxText.appendChild(card_footer);

                  infowindow.setContent(boxText);
                  infowindow.open(this.map, m);
                  infoList.push(infowindow);
                  google.maps.event.addDomListener(button, 'click', () => {
                    infoList.forEach(info => {
                      info.close();
                    });
                    this.nbh.multiSelectGrid = false;
                    this.nbh.setUp.pluscode = s.locationData.t1;
                    this.nbh.specialPluscode.shopSyskey = s.shopSysKey;
                    if (s.locationData.t1 !== '') {
                      this.getNbhTypeByPlusCode(s.locationData.t1);
                    } else {
                      this.manager.showToast(this.tostCtrl, "Message", "No pluscode data for this shop!", 1000)
                    }
                  })

                });//end add marker listener
              }
            });
            p();
          }
        )
      });
    }
    //console.log(retangleObjList);
  }
  openNeigbhourhood() {
    $('#detail_col').show();
    this.marker.use_marker = true;
    this.marker.pc_len = "8"
    this.detail.nbh = true;
    this.ex_nbh.open();
  }
  nbhPlusCodeChange() {
    this.manager.remove_Rentagle(this.nbh.specialPluscode.retangle);
    this.nbh.specialPluscode.retangle = [];
    this.nbh.specialPluscode.shoplist = [];
    this.nbh.specialPluscode.shopSyskey = '';
    this.nbh.showCoefficientList = false;
    this.nbh.setUp.pluscode = this.marker.pluscode.substr(0, parseInt(this.nbh.pluscodeLength));
  }
}
