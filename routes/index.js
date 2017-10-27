var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var cp=require('child_process')
var path=require('path')
/* GET home page. */


//Todo list

// Add success response for ajax to continue
//

var remote_server="ssh pie" //Leave empty if local 
var remote_folder="/media/brunocosta/prime-backup/Torrents-active/"

//List videos
function listVideos(){
  return new Promise(
    function(resolve,reject){
      //exec("ssh 192.168.1.5 'find ~/Sync/Torrents-active/**/*.mkv'",function(err,sdout,sderr){
      exec(remote_server+"'find "+remote_folder+"**/*.mkv'",function(err,sdout,sderr){
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
  videos().then(function(data){ 
    console.log(files[req.query['idx']])
    exec(remote_server+"'pkill -9 vlc;DISPLAY=:0 vlc -f \""+files[req.query['idx']]+"\" &'")      
    res.render('index', { title: "Remote",paths:data.paths, series: data.series });
  });   
});

router.get('/ffwd', function(req, res, next) {
  videos().then(function(data){    
    exec(remote_server+"'playerctl position 15+'");      
    //Add ok when done
    res.render('index', { title: "Remote",paths:data.paths, series: path.series});
  });   
});


/* GET home page. */
router.get('/play', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+"'playerctl play'")    
    res.render('index', { title: 'Play',series:data.series});
  })
});
router.get('/pause', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+"'playerctl pause'")   
    res.render('index', { title: 'Pause',series:data.series });
  })
});
router.get('/restart', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+"'playerctl position +0'")   
    res.render('index', { title: 'Pause',series:data.series, });
  })
});
router.get('/restart1', function(req, res, next) {
  exec(remote_server+"'playerctl position +110'")   
  res.render('index', { title: 'Pause',series:series });
});

module.exports = router;
