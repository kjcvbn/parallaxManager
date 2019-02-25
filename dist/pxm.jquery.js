/**
 * @version 1.0(2015. 08. 13) 최초 생성 
 */
(function(window, $){
	//requestAnimationFrame && cancelAnimationFrame cross B Function !!
	(function() {
	    var lastTime = 0;
	    if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	}());
	//requestAnimationFrame && cancelAnimationFrame cross B Function !!
	
	/**
	  * @class
	  * @name ParallaxManager
	  * 
	  * 
	  * @param {Object} [opt] 설정 객제
	  * @param {Object} [opt.data] 모션 프레임 설정값
	  * @param {Number} [opt.delay] 모션 딜레이값
	  * @param {Boolean} [opt.autoStart] 자동시작여부
	  * 
	  */
	var ParallaxManager = function(opt) {
		this.scrollTop = 1;
		this.scrollNum = 1;
		this.beforeScrollTop = -1;
		this.options = (opt != undefined) ? opt : {};
		this.delay = this.options.delay || 0.05;
		this.autoStart = (typeof this.options.autoStart == "boolean") ? this.options.autoStart : true;
		this.$container = $('body');
		this.$html = $('html');
		this.items;
		this.play = false;
		this.requestAnimation = 0;
		this.beforeTime = new Date();
		if(this.dataCache()){
			this.bindEvent();
			if(this.autoStart) this.start();	
		};
	};
	
	$.extend(ParallaxManager.prototype, {
		constructor: ParallaxManager,
		getScrollTop: function(flag){
			if(flag) this.scrollNum += Math.floor((this.scrollTop - this.scrollNum)*this.delay);
			return this.scrollNum;
		},
		/**
		 * 데이터 가공하여 캐시한다
		 * 
		 * @private
		 * @function
		 */
		dataCache: function(){
			this.items = $('[data-pxm]');
			if(this.items.length == 0 ) {
				return false;
			};
			var arr = [], obj = {};
			this.items.each(function(){
				var data = $(this).data("pxm").split("/"),
					parent = $(this).parents('.pxm');
				$(this).data({'pxm': data, 'top': parent[0] ? parent : $(this).offset().top, 'isHalf': $(this).attr('data-pxm-half') ? true : false});

			});
			
			return true;
		},
		/**
		 * 이벤트 처리
		 * 
		 * @private
		 * @function
		 */
		bindEvent: function(){
			var $win = $(window),
				self = this,
				interval = 0;
			// $win.off('scroll.pxm').on('scroll.pxm', function(e){
			// 	//e.preventDefault();
			// 	//if(!self.play) self.start();
			// 	//self.scrollTop = $win.scrollTop();
			// });
			// $win.on("resize", function(){
			// 	$win.trigger("scroll");
			// })
		},
		/**
		 * requestAnimationFrame 시작
		 * 
		 * @private
		 * @function
		 */
		start: function(){
			var self = this;
			self.play = true;
			var a = $('[data-pxm]'), b= 0, $win = $(window);

			(function run(){
				b += 1;
                	self.scrollTop = $win.scrollTop();
                    self.getScrollTop(true);
                    self.animate();
				self.requestAnimation = requestAnimationFrame(run);
			})();
		},
		/**
		 * requestAnimationFrame 정지
		 * 
		 * @private
		 * @function
		 */
		stop: function(){
			this.play = false;
			cancelAnimationFrame(this.requestAnimation);
		},
		/**
		 * 모션을 적용한다
		 * 
		 * @private
		 * @function
		 */
		animate: function(){
			var self = this,
				scroll = this.getScrollTop();
				
			if(scroll === this.beforeScrollTop) return;

			this.beforeScrollTop = scroll;
			this.items.each(function(){
				self.setFrame($(this));
			});
		},
		/**
		 * 계산된 css값을 적용한다
		 *  
		 * @private
		 * @function
		 */
		setFrame: function(obj){
			obj.css(this.getStyle(obj))
		},
		/**
		 *
		 * value값을 계산하여 리턴한다
		 * 
		 * @private
		 * @function
		 * 
		 * @param {String} [name] css 이름
		 * @param {Object} [currentFrame] 현제 프레임
		 * @param {Object} [prevFrame] 이전 프레임
		 * 
		 * @return {String}
		 *  
		 */
		getValue: function(data, pos, top){
			var k = pos.split("~"),
				h = window.innerHeight,
				min = Number(k[0]),
				max = Number(k[1]),
				full = h*(!data.data('isHalf') ? 2 : 1),
				cv = full + (top+full > document.body.offsetHeight ? Math.max(top+full- document.body.offsetHeight ,0)*-1 : Math.min(top-h, 0)),
				per = Math.abs(Math.max(Math.min(Math.max(top-h, 0)-this.getScrollTop(),0), -cv)/cv);


			return (max-min)*per + min;
			
		},
		/**
		 * 현 위치에 맞는 css 값을 전달한다
		 *  
		 * @private
		 * @function
		 *
		 * @return {Object}
		 * 
		 */
		getStyle: function(data){
			var self = this;
			function convertStyle(css){
				var obj = {},transform="",flag=self.isCss("transitionDuration"), flag2 = self.isCss("transform");
				
				if(css.x !== undefined || css.y!== undefined || css.z !== undefined){
					if(flag) transform = 'translate3d(' + (css.x||0) + 'px, ' + (css.y||0) + 'px, ' + (css.z||0) + 'px)';
					else if(flag2) transform = 'translate(' + (css.x||0) + 'px, ' + (css.y||0) + 'px)';
					else {
						if(css.x !== undefined) obj["margin-left"] = css.x;
						if(css.y !== undefined) obj["margin-top"] = css.y;
					}
				} 
				if(css.r !== undefined ) transform += ' rotate(' + css.r + 'deg)';
				if(css.s !== undefined ) transform+= ' scale(' + css.s + ',' + css.s +')';
				
				if(css.o !== undefined) obj["opacity"] = css.o;

				delete css.x;
				delete css.y;
				delete css.z;
				delete css.r;
				delete css.s;
				delete css.o;
				
				css = $.extend({
					'-webkit-transform': transform,  /* Chrome, Safari 3.1+ */
			        '-moz-transform': transform,  /* Firefox 3.5-15 */
			        '-ms-transform': transform,  /* IE 9 */
			        '-o-transform': transform,  /* Opera 10.50-12.00 */
			        'transform': transform  /* Firefox 16+, IE 10+, Opera 12.10+ */
				}, $.extend(css,obj));
				
				
				return css;
			};
			
			var d = data.data("pxm"), dd = {};
			for(var i = 0; i < d.length; i++){
				var obj = d[i].split(":"),
					top = data.data('top');
				dd[obj[0]] = this.getValue(data, obj[1],typeof top === 'object' ? top.offset().top : top);
			}

			return convertStyle(dd);
			
		},
        isCss: function(attr){
			var os = ["-o-","-ms-","-moz-","-webkit-",""],
				div = document.createElement("DIV"),
				i = os.length,
				flag = false;
			while(i--){
				flag = (div.style[os[i]+attr] === undefined)?false:true;
				if(flag) break;
			};

			return flag;

		}
	});
    if(typeof mvm === 'function' && mvm.core){
        mvm('module.pxm', function(){
            return ParallaxManager;
        });
    }

	window.pxm = new ParallaxManager();
})(window, jQuery);
