import './index.scss';

import * as Ladda from 'ladda';   // 按钮加载样式
import Cropper from 'cropperjs';  // 图片裁切
import 'common/css/cropper.css';
import HeaderNav from 'components/header-nav/index.js';
import _fgj from 'util/fgj.js'; 
import { SendLoginValidate } from 'api/user.js';
import { UpUserInfo, GetMyInfo } from 'api/user/information.js';
import { FileUpLoad } from 'api/public.js';


let tempIndex = require('./index.hbs');
let tempUpInfo = require('./up-info.hbs');

// 修改密码
let upPassword = {
  el: {
    cropper: null,    // 图片裁切实例
    cropImage: document.getElementById('image'),  // 裁切图
    cropperWrap: $('.js_cropper_wrap'),
    imageWrap: $('.js_image_wrap'),
    confirmCropBtn: $('#confirmCropBtn'),
    cancelCropBtn: $('#cancelCropBtn'),
    box: $('.js_up_user_info'),
    setBtn: $('#modifiedData'),
    saveBtn: $('#saveData'),
    closeSaveData: $('#closeSaveData'),
  },
  data: {},
  init(data) {
    this.filterData(data);  // 处理用户数据
    this.data = data;   // 要把用户数据传过来
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.renderBase();
    
    // 图片裁切实例
    this.el.cropper = new Cropper(this.el.cropImage, {
      aspectRatio: 1 / 1,   // 比例
    });
  },
  bindEvent() {
    this.onmodifiedData();    // 触发修改资料操作
  },
  // 处理用户数据
  filterData(data) {
    if (data._sex === '男') {
      data.man = true;
      data.woman = false;
    } 
    else {
      data.man = false
      data.woman = true
    }
  },
  // 渲染显示的内容
  renderBase() {
    let data = this.data;

    // 拼接图片，测试用
    if (data._headpic.indexOf('/upfile') !== -1 && data._headpic.indexOf('http://t.vipfgj.com') === -1) {
      data._headpic = _fgj.photoPath() + data._headpic;
    };
    let html = _fgj.handlebars(tempIndex, data);
    this.el.box.html(html);
  },
  // 渲染修改资料的内容
  onmodifiedData() {
    let html = '',
        el   = this.el;

    el.setBtn.show();
    el.setBtn.on('click', () => {
      html = _fgj.handlebars(tempUpInfo, this.data);
      el.box.html(html);
      el.setBtn.hide();
      el.saveBtn.show();
      el.closeSaveData.show();

      this.getElement();  // 获取渲染出来的页面元素
      this.dataFill();  // 填充数据
      this.getCode();   // 获取验证码
      this.onUpInfo();    // 修改资料
      this.upHeadPic();   // 上传头像
      this.closeSaveData(); // 取消修改
    });
  },
  // 填充数据
  dataFill() {
    let data = this.data,
        el   = this.el;

    if (data._address) {
      el.Address.val(data._address)
    }
    else if (data._birthday) {
    }
  },
  // 获取页面元素
  getElement() {
    this.el = $.extend(this.el, {
      infoUpImg   : $('#infoUpImg'),
      ValiNum     : $('#infoValiNum'),
      $getCode    : $('.js_up_user_info .js_get_code'),
      UserName    : $('#UserName'),
      dataMonth   : $('#dataMonth'),
      dataDay     : $('#dataDay'),
      Address     : $('#Address')
    });
  },
  // 填充号码
  postTel(tel) {
    $('#passTel').val(tel);
  },
  // 获取用户信息
  GetMyInfo() {
    let el = this.el;
    
    GetMyInfo(res => {
      this.data = res.data;
      el.setBtn.show();
      el.saveBtn.hide();
      el.closeSaveData.hide();
      this.renderBase();

      // 同步更新导航数据
      this.headerNav ? '' : this.headerNav = new HeaderNav();
      this.headerNav.renderUserInfo(res.data);
    }, err => {
      _fgj.errorTips(err);
    })
  },
  // 取消修改
  closeSaveData() {
    let el = this.el;

    el.closeSaveData.on('click', () => {
      this.renderBase();
      el.setBtn.show();
      el.saveBtn.hide();
      el.closeSaveData.hide();
    });
  },
  // 修改资料
  onUpInfo() {
    let el          = this.el,
        data        = this.data,
        $confrim    = el.saveBtn,
        obj         = {},
        load        = null;

    $confrim.on('click', () => {
      obj = {
        HeadPic   : data.HeadPic,
        Tel       : data._tel,
        ValiNum   : el.ValiNum.val(),
        UserName  : el.UserName.val(),
        Sex       : $('input[name="sex"]:checked').val(),
        dataMonth : el.dataMonth.val(),
        dataDay   : el.dataDay.val(),
        Address   : el.Address.val(),
      };
      
      // 验证
      let verify = this.verify(obj);
      if (!verify.result) {
        _fgj.errorTips(verify.msg);
        return
      };

      obj.Birthday = obj.dataMonth + '-' + obj.dataDay;   // 生日
      delete obj.dataMonth;
      delete obj.dataDay;

      load = Ladda.create($confrim[0]);
      load.start();

      UpUserInfo(obj, res => {
        load.remove();
        this.GetMyInfo();
        _fgj.successTips('修改成功');
      }, 
      err => {
        load.remove();
        _fgj.errorTips(err.msg);
      })
    });
  },
  // 验证数据输入是否正确
  verify(data) {
    let res = {
      result: false,
      msg: '错误提示'
    };
    // 验证码
    if ( !_fgj.validate(data.ValiNum, 'require') ) {
      res.msg = '请输入验证码'
      return res;
    };
    if ( !_fgj.validate(data.UserName, 'require') ) {
      res.msg = '请输入用户名'
      return res;
    };
    res.result = true;    // 验证成功后改为true
    return res;
  },
  // 获取验证码
  getCode() {
    let el        = this.el,
        Tel       = this.data._tel,
        $getCode  = el.$getCode,
        time      = null,
        num       = 60,
        load      = null;

    $getCode.on('click', () => {
      load = Ladda.create($getCode[0]);
      load.start();
      SendLoginValidate({
        Tel
      }, 
      res => {
        load.remove();
        count(num);   // 倒计时
      },
      err => {
        load.remove();
        _fgj.errorTips(err.msg);
      })
    });

    // 倒计时，60秒后再获取
    function count(num) {
      $getCode.attr('disabled', true).html(num + '秒后再获取');
      time = setTimeout(() => {
        if (num <= 0) {
          clearTimeout(time)
          $getCode.attr('disabled', false).html('获取验证码');
        } 
        else {
          num--
          count(num)
        }
      }, 1000);
    }
  },
  // 上传头像
  upHeadPic() {
    let _this = this;

    $('#fileupload').on('change', function (e) {
      e = e || window.event;
      let files = e.target.files[0];
      // 获取base64用来裁切
      let reader = new FileReader();
      reader.onload = function (files) {
        _this.imageCropper(this.result);    // 图片裁切
      };
      reader.readAsDataURL(files);
    });
  },
  // 图片裁切
  imageCropper(image) {
    let el      = this.el,
       _this   = this;

    el.cropperWrap.show();
    this.el.cropper.replace(image);    // 更换图片
    // 确定裁切
    el.confirmCropBtn.on('click', () => {
      _this.Laddaload = Ladda.create(el.confirmCropBtn[0]);
      _this.Laddaload.start();
      this.el.cropper.getCroppedCanvas().toBlob(function (blob) {
        _this.FileUpLoad(blob);
      }, 'image/jpeg')
      el.confirmCropBtn.unbind('click');    // 注意，每次调用都会再次绑定事件，这里要解绑事件
    });
    // 取消裁切
    el.cancelCropBtn.on('click', () => {
      el.cropperWrap.hide();
      el.cancelCropBtn.unbind('click');
      el.confirmCropBtn.unbind('click');    // 注意，每次调用都会再次绑定事件，这里要解绑事件
    });
  },
  // 图片上传地址
  FileUpLoad(blob) {
    let _this = this;
    let forms  = new FormData();

    forms.append('fileupload', blob);

    FileUpLoad(forms, res => {
      let pic = res.path.slice(1);  // slice(1) 取消前面的|
      _this.el.cropperWrap.hide();  // 成功后隐藏
      _this.data.HeadPic = pic;
      _this.el.infoUpImg.attr('src', _fgj.photoPath() + pic);

      _this.Laddaload.remove();

      // 这样就可以重复选择一张图片了
      $('#fileupload').remove();
      $('#headPic').append('<input class="file-img" id="fileupload" type="file" accept="image/*">');
      _this.upHeadPic();
    },
    err => {
       // 图片上传失败
       _fgj.errorTips('图片上传失败');
       _this.Laddaload.remove();
    })
  }
};

export default upPassword;