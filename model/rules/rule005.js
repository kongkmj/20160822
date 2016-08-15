var mongoose = require('mongoose');

var rule005 ={
  
  rule005x:{type:String},
  rule005y:{type:String},
  range005:{type:String},
  createdAt:{type:Date,default:Date.now},
};

module.exports =rule005;
