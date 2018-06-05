import 'common/js/commonStyle.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import Login from 'components/login/index.js';
import HintTop from 'components/hint-top/index.js';


// 二手房详细
let detail = {
  el: {},
  data: {
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
  },
  bindEvent() {
    this.initLogin();   // 初始化登陆
    this.initHintTop(); // 初始化提示功能
  },
  // 初始化登陆
  initLogin() {
    this.Login = new Login();
    // this.Login.init();
  },
  // 初始化提示功能
  initHintTop() {
    this.HintTop ? '' : this.HintTop = new HintTop();
  },
};

$(function () {
  detail.init()
});