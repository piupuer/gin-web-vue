// 注意浏览器需要允许声音自动播放, 否则可能无法播放
// 开始播放
function startPlay(url: string, playEnded: any, playError: any) {
  const audio = new Audio(url)
  audio.play()
  console.log('正在播放' + url)
  // 播放结束
  audio.onended = () => {
    console.log('播放' + url + '结束')
    if (typeof playEnded === 'function') {
      playEnded()
    }
  }
  // 播放异常
  audio.onerror = () => {
    console.log('播放' + url + '异常')
    if (typeof playError === 'function') {
      playError()
    }
  }
  return audio
}

export const voice = {
  // 播放音频, 指定声音编号
  playUrl: (url: string, playEnded: any, playError: any) => {
    return startPlay(url, playEnded, playError)
  }
}
