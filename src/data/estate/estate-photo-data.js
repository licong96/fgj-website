import _fgj from 'util/fgj.js';
import Mock from 'mockjs'

var Random = Mock.Random

Mock.mock(/todo=estate&type=getPhoto/, function (options) {

  var reg = new RegExp('(^|&)' + 'select' + '=([^&]*)(&|$)');
  var result = options.url.substr(1).match(reg);
  var select = decodeURIComponent(result[0].split('=')[1])

  if (select === '效果图') {
    return Mock.mock({
      photo: {
        'pic|6': [
          {
            pic: Random.image('1000x766', '#fd7e14')
          }
        ],
        'smPic|6': [
          {
            pic: Random.image('200x150', '#fd7e14')
          }
        ]
      }
    })
  } 
  else if (select === '在售房源') {
    return Mock.mock({
      photo: {
        'pic|7': [
          {
            pic: Random.image('1000x766', '#20c997')
          }
        ],
        'smPic|7': [
          {
            pic: Random.image('200x150', '#20c997')
          }
        ]
      }
    })
  }
  else if (select === '楼盘相册') {
    return Mock.mock({
      photo: {
        'pic|6': [
          {
            pic: Random.image('1000x766', '#ffc107')
          }
        ],
        'smPic|6': [
          {
            pic: Random.image('200x150', '#ffc107')
          }
        ]
      }
    })
  }
  else if (select === '户型列表') {
    return Mock.mock({
      photo: {
        'pic|5': [
          {
            pic: Random.image('1000x766', '#e83e8c')
          }
        ],
        'smPic|5': [
          {
            pic: Random.image('200x150', '#e83e8c')
          }
        ]
      }
    })
  }
  
})