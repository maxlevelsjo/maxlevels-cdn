/**
 * WP CDN Sync Pro - Frontend DOM Scanner
 * This script runs on the live homepage to find all assets.
 */
(function ($) {
  // Function to extract URLs from style attributes (for background-images)
  const getUrlsFromCss = (text) => {
    const urls = [];
    const urlRegex = /url\((['"]?)(.*?)\1\)/gi;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[2]);
    }
    return urls;
  };

  // Give the page a moment to finish rendering any JS-based assets
  $(window).on("load", function () {
    const foundUrls = new Set();

    // 1. Get assets from standard tags (link, script, img, video)
    document
      .querySelectorAll(
        'link[href], script[src], img[src], source[src], video[src], img[data-src]'
      )
      .forEach((el) => {
        let url = el.href || el.src || el.dataset.src;
        if (url) {
          foundUrls.add(url);
        }
      });

    // 2. Get assets from inline styles on all elements
    document.querySelectorAll('*[style]').forEach((el) => {
      const urls = getUrlsFromCss(el.style.backgroundImage);
      urls.forEach((url) => foundUrls.add(url));
    });

    // 3. Send the results back to WordPress via AJAX
    $.ajax({
      url: wpcspScanner.ajaxurl,
      method: 'POST',
      data: {
        action: 'wpcsp_save_scan_results',
        _ajax_nonce: wpcspScanner.nonce,
        urls: [...foundUrls], // Convert Set to Array
        scan_session_id: wpcspScanner.scan_session_id,
      },
      success: function () {
        // Let the parent window know we are done, then close.
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage('wpcsp-scan-complete', '*');
        }
        window.close();
      },
      error: function () {
        // If it fails, just close. The parent will timeout.
        window.close();
      },
    });
  });
})(jQuery);