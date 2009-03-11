/**
 * SingleScroller acts like a mechanical differential. One scrollbar controls
 * the scrolling of several scrollable areas and allows for independent (and 
 * hopefully sensible) distribution of movement.
 *
 * This widget currently supports only 2 scrollable columns (1 fixed-width and 
 * 1 liquid-width) but this is an artificial limitation. This could be 
 * refactored to support any number of fixed-width or liquid-width columns.
 *
 * <pre>
 *  Element         Function                  Class-name
 * ----------------------------------------------------------------------------
 * - div            Main container            scroll-dist-main
 *     - div*       Header bar                scroll-dist-header
 *     - div        Fixed-width column        scroll-dist-list
 *         - div                              scroll-dist-content
 *         - ...
 *     - div        Liquid-width column       scroll-dist-viewer
 *         - div                              scroll-dist-content
 *         - ...
 *     - div        Scrollbar                 scroll-dist-bar
 *         - div                              scroll-dist-content
 * </pre>
 * [Any element with a * is optional]
 *
 * @fileoverview One scrollbar to rule them all
 * @author http://massless.org/ (Chris Wetherell)
 */

/**
 * Distributes a single scrolling action for the page to various elements
 * and allows for node-level differences in scrolling stops and starts.
 * 
 * @constructor
 */
$.SingleScroller = function() {
  this.initStylesheet_();
  this.initNodes_();
  this.runDemo_();

  // Set scroll wheel events for the header since the visible scrollbar
  // includes this area, too.
  if (this.headerNode_) {
    this.setWheelScroll_(this.headerNode_);
  }

  // This will initialize a global scroll bar that can be used to control all
  // of the scrollable columns.
  this.initScrollbar_();

  // Set scroll wheel events to the main node
  this.setWheelScroll_(this.mainNode_);

  // This widget currently has only two scrollable columns. A fixed-width 
  // column and a liquid-width column which holds varying kinds of content.
  // TODO(cw): Number of columns and type of columns shouldn't be fixed. Be
  // more flexible here.
  this.initScrollableColumn_(this.fixedNode_);
  this.initScrollableColumn_(this.liquidNode_);

  this.initGlobalEvents_();

  this.adjustDimensions();
};

/**
 * @type {number}
 * @private
 */
$.SingleScroller.prototype.prevScrollTop_ = 0;

/**
 * @type {number}
 * @private
 */
$.SingleScroller.prototype.prevFrameScrollTop_ = 0;

/**
 * @type {number}
 * @private
 */
$.SingleScroller.prototype.headerNodeTop_ = 0;

/**
 * Appends a stylesheet to the HEAD element and looks for the file location in
 * the SINGLESCROLLER_CSS_PATH global variable. Will use "scroller.css" if this
 * is not found.
 */
$.SingleScroller.prototype.initStylesheet_ = function() {
  var stylesheetPath = SINGLESCROLLER_CSS_PATH || "scroller.css";
  $('<link rel="stylesheet" href="' + stylesheetPath + '" type="text/css" />')
    .appendTo($('head'));
}

/**
 * Detects and stores all of the needed elements to enable single scrolling.
 */
$.SingleScroller.prototype.initNodes_ = function() {
  /**
   * @type {Element}
   * @private
   */
  this.mainNode_ = $('div.scroll-dist-main').get(0);
  /**
   * This is a column with a fixed width.
   * 
   * @type {Element}
   * @private
   */
  this.fixedNode_ = $('div.scroll-dist-list').get(0);
  /**
   * This is column whose width can vary as the page resizes.
   *
   * @type {Element}
   * @private
   */
  this.liquidNode_ = $('div.scroll-dist-viewer').get(0);
  /**
   * @type {Element}
   * @private
   */
  this.liquidContentNode_ = this.getContentNode_(this.liquidNode_);
  /**
   * @type {Element}
   * @private
   */
  this.scrollbarNode_ = $('div.scroll-dist-bar').get(0);
  /**
   * @type {Element}
   * @private
   */
  this.headerNode_ = $('div.scroll-dist-header').get(0);

  // Start all scrollable areas at zero.
  this.fixedNode_.scrollTop = this.liquidNode_.scrollTop = 0;

  // Using an IFRAME for the liquid column?
  this.hasFrameAsLiquidColumn_ = this.liquidContentNode_.nodeName == 'IFRAME';

  if (this.hasFrameAsLiquidColumn_) {
    /**
     * @type {Element}
     * @private
     */
    this.frameLiquidNode_ = this.getFrameFromNode_(this.liquidContentNode_);
  }
};

/** 
 * @param {Element} containerNode Parent of content node.
 * @return {Element} 
 * @private
 */
$.SingleScroller.prototype.getContentNode_ = function(containerNode) {
  return $('.scroll-dist-content', containerNode).get(0);
};

/**
 * Initialize a scrollable column by adjusting its dimensions around any 
 * fixed nodes. Each column must contain a child "content" node whose height is 
 * modified to accommodate space-taking elements like headers. The content 
 * node is used because its parent node is fixed to the size of the viewport.
 *
 * @param {Element} node An element whose parent is a scrollable column and
 *     that will be used to contain the content for that column
 * @private
 */
$.SingleScroller.prototype.initScrollableColumn_ = function(node) {
  var isLiquidFrameNode = this.hasFrameAsLiquidColumn_ && node == this.liquidNode_;

  var contentNode = (isLiquidFrameNode)
    ? this.frameLiquidNode_.document.body
    : this.getContentNode_(node);

  // Increase the height of the content node to accommodate a header.
  if (this.headerNode_) {
    this.appendPaddingBottom_(contentNode, this.headerNode_.offsetHeight);
  }

  // Prevent auto-scrolling browsers from scrolling columns before the
  // main scrollbar scrolls.
  var self = this;
  node.onscroll = function() {
    if (!self.hasStartedScrolling_) {
      node.scrollTop = 0;
    }
  };
};

/**
 * Initializes all global event handlers.
 * @private
 */
$.SingleScroller.prototype.initGlobalEvents_ = function() {
  // Capture keys that normally would scroll the page when pressed and
  // instead direct them to use the single scroller.
  var keyEventHandler = ($.browser.safari)
                        ? function(f) {$(document).keydown(f);}
                        : function(f) {$(document).keypress(f);};
  var self = this;
  keyEventHandler(function (e) {
      var key = String.fromCharCode(e.which);
      if (key == ' ') {
        self.scrollElement_(self.scrollbarNode_,
                            e.shiftKey,
                            self.getPagingDistance_());
        e.preventDefault();
        return false;
      }

      // The arrow keys.
      var arrowKey = ($.browser.mozilla) ? self.keydown_ : e.which;
      if (arrowKey == 40 || arrowKey == 38) {
        self.scrollElement_(self.scrollbarNode_,
                            arrowKey == 38,
                            30);
        e.preventDefault();
        return false;
      }

      return true;
    });

  // Some browsers can catch auto-repeats of the arrow keys ONLY during
  // the keydown and keyup events.
  if ($.browser.mozilla) {
    $(document).keydown(function (e) {
        if (e.which > 0) self.keydown_ = e.which;
        return true;
      });
    $(document).keyup(function (e) {
        self.keydown_ = null;
        return true;
      });
  }
}

/**
 * @private
 */
$.SingleScroller.prototype.appendPaddingBottom_ = function(node, delta) {
  node.style.paddingBottom = 
      (parseInt(node.style.paddingBottom + 0, 10) + delta) + 'px';
};

/**
 * @private
 */
$.SingleScroller.prototype.getLiquidNodeHeight_ = function() {
  if (this.hasFrameAsLiquidColumn_) {
    return this.frameLiquidNode_.document.body.scrollHeight;
  }

  return this.liquidNode_.scrollHeight;
};

/**
 * Initialize the global scroll bar by binding its scrolling events to all of 
 * the scrollable columns and by adjusting its width to match the native
 * scrollbar width.
 * 
 * @private
 */
$.SingleScroller.prototype.initScrollbar_ = function() {
  // Briefly set some node to scroll and measure the scrollbar width. This will
  // vary across operating systems.
  $(this.mainNode_).css('overflow', 'scroll');
  this.osScrollbarWidth_ = (this.mainNode_.offsetWidth
                          - this.mainNode_.clientWidth);
  $(this.mainNode_).css('overflow', 'hidden');

  // A race condition may exist where the styles for the scrollbar node
  // have not yet have applied. Apply required styling here, just in case.
  $(this.scrollbarNode_).css("position", "absolute");

  // Set the scrollbar to the OS width. Make it slightly wider than the OS
  // scrollbar or in some cases (e.g. Windows) the scrollbar won't scroll.
  this.scrollbarNode_.style.width = (this.osScrollbarWidth_ + 1) + 'px';

  // Set the scrollbar to synchronously scroll other elements.
  this.scrollbarNode_.onscroll = $.bind(this.scroll_, this);
};

/**
 * Adjust the scrollbar's content to match the longest column.
 * @private
 */
$.SingleScroller.prototype.adjustScrollbarDimensions_ = function() {
  // Determine what's longer, the fixed or the liquid element.
  var fixedNodeHeight = this.getContentNode_(this.fixedNode_).scrollHeight;
  var liquidNodeHeight = this.getLiquidNodeHeight_();

  var greatestHeight = (fixedNodeHeight >= liquidNodeHeight) 
                       ? fixedNodeHeight 
                       : liquidNodeHeight;

  // Set the scroll bar height to equal the height of the longest column.
  this.getContentNode_(this.scrollbarNode_).style.height 
      = greatestHeight + 'px';
};

/**
 * @param {boolean} isScrollingUp True if decrementing, false if incrementing.
 * @param {number} scrollInterval How much to change the current value.
 * @private
 */
$.SingleScroller.prototype.scrollAll_ = 
    function(isScrollingUp, scrollInterval) {
  var scrollColumnsFunc =
      $.bind(this.scrollColumns_, this, isScrollingUp, scrollInterval);

  if (this.headerNode_) {
    // Move header the distance the scrollbar moved and store the new state.
    this.headerNodeTop_ = this.setStyleTop_(this.headerNode_, 
        'top', isScrollingUp, scrollInterval, this.headerNodeTop_);

    if (isScrollingUp || this.isHeaderOffscreen_()) {
      scrollColumnsFunc();
    }

    // Change the padding of the main node to match the distance the scrollbar 
    // moved and store the new state.
    this.mainNodePaddingTop_ = this.setStyleTop_(this.mainNode_, 
        'padding-top', isScrollingUp, scrollInterval, this.mainNodePaddingTop_);
  } else {
    scrollColumnsFunc();
  }
};

/**
 * @param {boolean} isScrollingUp True if decrementing, false if incrementing.
 * @param {number} scrollInterval How much to change the current value.
 * @private
 */
$.SingleScroller.prototype.scrollColumns_ = 
    function(isScrollingUp, scrollInterval) {
  this.scrollElement_(this.fixedNode_, isScrollingUp, scrollInterval);

  if (this.hasFrameAsLiquidColumn_) {
    this.scrollFrame_(this.liquidContentNode_, isScrollingUp, scrollInterval);
  } else {
    this.scrollElement_(this.liquidNode_, isScrollingUp, scrollInterval);
  }
};

/**
 * The main scroll action. This distributes scrolling to allow for some 
 * elements to be fixed and others to scroll in a staggered fashion. Currently,
 * this means that the header can scroll off and the columns can scroll
 * independently based on content length.
 * 
 * @private
 */
$.SingleScroller.prototype.scroll_ = function() {
  this.hasStartedScrolling_ = true;

  var barNode = this.scrollbarNode_;

  var isScrollingUp = (this.prevScrollTop_ > barNode.scrollTop);

  // Calculate the distance that the scroll bar moved.
  var scrollInterval = (isScrollingUp)
                       ? this.prevScrollTop_ - barNode.scrollTop
                       : barNode.scrollTop - this.prevScrollTop_;

  this.prevScrollTop_ = barNode.scrollTop;

  // Scroll the columns but in some cases do some other calculations e.g.
  // move a header element off or on screen, if present.
  this.scrollAll_(isScrollingUp, scrollInterval);
};

/**
 * @private
 */
$.SingleScroller.prototype.getFrameFromNode_ = function(node) {  
  return window[node.getAttribute('name')];
};

/**
 * The amount of distance in pixels that scroll wheel actions should take.
 * 
 * @type {number}
 */
$.SingleScroller.WHEEL_INTERVAL = 70;

/**
 * Sets the given node to be scrolled synchronously with the global scrollbar 
 * element whenever the mouse wheel moves.
 *
 * @param {Element} node 
 * @private
 */
$.SingleScroller.prototype.setWheelScroll_ = function(node) {  
  var self = this;

  $(node).wheel(function(event, delta) {
    self.scrollElement_(
      self.scrollbarNode_, 
      (delta > 0), 
      $.SingleScroller.WHEEL_INTERVAL);
  });
};

/**
 * Adjust the columns so they fit underneath the header.
 * 
 * @private
 */
$.SingleScroller.prototype.adjustHeaderDimensions_ = function() {
    this.mainNodePaddingTop_ = 
        this.setStyleTop_(this.mainNode_, 'padding-top', false, 0, 
            this.headerNode_.offsetHeight + this.headerNode_.offsetTop);
};

/**
 * Increments or decrements the value for the given style.
 *
 * @param {Element} el
 * @param {string} propertyName Either 'top', 'margin-top', or 'padding-top'.
 * @param {boolean} isAdd True if incrementing, false if decrementing.
 * @param {number} delta How much to change the current value, in pixels.
 * @param {number} currentValue The current property value, in pixels.
 *
 * @return {number} The absolute value of the change, this may include 
 *     negative numbers even though the property can't be set to negative
 *     numbers e.g. padding.
 * @private
 */
$.SingleScroller.prototype.setStyleTop_ = function(el,
                                                   propertyName, 
                                                   isAdd, 
                                                   delta, 
                                                   currentValue) {
  var absoluteValue = currentValue;

  absoluteValue += (isAdd) ? (+delta) : (-delta);

  // The 'padding-top' property can't be set to a negative value.
  var newValue = 
      (propertyName == 'padding-top') 
          ? ((absoluteValue < 0) ? 0 : absoluteValue)
          : absoluteValue;

  $(el).css(propertyName, newValue + 'px');

  return absoluteValue;
};

/**
 * Increments or decrements the scroll distance for the given element.
 *
 * @param {Element} el
 * @param {boolean} isScrollingUp True if decrementing, false if incrementing.
 * @param {number} scrollInterval How much to change the current value.
 * @private
 */
$.SingleScroller.prototype.scrollElement_ = function(el, 
                                                     isScrollingUp, 
                                                     scrollInterval) {
  el.scrollTop += (isScrollingUp) ? (-scrollInterval) : (+scrollInterval);
};

/**
 * Increments or decrements the scroll distance for the given frame.
 *
 * @param {Element} el
 * @param {boolean} isScrollingUp True if decrementing, false if incrementing.
 * @param {number} scrollInterval How much to change the current value.
 * @private
 */
$.SingleScroller.prototype.scrollFrame_ = function(el, 
                                                   isScrollingUp, 
                                                   scrollInterval) {
  var newValue = this.prevFrameScrollTop_ +
    ((isScrollingUp) ? (-scrollInterval) : (+scrollInterval));

  if (newValue < 0) {
    newValue = 0;
  }

  this.frameLiquidNode_.scrollTo(0, newValue);

  this.prevFrameScrollTop_ = newValue;
};

/**
 * @return {boolean}
 * @private
 */
$.SingleScroller.prototype.isHeaderOffscreen_ = function() {
  return (Math.abs(this.headerNodeTop_) > this.headerNode_.offsetHeight);
}

/**
 * Calculates the distance needed to move when traversing the scroller by
 * page length.
 *
 * @return {number}
 * @private
 */
$.SingleScroller.prototype.getPagingDistance_ = function() {
  var pageHeight = $.getViewportSize().height - 20;
  if (this.headerNode_ && !this.isHeaderOffscreen_()) {
    pageHeight -= this.headerNode_.offsetHeight;
  }
  return pageHeight;
}

/**
 * Resize the scroll distributor to the shape of the browser's viewport.
 */
$.SingleScroller.prototype.adjustDimensions = function() {
  this.adjustScrollbarDimensions_();

  if (this.headerNode_) {
    this.adjustHeaderDimensions_();
  }

  // Get the viewport height
  var h = $.getViewportSize().height;

  // Adjust all the nodes that need to fit to the exact height of the 
  // viewport.
  this.mainNode_.style.height = 
  this.fixedNode_.style.height = 
  this.scrollbarNode_.style.height =
  this.liquidNode_.style.height =
      h + 'px';

  // Get the difference in width between all fixed nodes and the main node.
  var lw = this.mainNode_.offsetWidth
           - this.fixedNode_.offsetWidth
           - parseInt($(this.liquidContentNode_).css("padding-left"), 10)
           - parseInt($(this.liquidContentNode_).css("padding-right"), 10);

  var isContentLargerThanViewport = this.liquidContentNode_.offsetHeight > h
                   || this.getContentNode_(this.fixedNode_).offsetHeight > h ;
  if (isContentLargerThanViewport) {
    lw -= this.scrollbarNode_.offsetWidth;
  }

  // Adjust the width of the liquid node content so it remains on screen.
  this.liquidContentNode_.style.width =  lw + 'px';

  // Treat IFRAME-based liquid columns differently since they always
  // need to grow to the viewport size.
  if (this.hasFrameAsLiquidColumn_) {
    this.liquidContentNode_.style.height = h + 'px';
  }
};

/**
 * @param {boolean} enableDebugging If true, then a floating box should appear 
 *     that will show debug statements called via the log_() method.
 */
$.SingleScroller.prototype.setDebug = function(enableDebugging) {
  this.debug_ = enableDebugging;

  $('#scroll-dist-log').get(0).style.display
      = (this.debug_) ? 'block' : 'none';
};

/**
 * For debugging purposes.
 *
 * @param {string} s A debug message.
 * @private
 */
$.SingleScroller.prototype.log_ = function(s) {
  if (!this.debug_) {
    return;
  }

  var entryNode = $('div').text(s);

  var logNode = $('#scroll-dist-log').get(0);
  logNode.insertBefore(entryNode.get(0), logNode.firstChild);
};

/**
 * Populates the scroller with demonstration text and links.
 * 
 * @private
 */
$.SingleScroller.prototype.runDemo_ = function() {
  if (typeof(SINGLESCROLLER_RUN_DEMO) == 'undefined' ||
      !SINGLESCROLLER_RUN_DEMO) {
    return;
  }
  
  function getNewColumnNode(columnNode) {
    var contentElement = $('.scroll-dist-content', columnNode);
    var newContentElement = $('<div></div>');
    contentElement.append(newContentElement);
    return newContentElement;
  }
  var listContentNode = getNewColumnNode($('.scroll-dist-list'));
  var viewerContentNode = getNewColumnNode($('.scroll-dist-viewer'));
  
  var self = this;  
  var adHtml = '<h3>Your<br />ad<br />here.</h3>';
  /**
   * Populate each column.
   * @param {number} numList Number of links to put in the navigation
   * @param {number} numViewer Number of paragraphs to add to the viewer
   */
  function populate(numList, numViewer) {
    listContentNode.html("");
    for (var i = 1; i <= numList; i++) {
      listContentNode.append($('<div><a href="">Sample Item</a> '
                               + i + '</div>'));
    }
    if (numList > 0) {
      listContentNode.append($(adHtml));
    }
    
    viewerContentNode.html("");
    for (var j = 1; j <= numViewer; j++) {
      viewerContentNode.append($('<p>Morbi convallis, lacus eget porta dapibus,'
          + 'magna neque ultrices orci, nec rutrum magna sem vitae dolor. '
          + 'Mauris suscipit lorem varius justo. Nunc nec mi in lorem '
          + 'imperdiet volutpat. Quisque dignissim, tortor non pharetra '
          + 'pharetra, erat erat varius lorem, sed mattis ipsum massa vel '
          + 'odio. Integer facilisis. Fusce sollicitudin iaculis enim. Nulla '
          + 'felis pede, imperdiet eget, eleifend non, vehicula interdum, '
          + 'nibh. Aenean orci risus, venenatis a, dignissim a, facilisis sit '
          + 'amet, sem. Suspendisse eleifend orci vitae lectus dapibus '
          + 'vestibulum. Nunc metus. Maecenas molestie suscipit mauris. Etiam '
          + 'suscipit malesuada elit. Duis erat nibh, feugiat ac, pulvinar '
          + 'vitae, ornare in, magna.</p>'));
    }
    if (numViewer > 0) {
      viewerContentNode.append($(adHtml));
    }
  }
  
  var demoLinksContainer = $('<div></div>');
  $(this.getContentNode_(this.headerNode_)).append(demoLinksContainer);
  
  function appendDemoLink(linkLabel, onClickFunc) {
    $('<span class="link">' + linkLabel + '</span>').css("margin-right", "1em")
      .click(function() {onClickFunc();  self.adjustDimensions();})
      .appendTo(demoLinksContainer);
  }
  
  $('<span>(Click then scroll down to test.) &raquo; </span>')
      .css("margin-right", "1em")
      .appendTo(demoLinksContainer);
  
  function start() {
    populate(4, 18);
  }
  
  appendDemoLink("<b>Long</b> and Short", function() {populate(150, 1);});
  
  appendDemoLink("Short and <b>Long</b>", start);
  
  appendDemoLink("Short and Short", function() {populate(0, 0);});
  
  appendDemoLink("No Javascript",
     function() {window.location.href = '?without-scroller-files=1';});

  start();
};

// Init
window.onload = function() {
  jQuery.extend({ 
    singleScrollerInstance: (new $.SingleScroller())
  });

  $(window).resize(function() {
    if ($.singleScrollerInstance) {
      $.singleScrollerInstance.adjustDimensions();
    }
  });
};