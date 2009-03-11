
/**
 * bind()
 *
 * Binds functions and scope such that a new function is created.
 * e.g. bind(f, o, a1, a2, a3) == f.apply(o, [a1, a2, a3])
 * 
 * Optimized to prevent repeated calls from creating additional objects.
 * @return {Function}
 */
(function($) {
  $.bind = function(fn, self /* args */) {
    self = fn.boundSelf_ || self;
    fn = fn.boundFn_ || fn;
    
    var args = (arguments.length > 2)
               ? Array.prototype.slice.call(arguments, 2)
               : [];
  
    var boundArgs = fn.boundArgs_;
    if (boundArgs) {
      args.unshift.apply(args, boundArgs);
    }
    
    var newfn = function() {
      // Include any new arguments added later to callee.
      var newfnArgs = Array.prototype.slice.call(arguments);
      newfnArgs.unshift.apply(newfnArgs, args);
      return fn.apply(self, newfnArgs);
    };
    
    newfn.boundArgs_ = args;
    newfn.boundSelf_ = self;
    newfn.boundFn_ = fn;
    return newfn;
  };
})(jQuery);

/**
 * getViewportSize()
 *
 * A basic port of goog.dom.getViewportSize from Google Doctype.
 * See: http://code.google.com/p/doctype/source/browse/trunk/goog/dom/dom.js
 *
 * @param {Window} opt_window Optional window element to test.
 */
(function($) { 
  $.getViewportSize = function(opt_window) {
    var win = opt_window || window;
    var doc = win.document;
  
    if ($.browser.safari && parseInt($.browser.version, 10) < 500) {
      if (typeof win.innerHeight == 'undefined') {
        win = window;
      }
      var innerHeight = win.innerHeight;
      var scrollHeight = win.document.documentElement.scrollHeight;
  
      if (win == win.top) {
        if (scrollHeight < innerHeight) {
          innerHeight -= 15; // Scrollbars are 15px wide on Mac
        }
      }
      return {'width': Number(win.innerWidth), 'height': Number(innerHeight)};
    }
    
    // TODO(cw): May need to port goog.dom.getDomHelper or similar for
    // times when a document node isn't being supplied for whatever reason.
    var el =
        $.getCompatMode(doc) == 'CSS1Compat' &&
            (!$.browser.opera ||
                $.browser.opera && $.browser.version >= 9.50) ?
                    doc.documentElement : doc.body;
  
    return {'width': Number(el.clientWidth), 'height': Number(el.clientHeight)};
  };
})(jQuery);
 
/**
 * getCompatMode()
 *
 * Returns the compatMode of the document. A basic port of
 * goog.dom.DomHelper.getCompatMode from Google Doctype.
 * See: http://code.google.com/p/doctype/source/browse/trunk/goog/dom/dom.js
 *
 * @param {Object} doc A document object.
 * @return {string} The result is either CSS1Compat or BackCompat.
 */
(function($) { 
  $.getCompatMode = function(doc) {
    if (doc.compatMode) {
      return doc.compatMode;
    }
    if ($.browser.safari) {
      // Create a dummy div and set the width without a unit. This is invalid 
      // in CSS but quirks mode allows it.
      var el = $('div').css({'position':'absolute','height':0,'width':1}).get(0);
      var val = el.style.width == '1px' ? 'BackCompat' : 'CSS1Compat';
      // There is no way to change the compatMode after it has been set so we
      // set it here so that the next call is faster
      doc.compatMode = val;
      return doc.compatMode;
    }
    return 'BackCompat';
  };
})(jQuery);


(function($){ // secure $ jQuery alias
/*****************************************************************************/
// jquery.event.wheel.js - rev 1 
// Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
// Liscensed under the MIT License (MIT-LICENSE.txt)
// http://www.opensource.org/licenses/mit-license.php
// Created: 2008-07-01 | Updated: 2008-07-14
/*****************************************************************************/

// jquery method
$.fn.wheel = function( fn ){
  return this[ fn ? "bind" : "trigger" ]( "wheel", fn );
};

// special event config
$.event.special.wheel = {
  setup: function(){
    $.event.add( this, wheelEvents, wheelHandler, {} );
    },
  teardown: function(){
    $.event.remove( this, wheelEvents, wheelHandler );
    }
};

// events to bind ( browser sniffed... )
var wheelEvents = !$.browser.mozilla ? "mousewheel" : // IE, opera, safari
  "DOMMouseScroll"+( $.browser.version<"1.9" ? " mousemove" : "" ); // firefox

// shared event handler
function wheelHandler( event ){ 
  switch ( event.type ){
    case "mousemove": // FF2 has incorrect event positions
      return $.extend( event.data, { // store the correct properties
        clientX: event.clientX, clientY: event.clientY,
        pageX: event.pageX, pageY: event.pageY
        });      
    case "DOMMouseScroll": // firefox
      $.extend( event, event.data ); // fix event properties in FF2
      event.delta = -event.detail/3; // normalize delta
      break;
    case "mousewheel": // IE, opera, safari
      event.delta = event.wheelDelta/120; // normalize delta
      if ( $.browser.opera ) {
        event.delta *= -1; // normalize delta
      }
      break;
    }
  event.type = "wheel"; // hijack the event  
  return $.event.handle.call( this, event, event.delta );
}
  
/*****************************************************************************/
})(jQuery);

