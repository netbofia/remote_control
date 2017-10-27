var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var cp=require('child_process')
var path=require('path')
/* GET home page. */

//List videos
function listVideos(){
  return new Promise(
    function(resolve,reject){
      //exec("ssh 192.168.1.5 'find ~/Sync/Torrents-active/**/*.mkv'",function(err,sdout,sderr){
      exec("ssh pie 'find /media/brunocosta/prime-backup/Torrents-active/**/*.mkv'",function(err,sdout,sderr){
      if(err) reject(Error(err)); 
      resolve(sdout.toString().split("\n"))        
      })
    }
  )
}

function videos(){
  return new Promise(function(resolve,reject){
    listVideos().then(function(data){
      try{ 
        var files=data
        var series={}
        for( i in files ){
          try{
            series[path.dirname(files[i]).split("/")[path.dirname(files[i]).split("/").length-1]].push(path.basename(files[i]));
          }catch(err){
            series[path.dirname(files[i]).split("/")[path.dirname(files[i]).split("/").length-1]]=[path.basename(files[i])];
          }
        }
        var result={paths:data,series:series}
        //Add some catch for error don't know what 
        resolve(result);
      }catch(err){
        reject(err)
      }
    })
  })
}


router.get('/', function(req, res, next) {
  videos().then(function(data){
    res.render('index', { title: "Remote",paths:data.paths, series: data.series });
  });   
});

router.get('/start', function(req, res, next) {
  console.log(req.query);
  listVideos().then(function(data){ 
    var files=data.split("\n")
    var series={}
    for( i in files ){
      try{
        series[path.dirname(files[i]).split("/")[path.dirname(files[i]).split("/").length-1]].push(path.basename(files[i]));
      }catch(err){
        series[path.dirname(files[i]).split("/")[path.dirname(files[i]).split("/").length-1]]=[path.basename(files[i])];
      }
    }
    console.log(files[req.query['idx']])
    exec("ssh 192.168.1.5 'pkill -9 vlc;DISPLAY=:0 vlc -f \""+files[req.query['idx']]+"\" &'")      
    res.render('index', { title: "Remote",paths:data.split("\n"), series: series });
  });   
});

router.get('/ffwd', function(req, res, next) {
videos().then(function(data){    
    exec("ssh 192.168.1.5 'playerctl position 15+'");      
    //Add ok when done
    res.render('index', { title: "Remote",paths:data.paths, series: path.series});
  });   
});


/* GET home page. */
router.get('/play', function(req, res, next) {
  videos().then(function(data){
    exec("ssh 192.168.1.5 'playerctl play'")    
    res.render('index', { title: 'Play',series:data.series});
  })
});
router.get('/pause', function(req, res, next) {
  videos().then(function(data){
    exec("ssh 192.168.1.5 'playerctl pause'")   
    res.render('index', { title: 'Pause',series:data.series });
  })
});
router.get('/restart', function(req, res, next) {
  videos().then(function(data){
    exec("ssh 192.168.1.5 'playerctl position +0'")   
    res.render('index', { title: 'Pause',series:data.series, });
  })
});
router.get('/restart1', function(req, res, next) {
  exec("ssh 192.168.1.5 'playerctl position +110'")   
  res.render('index', { title: 'Pause',series:series });
});

module.exports = router;
