// window.VIDEOJS_NO_DYNAMIC_STYLE = true;
// ffprobe -v error -sexagesimal -select_streams V:0 -show_entries stream '/Users/gradutsky/Documents/transcodes/SMPTE_100-BTC.mov'
// ffmpeg -hide_banner -y -loglevel verbose -i ~/Documents/transcodes/SMPTE_100-BTC.mov -c:v hevc -b:v 128k -r 23.976023976023978 -bufsize 24215311 -flags +cgop -g 30 -hls_time 3 -hls_list_size 0 ~/Applications/video.js-demo/dist/media/SMPTE_100-BTC.m3u8

require('!style-loader!css-loader!video.js/dist/video-js.css')
export const videojs = require('video.js');
require('videojs-contrib-dash/es5/videojs-dash.js');
require('videojs-contrib-hls/es5/videojs-contrib-hls.js');
require('./style.scss');

const videoTagId = 'player';

const playerOptions = {
  controls: true,
  autoplay: true,
  fluid: true,
  preload: 'metadata',
  playbackRates: [0.5, 1, 1.5, 2],
  controlBar: {
    children: {
      'playToggle': {},
      'progressControl': {},
      'remainingTimeDisplay': {},
      'playbackRateMenuButton': {},
      'fullscreenToggle': {},
    }
  }
};

// Player hook
videojs.hook('beforesetup', function(videoEl, options) {
  videoEl.className += 'video-js';
  options.autoplay = false;
  return options;
});

export const frameRate = 24000/1001;
export const spf = 1 / frameRate;
export let totalTime;


const currentTimeEl = document.getElementById('current-time');

function displayFrameNumberAndCurrentTime(){
	currentTimeEl.value = player.currentTime();
  document.getElementById('time-code').innerHTML = secondsToHMSF(player.currentTime());
  document.getElementById('frames').innerHTML = Math.floor(player.currentTime() * frameRate);

  return window.requestAnimationFrame(displayFrameNumberAndCurrentTime);
}

currentTimeEl.addEventListener('change', function(event){
	player.currentTime(event.target.value);
});

export let player = videojs(videoTagId, playerOptions, function() {
	this.one('loadedmetadata', function() {
    totalTime = this.duration();
		document.getElementById('frame-rate').innerHTML = frameRate;
		document.getElementById('spf').innerHTML = formatToPrecision(spf);
    window.cancelAnimationFrame(displayFrameNumberAndCurrentTime());
  });
});

player.src({
  // src: '//vjs.zencdn.net/v/oceans.mp4',
  // src: 'media/A_day_at_the_races_fixed_short.mp4',
  src: 'media/SMPTE_100-BTC.m3u8',
  // type: 'video/mp4'
  // src: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
  type: 'application/x-mpegURL'
  // type: 'application/vnd.apple.mpegurl'
  // src: 'https://s3.amazonaws.com/_bc_dml/example-content/sintel_dash/sintel_vod.mpd',
  // src: 'https://media.axprod.net/TestVectors/v7-MultiDRM-MultiKey/Manifest_1080p.mpd',
  // src: 'http://rdmedia.bbc.co.uk/dash/ondemand/testcard/1/client_manifest-events.mpd',
  // type: 'application/dash+xml'
});

// document.querySelector('#unload-player').addEventListener('click', function unloadVideojs() {
//   player.dispose();
// });

// Creating modal
const ModalDialog = videojs.getComponent('ModalDialog');

export const modal = new ModalDialog(player, {
  // We don't want this modal to go away when it closes.
  temporary: false,
  uncloseable: true
});


modal.on('beforemodalopen', function(ev, hash) {
  player.pause();
})

player.addChild(modal);


const markupFrames = [15, 40.75, 28];
const markupContent = [
  `<svg height="400" width="450">
    <path id="lineAB" d="M 100 350 l 150 -300" stroke="red" stroke-width="3" fill="none" />
    <path id="lineBC" d="M 250 50 l 150 300" stroke="red" stroke-width="3" fill="none" />
    <path d="M 175 200 l 150 0" stroke="green" stroke-width="3" fill="none" />
    <path d="M 100 350 q 150 -300 300 0" stroke="blue" stroke-width="5" fill="none" />
    <!-- Mark relevant points -->
    <g stroke="black" stroke-width="3" fill="black">
      <circle id="pointA" cx="100" cy="350" r="3" />
        <circle id="pointB" cx="250" cy="50" r="3" />
        <circle id="pointC" cx="400" cy="350" r="3" />
    </g>
    <!-- Label the points -->
    <g font-size="30" font-family="sans-serif" fill="black" stroke="none" text-anchor="middle">
        <text x="100" y="350" dx="-30">A</text>
        <text x="250" y="50" dy="-10">B</text>
        <text x="400" y="350" dx="30">C</text>
    </g>
    Sorry, your browser does not support inline SVG.
  </svg>`,

  `<svg width="100" height="100">
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
  </svg>`,

  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
     '<foreignObject width="100%" height="100%">' +
     '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
       '<em>I</em> like ' +
       '<span style="color:white; text-shadow:0 0 2px blue;">' +
       'cheese</span>' +
     '</div>' +
     '</foreignObject>' +
  '</svg>'
];


let currentFrameIndex;
export function cycleThroughMarkups(){
  if(currentFrameIndex === undefined || currentFrameIndex === markupFrames.length -1)
    currentFrameIndex = 0;
  else
    currentFrameIndex++;

  player.currentTime(markupFrames[currentFrameIndex]);

  // Adding content to modal
  const el = document.createElement('div');
  el.innerHTML = markupContent[currentFrameIndex];
  modal.fillWith(el);
  modal.open();
}

// https://developers.google.com/web/updates/2017/06/play-request-was-interrupted

let playPromise;
let playing = false;
let requestAnimationFrameId;

// let theInterval;
player.on('play', function(){
  playPromise = Promise.resolve();
  playing = true;
  // theInterval = setInterval(function() {
      // displayFrameNumberAndCurrentTime();
  // }, (1000 / frameRate));
  requestAnimationFrameId = displayFrameNumberAndCurrentTime();
});

player.on('pause', function(){
  playing = false;
  // seekToFrameStart();
  // clearInterval(theInterval)
  window.cancelAnimationFrame(requestAnimationFrameId);
});

player.on('seeking', function(){
  requestAnimationFrameId = displayFrameNumberAndCurrentTime();
});

player.on('seeked', function(){
  window.cancelAnimationFrame(requestAnimationFrameId);
});

const togglePlayButton = document.getElementById('toggle-play-video');
togglePlayButton.innerHTML = 'Play';
togglePlayButton.addEventListener('click', function() {
  if(playing) {
    pause();
    this.innerHTML = 'Play';
  } else {
    play();
    this.innerHTML = 'Pause';
  }
});

function play(){
  playPromise = player.play();
}

function pause(){
  playPromise.then(function() {
    player.pause();
  });
}

export function previousFrame(){
  let newTime = getPreviousAndNextFrames().previous;
  if(newTime < 0) {
    newTime = 0;
  }
  player.currentTime(newTime);
}

export function nextFrame(){
  let newTime = getPreviousAndNextFrames().next;
  if(newTime > totalTime) {
    newTime = totalTime;
  }
  player.currentTime(newTime);
}

export function previousMillisecond(){
  let newTime = player.currentTime() - .000001;
  if(newTime < 0) {
    newTime = 0;
  }
  player.currentTime(newTime);
}

export function nextMillisecond(){
  let newTime = player.currentTime() + .000001;
  if(newTime < 0) {
    newTime = 0;
  }
  player.currentTime(newTime);
}

function secondsToHMSF(doubleSeconds) {
  const wholeSeconds = Math.floor(doubleSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const wholeSecondsMinusHours = wholeSeconds - (hours * 3600);
  const minutes = Math.floor(wholeSecondsMinusHours / 60);
  const seconds = wholeSecondsMinusHours - (minutes * 60);
  const frame = Math.floor((doubleSeconds % 1) * frameRate);
  return `${hours}:${minutes}:${seconds}:${frame}`;
}

function formatToPrecision(double) {
  return Number.parseFloat(double.toFixed(6));
}

function getCurrentFrameCount(){
  return Math.floor(player.currentTime() / spf);
}

function getCurrentFrameTime(){
  return getCurrentFrameCount() * spf;
}

function getPreviousAndNextFrames() {
  const currentFrameTime = getCurrentFrameTime();
  return {
    previous: currentFrameTime - spf,
    next: currentFrameTime + spf
  }
}
