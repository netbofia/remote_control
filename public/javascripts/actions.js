$(document).ready(function(){
  //Must deal with resizing This becomes fixed for the session
  $('.fastforward').on('click',function(){
     $.ajax({
          url: "/ffwd",
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({path:"ssss",up:true}),
          success: function(data,textStatus,jqXHR){

    }})
  })
    $('.rewind').on('click',function(){
     $.ajax({
          url: "/rewind",
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({path:"ssss",up:true}),
          success: function(data,textStatus,jqXHR){

    }})
  })
  $('.video').on('click',function(){
     count=$(this).attr('count');
     $.ajax({
          url: "/start?idx="+count,
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({path:"ssss",up:true}),
          success: function(data,textStatus,jqXHR){
            $('.play').addClass('active')
            $('.pause').removeClass('active')
          }
    })
  })


  $('.play').on('click',function(){
     $.ajax({
          url: "/play",
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({path:"ssss",up:true}),
          success: function(data,textStatus,jqXHR){
            $('.play').addClass('active')
            $('.pause').removeClass('active')
          }
    })
  })
  $('.pause').on('click',function(){
     $.ajax({
          url: "/pause",
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({path:"ssss",up:true}),
          success: function(data,textStatus,jqXHR){
            $('.pause').addClass('active')
            $('.play').removeClass('active')
          }
    })
  })

  $('.setPosition').on('click',function(){
     $.ajax({
          url: "/position/set",
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            hours:$('input.hours').val(),
            minutes:$('input.minutes').val(),
            seconds:$('input.seconds').val()
          }),
          success: function(data,textStatus,jqXHR){

    }})
  })

  $('.getPosition').on('click',function(){
    $.ajax({
      url: "/position/get",
      type: 'POST',
      success: function(data,textStatus,jqXHR){
        console.log("Page data: "+data);
        var hours=Math.floor(data/3600);
        var minutes=Math.floor((data-hours*3600)/60);
        var seconds=Math.floor(data-minutes*60-hours*3600);
        $('input.hours').val(hours);
        $('input.minutes').val(minutes);
        $('input.seconds').val(seconds);
        console.log(hours);
        console.log(minutes);
        console.log(seconds);
      }
    })
  })

  function getTitle(){

     $.ajax({
          url: "/metadata/title",
          type: 'GET',
          contentType: 'application/json',
          data: JSON.stringify({}),
          success: function(data,textStatus,jqXHR){
            $('.playing .title').text(data);
          }
        })
  }
getTitle();
setInterval(function(){ getTitle() }, 30000);  

  function share(){
   //bootstrap function popover
    $('tbody .shareFile').popover('dispose');
    $('tbody .shareFile').on('click',function(){
        that=$(this);
        path=$(this).closest('td').attr('path');
        console.log(path);
        auth="1q2222222342we3we";
        $.ajax({
          url: "/share",
          type: 'POST',
          that:that,
          contentType: 'application/json',
          data: JSON.stringify({path:path,auth:auth}),
          success: function(data,textStatus,jqXHR){
            var that = this.that;
            that.popover({content:data.link,placement:'left',title:'Sharing link'});
            that.popover('show');
            console.log(data);
  
          }
        });
    })
  }


})