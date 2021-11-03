const getstr = function(){
  function randomString(length, chars) {
    let result = ''
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }
  return randomString(8, '0123456789abcdefghijklmnopqrstuvwxyz')
}


export {getstr}
