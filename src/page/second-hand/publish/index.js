import 'common/js/commonStyle.js';
import './index.scss';

import * as Ladda from 'ladda';   // 按钮加载样式
import 'ladda/css/ladda-themed.scss'
import _fgj from 'util/fgj.js';
import Login from 'components/login/index.js';
import HintTop from 'components/hint-top/index.js';
import ImageUpload from './image-upload/index.js';

import { GetDistrict, GetDictionary, FileUpLoad } from 'api/public.js';
import { AddPhoto, AddProperty } from 'api/second-hand/publish.js';

let tempIndex = require('./index.hbs');

// 二手房详细
let detail = {
  el: {
  },
  data: {
    coverPhoto: [],   // 封面图，只需要一张
    housePhoto: [],   // 户型图
    IndoorPhoto: [],  // 室内图
    estatePhoto: [],  // 小区图
    params: {
      Trade: '出售',
      CityID: 218,  // 城市ID，默认南昌
    }
  },
  init() {
    this.onLoad();
    this.bindEvent();
  },
  onLoad() {
    this.renderMain();    // 渲染主体内容
    this.isPropertyLook();  // 判断是不是分销或经纪人，看房方式有钥匙
  },
  bindEvent() {
    this.onSwitcher();  // 出售和出租的切换
    this.CoverImageUpload(); // 封面图上传
    this.HouseImageUpload(); // 户型图上传
    this.IndoorImageUpload(); // 室内图上传
    this.EstateImageUpload(); // 小区图上传

    this.initLogin();   // 初始化登陆
    this.initHintTop(); // 初始化提示功能
    this.onSubmit();    // 表单提交
  },
  // 渲染主体内容
  renderMain() {
    let html = _fgj.handlebars(tempIndex, {});
    $('#main').html(html);

    this.GetDistrict();   // 获取区域数据
    // 获取类型数据
    this.GetDictionary('PropertyUsage', res => {
      this.renderOption('PropertyUsage', res.data);
    });
    // 获取装修数据
    this.GetDictionary('PropertyDecoration', res => {
      this.renderOption('Decoration', res.data);
    });
    // 获取装修数据
    this.GetDictionary('PropertyOwn', res => {
      this.renderOption('PropertyNature', res.data);
    });
    // 获取朝向数据
    this.GetDictionary('PropertyDirection', res => {
      this.renderOption('Orientation', res.data);
    });
    // 获取地铁站
    this.GetDictionary('SubwayStation', res => {
      this.renderOption('SubWayStation', res.data);
    });
    // 获取朝向数据
    this.GetDictionary('PropertyTag', res => {
      let data = res.data,
          html = '';
      for (let i = 0, length = data.length; i < length; i ++) {
        html += `<div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="tag${i}" value="${data[i]._dictionaryvalue}">
                    <label class="custom-control-label" for="tag${i}">${data[i]._dictionaryvalue}</label>
                  </div>`;
      };
      $('#PropertyTag').html(html);
    });
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
        params = this.data.params,
        val    = '',
        _this  = this;

    $('input[name="Trade"]').on('change', function () {
      val = $(this).val();

      params.Trade = val;

      if (val === '出售') {
        $lease.addClass('hide');
        $deal.removeClass('hide');
        // 还原一些数据
        $('#RentPrice').val('')
        $('#RentPriceUnit').val('')
        $('#MtgPrice').val('')
        $('#TransferPrice').val('')
        $('input[name="typeHouse"]').val('')
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
      let data = res.data,
          html = '<option value="" selected>请选择区域</option>';

      for (let i = 0, length = data.length; i < length; i++) {
        html += `<option value="${data[i]._districtname}">${data[i]._districtname}</option>`
      };
      
      $('#DistrictID').html(html);
    }, 
    err => {
      $('#DistrictID').html('暂时无信息');
    })
  },
  // 渲染Option
  renderOption(id, data) {
    let html = '';

    for (let i = 0, length = data.length; i < length; i++) {
      if (data[i]._dictionaryvalue) {
        html += `<option value="${data[i]._dictionaryvalue}">${data[i]._dictionaryvalue}</option>`
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
  // 初始化登陆
  initLogin() {
    this.Login = new Login();
    // this.Login.init();
  },
  // 初始化提示功能
  initHintTop() {
    this.HintTop ? '' : this.HintTop = new HintTop();
  },
  // 封面图上传
  CoverImageUpload() {
    let cover = new ImageUpload(),
        _this = this,
        load  = null;

    cover.init({
      box: $('#PhotoTypeCover'),
      laddaStart() {
        load = Ladda.create($('#PhotoTypeCover .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.show({
          type: 'danger',
          text: '图片上传失败'
        })
      },
      backPhoto(photo) {    // 返回图片数据
        console.log('cover', photo)
        _this.data.coverPhoto = photo;

        // 封面图只有一张
        if (_this.data.coverPhoto.length) {
          $('#PhotoTypeCover .add').hide();
        } else {
          $('#PhotoTypeCover .add').show();
        }
      }
    });
  },
  // 户型图上传
  HouseImageUpload() {
    let house = new ImageUpload(),
        _this = this,
        load  = null;

    house.init({
      box: $('#PhotoTypeHouse'),
      laddaStart() {
        load = Ladda.create($('#PhotoTypeHouse .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.show({
          type: 'danger',
          text: '图片上传失败'
        })
      },
      backPhoto(photo) {    // 返回图片数据
        console.log('house', photo)
        _this.data.housePhoto = photo;
      }
    });
  },
  // 室内图上传
  IndoorImageUpload() {
    let Indoor = new ImageUpload(),
        _this = this,
        load  = null;

    Indoor.init({
      box: $('#PhotoTypeIndoor'),
      laddaStart() {
        load = Ladda.create($('#PhotoTypeIndoor .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.show({
          type: 'danger',
          text: '图片上传失败'
        })
      },
      backPhoto(photo) {    // 返回图片数据
        console.log('Indoor', photo)
        _this.data.IndoorPhoto = photo;
      }
    });
  },
  // 小区图上传
  EstateImageUpload() {
    let estate = new ImageUpload(),
        _this = this,
        load  = null;

    estate.init({
      box: $('#PhotoTypeEstate'),
      laddaStart() {
        load = Ladda.create($('#PhotoTypeEstate .ladda-button')[0]);
        load.start();
      },
      laddaStop() {
        // load.stop();
        load.remove();
      },
      HintTop() {
        _this.HintTop.show({
          type: 'danger',
          text: '图片上传失败'
        })
      },
      backPhoto(photo) {    // 返回图片数据
        console.log('estate', photo)
        _this.data.estatePhoto = photo;
      }
    });
  },
  // 表单提交
  onSubmit() {
    let _this   = this,
        obj     = {},
        Tag     = '';

    $('#submit .btn').on('click', function () {
      // 都要传
      let com = {
        PropertyTitle   : $('#PropertyTitle').val(),
        DistrictID      : $('#DistrictID').val(),
        Square          : $('#Square').val(),
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
        typeHouse       : $('input[name="typeHouse"]').val(), // 租房类型 | 出租
      };
      
      // 获取Tag
      let PropertyTag = $('#PropertyTag').find(':checkbox:checked');
      PropertyTag.each(function () {
        Tag += $(this).val() + '|'
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
        obj.PagePic = _this.data.coverPhoto[0].path.slice(1); // 追加封面图
      }

      console.log(obj)

      return

      AddProperty(obj, res => {
        console.log(res)
      }, 
      err => {
        console.log(err)
      })
      
      let submit = Ladda.create(this);
      submit.start();
      setTimeout(() => {
        submit.stop()
      }, 2000)
    })
  }
};

$(function () {
  detail.init()
});