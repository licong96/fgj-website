import './index.scss';
import _fgj from 'util/fgj.js'; 

let tempIndex = require('./index.hbs');   // 二手房买卖

/**
 * 筛选
 * @class Screen
 * @param { Element } box 容器
 * @param { Function } callParams 修改参数后的回调
 */
export default class Screen {
  constructor() {
    this.el = {};   // 用来存储页面元素
  }

  // 初始化
  init(option) {
    this.option = $.extend({}, option);

    this.renderCom(1);   // 渲染主体结构
    this.bindEvent();   // 绑定事件
  }

  // 绑定事件
  bindEvent() {
    let option = this.option
  }

  // 渲染主体结构
  renderCom(index) {
    let option = this.option,
        html   = _fgj.handlebars(tempIndex, {});

    option.box.html(html);
    this.getElement();    // 获取页面元素
  }

  // 获取页面元素
  getElement() {
    this.el.pitch         = $('.js_pitch');
    this.el.pitchCon      = $('.js_pitch_con');
    this.el.searchVal     = $('.js_search_val');
    this.el.searchBtn     = $('.js_search_btn');
    this.el.DistrictName  = $('#DistrictName');
    this.el.SubwayStation = $('#SubwayStation');
  }

  // 其他筛选功能
  else(data, el) {
    let element = $('#' + el),
        option  = this.option,
        html    = '';

    for (let i = 0, length = data.length; i < length; i++) {
      html += `<option value="${data[i]._dictionaryvalue}">${data[i]._dictionaryvalue}</option>`
    };
    element.append(html);
    this.onChangeOption(el);    // 添加事件
  }
  // 改变select触发事件
  onChangeOption(el) {
    let element = $('#' + el),
        value = '',
        obj   = {},
        _this = this,
        option= this.option,
        params= this.option.params;

    element.on('change', function() {
      value = $(this).val();

      if (!!value) {
        obj[el] = value
        Object.assign(params, obj);
      } else {
        delete params[el];
      };
      
      params.page = 1;    // 页数还原成 1
      typeof option.callParams === 'function' && option.callParams(params); // 点击筛选后改变参数的回调

      console.log(params)
      _this.renderPitch();    // 渲染选中的筛选条件
    })
  }
};