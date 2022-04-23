console.log(`Content Script Running!! > ${new Date().getTime()}`)

function makeVideoData() {
  var video_title = document.getElementsByClassName("title style-scope ytd-video-primary-info-renderer")[0]
  var video_length = document.getElementsByClassName("ytp-time-duration")[0]
  var url = window.location.href
  var i, r, regx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  var video_id = url.match(regx)[1];
  var mPlayer = document.getElementsByClassName('video-stream html5-main-video')[0]
  var video_stamp = mPlayer.currentTime
  return {title:video_title.innerText, length:video_length.innerText, id:video_id, stamp:video_stamp}
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.getVideoData){
    sendResponse(makeVideoData());
  }
  if(request.watchVideo) {
    window.open(`https://youtu.be/${request.v_data[0]}?t=${request.v_data[1]}`,"_self");
  }
  return true;
})
   
