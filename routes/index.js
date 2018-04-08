var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var cp=require('child_process');
var path=require('path');
//var glob=require('glob');
/* GET home page. */


//Todo list

// Add success response for ajax to continue
//

var remote_server="" //Leave empty if local 
var remote_server="ssh localhost" //Leave empty if local 
var remote_folder="/media/brunocosta/prime-backup/Torrents-active/"
var remote_folder="/home/brunocosta/Torrents/mount2/brunocosta/prime-backup/Torrents-active/"

//List videos
function listVideos(){
  return new Promise(
    function(resolve,reject){
      exec('find '+remote_folder+'**/*.m*',function(err,sdout,sderr){
      //exec(remote_server+" 'find "+remote_folder+"**/*.mkv'",function(err,sdout,sderr){
      if(err) reject(Error(err)); 
      resolve(sdout.toString().split("\n"))        
      })
    }
  )
}


function getTitle(){
  return new Promise(
    function(resolve,reject){
      exec(remote_server+" 'playerctl metadata title'",function(err,sdout,sderr){
      if(err) reject(Error(err)); 
      resolve(sdout.toString())        
      })
    }
  )
}

function downloadSubtitle(file){
  return new Promise(
    function(resolve,reject){
      //exec("ssh 192.168.1.5 'find ~/Sync/Torrents-active/**/*.mkv'",function(err,sdout,sderr){
      exec(remote_server+" '/usr/local/bin/subdb d \""+file+"\" -l pt'",function(err,sdout,sderr){
      if(err) reject(Error(err)); 
      resolve(sdout.toString())        
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
            seriesName=path.dirname(files[i]).split("/")[path.dirname(files[i]).split("/").length-1]
            if(seriesName!="Sample"){
              series[seriesName]=[path.basename(files[i])];
            }
          }
        }
        var result={paths:data,series:series}
        //Add some catch for error don't know what 
        resolve(result);
      }catch(err){
        reject(err)
      }
    }).catch(function(err){
      console.log(err);
    })
  })
}


router.get('/', function(req, res, next) {
  videos().then(function(data){
    res.render('index', { title: "Remote",paths:data.paths, series: data.series });
  }).catch(function(err){
    console.log("Cannot get videos in index: "+err);
  });   
});

router.get('/metadata/title', function(req, res, next) {
    getTitle().then(function(data){
      res.json( data );
    }).catch(function(err){
    console.log("Cannot get title: "+err);
  });  
});

router.get('/volume/up', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+" 'playerctl volume 0.10+'")
    res.render('index', { title: "Remote",paths:data.paths, series: data.series });
  }).catch(function(err){
    console.log("Problem getting volume up: "+err);
  });   
});


router.get('/volume/down', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+" 'playerctl volume 0.10-'")
    res.render('index', { title: "Remote",paths:data.paths, series: data.series });
  }).catch(function(err){
    console.log("Problem getting volume down: "+err);
  });   
});


router.get('/start', function(req, res, next) {
  console.log(req.query);
  videos().then(function(data){ 
    file=data.paths[req.query['idx']]
    downloadSubtitle(file).then(function(subRes){
      console.log(subRes);
      if (subRes.split(" ")[0]=="Successfully"){
        exec(remote_server+" ';pkill -9 vlc;DISPLAY=:0 vlc -f \""+file+"\" --sub-file=\""+file.replace(/\.m.*$/g,'.srt')+"\" &'")      
      }else{
        exec(remote_server+" ';pkill -9 vlc;DISPLAY=:0 vlc -f \""+file+"\" &'")      
      }
      res.render('index', { title: "Remote",paths:data.paths, series: data.series });
    }).catch(function(err){
      console.log("Unable to download subtitle "+err);
    })
  }).catch(function(err){
    console.log("Get videos list: "+err);
  });   
});

router.get('/ffwd', function(req, res, next) {
  videos().then(function(data){    
    exec(remote_server+" 'playerctl position 15+'");      
    //Add ok when done
    res.render('index', { title: "Remote",paths:data.paths, series: path.series});
  }).catch(function(err){
    console.log("Unable to fast forward: "+err);
  });   
});
router.get('/rewind', function(req, res, next) {
  videos().then(function(data){    
    exec(remote_server+" 'playerctl position 15-'");      
    //Add ok when done
    res.render('index', { title: "Remote",paths:data.paths, series: path.series});
  }).catch(function(err){
    console.log("Unable to get videos : "+err)
  });   
});

/* GET home page. */
router.get('/play', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+" 'playerctl play'")    
    res.render('index', { title: 'Play',series:data.series});
  }).catch(function(err){
    console.log("Unable to get videos and play : "+err)
  })
});
router.get('/pause', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+" 'playerctl pause'")   
    res.render('index', { title: 'Pause',series:data.series });
  }).catch(function(err){
    console.log("Unable to get videos or pause : "+err)
  })
});
router.get('/restart', function(req, res, next) {
  videos().then(function(data){
    exec(remote_server+" 'playerctl position +0'")   
    res.render('index', { title: 'Pause',series:data.series, });
  }).catch(function(err){
    console.log("Unable to get videos and restart : "+err)
  })
});
router.get('/restart1', function(req, res, next) {
  exec(remote_server+" 'playerctl position +110'")   
  res.render('index', { title: 'Pause',series:series });
});

router.post('/position/set',function(req,res,next){
  query=req.body
  position=parseInt(query.hours)*3600+parseInt(query.minutes)*60+parseInt(query.seconds);
  exec('playerctl position '+position);
  res.send(200);
})

router.post('/position/get',function(req,res,next){
  exec('playerctl position ',function(err,sdout,sderr){
    if (err) res.send(400);
    res.json( sdout )
  });

})

module.exports = router;
