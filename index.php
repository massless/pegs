<?
/**
 * @return {string}
 */
function get_unique_url_for_file($filename) {
  return (file_exists($filename)) 
            ? $filename . '?' . filemtime($filename)
            : $filename;
}
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <title>Pegs (Demo of scroll distribution for a single page.)</title>
  <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
  
  <style type="text/css">
    /*
      Example styling. Be aware that "Pegs" (a.k.a. SingleScroller) will
      append a <link> to the <head> element pointing to a file named "scroller.css".
    ------------------------------------------------------------------------ */
    html, body {
      margin: 0;
      font-family: arial, sans-serif;
      font-size: small;
      color: #555;
    }
    
    a, a:visited, .link {
      color: #369;
      text-decoration: underline;
      cursor: pointer;
    }
    
    .scroll-dist-list, .scroll-dist-viewer {
      border-top: 4px solid;
    }
    
    .scroll-dist-list {
      position: absolute;
      left: 0;
      background-color: #ccc;
      border-right: 1px solid;
    }
    
    /* These values control the width of the left column. Should be equal. */
    .scroll-dist-list { width: 150px; }
    .scroll-dist-viewer { margin-left: 150px; }
    
    .scroll-dist-content {
      padding: 1em;
    }
    
    .standout {
      font-weight: bold;
      font-size: 130%;
      color: #000;
    }
  </style>
<?
  if (!$_GET["without-scroller-files"]) {
?>
  <script type="text/javascript">
    // The SingleScroller object looks for this global var to determine
    // whether to populate scroll elements with dummy text and test links.
    var SINGLESCROLLER_RUN_DEMO = true;
    
    // The SingleScroller object looks for this global var to determine
    // the location of the base CSS for scrolling. Uses "scroller.css" if not
    // given.
    var SINGLESCROLLER_CSS_PATH = "<?=get_unique_url_for_file("scroller.css")?>";
  </script>
<?
  $DEV = false;
  if ($DEV) {
?>
  <script type="text/javascript" src="<?=get_unique_url_for_file("jquery-1.2.6.pack.js")?>"></script>
  <script type="text/javascript" src="<?=get_unique_url_for_file("jquery-extensions.js")?>"></script>
  <script type="text/javascript" src="<?=get_unique_url_for_file("scroller-0.9.js")?>"></script>
<?
  } else {
?>
  <script type="text/javascript" src="<?=get_unique_url_for_file("jquery-1.2.6.pack.js")?>"></script>
  <script type="text/javascript" src="<?=get_unique_url_for_file("scroller-0.9.mini.js")?>"></script>
<?
  }
?>
<?
  }
?>
</head>
<body>
  <!-- Start main -->
  <div class="scroll-dist-main">
    
      <!-- Start header -->
      <div class="scroll-dist-header">
        <div class="scroll-dist-content">
          <h1>Pegs. Differential scrolling.</h1>
          <h3>One scrollbar. Several scrollable areas. Independent (and
          hopefully sensible) distribution of movement.</h3>
<?
          if ($_GET["without-scroller-files"]) {
            ?><div style="font-size: 90%; padding-top: 0.1em;"><a href="<?=rtrim(dirname($_SERVER['PHP_SELF']), '/\\')?>">&lsaquo; Back to scroller demo</a></div><?
}?>
        </div>
      </div>
      <!-- End header -->
      
      <!-- Start list -->
      <div class="scroll-dist-list">
          <div class="scroll-dist-content"><h3>Navigation.</h3>
<?          if ($_GET["without-scroller-files"]) {
            for ($i = 0; $i < 80; $i++) { 
              ?>
              <div><a href="">Sample Item</a> <?=$i+1?></div>
              <? 
            }
          }
?>
          </div>
      </div>
      <!-- End list -->
      
      <!-- Start viewer -->
      <div class="scroll-dist-viewer">
          <div class="scroll-dist-content"><h3>Content area.</h3>
          <p class="standout">
            An experiment in keeping information on the page.
            <br /><small>Columns are <em>"pegged"</em> in order to keep their
            content on screen while scrolling.</small></p>
          <p class="standout">
            <small>Pros:
              <ul>
                <li>Having site navigation remain on-screen may increase the chance that people will visit interior pages.</li>
                <li>Ads in columns remain on-screen longer which could increase visibility.</li>
              </ul>
            </small>
            <small>Cons:
              <ul>
                <li>More interface logic to maintain.</li>
                <li>Scroll behavior may be confusing.</li>
                <li>May be difficult to make the behavior smooth and polished.</li>
              </ul>
            </small>
          </p>
          <p>
            <small>About this: No frames. Scrolling is managed via Javascript.
            Uses JQuery as a base. Design should work like as a normal page
            if the javascript is removed. This is just proof-of-concept and is not
            recommended for use in production yet.</small>
          </p>
<?          if ($_GET["without-scroller-files"]) {
            for ($i = 0; $i < 8; $i++) { 
              ?><p>Morbi convallis, lacus eget porta dapibus, magna neque ultrices orci, nec rutrum magna sem vitae dolor. Mauris suscipit lorem varius justo. Nunc nec mi in lorem imperdiet volutpat. Quisque dignissim, tortor non pharetra pharetra, erat erat varius lorem, sed mattis ipsum massa vel odio. Integer facilisis. Fusce sollicitudin iaculis enim. Nulla felis pede, imperdiet eget, eleifend non, vehicula interdum, nibh. Aenean orci risus, venenatis a, dignissim a, facilisis sit amet, sem. Suspendisse eleifend orci vitae lectus dapibus vestibulum. Nunc metus. Maecenas molestie suscipit mauris. Etiam suscipit malesuada elit. Duis erat nibh, feugiat ac, pulvinar vitae, ornare in, magna.</p>
              <? 
            }
          }
?>
          </div>
      </div>
      <!-- End viewer -->
  </div>
  <!-- End main -->
    
  <div class="scroll-dist-bar"><div class="scroll-dist-content"></div></div>
  <div id="scroll-dist-log"></div>
</body>
</html>