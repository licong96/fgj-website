import 'common/js/common.js';
import 'components/header-nav/index.scss';
import 'components/footer/index.js'
import './index.scss';

import stickybits from 'stickybits';
import MenuSpy from 'menuspy';
import anchorScroll from 'util/anchor-scroll.js';
import _fgj from 'util/fgj.js'; 
import HeaderNav from 'components/header-nav/index.js';

import { 
  classifyGetListMore,
  GetListMoreMessage
} from 'api/message/message-home.js';

import 'components/message-list/index.scss';    // 需要用到资讯类表样式
var tempNavPills = require('./nav-pills.hbs');
var tempHotList = require('./hot-list.hbs');
var tempListWrap = require('./list-wrap.hbs');
var tempList = require('./list.hbs');

var messageHome = {
  el: {
  },
  data: {
    countRenderList: 0,   // 记录资讯分类列表渲染次数
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.initHeaderNav();  // 给当前导航加class
    this.getHotList();   // 获取头部最热门的资讯
    this.getclassif();   // 获取所有分类
  },
  bindEvent() {
    // this.onStickyRecom();   // 右侧一周热文粘性滑动
  },
  // 初始化头部导航
  initHeaderNav() {
    var nav = new HeaderNav();
    nav.init({
      current: $('.js_header_nav .nav-a').eq(3)    // 当前导航元素
    });
  },
  // 获取头部最热门的资讯
  getHotList() {
    GetListMoreMessage({
      num: 3,
      IsTop: 1,
      RegDate: 'DESC'
    }, res => {
      let data = res.data;
      if (data.length < 3) {
        $('.js_hot_list').html('热门资讯不能少于三条，否则后果不堪设想');
        return
      };
      
      data.map(list => {
        list.link = './message-detail.html?NewsID=' + list._newsid + '&NewsClassID=' + list._newsclassid;   // 添加link跳转和参数
      });
      var html = _fgj.handlebars(tempHotList, {
        data: data
      });
      $('.js_hot_list').html(html);
    }, err => {
      $('.js_hot_list').html(res.data.msg);
    });
  },
  // 获取所有分类
  getclassif() {
    classifyGetListMore({
      num: 9
    }, res => {
      // console.log(res)
      var list = res.data;

      // 渲染分类导航
      var navPills = _fgj.handlebars(tempNavPills, {
        list: list
      });
      $('.js_nav_pills').html(navPills);

      // 根据分类个数，渲染分类列表容器，用来放对应的分类列表
      var listWrap = _fgj.handlebars(tempListWrap, {
        list: list
      });
      $('#newsClass').html(listWrap);
      
      // 根据分类获取数据列表
      let leng = list.length;
      for (let i = 0; i < leng; i++) {
        this.renderMessageList(list[i], i, leng);
      }
    });
  },
  // 渲染资讯列表
  renderMessageList(father, index, leng) {
    GetListMoreMessage({
      num: 3,
      NewsClassID: father._newsclassid
    }, res => {
      let data = this.filter(father, res.data);    // 把数据拼接在一起
      // console.log(data)
      var html = _fgj.handlebars(tempList, data);
      $('#classList_' + index).html(html);
      
      // 资讯列表对应分类加载，全部加载完后再初始化锚点功能
      this.data.countRenderList++
      if (this.data.countRenderList === leng) {
        setTimeout(() => {
          this.scrollSpy();     // 联动效果
        }, 30);
      }
    }, err => {
      // $('#' + el).html('网络错误，可以尝试刷新重试');
    });
  },
  // 过滤数据
  filter(father, data) {
    if (!data) {
      father.list = data
      return father
    };
    data.map(list => {
      list.link = './message-detail.html?NewsID=' + list._newsid + '&NewsClassID=' + list._newsclassid;   // 添加link跳转和参数
    });
    father.list = data
    return father
  },
  // 二级导航联动效果
  scrollSpy() {
    var subNav = document.getElementById('navbar-example');
    new MenuSpy(subNav);  // 监听滚动
    stickybits(subNav); // 粘性滚动
    anchorScroll();   // 锚点动画
  },
  // 右侧一周热文粘性滑动
  onStickyRecom() {
    var recom = document.getElementById('recom');
    stickybits(recom, {
      stickyBitStickyOffset: 60
    });
  }
};

$(function () {
  messageHome.init()
});