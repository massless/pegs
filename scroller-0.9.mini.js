(function(a){a.bind=function(d,b){b=d.boundSelf_||b;d=d.boundFn_||d;var c=(arguments.length>2)?Array.prototype.slice.call(arguments,2):[];var f=d.boundArgs_;if(f){c.unshift.apply(c,f)}var e=function(){var g=Array.prototype.slice.call(arguments);g.unshift.apply(g,c);return d.apply(b,g)};e.boundArgs_=c;e.boundSelf_=b;e.boundFn_=d;return e}})(jQuery);(function(a){a.getViewportSize=function(b){var g=b||window;var f=g.document;if(a.browser.safari&&parseInt(a.browser.version,10)<500){if(typeof g.innerHeight=="undefined"){g=window}var e=g.innerHeight;var d=g.document.documentElement.scrollHeight;if(g==g.top){if(d<e){e-=15}}return{width:Number(g.innerWidth),height:Number(e)}}var c=a.getCompatMode(f)=="CSS1Compat"&&(!a.browser.opera||a.browser.opera&&a.browser.version>=9.5)?f.documentElement:f.body;return{width:Number(c.clientWidth),height:Number(c.clientHeight)}}})(jQuery);(function(a){a.getCompatMode=function(c){if(c.compatMode){return c.compatMode}if(a.browser.safari){var b=a("div").css({position:"absolute",height:0,width:1}).get(0);var d=b.style.width=="1px"?"BackCompat":"CSS1Compat";c.compatMode=d;return c.compatMode}return"BackCompat"}})(jQuery);(function(a){a.fn.wheel=function(d){return this[d?"bind":"trigger"]("wheel",d)};a.event.special.wheel={setup:function(){a.event.add(this,c,b,{})},teardown:function(){a.event.remove(this,c,b)}};var c=!a.browser.mozilla?"mousewheel":"DOMMouseScroll"+(a.browser.version<"1.9"?" mousemove":"");function b(d){switch(d.type){case"mousemove":return a.extend(d.data,{clientX:d.clientX,clientY:d.clientY,pageX:d.pageX,pageY:d.pageY});case"DOMMouseScroll":a.extend(d,d.data);d.delta=-d.detail/3;break;case"mousewheel":d.delta=d.wheelDelta/120;if(a.browser.opera){d.delta*=-1}break}d.type="wheel";return a.event.handle.call(this,d,d.delta)}})(jQuery);$.SingleScroller=function(){this.initStylesheet_();this.initNodes_();this.runDemo_();if(this.headerNode_){this.setWheelScroll_(this.headerNode_)}this.initScrollableColumn_(this.fixedNode_);this.initScrollableColumn_(this.liquidNode_);this.initScrollbar_();var a=this;$(document).keypress(function(c){var b=String.fromCharCode(c.which);if(b==" "){a.scrollElement_(a.scrollbarNode_,c.shiftKey,a.getPagingDistance_());c.preventDefault();return false}return true});this.adjustDimensions()};$.SingleScroller.prototype.prevScrollTop_=0;$.SingleScroller.prototype.prevFrameScrollTop_=0;$.SingleScroller.prototype.headerNodeTop_=0;$.SingleScroller.prototype.initStylesheet_=function(){var a=SINGLESCROLLER_CSS_PATH||"scroller.css";$('<link rel="stylesheet" href="'+a+'" type="text/css" />').appendTo($("head"))};$.SingleScroller.prototype.initNodes_=function(){this.mainNode_=$("div.scroll-dist-main").get(0);this.fixedNode_=$("div.scroll-dist-list").get(0);this.liquidNode_=$("div.scroll-dist-viewer").get(0);this.liquidContentNode_=this.getContentNode_(this.liquidNode_);this.scrollbarNode_=$("div.scroll-dist-bar").get(0);this.headerNode_=$("div.scroll-dist-header").get(0);this.controlsNode_=$("div.scroll-dist-controls").get(0);this.navigationNode_=$("div.scroll-dist-navigation").get(0);this.fixedNode_.scrollTop=this.liquidNode_.scrollTop=0;this.hasFrameAsLiquidColumn_=this.liquidContentNode_.nodeName=="IFRAME";if(this.hasFrameAsLiquidColumn_){this.frameLiquidNode_=this.getFrameFromNode_(this.liquidContentNode_)}};$.SingleScroller.prototype.getContentNode_=function(a){return $(".scroll-dist-content",a).get(0)};$.SingleScroller.prototype.initScrollableColumn_=function(d){var b=this.hasFrameAsLiquidColumn_&&d==this.liquidNode_;var a=(b)?this.frameLiquidNode_.document.body:this.getContentNode_(d);if(this.headerNode_){this.appendPaddingBottom_(a,this.headerNode_.offsetHeight)}if(this.navigationNode_){this.appendPaddingBottom_(a,this.navigationNode_.offsetHeight)}if(this.controlsNode_&&b){this.appendPaddingBottom_(a,this.controlsNode_.offsetHeight)}this.setWheelScroll_(d);var c=this;d.onscroll=function(){if(!c.hasStartedScrolling_){d.scrollTop=0}}};$.SingleScroller.prototype.appendPaddingBottom_=function(a,b){a.style.paddingBottom=(parseInt(a.style.paddingBottom+0,10)+b)+"px"};$.SingleScroller.prototype.getLiquidNodeHeight_=function(){if(this.hasFrameAsLiquidColumn_){return this.frameLiquidNode_.document.body.scrollHeight}return this.liquidNode_.scrollHeight};$.SingleScroller.prototype.initScrollbar_=function(){$(this.mainNode_).css("overflow","scroll");this.osScrollbarWidth_=(this.mainNode_.offsetWidth-this.mainNode_.clientWidth);$(this.mainNode_).css("overflow","hidden");this.scrollbarNode_.style.width=(this.osScrollbarWidth_+1)+"px";this.scrollbarNode_.onscroll=$.bind(this.scroll_,this)};$.SingleScroller.prototype.adjustScrollbarDimensions_=function(){var c=this.getContentNode_(this.fixedNode_).scrollHeight;var b=this.getLiquidNodeHeight_();var a=(c>=b)?c:b;this.getContentNode_(this.scrollbarNode_).style.height=a+"px"};$.SingleScroller.prototype.scrollAll_=function(a,b){var c=$.bind(this.scrollColumns_,this,a,b);if(this.headerNode_){this.headerNodeTop_=this.setStyleTop_(this.headerNode_,"top",a,b,this.headerNodeTop_);if(a||this.isHeaderOffscreen_()){c()}this.mainNodePaddingTop_=this.setStyleTop_(this.mainNode_,"padding-top",a,b,this.mainNodePaddingTop_)}else{c()}};$.SingleScroller.prototype.scrollColumns_=function(a,b){this.scrollElement_(this.fixedNode_,a,b);if(this.hasFrameAsLiquidColumn_){this.scrollFrame_(this.liquidContentNode_,a,b)}else{this.scrollElement_(this.liquidNode_,a,b)}};$.SingleScroller.prototype.scroll_=function(){this.hasStartedScrolling_=true;var c=this.scrollbarNode_;var a=(this.prevScrollTop_>c.scrollTop);var b=(a)?this.prevScrollTop_-c.scrollTop:c.scrollTop-this.prevScrollTop_;this.prevScrollTop_=c.scrollTop;this.scrollAll_(a,b)};$.SingleScroller.prototype.getFrameFromNode_=function(a){return window[a.getAttribute("name")]};$.SingleScroller.WHEEL_INTERVAL=70;$.SingleScroller.prototype.setWheelScroll_=function(b){var a=this;$(b).wheel(function(c,d){a.scrollElement_(a.scrollbarNode_,(d>0),$.SingleScroller.WHEEL_INTERVAL)})};$.SingleScroller.prototype.adjustHeaderDimensions_=function(){this.mainNodePaddingTop_=this.setStyleTop_(this.mainNode_,"padding-top",false,0,this.headerNode_.offsetHeight+this.headerNode_.offsetTop)};$.SingleScroller.prototype.setStyleTop_=function(e,a,c,g,d){var b=d;b+=(c)?(+g):(-g);var f=(a=="padding-top")?((b<0)?0:b):b;$(e).css(a,f+"px");return b};$.SingleScroller.prototype.scrollElement_=function(c,a,b){c.scrollTop+=(a)?(-b):(+b)};$.SingleScroller.prototype.scrollFrame_=function(c,a,b){var d=this.prevFrameScrollTop_+((a)?(-b):(+b));if(d<0){d=0}this.frameLiquidNode_.scrollTo(0,d);this.prevFrameScrollTop_=d};$.SingleScroller.prototype.isHeaderOffscreen_=function(){return(Math.abs(this.headerNodeTop_)>this.headerNode_.offsetHeight)};$.SingleScroller.prototype.getPagingDistance_=function(){var a=$.getViewportSize().height-40;if(this.headerNode_&&!this.isHeaderOffscreen_()){a-=this.headerNode_.offsetHeight}return a};$.SingleScroller.prototype.adjustDimensions=function(){this.adjustScrollbarDimensions_();if(this.headerNode_){this.adjustHeaderDimensions_()}var d=$.getViewportSize().height;var c=(this.mainNode_.offsetWidth-this.fixedNode_.offsetWidth-this.scrollbarNode_.offsetWidth);if(!this.widthFixForNotMsie_&&(!$.browser.msie)){c+=(this.scrollbarNode_.offsetWidth-1);this.widthFixForNotMsie_=true}if(this.getContentNode_(this.scrollbarNode_).offsetHeight<=$.getViewportSize().height){c+=this.scrollbarNode_.offsetWidth;this.scrollbarNode_.style.visibility="hidden"}else{this.scrollbarNode_.style.visibility="visible"}this.liquidNode_.style.width=c+"px";this.mainNode_.style.height=this.fixedNode_.style.height=this.scrollbarNode_.style.height=this.liquidNode_.style.height=d+"px";var e=$(this.liquidContentNode_);var b=parseInt(e.css("padding-left"),10);var a=parseInt(e.css("padding-right"),10);this.liquidContentNode_.style.width=(c-(b+a))+"px";if(this.hasFrameAsLiquidColumn_){var f=d;f=(this.controlsNode_)?f-this.controlsNode_.offsetHeight:f;f=(this.navigationNode_)?f-this.navigationNode_.offsetHeight:f;this.liquidContentNode_.style.height=f+"px"}if(this.controlsNode_){this.controlsNode_.style.width=(c-b)+"px";this.controlsNode_.style.marginLeft=(b+(($.browser.msie)?this.fixedNode_.offsetWidth:0))+"px"}};$.SingleScroller.prototype.setDebug=function(a){this.debug_=a;$("#scroll-dist-log").get(0).style.display=(this.debug_)?"block":"none"};$.SingleScroller.prototype.log_=function(b){if(!this.debug_){return}var c=$("div").text(b);var a=$("#scroll-dist-log").get(0);a.insertBefore(c.get(0),a.firstChild)};$.SingleScroller.prototype.runDemo_=function(){if(typeof(SINGLESCROLLER_RUN_DEMO)=="undefined"||!SINGLESCROLLER_RUN_DEMO){return}function e(k){var l=$(".scroll-dist-content",k);var j=$("<div></div>");l.append(j);return j}var f=e($(".scroll-dist-list"));var g=e($(".scroll-dist-viewer"));var i=this;var h="<h3>Your<br />ad<br />here.</h3>";function d(m,n){f.html("");for(var l=1;l<=m;l++){f.append($('<div><a href="">Sample Item</a> '+l+"</div>"))}if(m>0){f.append($(h))}g.html("");for(var k=1;k<=n;k++){g.append($("<p>Morbi convallis, lacus eget porta dapibus,magna neque ultrices orci, nec rutrum magna sem vitae dolor. Mauris suscipit lorem varius justo. Nunc nec mi in lorem imperdiet volutpat. Quisque dignissim, tortor non pharetra pharetra, erat erat varius lorem, sed mattis ipsum massa vel odio. Integer facilisis. Fusce sollicitudin iaculis enim. Nulla felis pede, imperdiet eget, eleifend non, vehicula interdum, nibh. Aenean orci risus, venenatis a, dignissim a, facilisis sit amet, sem. Suspendisse eleifend orci vitae lectus dapibus vestibulum. Nunc metus. Maecenas molestie suscipit mauris. Etiam suscipit malesuada elit. Duis erat nibh, feugiat ac, pulvinar vitae, ornare in, magna.</p>"))}if(n>0){g.append($(h))}}var c=$("<div></div>");$(this.getContentNode_(this.headerNode_)).append(c);function b(j,k){$('<span class="link">'+j+"</span>").css("margin-right","1em").click(function(){k();i.adjustDimensions()}).appendTo(c)}$("<span>(Click then scroll down to test.) &raquo; </span>").css("margin-right","1em").appendTo(c);function a(){d(4,18)}b("<b>Long</b> and Short",function(){d(150,1)});b("Short and <b>Long</b>",a);b("Short and Short",function(){d(0,0)});b("No Javascript",function(){window.location.href="?without-scroller-files=1"});a()};$(function(){jQuery.extend({singleScrollerInstance:(new $.SingleScroller())});$(window).resize(function(){if($.singleScrollerInstance){$.singleScrollerInstance.adjustDimensions()}})});