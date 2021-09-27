// START METADATA
// NAME: Skip
// AUTHOR: Johan Kohlin
// DESCRIPTION: A little script to skip 15s forward or backward
// END METADATA
(function Skip() {
  if (!Spicetify.Keyboard) {
    setTimeout(Skip, 500);
    return;
  }
  /**
   * The following code is curtesy of khanhas loopyloop.mjs
   */
  const DEFAULT_URI = "spotify:special:skip"
  let points, song
  const bar = document.querySelector(".progress-bar");
  bar.setAttribute("data-contextmenu", "");
  bar.setAttribute("data-uri", DEFAULT_URI);
  const style = document.createElement("style");
  style.innerHTML = `
#loopy-loop-start, #loopy-loop-end {
  position: absolute;
  font-weight: bolder;
  font-size: 15px;
  top: -8px;
}
`;

  const startMark = document.createElement("div");
  startMark.id = "loopy-loop-start";
  startMark.innerText = "[";
  const endMark = document.createElement("div");
  endMark.id = "loopy-loop-end";
  endMark.innerText = "]";
  startMark.style.position = endMark.style.position = "absolute";
  startMark.hidden = endMark.hidden = true;

  bar.append(style);
  bar.append(startMark);
  bar.append(endMark);
  let start = null, end = null;
  let mouseOnBarPercent = 0.0;

  function getPercent(ms = null) {
    if (ms !== null && song) {
      let percent = ms / song.duration
      return percent
    }
    return Spicetify.Player.getProgressPercent();
  }
  function drawOnBar() {
    console.log('start: ' + start);
    console.log('end' + end);
    console.log('in-point: ' + points.in + ' = ' + Spicetify.Player.formatTime(points.in));
    console.log('out-point: ' + points.out + ' = ' + Spicetify.Player.formatTime(points.out));
    console.log('duration: ' + song.duration + ' = ' + Spicetify.Player.formatTime(song.duration));
    if (start === null && end === null) {
      startMark.hidden = endMark.hidden = true;
      return;
    }
    startMark.hidden = endMark.hidden = false;
    startMark.style.left = (start * 100) + "%";
    endMark.style.left = (end * 100) + "%";
  }
  function reset() {
    start = null;
    end = null;
    clearLocalStorage()
    loadLocalStorage()
    drawOnBar();
    Spicetify.showNotification(`Custom In: ${Spicetify.Player.formatTime(points.in)} Custom out: ${Spicetify.Player.formatTime(points.out)}`)
  }
  new Spicetify.ContextMenu.Item(
    "Set in",
    () => {
      start = mouseOnBarPercent;
      if (end === null || start > end) {
        end = 0.99;
      }
      let currentProgress = parseInt(song.duration * start)
      setInpoint(null, currentProgress)
      drawOnBar();
    },
    ([uri]) => uri === DEFAULT_URI
  ).register();

  new Spicetify.ContextMenu.Item(
    "Set out",
    () => {
      end = mouseOnBarPercent;
      if (start === null || end < start) {
        start = 0;
      }
      let currentProgress = parseInt(song.duration * end)
      setOutpoint(null, currentProgress)
      drawOnBar();
    },
    ([uri]) => uri === DEFAULT_URI
  ).register();

  new Spicetify.ContextMenu.Item(
    "Reset",
    reset,
    ([uri]) => uri === DEFAULT_URI
  ).register();

  bar.oncontextmenu = (event) => {
    const { x, width } = bar.getBoundingClientRect();
    mouseOnBarPercent = (event.clientX - x) / width;
  };


  /**
   *  Johans Code
   * 
   * 
   * 
   */
  class Song {
    constructor(data) {
      this.artist = data.track.metadata.artist_name
      this.title = data.track.metadata.title
      this.duration = parseInt(data.track.metadata.duration)
      this.uri = data.track.uri
      this.uid = data.track.uid
      this.image = data.track.metadata.image_xlarge_url || data.track.metadata.image_large_url || data.track.metadata.image_url
    }
  }

  do {
    console.log('do')
    loadLocalStorage()
    if (points.in && points.out) {
      start = getPercent(points.in)
      end = getPercent(points.out)
      drawOnBar()
    }
  } while (Spicetify.Player.data.track == undefined)
  /*     
  registerBind(keyName, ctrl, shift, alt, callback) */
  registerBind("ARROW_RIGHT", false, false, true, skipForward);
  registerBind("ARROW_LEFT", false, false, true, skipbackward);
  registerBind("I", true, false, true, debugIt);
  registerBind("I", false, true, false, setInpoint);
  registerBind("O", false, true, false, setOutpoint);

  function loadLocalStorage() {
    song = new Song(Spicetify.Player.data)
    points = Spicetify.LocalStorage.get(song.uid) ? JSON.parse(Spicetify.LocalStorage.get(song.uid)) : { in: 0, out: song.duration }
  }
  function clearLocalStorage() {
    Spicetify.LocalStorage.remove(song.uid)
  }

  /**
   * On song change, look for in and outpoint
   */
  Spicetify.Player.addEventListener("songchange", () => {
    loadLocalStorage()
    Spicetify.Player.seek(points.in)
    Spicetify.showNotification(`Custom In: ${Spicetify.Player.formatTime(points.in)} Custom out: ${Spicetify.Player.formatTime(points.out)}`)
    start = getPercent(points.in)
    end = getPercent(points.out)
    if (points.in === 0 && start > points.in) debugger
    drawOnBar()
  });
  /**
   * On progress check to see if we passed the out point
   */
  Spicetify.Player.addEventListener('onprogress', (e) => {
    if (!song || !points) return
    if (Spicetify.Player.getProgress() > points.out) {
      song = null
      points = null
      Spicetify.Player.next()
    }

  })

  /**
   * debug()
   * Stops the current script with a debugger. 
   * Not really needed since Spicetify is 
   * globally available
   */
  function debugIt(event) {
    debugger;
  }
  /**
   * Skip 15 seconds back or forwards
   * Alt + -> to skip forward
   * Alt + <- to skip 15s backwards
   */
  function skipForward(event) {
    if (event.code === 'ArrowRight' && event.altKey) {
      Spicetify.Player.skipForward(5000);
    }
  }
  function skipbackward(event) {
    if (event.code === 'ArrowLeft' && event.altKey) {
      Spicetify.Player.skipBack(5000);
    }
  }

  /**
   * Set custom in- and out point 
   * 
   */
  function setInpoint(e, custom = null) {
    if (!song) loadLocalStorage()
    points.in = custom ?? Spicetify.Player.getProgress()
    points.out = points.out ?? song.duration
    Spicetify.LocalStorage.set(song.uid, JSON.stringify(points))
    Spicetify.showNotification(`New in-point set at ${Spicetify.Player.formatTime(points.in)}`)
    start = getPercent()
    end = getPercent(points.out)
    drawOnBar()
  }

  function setOutpoint(e, custom = null) {
    if (!song) loadLocalStorage()
    points.in = points.in ?? 0
    points.out = custom ?? Spicetify.Player.getProgress()
    Spicetify.LocalStorage.set(song.uid, JSON.stringify(points))
    Spicetify.showNotification(`New out-point set at ${Spicetify.Player.formatTime(points.out)}`)
    start = getPercent(points.in)
    end = getPercent()
    drawOnBar()
  }

  /**
   * registerBind 
   * 
   * @param keyName "String" - Key to listen for
   * @param ctrl 
   * @param shift 
   * @param alt 
   * @param callback 
   */
  function registerBind(keyName, ctrl, shift, alt, callback) {
    if (typeof keyName === "string") {
      keyName = Spicetify.Keyboard.KEYS[keyName];
    }

    Spicetify.Keyboard.registerShortcut(
      {
        key: keyName,
        ctrl,
        shift,
        alt,
      },
      (event) => {
        if (!event.cancelBubble) {
          callback(event);
        }
      },
    );
  }

})()
