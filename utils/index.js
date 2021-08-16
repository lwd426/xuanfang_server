module.exports ={
  getParamsToString: function (obj) {
    let str = '';
    for (const key in obj) {
      str += `${key}=${obj[key]}&`;
    }
    return str.substr(0, str.length - 1);
  }
} 