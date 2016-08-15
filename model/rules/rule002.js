var mongoose = require('mongoose');

var rule002 ={
  
  rule002x:{type:String},
  rule002y:{type:String},
  range002:{type:String},
  createdAt:{type:Date,default:Date.now},
};

module.exports =rule002;
