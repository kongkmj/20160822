// 수신데이터

var mongoose = require('mongoose');

var beaconData ={
  beacon001x:{type:String},
  beacon001y:{type:String},
  beacon002x:{type:String},
  beacon002y:{type:String},
  beacon003x:{type:String},
  beacon003y:{type:String},
  beacon004x:{type:String},
  beacon004y:{type:String},
  beacon005x:{type:String},
  beacon005y:{type:String},
  rectime : {type:String},

  createdAt:{type:Date,default:Date.now},
};

module.exports = beaconData;
