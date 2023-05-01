/*
    Script Name : library.js
    Creation Date : April 25, 2020
    Modification Date : April 26, 2020
    Purpose : This script is written by Phyo Kyi for Excel Heat Mapping Project...
*/

var tilelayer = {
    "openstreetmap/standard":{
        url : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribuition : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        id : ""
    },
    "openstreetmap/humanitarian":{
        url : "https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribuition : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        id : ""
    }
}

var geolevel = {
    "States" : {
        geocode : "ST_PCODE",
        geoname : "ST",
        src : "./ref_files/state.js"
    },
    "District" : {
        geocode : "DT_PCODE",
        geoname : "DT",
        src : "./ref_files/district.js"
    },
    "Township" : {
        geocode : "TS_PCODE",
        geoname : "TS",
        src : "./ref_files/township.js"
    }
}