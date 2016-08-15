var mongoose = require('mongoose');

var rule001 ={

  rule001x:{type:String},
  rule001y:{type:String},
  range001:{type:String},
  createdAt:{type:Date,default:Date.now},
};

module.exports =rule001;
