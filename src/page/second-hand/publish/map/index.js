import './index.scss';
import _fgj from 'util/fgj.js';

let tempIndex = require('./index.hbs');

/**
 * 百度地图 - [-$_$-] 地址那里没用到，开发完之后，改方案了，暂时没用到
 * @class Map
 * @param { Element } box 容器
 */
export default class Map {
  constructor(option) {
    this.option = option;
    this.init();
    this.el = {
      mapParel: $('.js_map_parel')
    }
  }

  // 初始化
  init() {
    this.render();
  }

  render() {
    let option = this.option;

    let html = _fgj.handlebars(tempIndex);

    option.box.html(html);

    this.initMap();
  }

  initMap() {
    let option  = this.option,
        _this   = this;

    let map = new BMap.Map('Bmap');            // 创建Map实例
    map.centerAndZoom(new BMap.Point(115.88, 28.68), 11);

    this.local = new BMap.LocalSearch(map, {
      renderOptions: {
        map: map, 
        panel: 'mapResult'
      },
      onSearchComplete: function (results) {      // 添加事件
        // console.log(results)
        let data = results.Br;    // 当前的搜索结果数据集
        // 获取节点需要等浏览器渲染完毕
        setTimeout(() => {
          let aLi = $('#mapResult li');   // 所有的li
          $(aLi).each(function (index, item) {
            $(item).on('click', () => {
              option.Br = data[index]     // 拿到当前选中的数据
              _this.el.mapParel.hide();
              typeof option.success === 'function' && option.success(data[index]);  // 返回结果
            });
          })
        }, 30)
      },
    });
  }

  // 搜索
  search(value) {
    if (value) {
      this.el.mapParel.show();
      this.local.search(value);
    } 
    else {
      this.el.mapParel.hide();
    }
  }

};