import './index.scss';
import _fgj from 'util/fgj.js'; 

let tempIndex = require('./index.hbs');

// 个人中心侧边导航
/**
 * @class UserNav
 * @param {Array} list 导航列表项
 * @param {Element} box 父容器
 * @param {String} name 列表名，用来判断当前选项
 */
export default class UserNav {
  constructor(option) {
    // 默认参数
    let defaultOption = {
      box: $('#user-nav'),
      list: [
        {
          name: 'information',
          text: '个人资料',
          href: './information.html',
          icon: 'icon-user-o'
        }, {
          name: 'message',
          text: '我的消息',
          href: './message.html',
          icon: 'icon-btnMsg'
        }, {
          name: 'reply',
          text: '我的回复',
          href: './reply.html',
          icon: 'icon-huifu'
        }, {
          name: 'collect',
          text: '我的收藏',
          href: './collect.html',
          icon: 'icon-shoucang'
        }, {
          name: 'manage',
          text: '房源管理',
          href: './manage.html',
          icon: 'icon-fangyuan1'
        },
      ]
    };

    this.option = $.extend({}, defaultOption, option);

    this.init();
  }

  init() {
    this.render();
    this.bindEvent();
  }

  render() {
    let option = this.option;
    
    // 判断传过来的name，给对应的选项添加class
    for (let i = 0, length = option.list.length; i < length; i++) {
      if (option.list[i].name === option.name) {
        option.list[i].active = 'active';
      }
    };

    let html = _fgj.handlebars(tempIndex, {
      list: option.list
    });
    
    option.box.html(html);
  }

  bindEvent() {
  }
};