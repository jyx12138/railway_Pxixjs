import resourcesData from "./config/resource_railway.js";
import siteData from "./config/site_name.js";
import scenesData from "./config/scene_railway.js";
import spritesData from "./config/sprites_railway.js";
import animationData from "./config/animation.js";
import titleAnimatData from "./config/titleAnimation.js";
import lanData from './config/language_name.js'; // 车站点位名称
import navData from './config/nav-img.js'; // 车站点位
import { intervals, audiosMap } from "./config/audios.js";

var language = 'ch'; // 当前语言
var seekProgress = 0 //
let alloyTouch;
let trainSprite;
let pixieArr = []
let introText
const chText = "12月3日，连接昆明和万象、全线采用中国标准的中老铁路正式开通。线路北\n起云南省会昆明，向南经玉溪、普洱、西双版纳至磨憨口岸，再经老挝境内的\n磨丁、琅勃拉邦，最终到达老挝首都万象，设计时速160公里，线路全长1000\n多公里。通车后，从昆明至景洪仅需3个多小时，至老挝万象有望实现直达\n运输、当日通达。中老铁路是中老两党两国领导人高度关注并亲自推动的政府\n间合作项目，是我国“一带一路”倡议与老挝“变陆锁国为陆联国”战略对接的\n重要项目，对加快建设中老经济走廊、构建中老命运共同体具有重要意义。"
const loText = 'ໃນວັນທີ3ເດືອນທນວາ.ເສັ້ນທາງລົດໄຟຈີນລາວທີ່ເຊື່ອມຕໍ່ຄຸນໝິງຫາວຽງຈັນແລະໃຊ້ມາດຕະຖານ\nເຕັກນິກຂອງຈີນເປີນນຳ້ໃຊ້ຢ່າງເປັນທາງການ.ການອອກແບບແມ່ນ160ກິໂລແມັດ/ຊົ່ວໂມງແລະ\nມີຄວາມຍາວທັງໝົດແມ່ນ1,000ກວ່າກິໂລແມັດ.ທາງລົດໄຟຈີນ-ລາວ（ຄຸນໝິງ-ວຽງຈັນ）ແມ່ນ\nໂຄງການຮ່ວມມືລະຫວ່າງສອງປະເທດລາວ-ຈີນ,ເຊິ່ງແມ່ນການນຳທັງສອງຝ່າຍໄດ້ເອົາໃຈໃສ່ເປັນຢ່າງ\nສູງແລະໄດ້ຮັບການຊຸກຍູ້ສົ່ງເສີມໂດຍການນໍາຝ່າຍລາວແລະຝ່າຍຈີນ.ຍັງເປັນໂຄງການຫນຶ່ງທີ່ສຳຄັນ\nມາຈາກຂໍ້ລິເລີ່ມ"ໜຶ່ງແລວທາງໜຶ່ງເສັ້ນທາງ"ຂອງສປຈີນເຊື່ອມຕໍ່ຍຸດທະສາດຫັນຈາກປະເທດທີ່ບໍ່\nມີຊາຍແດນຕິດກັບທະເລເປັນປະເທດໃຈກາງການບໍລິການທາງຜ່ານຂອງລາວ.ມີຄວາມໝາຍສຳຄັນ\nທີ່ສຸດຈະກໍ່ສ້າງແລວທາງເສດຖະກິດແລະສ້າງຄູ່ຮ່ວມຊາຕຳກຳຂອງປະເທດຈີນ-ລາວ.'
class MainRail {
    app = null;
    scenes = [];
    timeline = null;
    sprites = {};
    tickerPhone = null;
    actTrumpet = null;
    scale = 0;
    cacheAudioIndex = [];
    swiper = null;
    currentIndex = 0;
    progress = 0;
    vtData = []
    initR() {
        console.log("MainRail:init");
        const min = Math.min(window.__clientH, window.__clientW);
        this.scale = min / 750;
        // 加载资源
        this.initLoader();
        // 动画时间线
        this.timeline = this.initTimeline();
        this.cacheAudioIndex = [];
    }

    initRApp() {
        const app = new PIXI.Application({
            width: window.__clientW,
            height: window.__clientH,
            backgroundColor: 0xffffff,
            resolution:2,
            forceCanvas: true
        });
        document.getElementById('canvas').appendChild(app.view);
        app.renderer.autoDensity=true;
        app.renderer.resize(window.__clientW, window.__clientH)
        app.stage.scale.set(this.scale, this.scale);

        if (window.__clientW < window.__clientH) {
            app.stage.rotation = Math.PI / 2;
            app.stage.x = window.__clientW;
        }

        return app;
    }

    initLoader() {
        // 加载图片精灵
        const loader = new PIXI.Loader();
        Object.keys(resourcesData).forEach(v => loader.add(v, resourcesData[v]));
        siteData.forEach(v => {
            Object.keys(v).forEach(k =>{
                loader.add(k, v[k])
            });
        })
        loader.on("progress", this.updateLoading);
        loader.once("complete", this.onLoaded);
        loader.load(); // 加载资源
    }

    updateLoading(target) {
        $("#percent").text(parseInt(target.progress) + "%");
    }

    onLoaded = () => {
        // 隐藏 Loading
        $("#loading").hide();
        // 初始化舞台 stage (canvas、webgl)
        this.app = this.initRApp();

        // 初始化场景画布 scene
        this.scenes = this.initRScenes();
        // 显示精灵图
        this.initSprites();
        // 显示文字
        this.initTextSprites();
        // 初始化 动画
        // this.initTitleAnimation()
        this.initRAnimation();

        this.bindEvents();
    };
    // 播放背景音乐
    playBgm() {
        let audio = document.getElementById('bg');
        if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
            WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                audio.play();
            });
        } else {
            audio.play();
        }
    }
    isWeiXin () {
        var ua = window.navigator.userAgent.toLowerCase();
        console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }

    initRScenes = () => {
        const scenes = scenesData.map(v => {
            let scene = new PIXI.Container({
                width: v.width,
                height: v.height,
                backgroundColor: 0xd7a664
            });
            scene.x = v.x;
            scene.y = v.y;

            return scene;
        });
        this.app.stage.addChild(...scenes);
        return scenes;
    };

    initSprites = () => {
        spritesData.forEach((v, i) => {
            // 找到相关 资源图

            Object.keys(v).forEach(t => {
                if (resourcesData[t]) {
                    let sprite = PIXI.Sprite.from(t);
                    // 添加属性
                    Object.keys(v[t]).forEach(k => {
                        sprite[k] = v[t][k];
                    });
                    if (sprite.stage) { // 精灵单独添加到舞台中(火车)
                        trainSprite = sprite
                        this.app.stage.addChild(sprite)
                    } else {
                        this.sprites[t] = sprite;
                        this.scenes[i].addChild(sprite);
                    }
                } else {
                    // 加载站点名精灵帧动画，通过切换帧实现语言切换
                    this.vtData.push(v[t])
                    if (this.vtData.length > 47) {
                        this.initSiteName()
                    }
                }
            });
        });
    };
    initSiteName = () => {
        console.log('initSiteName---------------------------------------')
        let result = []
        let siteTextures = []
        let TextureCache = PIXI.utils.TextureCache;
        let Texture = PIXI.Texture;
        let Rectangle = PIXI.Rectangle;
        let AnimatedSprite = PIXI.AnimatedSprite;
        siteData.forEach(el => {
            Object.keys(el).forEach(obj => {
                let base = TextureCache[obj];
                let texture = new Texture(base);
                texture.frame = new Rectangle(0,0,texture.orig.width,texture.orig.height)
                result.push(texture)
                // 两个一组分成24个帧动画
                if (result.length > 47) {
                    for (let i = 0; i < result.length;i+=2) {
                        siteTextures.push(result.slice(i,i+2))
                    }
                    console.log(siteTextures,'siteTextures',siteTextures.length)
                }
            })
        })
        siteTextures.forEach((arr,index) => {
            let pixie = new PIXI.AnimatedSprite(arr);
            pixie.x = this.vtData[index*2].position.x
            pixie.y = this.vtData[index*2].position.y
            pixie.gotoAndStop(language == 'ch'? 0:1)
            pixieArr.push(pixie)
        })
        this.scenes[1].addChild(pixieArr[0]);
        this.scenes[2].addChild(pixieArr[2],pixieArr[1]);
        this.scenes[3].addChild(pixieArr[3],pixieArr[4]);
        this.scenes[4].addChild(pixieArr[5],pixieArr[6]);
        this.scenes[5].addChild(pixieArr[7],pixieArr[8]);
        this.scenes[6].addChild(pixieArr[9],pixieArr[10]);
        this.scenes[7].addChild(pixieArr[11]);
        this.scenes[8].addChild(pixieArr[12],pixieArr[13]);
        this.scenes[9].addChild(pixieArr[14],pixieArr[15]);
        this.scenes[10].addChild(pixieArr[16],pixieArr[17]);
        this.scenes[11].addChild(pixieArr[18],pixieArr[19],pixieArr[20]);
        this.scenes[12].addChild(pixieArr[21],pixieArr[22]);
        this.scenes[13].addChild(pixieArr[23]);
        pixieArr.forEach((v,index) => {
            v.interactive = true;
            v.buttonMode = true;
            v.on('pointerdown', () => {
                this.viewArticle(v,index)
            })
        })
    }

    initTouch = (vertical, direction) => {
        const max = Math.max(window.__clientH, window.__clientW);
        const appW = this.app.stage.width;
        const scrollDis = appW - 2 * max;

        alloyTouch = new AlloyTouch({
            touch: "#canvas", //反馈触摸的dom
            vertical: vertical,
            min: -scrollDis,
            maxSpeed: 0.5,
            max: 0, //不必需,滚动属性的最大值
            bindSelf: false,
            initialValue: 0,
            change: value => {
                let progress = -value / scrollDis;
                progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;
                this.app.stage.position[direction] = value - max;
                this.timeline.seek(progress);
                seekProgress = progress
                if (progress > 0.047) {
                    this.initNav(progress) // 初始化导航条
                    this.setProgress(progress) // 设置导航条切换
                }
                if (progress < 0.047) {
                    $('.swiper-list-wrapper').hide()
                }
                console.log(progress,'progress',value,'value',appW)
            }
        });
    };
    initNav = () => {
         // 显示导航站点
            $('.swiper-list-wrapper').show()
            if ($('.nav-list').children().length > 0) return
            navData[language].forEach(v => {
                let imgs = `<div class="swiper-slide stop-swiping">
                                        <img class="img show ${language == 'lo'?'lo-img':'img-normal'}" src="${v.chN}" alt="">
                                        <img class="img hide ${language == 'lo'?'lo-img':'img-active'}" src="${v.chNA}" alt="">
                                    </div>
                                   `
                $('.nav-list').append(imgs)
            })
            this.initSwiper()
    }
    initSwiper = () => {
        this.swiper = new Swiper('.swiper-container', {
            slidesPerView: language == 'ch'? 5:3,
            observer:true,
            onSlideChangeEnd: function(swiper){
                swiper.update();
            },
        })
    }
    setProgress = (progress) => {
        Object.keys(titleAnimatData).forEach((k,index) => {
            const delay =  titleAnimatData[k][0].delay
            if (progress - delay <= 0.03 && progress - delay > 0) {
                console.log(delay,'delay',index,$('.swiper-slide').eq(index).children('.img'))
                this.currentIndex = index
                $('.swiper-slide').eq(index).children('.show').hide()
                $('.swiper-slide').eq(index).children('.hide').show()
                $('.swiper-slide').eq(index).siblings().children('.hide').hide()
                $('.swiper-slide').eq(index).siblings().children('.show').show()
            }
        })
        const mathProgres = progress.toFixed(3)
        let dis = this.computeNumber(mathProgres,'-',0.1).result
        if (progress > 0.42) {
            dis = this.computeNumber(mathProgres,'-',0).result
        }
        let interval = language == 'ch'? mathProgres: dis

        this.swiper.setProgress(interval,500)
    }
    // 渲染第二屏简介文字
    initTextSprites = () => {
        const style = new PIXI.TextStyle({
            fontFamily: "Source Han Sans CN",
            align: "center",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 48,
            fill: ["#ffffff"],
            wordWrap: false,
        });

        const styleOne = new PIXI.TextStyle({
            fontFamily: "Source Han Sans CN",
            align: "left",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 28,
            fill: ["#2C3A2F"],
            wordWrap: true,
            wordWrapWidth: 200
        });
        introText = new PIXI.Text(
            language == 'ch'? chText:loText,
            styleOne
        );
        introText.x = 115
        introText.y = 208
        this.scenes[1].addChild(introText)
    };
    updateText = () => {
        introText.text = language == 'ch'? chText:loText
    }
    initTimeline = () => {
        return new TimelineMax({ paused: true });
    };

    initRAnimation = () => {
        Object.keys(animationData).forEach(k => {
            animationData[k].forEach(v => {
                const { duration, delay, from, to } = v;
                let sprite
                if (k == 'train') {
                    sprite = trainSprite
                } else {
                    if (v.prop) {
                        sprite = this.sprites[k][v.prop]
                    } else {
                        sprite = this.sprites[k];
                    }
                }
                let act = null;
                if (from && to) {
                    act = TweenMax.fromTo(sprite, duration, from, to);
                } else if (from) {
                    act = TweenMax.from(sprite, duration, from);
                } else if (to) {
                    act = TweenMax.to(sprite, duration, to);
                }
                const tm = new TimelineMax({ delay });

                tm.add(act, 0);
                tm.play();
                this.timeline.add(tm, 0);
            });
        });

        // 特殊动画特殊处理
        // this.sprites.phone.pivot.set(173, 164);
        // let tickerPhone = new PIXI.ticker.Ticker();
        // let count = 0;
        // tickerPhone.stop();
        // tickerPhone.add(delta => {
        //     count++;
        //     if (count == 11) count = 0;
        //     if (this.sprites.phone.rotation > 1 && count % 10 == 0) {
        //         this.sprites.phone.rotation -= 0.1 * delta;
        //     } else if (this.sprites.phone.rotation < 1 && count % 10 == 0) {
        //         this.sprites.phone.rotation += 0.1 * delta;
        //     }
        // });
        // tickerPhone.start();

        // 喇叭播音
        // const actTrumpet = new TweenMax(this.sprites.trumpet, 0.5, {
        //     width: 210 * 0.85,
        //     height: 179 * 0.85,
        //     repeat: -1,
        //     yoyo: true,
        //     ease: Power0.easeNone
        // });

        // 手机振动
        // this.tickerPhone = tickerPhone;
        // this.actTrumpet = actTrumpet;
    };
    //
    initTitleAnimation = () => {
        Object.keys(titleAnimatData).forEach(k => {
            titleAnimatData[k].forEach(v => {
                const { duration, delay, from, to } = v;
                let sprite = this.sprites[k];
                let acts = null;
                if (sprite) {
                    if (from && to) {
                        acts = TweenMax.fromTo(sprite, duration, from, to);
                    } else if (from) {
                        acts = TweenMax.from(sprite, duration, from);
                    } else if (to) {
                        acts = TweenMax.to(sprite, duration, to);
                    }
                    const tm = new TimelineMax({ delay });

                    tm.add(acts, 0);
                    tm.play();
                    this.timeline.add(tm, 0);
                }
            });
        })
    }

    bindEvents = () => {
        this.sprites.btn.interactive = true;
        this.sprites.btn.buttonMode = true;
        this.sprites.btn.on("pointerdown", this.onStart);
    };
    // 显示文章
    viewArticle = (v,index) => {
        if (language == 'ch') {
            $('.article-list').eq(index).show()
            $('.article-list').eq(index).find('.title-ch').show()
            $('.article-list').eq(index).find('.title-lo').hide()
            $('.article-list').eq(index).find('.detail-ch').show()
            $('.article-list').eq(index).find('.detail-lo').hide()
        } else {
            $('.article-list').eq(index).show()
            $('.article-list').eq(index).find('.title-ch').hide()
            $('.article-list').eq(index).find('.title-lo').show()
            $('.article-list').eq(index).find('.detail-ch').hide()
            $('.article-list').eq(index).find('.detail-lo').show()
        }
    }
    onStart = () => {
        $('.audio-icon').show()
        $('.lan-change').show()
        $('.like-num').show()
        if (window.__clientW < window.__clientH) {
            // 竖屏
            let tm = new TweenMax.to(this.app.stage.position, 1.5, { y: -this.scenes[0].width * this.scale });
            tm.play();
            this.initTouch(true, "y");
        } else {
            // 横屏
            let tm = new TweenMax.to(this.app.stage.position, 1.5, { x: -this.scenes[0].width * this.scale });
            tm.play();
            this.initTouch(false, "x");
        }
        this.playBgm();
    };
    computeNumber = (a, type, b) => {
        /**
         * 获取数字小数点的长度
         * @param {number} n 数字
         */
        function getDecimalLength(n) {
            const decimal = n.toString().split(".")[1];
            return decimal ? decimal.length : 0;
        }
        /** 倍率 */ //Math.pow(x,y)  x 的 y 次幂的值
        const power = Math.pow(10, Math.max(getDecimalLength(a), getDecimalLength(b)));
        let result = 0;

        // 防止出现 `33.33333*100000 = 3333332.9999999995` && `33.33*10 = 333.29999999999995` 这类情况做的暴力处理
        a = Math.round(a * power);
        b = Math.round(b * power); // round() 方法可把一个数字舍入为最接近的整数

        switch (type) {
            case "+":
                result = (a + b) / power;
                break;
            case "-":
                result = (a - b) / power;
                break;
            case "*":
                result = (a * b) / (power * power);
                break;
            case "/":
                result = a  / b ;
                break;
        }

        return {
            /** 计算结果 */
            result,
            /**
             * 继续计算
             * @param {"+"|"-"|"*"|"/"} nextType 继续计算方式
             * @param {number} nextValue 继续计算的值
             */
            next(nextType, nextValue) {
                return computeNumber(result, nextType, nextValue);
            }
        };
    }
    changeLanguage = () => {
        language == 'ch' ? language = 'lo' : language = 'ch';
        $('.lan-change').css('background-image','url(./images/lan_btn_'+language+'.png)')
        $('.like-num').css('background-image','url(./images/like_'+language+'.png)')
        this.updateText()
        if (seekProgress > 0.05) {
            console.log('initNav')
            $('.nav-list').empty()
            this.initNav()
        }
        pixieArr.forEach(el => {
            el.gotoAndStop(language =='ch'?0:1)
        })
    }
}

export default new MainRail().initR();

$('.close-btn').on('click', function () {
    $(this).parents('.article-list').eq(0).hide()
})
$('.lan-change').on('click', function () {
    new MainRail().changeLanguage()
})
$('.audio-icon').on('click', function () {
    let bgm = document.getElementById('bg')
    if (bgm.paused) {
        bgm.play()
        $(this).addClass('audio-icon-rotate')
    } else {
        bgm.pause()
        $(this).removeClass('audio-icon-rotate')
    }
})
