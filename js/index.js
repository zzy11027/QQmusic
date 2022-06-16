(function () {
  /* 获取定义元素对象 */
  const musicBox = document.querySelector('.music'),
    headerBox = musicBox.querySelector('.header_box'),
    mainBox = musicBox.querySelector('.main_box'),
    footerBox = musicBox.querySelector('.footer_box'),
    lyricBox = mainBox.querySelector('.lyric'),
    musicBtn = headerBox.querySelector('.music_btn'),
    musicPlay = musicBox.querySelector('.musicPlay'),
    startTime = footerBox.querySelector('.start_time'),
    greenBar = footerBox.querySelector('.green_bar'),
    endTime = footerBox.querySelector('.end_time');
  bar = footerBox.querySelector('.bar');

  /* 定义变量 */
  let data, //json歌词数据
    dataRge, //歌词正则
    timeRge, //时间正则
    str = ``, //歌词标签
    musicClass, //播放按钮的clss属性值
    minute, //播放的分钟
    second, //播放的秒
    totalTime, //音频总时长
    playTime, //音频当前播放时长
    oldplayTime, //上一次的播放事件(因为播放时间以秒为单位，一秒会执行多次播放时间事件,防止重复处理,将上一次处理的时间记录进行对比)
    dataList, //P标签集合
    pH = 0; //P标签高度

  /* 计算main高度 */
  const mainHeight = function mainHeight() {
    const htmlHeight = document.documentElement.clientHeight, //获取页面总高度
      headerH = headerBox.offsetHeight, //获取头部高度
      footerH = footerBox.offsetHeight; //获取尾部高度
    mainBox.style.height = `${htmlHeight - headerH - footerH}px`; //计算并添加中间高度
  };
  /* 获取数据 */
  const query = function query() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `./json/lyric.json?_time=${new Date()}`, false);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        data = JSON.parse(xhr.response).lyric;
      }
    };
    xhr.send();
  };
  /* 整理歌词 */
  const arrange = function arrange() {
    dataRge = /&#(32|40|41|45);/g;
    data = data.replace(dataRge, function (val, g1) {
      g1 = +g1;
      switch (g1) {
        case 32:
          val = ' ';
          break;
        case 40:
          val = '(';
          break;
        case 41:
          val = ')';
          break;
        case 45:
          val = '-';
          break;
      }
      return val;
    });
  };
  /* 渲染数据 */
  const render = function render() {
    // 整理歌词
    arrange();
    // 整理时间
    timeRge = /\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#;]+)(?:&#10;)?/g;
    str = ``;
    // 渲染歌词
    data = data.replace(timeRge, function (val, g1, g2, g3) {
      str += `<p minute='${g1}' second='${g2}'>${g3}</p>`;
    });
    lyricBox.innerHTML = str;
  };
  // 时间0填充
  const zero = function zero(time) {
    minute = Math.floor(time / 60);
    second = Math.floor(time % 60);
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;
    return minute + ':' + second;
  };
  /* 歌词处理 */
  const lyric = function lyric(playTime) {
    [minute, second] = playTime.split(':');
    dataList = Array.from(lyricBox.querySelectorAll('p'));
    dataList.forEach((item, index) => {
      if (minute == item.getAttribute('minute') && second == item.getAttribute('second')) {
        if (index > 0) dataList[index - 1].className = '';
        item.className = 'selected';
        if (index > 4) {
          pH += dataList[0].offsetHeight;
          lyricBox.style.transform = `translateY(${-pH}px)`;
        }
      }
    });
  };
  /* 处理时间 */
  const timeHandle = function timeHandle() {
    // 音频加载后执行，自动执行(因为没有开启预加载,播放时加载,所有点击播放后才会执行,不用此事件读取不到总时长)
    musicPlay.oncanplay = function () {
      totalTime = zero(musicPlay.duration);
      endTime.innerHTML = totalTime;
    };
    // 播放时间更新时间，播放后执行
    greenBar.style.width = 0;
    musicPlay.ontimeupdate = function () {
      oldplayTime == 0;
      playTime = Math.floor(musicPlay.currentTime);
      if (oldplayTime !== playTime) {
        oldplayTime = playTime;
        playTime = zero(playTime);
        startTime.innerHTML = playTime;
        // 进度条处理
        greenBar.style.width = (musicPlay.currentTime / musicPlay.duration) * 100 + '%';
        // 歌词处理
        lyric(playTime);
      }
    };
    // 播放结束
    musicPlay.onended = function () {
      startTime.innerHTML = '00:00';
      greenBar.style.width = 0;
      lyricBox.style.transform = 'transform 0s';
      lyricBox.style.transform = `translateY(0px)`;
      dataList[dataList.length - 1].className = '';
      musicBtn.className = musicClass;
    };
  };
  /* 播放 */
  const playing = function playing() {
    musicClass = musicBtn.className;
    musicBtn.onclick = function () {
      // 判断是否播放
      if (musicPlay.paused) {
        musicPlay.play(); //播放
        musicBtn.className = musicClass + ' move';
        // 处理时间
        timeHandle();
      } else {
        musicPlay.pause(); //暂停
        musicBtn.className = musicClass;
      }
    };
  };

  /* 计算main高度 */
  mainHeight();
  window.addEventListener('resize', mainHeight);
  /* 获取数据 */
  query();
  /* 渲染数据 */
  render();
  /* 播放 */
  playing();
})();
