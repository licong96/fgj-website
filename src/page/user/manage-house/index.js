import 'common/js/common.js';
import './index.scss';

import _fgj from 'util/fgj.js';
import UserNav from 'components/user-nav/index.js';
import _common from '../common.js';  // 用户中心公用js

import * as Ladda from 'ladda';   // 按钮加载样式
import Cropper from 'cropperjs';  // 图片裁切
import 'common/css/cropper.css';
import HintTop from 'components/hint-top/index.js';
import ImageUpload from './image-upload/index.js';
import Login from 'components/login/index.js';

import { GetModelDetail } from 'api/user/manage-house.js';

import { GetDistrict, GetDictionary, FileUpLoad, matchingEstate } from 'api/public.js';
import { AddPhoto, DelPhoto, UpProperty } from 'api/second-hand/publish.js';
import { GetPropertyPhoto } from 'api/second-hand/detail.js';

let tempIndex = require('./index.hbs');
let tempEmpty = require('components/empty/empty.hbs');

// 房源管理
let manage = {
  el: {
    CoverImage: null, // 封面图实例
    HouseImage: null, // 户型图实例
    IndoorImage: null, // 室内图实例
    EstateImage: null, // 小区图实例
    cropper: null,    // 图片裁切实例
    cropImage: document.getElementById('image'),  // 裁切图
    cropperWrap: $('.js_cropper_wrap'),
    imageWrap: $('.js_image_wrap'),
    confirmCropBtn: $('#confirmCropBtn'),
    cancelCropBtn: $('#cancelCropBtn'),
  },
  data: {
    PropertyID: _fgj.getUrlParam('PropertyID') || (window.location.href = './manage.html'),
    coverPhoto: [],   // 封面图，只需要一张
    housePhoto: [],   // 户型图
    IndoorPhoto: [],  // 室内图
    estatePhoto: [],  // 小区图
    params: {
      // TempID: Math.random().toString(36).substr(2),   // 临时ID
      CityID: 218,  // 城市ID，默认南昌
    }
  },
  init() {
    this.initCommon();  // 初始化公共信息
    this.onLoad();
  },
  // 初始化公共信息
  initCommon() {
    let _this = this;

    _common.init({
      successGetInfo(data) {
        // console.log(data)
      },
      errorGetInfo(err) {
      }
    });
  },
  onLoad() {
    this.renderUserNav();   // 渲染用户侧边栏导航
    this.GetModelDetail();  // 获取详细页数据
    this.isPropertyLook();  // 判断是不是分销或经纪人，看房方式有钥匙
  },
  bindEvent() {
    this.initHintTop(); // 初始化提示功能
    this.onSwitcher();  // 出售和出租的切换
    this.initCropper();   // 初始化图片裁切

    this.CoverImageUpload(); // 封面图上传

    this.onChangeSquare();   // 修改面积计算单价或总价
    this.onChangePrice();   // 改变总价，计算单价
    this.onChangePriceUnit();   // 改变单价，计算总价
    this.onChangeRentPriceUnit(); // 房屋出租 - 修改租价，计算租单价
    this.onChangeRentPrice(); // 房屋出租 - 修改租单价，计算租价
    this.onChangeRentSquare() // 房屋出租 - 修改总价，计算租单价

    this.uploadBoxTab();   // 图片切换
    this.AddressSearch();   // 地址搜索
    
    this.toLocaleUpperCase(); // 字段转换过来，因为上传的字段和显示的字段是不一样的，这太糟糕了
    this.onSubmit();    // 表单提交
  },
  // 获取详细页数据
  GetModelDetail() {
    GetModelDetail({
      PropertyID: this.data.PropertyID
    }, 
    res => {
      this.data.params = res.data;
      this.renderMain(res.data);
      this.bindEvent();   // 渲染完页面之后，添加操作
      this.getPropertyPhoto();    // 获取图片
    }, 
    err => {

    })
  },
  // 渲染用户侧边栏导航
  renderUserNav() {
    let nav = new UserNav({
      name: 'manage'
    });
  },
  // 渲染主体内容
  renderMain(data) {
    data._trade === '出售' ? data.sell = true : data.ount = true; // 出售还是出租，用来渲染视图

    let html = _fgj.handlebars(tempIndex, data);
    $('#content').html(html);
    // $('body').bootstrapMaterialDesign();  // 初始化bootstrap

    this.GetDistrict();   // 获取区域数据
    // 获取类型数据
    this.GetDictionary('PropertyUsage', res => {
      this.renderOption('PropertyUsage', res.data);
    });
    // 获取装修数据
    this.GetDictionary('PropertyDecoration', res => {
      this.renderOption('Decoration', res.data);
    });
    // 获取产权性质数据
    this.GetDictionary('PropertyOwn', res => {
      this.renderOption('PropertyNature', res.data);
    });
    // 获取朝向数据
    this.GetDictionary('PropertyDirection', res => {
      this.renderOption('Orientation', res.data);
    });
    // 获取所有地铁站
    this.GetDictionary('SubwayStation', res => {
      this.renderOption('SubWayStation', res.data);
    });
    // 获取标签
    this.GetDictionary('PropertyTag', res => {
      let tagData = res.data,
          html = '',
          tag = data._tag.split('|');

      for (let i = 0, length = tagData.length; i < length; i ++) {
        html += `<div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="tag${i}" value="${tagData[i]._dictionaryvalue}">
                    <label class="custom-control-label" for="tag${i}">${tagData[i]._dictionaryvalue}</label>
                  </div>`;
      };
      $('#PropertyTag').html(html);

      // 回填tag
      let propertyInput = $('#PropertyTag input');

      data._tag.split('|').forEach(item => {
        if (item) {
          propertyInput.each((index, el) => {
            if (item === $(el).val()) {
              propertyInput.eq(index).attr('checked', 'true');
            }
          })
        }
      })
    });

    // 信息回填
    $('#CountF').val(data._countf);
    $('#CountT').val(data._countt);
    $('#CountW').val(data._countw);
    $('#Floor').val(data._floor);
    $('#CompletedYear').val(data._completedyear);
    $('#PropertyYear').val(data._propertyyear);
    $('#SellingPoint').val(data._sellingpoint);
    $('#Traffic').val(data._traffic);
  },
  // 判断是不是分销或经纪人，看房方式有钥匙
  // Cookie : CGroupID = 4759F10B8EE94CC6927C753F1A446C9B 就是分销
  isPropertyLook() {
    if (_fgj.getCookie('CGroupID') === '4759F10B8EE94CC6927C753F1A446C9B') {
      let html = '<option value="有钥匙">有钥匙</option>';
      $('#PropertyLook').append(html)
    }
  },
  // 出售和出租的切换
  onSwitcher() {
    let $deal  = $('.js_deal'),   // 出售
        $lease = $('.js_lease'),  // 出租
        val    = '',
        _this  = this;

    $('input[name="Trade"]').on('change', function () {
      val = $(this).val();
      _this.data.params.Trade = val;

      if (val === '出售') {
        $lease.addClass('hide');
        $deal.removeClass('hide');
        // 还原一些数据
        $('#RentPrice').val('');
        $('#RentPriceUnit').val('');
        $('#MtgPrice').val('');
        $('#TransferPrice').val('');
        $('input[name="RentType"]').val('');
      }
      else {
        $lease.removeClass('hide');
        $deal.addClass('hide');

        // 还原一些数据
        $('#Price').val('');
        $('#PriceUnit').val('');
      }
    });
  },
  // 获取区域数据
  GetDistrict() {
    GetDistrict({
      num:	99,
      CityID:	218
    }, 
    res => {
      let data   = res.data,
          params = this.data.params,
          html   = '<option value="">请选择区域</option>';

      for (let i = 0, length = data.length; i < length; i++) {
        let _districtid = $.trim(data[i]._districtid);
        if (params._districtid === data[i]._districtid) {
          html += `<option value="${_districtid}" selected>${data[i]._districtname}</option>`;  // 加一个选中状态
        } 
        else {
          html += `<option value="${_districtid}">${data[i]._districtname}</option>`;
        }
      };
      
      $('#DistrictID').html(html);
    }, 
    err => {
      $('#DistrictID').html('暂时无信息');
    })
  },
  // 渲染Option
  renderOption(id, data) {
    let html    = '',
        params  = this.data.params,
        key     = '';

    for (let i = 0, length = data.length; i < length; i++) {
      if (data[i]._dictionaryvalue) {
        key = '_' + id.toLocaleLowerCase();   // 返回的数据键就是这样的
        params[key] === data[i]._dictionaryvalue ? 
        html += `<option value="${data[i]._dictionaryvalue}" selected>${data[i]._dictionaryvalue}</option>` :
        html += `<option value="${data[i]._dictionaryvalue}">${data[i]._dictionaryvalue}</option>`;
      }
    };
    $('#' + id).append(html);
  },
  /**
   * 根据DictionaryNo字段获取对应筛选数据
   * @param {Element} DictionaryNo  id元素
   * @param {Function} callback  回调
   */
  GetDictionary(DictionaryNo, callback) {
    GetDictionary({
      num: 99,
      DictionaryNo: DictionaryNo
    }, 
    res => {
      typeof callback === 'function' && callback(res);
    }, 
    err => {
      $('#' + DictionaryNo).html('暂时无信息')
    })
  },
  // 初始化提示功能
  initHintTop() {
    this.HintTop ? '' : this.HintTop = new HintTop();
  },
  // 初始化图片裁切
  initCropper() {
    this.el.cropper = new Cropper(this.el.cropImage, {
      aspectRatio: 4 / 3,   // 比例
    });
  },
  /**
   * 图片裁切操作
   * @param {String} image base或图片地址
   * @param {String} type 哪个类型的图片上传
   */
  imageCropper(image, type) {
    let el      = this.el,
        _this   = this,
        load    = null;

    el.cropperWrap.show();

    this.el.cropper.replace(image);    // 更换图片
    // 确定裁切
    el.confirmCropBtn.on('click', () => {
      load = Ladda.create(el.confirmCropBtn[0]);
      load.start();
      this.el.cropper.getCroppedCanvas().toBlob(function (blob) {
        load.remove();
        el.cropperWrap.hide();
        el[type].FileUpLoad(blob);  // 根据类型执行它下面对应的方法
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
  // 封面图上传
  CoverImageUpload() {
    let cover = this.el.CoverImage = new ImageUpload(),
        _this = this,
        load  = null;

    cover.init({
      box: $('#PhotoTypeCover'),
      photo: [
        {
          src: _this.data.params._pagepic,
          path: _this.data.params._pagepic
        }
      ],
      crop(base) {    // 图片裁切
        _this.imageCropper(base, 'CoverImage');
      },
      laddaStart() {
        load = Ladda.create($('#PhotoTypeCover .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.error('图片上传失败')
      },
      backPhoto(photo) {    // 返回图片数据
        _this.data.coverPhoto = photo;

        // 封面图只有一张，有了就去掉添加按钮
        if (_this.data.coverPhoto.length) {
          $('#PhotoTypeCover .add').hide();
        } else {
          $('#PhotoTypeCover .add').show();
        }
      }
    });
  },
  // 户型图上传
  HouseImageUpload(photo) {
    let house = this.el.HouseImage = new ImageUpload(),
        _this = this,
        load  = null;

    house.init({
      box: $('#PhotoTypeHouse'),
      photo: photo,
      crop(base) {    // 图片裁切
        _this.imageCropper(base, 'HouseImage');
      },
      laddaStart() {
        load = Ladda.create($('#PhotoTypeHouse .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.error('图片上传失败')
      },
      backPhoto(photo) {    // 返回图片数据
        // console.log('house', photo)
        _this.data.housePhoto = photo;
        _this.manipulateImagePack(_this.data.housePhoto, '户型图');   // 图片添加就上传，用临时ID进行关联
      },
      remove(index) {    // 删除图片
        _this.removeImage(index, 'housePhoto');
      }
    });
  },
  // 室内图上传
  IndoorImageUpload(photo) {
    let Indoor = this.el.IndoorImage = new ImageUpload(),
        _this = this,
        load  = null;

    Indoor.init({
      box: $('#PhotoTypeIndoor'),
      photo: photo,
      crop(base) {    // 图片裁切
        _this.imageCropper(base, 'IndoorImage');
      },
      laddaStart() {
        load = Ladda.create($('#PhotoTypeIndoor .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.error('图片上传失败')
      },
      backPhoto(photo) {    // 返回图片数据
        // console.log('Indoor', photo)
        _this.data.IndoorPhoto = photo;
        _this.manipulateImagePack(_this.data.IndoorPhoto, '室内图');   // 图片添加就上传，用临时ID进行关联
      },
      remove(index) {    // 删除图片
        _this.removeImage(index, 'IndoorPhoto');
      }
    });
  },
  // 小区图上传
  EstateImageUpload(photo) {
    let estate = this.el.EstateImage = new ImageUpload(),
        _this = this,
        load  = null;

    estate.init({
      box: $('#PhotoTypeEstate'),
      photo: photo,
      crop(base) {    // 图片裁切
        _this.imageCropper(base, 'EstateImage');
      },
      laddaStart() {
        load = Ladda.create($('#PhotoTypeEstate .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.error('图片上传失败')
      },
      backPhoto(photo) {    // 返回图片数据
        // console.log('estate', photo)
        _this.data.estatePhoto = photo;
        _this.manipulateImagePack(_this.data.estatePhoto, '小区图');   // 图片添加就上传，用临时ID进行关联
      },
      remove(index) {    // 删除图片
        _this.removeImage(index, 'estatePhoto');
      }
    });
  },
  // 修改面积计算单价或总价
  onChangeSquare() {
    let Square        = $('#Square'),
        Price         = $('#Price'),
        PriceUnit     = $('#PriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    Square.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceVal = Price.val();
      PriceUnitVal = PriceUnit.val();

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceVal, 'number-dot')) {
        PriceUnitVal = (PriceVal * 10000 / SquareVal).toFixed(2);
        PriceUnit.val(PriceUnitVal);
      } else {
        PriceUnit.val('');
      };

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceUnitVal, 'number-dot')) {
        PriceVal = (PriceUnitVal * SquareVal / 10000).toFixed(2);
        Price.val(PriceVal);
      } else {
        Price.val('');
      };
    })
  },
  // 改变总价，计算单价 
  onChangePrice() {
    let Square        = $('#Square'),
        Price         = $('#Price'),
        PriceUnit     = $('#PriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    Price.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceVal = Price.val();

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceVal, 'number-dot')) {
        PriceUnitVal = (PriceVal * 10000 / SquareVal).toFixed(2);
        PriceUnit.val(PriceUnitVal);
      } else {
        PriceUnit.val('');
      }
    })
  },
  // 改变单价，计算总价
  onChangePriceUnit() {
    let Square        = $('#Square'),
        Price         = $('#Price'),
        PriceUnit     = $('#PriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    PriceUnit.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceUnitVal = PriceUnit.val();

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceUnitVal, 'number-dot')) {
        PriceVal = (PriceUnitVal * SquareVal / 10000).toFixed(2);
        Price.val(PriceVal);
      } else {
        Price.val('');
      }
    })
  },
  // 房屋出租 - 修改总价，计算租单价
  onChangeRentSquare() {
    let Square        = $('#Square'),
        Price         = $('#RentPrice'),
        PriceUnit     = $('#RentPriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    Square.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceVal = Price.val();
      PriceUnitVal = PriceUnit.val();
      
      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceVal, 'number-dot')) {
        PriceUnitVal = (PriceVal * SquareVal).toFixed(2);
        PriceUnit.val(PriceUnitVal);
        return;
      } else {
        PriceUnit.val('');
      };
  
      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceUnitVal, 'number-dot')) {
        PriceVal = (PriceUnitVal * SquareVal).toFixed(2);
        Price.val(PriceVal);
      } else {
        Price.val('');
      };
    })
  },
  // 房屋出租 - 修改租价，计算租单价
  onChangeRentPriceUnit() {
    let Square        = $('#Square'),
        Price         = $('#RentPrice'),
        PriceUnit     = $('#RentPriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    Price.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceVal = Price.val();

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceVal, 'number-dot')) {
        PriceUnitVal = (PriceVal / SquareVal).toFixed(2);
        PriceUnit.val(PriceUnitVal);
      } else {
        PriceUnit.val('');
      }
    })
  },
  // 房屋出租 - 修改租单价，计算租价
  onChangeRentPrice() {
    let Square        = $('#Square'),
        Price         = $('#RentPrice'),
        PriceUnit     = $('#RentPriceUnit'),
        SquareVal     = '',
        PriceVal      = '',
        PriceUnitVal  = '';

    PriceUnit.on('input propertychange', function () {
      SquareVal = Square.val();
      PriceUnitVal = PriceUnit.val();

      if (_fgj.validate(SquareVal, 'number-dot') && _fgj.validate(PriceUnitVal, 'number-dot')) {
        PriceVal = (PriceUnitVal * SquareVal).toFixed(2);
        Price.val(PriceVal);
      } else {
        Price.val('');
      }
    })
  },
  // 图片切换
  uploadBoxTab() {
    let btn = $('.js_upload_tab .btn'),
        box = $('.js_upload_box');

    btn.each(function(index, item) {
      $(item).on('click', function () {
        btn.eq(index).addClass('btn-primary').siblings().removeClass('btn-primary');
        btn.remove('btn-primary').eq(index).addClass('btn-primary');
        box.addClass('hide').eq(index).removeClass('hide');
      })
    })
  },
  // 地址搜索
  AddressSearch() {
    let _this   = this,
        time    = null,
        input   = $('#Address'),
        search  = $('.js_address_search'),
        Address = $('#Address'),
        $this   = null,
        html    = '',
        dayData = '';   // 临时存储，用来验证是否选了地址
        
    input.on('input propertychange', function () {
      if (time) {
        clearTimeout(time)
      };
      time = setTimeout(() => {
        matchingEstate({
          likestr: $(this).val(),
          num: 8
        }, 
        res => {
          html = '';
          for (let i = 0, length = res.data.length; i < length; i++) {
            html += `<li class="a-list" data-id="${res.data[i]._estateid}" 
                                        data-lat="${res.data[i]._lat}"
                                        data-lng="${res.data[i]._lng}">${res.data[i]._estatename}</li>`;
          };
          search.html(html);
        }, 
        err => {
          search.html(tempEmpty)
        });
        search.show();
      }, 300);
    });

    $(document).on('click', '.js_address_search .a-list', function () {
      $this = $(this);
      _this.data.params = $.extend({}, _this.data.params, {
        EstateID: $this.data('id'),
        Lat: $this.data('lat'),
        Lng: $this.data('lng')
      });
      Address.val($this.html());
      dayData = $this.html();
    });

    input.on('focus', function () {
      search.show();
    });
    input.on('blur', function () {
      setTimeout(() => {
        // 只能选一个，不能手动输入
        if (dayData !== Address.val()) {
          Address.val('');
        };
        search.hide();
      }, 200);
    });
  },
  // 转换字段
  toLocaleUpperCase() {
    let params = this.data.params;

    params.PropertyID = params._propertyid;
    params.CityID = params._cityid;
    params.EstateID = params._estateid;
    params.Trade = params._trade;
    params.Lng = params._lng;
    params.Lat = params._lat;
    params.SubWayStation = params._subwaystation;
  },
  // 表单提交，下面的代码写的太糟糕了，但是也没空优化
  onSubmit() {
    let _this   = this,
        obj     = {},
        Tag     = '',
        verify  = null,
        isLoad  = null;

    $('#submit .btn').on('click', function () {
      // 判断是否登陆
      if (!_fgj.getCookie('CUserID')) {
        _this.isLogin();
        return
      }
      // 都要传
      let com = {
        PropertyTitle   : $('#PropertyTitle').val(),
        DistrictID      : $('#DistrictID').val(),
        Square          : $('#Square').val(),
        CountF          : $('#CountF').val(),
        CountT          : $('#CountT').val(),
        CountT          : $('#CountT').val(),
        CountW          : $('#CountW').val(),
        Floor           : $('#Floor').val(),
        FloorAll        : $('#FloorAll').val(),
        PropertyUsage   : $('#PropertyUsage').val(),  // 类型，也叫物业用途
        PropertyType    : $('#PropertyType').val(),  // 物业类别
        PropertyLook    : $('#PropertyLook').val(),  // 看房方式
        PropertyNature  : $('#PropertyNature').val(),  // 产权性质
        PropertyYear    : $('#PropertyYear').val(),  // 产权年限
        CompletedYear   : $('#CompletedYear').val(),  // 建筑年代
        SellingPoint    : $('#SellingPoint').val(),  // 核心卖点
        Traffic         : $('#Traffic').val(),  // 交通
        Address         : $('#Address').val(),  // 地址
        SubWayStation   : $('#SubWayStation').val(),  // 地铁站
        Decoration      : $('#Decoration').val(),  // 装修
        Orientation     : $('#Orientation').val(),  // 朝向
      };
      // 出售
      let deal = {
        Price           : $('#Price').val(),    // 售价 | 出售
        PriceUnit       : $('#PriceUnit').val(),  // 售单价 | 出售
      };
      // 出租
      let lease = {
        RentPrice       : $('#RentPrice').val(),  // 租单 | 出租
        RentPriceUnit   : $('#RentPriceUnit').val(),  // 租单价 | 出租
        MtgPrice        : $('#MtgPrice').val(),  // 物业费 | 出租
        TransferPrice   : $('#TransferPrice').val(),  // 转让费 | 出租
        RentType        : $('input[name="RentType"]:checked').val(), // 租房类型 | 出租
      };
      
      // 获取Tag
      let PropertyTag = $('#PropertyTag').find(':checkbox:checked');
      PropertyTag.each(function () {
        Tag += $(this).val() + '|';
      });
      
      // 判断是出售还是出租
      if (_this.data.params.Trade === '出售') {
        obj = $.extend({}, _this.data.params, com, deal);
      } 
      else {
        obj = $.extend({}, _this.data.params, com, lease);
      };
      obj.Tag = Tag;    // 追加标签
      if (_this.data.coverPhoto[0]) {
        obj.PagePic = _this.data.coverPhoto[0].path
      };

      console.log(obj)
      
      // 上传之前，验证数据
      verify = _this.verifyData(obj);
      if (!verify.result) {
        _fgj.errorTips(verify.msg);
        return
      }
      
      isLoad = Ladda.create(this);    // 上传中
      isLoad.start();
      // 上传数据
      UpProperty(obj, res => {
        isLoad.stop();
        _fgj.successTips('编辑成功', '', function () {
          window.location.reload();   // 清空数据太麻烦，干脆直接刷新，更省时间
        });
      }, 
      err => {
        _fjg.errorTips(err.msg);
      });
    })
  },
  // 添加图片之后就直接上传图片，用临时ID进行关联
  manipulateImagePack(arr, type) {
    let obj = {},
        PropertyID  = this.data.params._propertyid;

    if (arr.length) {
      obj.PropertyID = PropertyID;
      obj.PhotoType = type;
      obj.Path = arr[0].path.slice(1);
      obj.SmallPath = arr[0].sm_path.slice(1);

      // 添加图片
      AddPhoto(obj, res => {
        arr[0].PhotoID = res.PhotoID;   // 保存ID，删除的时候有用
        this.HintTop.success('图片添加成功');
      }, 
      err => {
        _fgj.errorTips(err.msg);
      })
    };
  },
  // 删除图片
  removeImage(index, type) {
    let PhotoID = this.data[type][index].PhotoID
    DelPhoto({
      PhotoID
    }, 
    res => {
    }, 
    err => {
      _fgj.errorTips(err.msg);
    })
  },
  // 验证要上传的数据
  verifyData(data) {
    let res = {
      result: false,
      msg: '错误提示',
      desc: '附加说明'
    };
    if (!data.PagePic) {
      res.msg = '请上传封面图'
      return res
    };
    if (!$.trim(data.PropertyTitle)) {
      res.msg = '请输入房源标题'
      return res
    };
    if (!$.trim(data.DistrictID)) {
      res.msg = '请选择区域'
      return res
    };
    if (!$.trim(data.Address)) {
      res.msg = '请输入地址'
      return res
    };
    if (!$.trim(data.CountF)) {
      res.msg = '请选择几室'
      return res
    };
    if (!$.trim(data.CountT)) {
      res.msg = '请选择几厅'
      return res
    };
    if (!$.trim(data.CountW)) {
      res.msg = '请选择几卫'
      return res
    };
    if (!$.trim(data.Square)) {
      res.msg = '请输入面积'
      return res
    };
    // 出租和出售的验证不一样
    if (this.data.params.Trade === '出售') { 
      if (!$.trim(data.Price)) {
        res.msg = '请输入总价'
        return res
      };
      if (!$.trim(data.PriceUnit)) {
        res.msg = '请输入单价'
        return res
      };
    } 
    else {
      if (!$.trim(data.RentPrice)) {
        res.msg = '请输入租价'
        return res
      };
      if (!$.trim(data.RentPriceUnit)) {
        res.msg = '请输入租单价'
        return res
      };
      if (!$.trim(data.TransferPrice)) {
        res.msg = '请输入转让费'
        return res
      };
    }
    if (!$.trim(data.Floor)) {
      res.msg = '请选择所在楼层'
      return res
    };
    if (!$.trim(data.FloorAll)) {
      res.msg = '请输入总楼层'
      return res
    };
    if (!$.trim(data.PropertyUsage)) {
      res.msg = '请选择类型'
      return res
    };
    if (!$.trim(data.PropertyType)) {
      res.msg = '请输入物业类别'
      return res
    };

    res.result = true;
    return res;
  },
  // 判断是否登陆
  isLogin() {
    let _this = this;

    if (!_fgj.getCookie('CUserID')) {
      this.Login = new Login();
      this.Login.init({
        success: function () {
          _this.HintTop.success('登陆成功！')
        },
        cancel() {
        }
      });
    }
  },
  // 获取图片
  getPropertyPhoto() {
    let PropertyID  = this.data.PropertyID;

    GetPropertyPhoto({
      num: 999,
      PropertyID: PropertyID,
      PhotoType: '户型图'
    }, 
    res => {
      this.data.housePhoto = res.data;
      this.HouseImageUpload(res.data);    // 户型图上传
    }, 
    err => {
      this.HouseImageUpload([]);    // 户型图上传
    });

    GetPropertyPhoto({
      num: 999,
      PropertyID: PropertyID,
      PhotoType: '室内图'
    }, 
    res => {
      this.data.IndoorPhoto = res.data;
      this.IndoorImageUpload(res.data);
    }, 
    err => {
      this.IndoorImageUpload([]);
    });

    GetPropertyPhoto({
      num: 999,
      PropertyID: PropertyID,
      PhotoType: '小区图'
    }, 
    res => {
      this.data.estatePhoto = res.data;
      this.EstateImageUpload(res.data);
    }, 
    err => {
      this.EstateImageUpload([]);
    });
  }
};

$(function () {
  manage.init();
});