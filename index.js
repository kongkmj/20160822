var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose  = require('mongoose');
var querystring = require('querystring');

require('events').EventEmitter.prototype._maxListeners = 9999999;


//http server
var http = require('http').Server(app);
var io = require('socket.io')(http);


var data_001,data_002,data_003,data_004,data_005,data_006,data_007,data_008,data_009,data_0010; // 디바이스 수신데이터를 담을 전역변수
var noti001,noti002,noti003,noti004,noti005; //알림을 담을 전역변수
var rule_001,rule_002,rule_003,rule_004,rule_005; // DB데이터 담을 그릇

//디바이스 발신데이터를 담을 전역변수
var sendData = new Array(15);


var alaram=""; // 알람을 담을 그릇

var intervalmessage; // 클라이언트 주기버튼 메시지를 담을 변수

var rangedata = new Array(5);
var ruledata = new Array(10);


var rcrule = new Array(5); // 디바이스로부터 받은 기준치
//var rcinterval ; // 디바이스로 부터 받은 주기

var dbprevData = new Array(20); //역순으로 데이터를 찾기에 순서를 바꿔줄 그릇

var tcp_R_Data = new Array(10); //들어온 데이터 Parsing(int)
//var tcp_R_ChData =new Array(10); //parsing한 tcp_R_Data를 그래프표현을 위해 필터링

var falsecount;

// TCP
var net = require('net');
var socket2; // 소켓의 정보를 담을 그릇
var sd;
var tcprule001x,tcprule002x,tcprule003x,tcprule004x,tcprule005x;
var tcprule001y,tcprule002y,tcprule003y,tcprule004y,tcprule005y;
var tcprange001,tcprange002,tcprange003,tcprange004,tcprange005;
var datacount;

var server = net.createServer(function (socket) {

  console.log('Client connection: ');
  console.log('   local = %s:%s',socket.localAddress,socket.localPort); //로컬 포트
  console.log('   remote= %s:%s',socket.remoteAddress,socket.remotePort); //원격 포트
  socket.setEncoding('utf8');

  socket2=socket; // socket2라는 그릇에 sockt 정보 담기

  datacount=0;

  //디바이스로 부터 데이터 수신시
  socket.on('data',function (data) {
    datacount=1;

    console.log('Received data from client on port %d: %s',socket.remotePort,data.toString());
    console.log('   Byte recieved: '+socket.byteRead); // 총 수신 데이터
    console.log('   Byte sent : '+socket.bytesWritten);

    var recieveData = ""+data;
    var recieveArray = recieveData.split(',');

    //time
    var now = new Date();
    var hour = now.getHours();
    var min = now.getMinutes();
    var second = now.getSeconds();

    //beacon1
    tcp_R_Data[0] =parseInt(recieveArray[0]); //roll1
    tcp_R_Data[1] =parseInt(recieveArray[1]); //pitch1
    tcp_R_Data[2] =parseInt(recieveArray[2]); //민감도1
    //beacon2
    tcp_R_Data[3] =parseInt(recieveArray[3]); //roll2
    tcp_R_Data[4] =parseInt(recieveArray[4]); //pitch2
    tcp_R_Data[5] =parseInt(recieveArray[5]); //민감도2
    //beacon3
    tcp_R_Data[6] =parseInt(recieveArray[6]); //roll3
    tcp_R_Data[7] =parseInt(recieveArray[7]); //pitch2
    tcp_R_Data[8] =parseInt(recieveArray[8]); //민감도3
    //beacon4
    tcp_R_Data[9] =parseInt(recieveArray[9]); //roll4
    tcp_R_Data[10] =parseInt(recieveArray[10]); //pitch4
    tcp_R_Data[11] =parseInt(recieveArray[11]); //민감도4
    //beacon5
    tcp_R_Data[12] =parseInt(recieveArray[12]); //roll5
    tcp_R_Data[13] =parseInt(recieveArray[13]); //pitch5
    tcp_R_Data[14] =parseInt(recieveArray[14]); //민감도5
    //주기
    tcp_R_Data[15] =parseInt(recieveArray[15]);

    for(var cnt=0;cnt<tcp_R_Data.length;cnt++){
      if(tcp_R_Data[cnt]>180){
        tcp_R_Data[cnt]=180;
      }
    }
//수신데이터 민감도가 다를경우 카운터
     falsecount=0;

    //수신 데이터 저장 이전그래프를 띄위기위해
    var beacon_Data = new beaconData({
    beacon001x:tcp_R_Data[0],
    beacon001y:tcp_R_Data[1],
    beacon002x:tcp_R_Data[3],
    beacon002y:tcp_R_Data[4],
    beacon003x:tcp_R_Data[6],
    beacon003y:tcp_R_Data[7],
    beacon004x:tcp_R_Data[9],
    beacon004y:tcp_R_Data[10],
    beacon005x:tcp_R_Data[12],
    beacon005y:tcp_R_Data[13],
    rectime:(hour+":"+min+":"+second)
    });
    beacon_Data.save(function (err,beacon_Data) {

    });


    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 알람 관련 start @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    var notidata001x = parseInt(rule_001.rule001x);
    var notidata001y = parseInt(rule_001.rule001y);
    var notidata002x = parseInt(rule_002.rule002x);
    var notidata002y = parseInt(rule_002.rule002y);
    var notidata003x = parseInt(rule_003.rule003x);
    var notidata003y = parseInt(rule_003.rule003y);
    var notidata004x = parseInt(rule_004.rule004x);
    var notidata004y = parseInt(rule_004.rule004y);
    var notidata005x = parseInt(rule_005.rule005x);
    var notidata005y = parseInt(rule_005.rule005y);


    var parse1,parse2,parse3,parse4,parse5;
    // (1)
    if(rule_001.range001===undefined){
      parse1=70;
    }else {
      parse1=rule_001.range001;
    }
    // (2)
    if(rule_002.range002===undefined){
      parse2=70;
    }else {
      parse2=rule_002.range002;
    }

    // (3)
    if(rule_003.range003===undefined){
      parse3=70;
    }else {
      parse3=rule_003.range003;
    }
    // (4)
    if(rule_004.range004===undefined){
      parse4=70;
    }else {
      parse4=rule_004.range004;
    }
    // (5)
    if(rule_005.range005===undefined){
      parse5=70;
    }else {
      parse5=rule_005.range005;
    }

    // (1) 알람 연산
var plus001x = notidata001x +parseInt(parse1);
var plus001y = notidata001y +parseInt(parse1);
var minus001x =notidata001x -parseInt(parse1);
var minus001y =notidata001y -parseInt(parse1);


if((tcp_R_Data[0]>plus001x)||(tcp_R_Data[1]>plus001y)||(tcp_R_Data[0]<minus001x)||(tcp_R_Data[1]<minus001y)){
  noti001=1;
}
if((tcp_R_Data[0]<=plus001x)&&(tcp_R_Data[1]<=plus001y)&&(tcp_R_Data[0]>=minus001x)&&(tcp_R_Data[1]>=minus001y)){
  noti001=0;
}


// (2) 알람 연산
var plus002x = notidata002x +parseInt(parse2);
var plus002y = notidata002y +parseInt(parse2);
var minus002x =notidata002x -parseInt(parse2);
var minus002y =notidata002y -parseInt(parse2);

if((tcp_R_Data[3]>plus002x)||(tcp_R_Data[4]>plus002y)||(tcp_R_Data[3]<minus002x)||(tcp_R_Data[4]<minus002y)){
  noti002=1;
}
if((tcp_R_Data[3]<=plus002x)&&(tcp_R_Data[4]<=plus002y)&&(tcp_R_Data[3]>=minus002x)&&(tcp_R_Data[4]>=minus002y)){
  noti002=0;
}


// (3) 알람 연산
var plus003x = notidata003x +parseInt(parse3);
var plus003y = notidata003y +parseInt(parse3);
var minus003x =notidata003x -parseInt(parse3);
var minus003y =notidata003y -parseInt(parse3);

if((tcp_R_Data[6]>plus003x)||(tcp_R_Data[7]>plus003y)||(tcp_R_Data[6]<minus003x)||(tcp_R_Data[7]<minus003y)){
  noti003=1;
}
if((tcp_R_Data[6]<=plus003x)&&(tcp_R_Data[7]<=plus003y)&&(tcp_R_Data[6]>=minus003x)&&(tcp_R_Data[7]>=minus003y)){
  noti003=0;
}


// (4) 알람 연산
var plus004x = notidata004x +parseInt(parse4);
var plus004y = notidata004y +parseInt(parse4);
var minus004x =notidata004x -parseInt(parse4);
var minus004y = notidata004y -parseInt(parse4);

if((tcp_R_Data[9]>plus004x)||(tcp_R_Data[10]>plus004y)||(tcp_R_Data[9]<minus004x)||(tcp_R_Data[10]<minus004y)){
  noti004=1;
}
if((tcp_R_Data[9]<=plus004x)&&(tcp_R_Data[10]<=plus004y)&&(tcp_R_Data[9]>=minus004x)&&(tcp_R_Data[10]>=minus004y)){
  noti004=0;
}


// (5) 알람 연산
var plus005x = notidata005x +parseInt(parse5);
var plus005y = notidata005y +parseInt(parse5);
var minus005x =notidata005x -parseInt(parse5);
var minus005y =notidata005y -parseInt(parse5);

if((tcp_R_Data[12]>plus005x)||(tcp_R_Data[13]>plus005y)||(tcp_R_Data[12]<minus005x)||(tcp_R_Data[13]<minus005y)){
  noti005=1;
}
if((tcp_R_Data[12]<=plus005x)&&(tcp_R_Data[13]<=plus005y)&&(tcp_R_Data[12]>=minus005x)&&(tcp_R_Data[13]>=minus005y)){
  noti005=0;
}

//알람 배열
var notiarr=[noti001,noti002,noti003,noti004,noti005];

  alaram="";
  for(var i=0;i<10;i++){
    if(notiarr[i]==1){
      alaram+=1+i+"번 ";
    }
  }

  //alaram DB저장
  if(alaram!==""){
    var alaramsave = new alaram1({
          id:1,
          alaram:alaram
        });

      alaramsave.save(function (err,alaramsave) {

    });
  }



  // (1) 알림
  if(noti001==1){
    var log1 = new beacon001({
        bnum:1,
        gnum:1,
        status:"경고",
        beaconx:tcp_R_Data[0],
        beacony:tcp_R_Data[1]
      });
      console.log("1번 비콘 경고 받음");
    log1.save(function (err,log1){

    });
  }

  // (2) 알림
  if(noti002==1){
    var log2 = new beacon002({
        bnum:2,
        gnum:1,
        status:"경고",
        beaconx:tcp_R_Data[3],
        beacony:tcp_R_Data[4]
      });
      console.log("2번 비콘 경고 받음");
    log2.save(function (err,log2) {

    });
  }

  // (3) 알림
  if(noti003==1){
    var log3 = new beacon003({
        bnum:3,
        gnum:1,
        status:"경고",
        beaconx:tcp_R_Data[6],
        beacony:tcp_R_Data[7]
      });
      console.log("3번 비콘 경고 받음");
    log3.save(function (err,log3) {
    });
  }

  // (4) 알림
  if(noti004==1){
    var log4 = new beacon004({
        bnum:4,
        gnum:1,
        status:"경고",
        beaconx:tcp_R_Data[9],
        beacony:tcp_R_Data[10]
      });
      console.log("4번 비콘 경고 받음");
    log4.save(function (err,log4) {
    });
  }

  // (5) 알림
  if(noti005==1){
    var log5 = new beacon005({
        bnum:5,
        gnum:1,
        status:"경고",
        beaconx:tcp_R_Data[12],
        beacony:tcp_R_Data[13]
      });
      console.log("5번 비콘 경고 받음");
    log5.save(function (err,log5) {
    });
  }

  //수신데이터의 민감도가 다를시

  if(tcp_R_Data[2]!=rule_001.range001||tcp_R_Data[5]!=rule_002.range002||tcp_R_Data[8]!=rule_003.range003||tcp_R_Data[11]!=rule_004.range004||tcp_R_Data[14]!=rule_005.range005||tcp_R_Data[15]!=intervalmessage){
    falsecount=1;
    sendData[0]=rule_001.rule001x;
    sendData[1]=rule_002.rule002x;
    sendData[2]=rule_003.rule003x;
    sendData[3]=rule_004.rule004x;
    sendData[4]=rule_005.rule005x;

    sendData[5]=rule_001.rule001y;
    sendData[6]=rule_002.rule002y;
    sendData[7]=rule_003.rule003y;
    sendData[8]=rule_004.rule004y;
    sendData[9]=rule_005.rule005y;

    sendData[10]=rule_001.range001;
    sendData[11]=rule_002.range002;
    sendData[12]=rule_003.range003;
    sendData[13]=rule_004.range004;
    sendData[14]=rule_005.range005;

    for(var d=0;d<15;d++){
    if(sendData[d].length==1){
      sendData[d]="00"+sendData[d];
    }
    else if(sendData[d].length==2){
      sendData[d]="0"+sendData[d];
    }
    else if(sendData[d].length==3){
      sendData[d]=sendData[d];
    }
    }
    var tcpsendData="a"+sendData[0]+"x"+sendData[5]+"x"+sendData[10]+"x"+
                    sendData[1]+"x"+sendData[6]+"x"+sendData[11]+"x"+
                    sendData[2]+"x"+sendData[7]+"x"+sendData[12]+"x"+
                    sendData[3]+"x"+sendData[8]+"x"+sendData[13]+"x"+
                    sendData[4]+"x"+sendData[9]+"x"+sendData[14]+"x"+
                    intervalmessage+"b";
   writeData(socket2,tcpsendData);
  }
    io.emit('chat message',tcp_R_Data,alaram,recieveArray);

    if(std1==1){
      rule001.find({}).sort('-createdAt').exec(function (err, r001) {
          var log1 = new rule001({
            rule001x:tcp_R_Data[0],
            rule001y:tcp_R_Data[1],
            range001:r001[0].range001
          });
          log1.save(function (err,log1) {
          });
      });
      tcprule001x=tcp_R_Data[0];
      tcprule001y=tcp_R_Data[1];

      io.emit('luck1');

      std1=0;
    }
    if(std2==1){
      rule002.find({}).sort('-createdAt').exec(function (err, r002) {
          var log2 = new rule002({
            rule002x:tcp_R_Data[3],
            rule002y:tcp_R_Data[4],
            range002:r002[0].range002
          });
          log2.save(function (err,log2) {
          });
      });
      tcprule002x=tcp_R_Data[3];
      tcprule002y=tcp_R_Data[4];
      io.emit('luck2');
      std2=0;
    }
    if(std3==1){
      rule003.find({}).sort('-createdAt').exec(function (err, r003) {
          var log3 = new rule003({
            rule003x:tcp_R_Data[6],
            rule003y:tcp_R_Data[7],
            range003:r003[0].range003
          });
          log3.save(function (err,log3) {
          });
      });
      tcprule003x=tcp_R_Data[6];
      tcprule003y=tcp_R_Data[7];
      io.emit('luck3');

      std3=0;
    }
    if(std4==1){
      rule004.find({}).sort('-createdAt').exec(function (err, r004) {
          var log4 = new rule004({
            rule004x:tcp_R_Data[9],
            rule004y:tcp_R_Data[10],
            range004:r004[0].range004
          });
          log4.save(function (err,log4) {
          });
      });
      tcprule004x=tcp_R_Data[9];
      tcprule004y=tcp_R_Data[10];
      io.emit('luck4');
      std4=0;
    }
    if(std5==1){
      rule005.find({}).sort('-createdAt').exec(function (err, r005) {
          var log5 = new rule005({
            rule005x:tcp_R_Data[12],
            rule005y:tcp_R_Data[13],
            range005:r005[0].range005
          });
          log5.save(function (err,log5) {
          });
      });
      tcprule005x=tcp_R_Data[12];
      tcprule005y=tcp_R_Data[13];
      io.emit('luck5');
      std5=0;
    }
});


rule001.find({}).sort('-createdAt').exec(function (err, r001) {

      rule_001=r001[0];
      if(rule_001===undefined){
      rule_001={rule001x:"10",rule001y:"10",range001:"10"};
      }
      rule002.find({}).sort('-createdAt').exec(function (err, r002) {

          rule_002=r002[0];
          if(rule_002===undefined){
          rule_002={rule002x:"10",rule002y:"10",range002:"10"};
          }
          rule003.find({}).sort('-createdAt').exec(function (err, r003) {

              rule_003=r003[0];
              if(rule_003===undefined){
              rule_003={rule003x:"10",rule003y:"10",range003:"10"};
              }
              rule004.find({}).sort('-createdAt').exec(function (err, r004) {

                  rule_004=r004[0];
                  if(rule_004===undefined){
                  rule_004={rule004x:"10",rule004y:"10",range004:"10"};
                  }
                  rule005.find({}).sort('-createdAt').exec(function (err, r005) {

                      rule_005=r005[0];
                      if(rule_005===undefined){
                      rule_005={rule005x:"10",rule005y:"10",range005:"10"};
                      }
                });
            });
        });
    });
});

// socket 반대편에 FIN 패킷을 보낼때
  socket.on('end',function () {
    console.log('Client disconnected');
    server.getConnections(function (err,count) {
      console.log('Remaining Connection: '+count);
    });
  });

  // socket 에러 발생시
  socket.on('error',function (err) {
    console.log('Socket Error: '+JSON.stringify(err));
  });

});


//TCP 포트설정
server.listen(11111,function () {
  console.log('Server listening: '+JSON.stringify(server.address()));

  server.on('close',function () {
    console.log('Server Terminated');
  });

  server.on('error',function (err) {
    console.log('Server Error: ',JSON.stringify(err));
  });
});

// TCP 쓰기 함수
function writeData(socket,data) {
    var success = !socket.write(data);
    if(!success){
      (function (socket,data) {
          socket.once('drain',function () {
              writeData(socket,data);
          });
      })(socket,data);
    }
}


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ DB 관련 start @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//##################### DB 연결 ########################
mongoose.connect("mongodb://127.0.0.1:27017");
var db = mongoose.connection;
db.once("open",function () {
  console.log("DB connected");
});
db.on("error",function (err) {
  console.log("DB ERROR: ",err);
});


//##################### model setting ##################

//##################### recieveData ####################
var beaconDataSchema = require('./model/beacons/beaconData');
var beaconData = mongoose.model('rcdata',beaconDataSchema);


//##################### beacons ########################
var beacon001Schema =require('./model/beacons/beacon001');
var beacon001 = mongoose.model('bc001',beacon001Schema);

var beacon002Schema =require('./model/beacons/beacon002');
var beacon002 = mongoose.model('bc002',beacon002Schema);

var beacon003Schema =require('./model/beacons/beacon003');
var beacon003 = mongoose.model('bc003',beacon003Schema);

var beacon004Schema =require('./model/beacons/beacon004');
var beacon004 = mongoose.model('bc004',beacon004Schema);

var beacon005Schema =require('./model/beacons/beacon005');
var beacon005 = mongoose.model('bc005',beacon005Schema);




//###################### rules #########################
var rule001Schema = require('./model/rules/rule001');
var rule001 = mongoose.model('r001',rule001Schema);

var rule002Schema = require('./model/rules/rule002');
var rule002 = mongoose.model('r002',rule002Schema);

var rule003Schema = require('./model/rules/rule003');
var rule003 = mongoose.model('r003',rule003Schema);

var rule004Schema = require('./model/rules/rule004');
var rule004 = mongoose.model('r004',rule004Schema);

var rule005Schema = require('./model/rules/rule005');
var rule005 = mongoose.model('r005',rule005Schema);



//##################### alaram ########################
var alaramSchema = require('./model/alaram');
var alaram1 = mongoose.model('a',alaramSchema);

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ DB 관련 END @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs'); // view engine 설정

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));// 정적폴더 세팅




//@@@@@@@@@@@@@@@@@@@@@@@@@@@ mapping 관련 START @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

setInterval(function(){
 if(alaram!==""){
 if(datacount==1){
  datacount=0;
}else if(datacount!=1){
 console.log("알람후 데이터 쐇다");
 writeData(socket2,'std');
 }
}
},1000*5);


//##################### 접속 첫 페이지 ########################

app.get('/',function (req,res) {
  res.render('index');

});


app.get('/input',function (req,res) {
  console.log("카웉너"+falsecount);
  rule001.find({}).sort('-createdAt').exec(function (err, r001) {

      rule002.find({}).sort('-createdAt').exec(function (err, r002) {

          rule003.find({}).sort('-createdAt').exec(function (err, r003) {

              rule004.find({}).sort('-createdAt').exec(function (err, r004) {

                  rule005.find({}).sort('-createdAt').exec(function (err, r005) {


                              rule_001=r001[0];
                              rule_002=r002[0];
                              rule_003=r003[0];
                              rule_004=r004[0];
                              rule_005=r005[0];

                              if(rule_001===undefined){
                                rule_001={rule001x:"10",rule001y:"10",range001:"10"};
                              }
                              if(rule_002===undefined){
                                rule_002={rule002x:"10",rule002y:"10",range002:"10"};
                              }
                              if(rule_003===undefined){
                                rule_003={rule003x:"10",rule003y:"10",range003:"10"};
                              }
                              if(rule_004===undefined){
                                rule_004={rule004x:"10",rule004y:"10",range004:"10"};
                              }
                              if(rule_005===undefined){
                                rule_005={rule005x:"10",rule005y:"10",range005:"10"};
                              }

                              sendData[0]=rule_001.rule001x;
                              sendData[1]=rule_002.rule002x;
                              sendData[2]=rule_003.rule003x;
                              sendData[3]=rule_004.rule004x;
                              sendData[4]=rule_005.rule005x;

                              sendData[5]=rule_001.rule001y;
                              sendData[6]=rule_002.rule002y;
                              sendData[7]=rule_003.rule003y;
                              sendData[8]=rule_004.rule004y;
                              sendData[9]=rule_005.rule005y;

                              sendData[10]=rule_001.range001;
                              sendData[11]=rule_002.range002;
                              sendData[12]=rule_003.range003;
                              sendData[13]=rule_004.range004;
                              sendData[14]=rule_005.range005;

                      if(sd==1&&falsecount==0){
                        for(var i=0;i<15;i++){
                          if(sendData[i].length==1){
                            sendData[i]="00"+sendData[i];
                          }
                          else if(sendData[i].length==2){
                            sendData[i]="0"+sendData[i];
                          }
                          else if(sendData[i].length==3){
                            sendData[i]=sendData[i];
                          }
                        }
                        var tcpsendData="a"+sendData[0]+"x"+sendData[5]+"x"+sendData[10]+"x"+
                                        sendData[1]+"x"+sendData[6]+"x"+sendData[11]+"x"+
                                        sendData[2]+"x"+sendData[7]+"x"+sendData[12]+"x"+
                                        sendData[3]+"x"+sendData[8]+"x"+sendData[13]+"x"+
                                        sendData[4]+"x"+sendData[9]+"x"+sendData[14]+"x"+
                                        intervalmessage+"b";
                       writeData(socket2,tcpsendData);
                   sd=0;
                     }


                              res.render("input",{data_1:rule_001,data_2:rule_002,data_3:rule_003,data_4:rule_004,data_5:rule_005});
                            });
                            });
                          });
                        });
                      });
});




//################# 기준치 설정 POST START #######################
var std1,std2,std3,std4,std5;
var sstd1=1,sstd2=1,sstd3=1,sstd4=1,sstd5=1;
io.on('connection',function (socketio) {
  socketio.on('std1',function () {
    writeData(socket2,"std");
    std1=1;
    sstd1=0;
    console.log('std 버튼 누르기');
  });
  socketio.on('std2',function () {
    writeData(socket2,"std");
    std2=1;
    sstd2=0;
  });
  socketio.on('std3',function () {
    writeData(socket2,"std");
    std3=1;
    sstd3=0;
  });
  socketio.on('std4',function () {
    writeData(socket2,"std");
    std4=1;
    sstd4=0;
  });
  socketio.on('std5',function () {
    writeData(socket2,"std");
    std5=1;
    sstd5=0;
  });

  //주기
  socketio.on('intervalEV',function (message) {

    intervalmessage=message;
    sendData[0]=rule_001.rule001x;
    sendData[1]=rule_002.rule002x;
    sendData[2]=rule_003.rule003x;
    sendData[3]=rule_004.rule004x;
    sendData[4]=rule_005.rule005x;

    sendData[5]=rule_001.rule001y;
    sendData[6]=rule_002.rule002y;
    sendData[7]=rule_003.rule003y;
    sendData[8]=rule_004.rule004y;
    sendData[9]=rule_005.rule005y;

    sendData[10]=rule_001.range001;
    sendData[11]=rule_002.range002;
    sendData[12]=rule_003.range003;
    sendData[13]=rule_004.range004;
    sendData[14]=rule_005.range005;
for(var i=0;i<15;i++){
if(sendData[i].length==1){
  sendData[i]="00"+sendData[i];
}
else if(sendData[i].length==2){
  sendData[i]="0"+sendData[i];
}
else if(sendData[i].length==3){
  sendData[i]=sendData[i];
}
}
    var tcpsendData="a"+sendData[0]+"x"+sendData[5]+"x"+sendData[10]+"x"+
                    sendData[1]+"x"+sendData[6]+"x"+sendData[11]+"x"+
                    sendData[2]+"x"+sendData[7]+"x"+sendData[12]+"x"+
                    sendData[3]+"x"+sendData[8]+"x"+sendData[13]+"x"+
                    sendData[4]+"x"+sendData[9]+"x"+sendData[14]+"x"+
                    intervalmessage+"b";
   writeData(socket2,tcpsendData);

  });

});


// (1)
app.post('/input1',function (req,res) {
  if(sstd1==1){
    tcprule001x=rule_001.rule001x;
    tcprule001y=rule_001.rule001y;
  }
  if(req.body.range1===undefined){
      tcprange001=rule_001.range001;
  }
  else {
    tcprange001=req.body.range1;
  }
    var log1 = new rule001({
      rule001x:tcprule001x,
      rule001y:tcprule001y,
      range001:tcprange001
    });
    sd=1;
    res.redirect('/input');
    log1.save(function (err,log1) {
  });

});

// (2)
app.post('/input2',function (req,res) {
  if(sstd2==1){
    tcprule002x=rule_002.rule002x;
    tcprule002y=rule_002.rule002y;
  }
if(req.body.range2===undefined){
    tcprange002=rule_002.range002;
}
else {
  tcprange002=req.body.range2;
}
    var log2 = new rule002({
      rule002x:tcprule002x,
      rule002y:tcprule002y,
      range002:tcprange002
    });
    sd=1;
    res.redirect('/input');
    log2.save(function (err,log2) {
  });

});

// (3)
app.post('/input3',function (req,res) {
  if(sstd3==1){
    tcprule003x=rule_003.rule003x;
    tcprule003y=rule_003.rule003y;
  }
if(req.body.range3===undefined){
    tcprange003=rule_003.range003;
}
else {
  tcprange003=req.body.range3;
}
    var log3 = new rule003({
      rule003x:tcprule003x,
      rule003y:tcprule003y,
      range003:tcprange003
    });
    sd=1;
    res.redirect('/input');
    log3.save(function (err,log3) {
  });
});

// (4)
app.post('/input4',function (req,res) {
  if(sstd4==1){
    tcprule004x=rule_004.rule004x;
    tcprule004y=rule_004.rule004y;
  }
if(req.body.range4===undefined){
    tcprange004=rule_004.range004;
}
else {
  tcprange004=req.body.range4;
}
    var log4 = new rule004({
      rule004x:tcprule004x,
      rule004y:tcprule004y,
      range004:tcprange004
    });
    sd=1;
    res.redirect('/input');
    log4.save(function (err,log4) {
  });
});

// (5)
app.post('/input5',function (req,res) {
  if(sstd5==1){
    tcprule005x=rule_005.rule005x;
    tcprule005y=rule_005.rule005y;
  }
if(req.body.range5===undefined){
    tcprange005=rule_005.range005;
}
else {
  tcprange005=req.body.range5;
}
    var log5 = new rule005({
      rule005x:tcprule005x,
      rule005y:tcprule005y,
      range005:tcprange005
    });
    sd=1;
    res.redirect('/input');
    log5.save(function (err,log5) {
  });
});



//################# 기준치 설정 POST END #########################




//######################### 알람 EVENT ##########################
io.on('connection',function (socket) {

  socket.emit('news',alaram,dbprevData);

});


//################# 그래프 page mapping START ###################

// (total)
app.get('/realtimechart-0',function (req,res) {

//################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];



  alaram1.findOne({id:1}).sort('-createdAt').exec(function (err,a) {
      rule001.find({}).sort('-createdAt').exec(function (err, r001) {
        rule002.find({}).sort('-createdAt').exec(function (err, r002) {
          rule003.find({}).sort('-createdAt').exec(function (err, r003) {
            rule004.find({}).sort('-createdAt').exec(function (err, r004) {
              rule005.find({}).sort('-createdAt').exec(function (err, r005) {
                  rule_001=r001[0];
                  rule_002=r002[0];
                  rule_003=r003[0];
                  rule_004=r004[0];
                  rule_005=r005[0];

                  res.render("realtimechart-0", {data1:rule_001,data2:rule_002,data3:rule_003,data4:rule_004,data5:rule_005,data6:a});
             });
            });
          });
        });
      });
    });
  });
});

// (1)
app.get('/realtimechart-1',function (req,res) {
  //################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];

  alaram1.findOne({id:1}).sort('-createdAt').exec(function (err,a) {

      rule001.find({}).sort('-createdAt').exec(function (err, r001) {
          rule_001=r001[0];
          if(rule_001===undefined){
            rule_001={rule001x:"10",range001:"10"};
          }
          beacon001.find({}).sort('-createdAt').exec(function (err, bc001) {
                if (err) return res.json({success: false, message: err});
                  res.render("realtimechart-1", {data:bc001,data2:rule_001,data3:a});
              });
        });
    });
    });
});


// (2)
app.get('/realtimechart-2',function (req,res) {

  //################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];

  rule002.find({}).sort('-createdAt').exec(function (err, r002) {
      rule_002=r002[0];
      if(rule_002===undefined){
        rule_002={rule002x:"10",range002:"10"};
      }
      beacon002.find({}).sort('-createdAt').exec(function (err, bc002) {
            if (err) return res.json({success: false, message: err});
              res.render("realtimechart-2", {data:bc002,data2:rule_002});
          });
      });
});
});

// (3)
app.get('/realtimechart-3',function (req,res) {

  //################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];
  rule003.find({}).sort('-createdAt').exec(function (err, r003) {
      rule_003=r003[0];
      if(rule_003===undefined){
        rule_003={rule003x:"10",range003:"10"};
      }
      beacon003.find({}).sort('-createdAt').exec(function (err, bc003) {
            if (err) return res.json({success: false, message: err});
              res.render("realtimechart-3", {data:bc003,data2:rule_003});
          });
      });
});
});

// (4)
app.get('/realtimechart-4',function (req,res) {

  //################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];
  rule004.find({}).sort('-createdAt').exec(function (err, r004) {
      rule_004=r004[0];
      if(rule_004===undefined){
        rule_004={rule004x:"10",range004:"10"};
      }
      beacon004.find({}).sort('-createdAt').exec(function (err, bc004) {
            if (err) return res.json({success: false, message: err});
              res.render("realtimechart-4", {data:bc004,data2:rule_004});
          });
      });
});
});

// (5)
app.get('/realtimechart-5',function (req,res) {

    //################# 그래프 이전 데이터  #########################

//var nowtime = new Array(20);

// DB에서 최근 20개의 데이터를 역순 끝에서부터 20개를 받아오고있다.
beaconData.find({}).limit(20).sort({$natural:-1}).exec(function (err,rcdata) {


    //역순이라 다시 순서를 바꿔주고 있다.
    dbprevData[0]=rcdata[19];
    dbprevData[1]=rcdata[18];
    dbprevData[2]=rcdata[17];
    dbprevData[3]=rcdata[16];
    dbprevData[4]=rcdata[15];
    dbprevData[5]=rcdata[14];
    dbprevData[6]=rcdata[13];
    dbprevData[7]=rcdata[12];
    dbprevData[8]=rcdata[11];
    dbprevData[9]=rcdata[10];
    dbprevData[10]=rcdata[9];
    dbprevData[11]=rcdata[8];
    dbprevData[12]=rcdata[7];
    dbprevData[13]=rcdata[6];
    dbprevData[14]=rcdata[5];
    dbprevData[15]=rcdata[4];
    dbprevData[16]=rcdata[3];
    dbprevData[17]=rcdata[2];
    dbprevData[18]=rcdata[1];
    dbprevData[19]=rcdata[0];

  rule005.find({}).sort('-createdAt').exec(function (err, r005) {
      rule_005=r005[0];
      if(rule_005===undefined){
        rule_005={rule005x:"10",range005:"10"};
      }
      beacon005.find({}).sort('-createdAt').exec(function (err, bc005) {
            if (err) return res.json({success: false, message: err});
              res.render("realtimechart-5", {data:bc005,data2:rule_005});
          });
      });
});
});



//################# 그래프 page mapping EMD #####################


//@@@@@@@@@@@@@@@@@@@@@@@@@@@ mapping 관련 END @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



http.listen(80,function(){
    console.log('listening at 80');

});
