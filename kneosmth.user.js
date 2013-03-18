// Generated by CoffeeScript 1.4.0

/*
// ==UserScript==
// @author         kneo
// @version        0.2.2
// @name           kneosmth
// @namespace      https://github.com/iambus
// @description    It's my style
// @include        http://www.newsmth.net/bbspst.php?*
// @include        http://www.newsmth.net/bbsguestleft.html
// @include        http://www.newsmth.net/bbsleft.php
// @include        http://www.newsmth.net/bbsqry.php?userid=*
// @include        http://www.newsmth.net/bbscon.php?*
// ==/UserScript==
*/


(function() {
  var a, ajax, article, ascii_to_html, br, encode_form, gm_ajax, herfs, img, insert_post_button, is_nav, is_posting, is_reading, is_user, overwrite_hotkey, parent, post, raw, raw_to_html, redirect_ok, user, _i, _len;

  is_posting = function() {
    return /^http:\/\/(www\.)newsmth\.net\/bbspst\.php\?/.test(window.location);
  };

  encode_form = function(form) {
    var k, v;
    return ((function() {
      var _results;
      _results = [];
      for (k in form) {
        v = form[k];
        _results.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
      return _results;
    })()).join('&');
  };

  ajax = function(url, form, callback) {
    var xhr;
    xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function() {
      return callback(xhr);
    };
    xhr.open("Post", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    return xhr.send(encode_form(form));
  };

  gm_ajax = function(url, form, callback) {
    return GM_xmlhttpRequest({
      method: form ? 'POST' : 'GET',
      url: url,
      data: encode_form(form),
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest"
      },
      onload: callback
    });
  };

  redirect_ok = function(board, board_cn, id, is_reply) {
    var op;
    op = is_reply ? '回复文章' : '发表文章';
    document.getElementsByTagName('BODY')[0].innerHTML = "<div class=\"nav smaller\"><a href=\"mainpage.html\">水木社区</a><span id=\"idExp\"></span> → <a href=\"bbsdoc.php?board=" + board + "\">" + board_cn + "</a> → " + op + "</div>\n操作成功: 发文成功！<br/>本页面将在3秒后自动返回版面文章列表<div class=\"medium\"><ul><b>您可以选择以下操作：</b>\n<li><a href='mainpage.html'>返回首页</a></li><li><a href='bbsdoc.php?board=" + board + "'>返回 " + board_cn + "</a></li></ul>\n<br /><br />";
    return setTimeout((function() {
      return window.location.href = "bbsdoc.php?board=" + board;
    }), 3000);
  };

  post = function() {
    var board, reid, signature, text, title, _ref, _ref1;
    board = window.location.toString().match(/board=([\w.]+)/)[1];
    reid = (_ref = (_ref1 = window.location.toString().match(/reid=(\d+)/)) != null ? _ref1[1] : void 0) != null ? _ref : '0';
    title = document.getElementsByName('title')[0].value;
    text = document.getElementsByName('text')[0].value;
    signature = document.getElementsByName('signature')[0].value;
    gm_ajax("/nForum/article/" + board + "/ajax_post.json", {
      id: reid,
      subject: title,
      content: text,
      signature: signature
    }, function(xhr) {
      var board_cn, id, result;
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        alert('error: ' + xhr.status);
        return;
      }
      result = JSON.parse(xhr.responseText);
      if (result.ajax_st === 1) {
        board_cn = result.list[0].text.substring(3);
        board = result.list[0].url.replace(/.*\//, '');
        id = result.list[1].url.replace(/.*\//, '');
        return redirect_ok(board, board_cn, id, reid !== '0');
      } else {
        return alert(xhr.responseText);
      }
    });
  };

  overwrite_hotkey = function() {
    var textarea;
    textarea = document.getElementsByName('text')[0];
    textarea.onkeydown = null;
    return textarea.addEventListener('keydown', function(event) {
      var key, _ref;
      key = (_ref = event.keyCode) != null ? _ref : event.charCode;
      if ((key === 87 && event.ctrlKey) || (key === 13 && event.ctrlKey)) {
        event.preventDefault();
        event.stopPropagation();
        post();
        return false;
      }
      return true;
    });
  };

  insert_post_button = function() {
    var button, check, check_label, old_button, opers, post_oper, verify_oper;
    opers = document.getElementsByClassName('oper');
    if (opers.length !== 2) {
      return;
    }
    verify_oper = opers[0], post_oper = opers[1];
    verify_oper.hidden = true;
    old_button = post_oper.children[0];
    old_button.value = '发表';
    old_button.title = '使用原来的方式发表文章（请手动输入验证码）';
    button = document.createElement('input');
    button.type = 'button';
    button.value = '直接发表';
    button.title = '不必输入验证码';
    post_oper.insertBefore(button, old_button);
    button.addEventListener('click', post);
    check = document.createElement('input');
    check.type = 'checkbox';
    post_oper.insertBefore(check, old_button);
    check.addEventListener('click', function(event) {
      verify_oper.hidden = !event.target.checked;
    });
    check_label = document.createTextNode('显示验证码');
    return post_oper.insertBefore(check_label, old_button);
  };

  if (is_posting()) {
    insert_post_button();
    overwrite_hotkey();
  }

  is_nav = function() {
    var _ref;
    return (_ref = window.location.toString()) === 'http://www.newsmth.net/bbsguestleft.html' || _ref === 'http://www.newsmth.net/bbsleft.php';
  };

  if (is_nav()) {
    herfs = document.getElementsByTagName('a');
    for (_i = 0, _len = herfs.length; _i < _len; _i++) {
      a = herfs[_i];
      if (a.getAttribute('href') === 'http://www.51smth.com') {
        parent = a.parentNode;
        img = a.previousSibling;
        br = a.nextElementSibling;
        parent.removeChild(img);
        parent.removeChild(a);
        parent.removeChild(br);
        break;
      }
    }
  }

  is_user = function() {
    return window.location.toString().match(/^http:\/\/www\.newsmth\.net\/bbsqry\.php\?userid=(\w+)$/);
  };

  if (is_user()) {
    user = is_user()[1];
    gm_ajax("/nForum/user/query/" + user + ".json", null, function(xhr) {
      var location, nform_info, result, text;
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        alert('error: ' + xhr.status);
        return;
      }
      result = JSON.parse(xhr.responseText);
      if (result.ajax_st === 1) {
        nform_info = "用户积分：" + result.score_user + " 论坛等级：" + result.life + "(" + result.lifelevel + ")";
        text = document.createTextNode(nform_info);
        location = document.getElementsByClassName('c36')[0];
        location.parentNode.insertBefore(text, location);
        return location.parentNode.insertBefore(document.createElement('br'), location);
      } else {
        return alert(xhr.responseText);
      }
    });
  }

  is_reading = function() {
    return /^http:\/\/(www\.)newsmth\.net\/bbscon\.php\?/.test(window.location);
  };

  ascii_to_html = function(ascii) {
    var b, backgrounds, bb, close_tags, colors, css, effects, f, ff, foregrounds, html, i, m, match, open_tag, re, state, tag, tags;
    html = [];
    tags = [];
    state = ['0', '30', '40'];
    effects = [];
    i = 0;
    foregrounds = {
      '1;30': 'color: #747874',
      '1;31': 'color: #e80000',
      '1;32': 'color: #009600',
      '1;33': 'color: #919600',
      '1;34': 'color: #0000e8',
      '1;35': 'color: #e800e8',
      '1;36': 'color: #009691',
      '1;37': 'color: #000000',
      '0;30': 'color: #e8f0e8',
      '0;31': 'color: #e87874',
      '0;32': 'color: #00b400',
      '0;33': 'color: #aeb400',
      '0;34': 'color: #7478e8',
      '0;35': 'color: #e878e8',
      '0;36': 'color: #00b4ae',
      '0;37': 'color: #303230'
    };
    backgrounds = {
      '40': 'background-color: #f7f7f7',
      '41': 'background-color: #e8c8c1',
      '42': 'background-color: #c1f0c1',
      '43': 'background-color: #e8f0b8',
      '44': 'background-color: #c1c8e8',
      '45': 'background-color: #e8c8e8',
      '46': 'background-color: #b8f0e8',
      '47': 'background-color: #c1c8c1'
    };
    colors = {
      '4': 'text-decoration: underline',
      '5': 'text-decoration: blink'
    };
    for (f in foregrounds) {
      ff = foregrounds[f];
      colors[f + ';40'] = ff;
    }
    for (b in backgrounds) {
      bb = backgrounds[b];
      colors['0;30;' + b] = bb;
    }
    for (f in foregrounds) {
      ff = foregrounds[f];
      for (b in backgrounds) {
        bb = backgrounds[b];
        colors[f + ';' + b] = ff + '; ' + bb;
      }
    }
    css = function(code) {
      var n, style, x, _j, _len1, _ref;
      _ref = code.split(/;/);
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        x = _ref[_j];
        if (!/^\d+$/.test(x)) {
          return;
        }
        n = parseInt(x);
        if ((0 <= n && n <= 1)) {
          state[0] = n;
          if (state === 0) {
            effects = [];
          }
        } else if ((30 <= n && n <= 37)) {
          state[1] = n;
        } else if ((40 <= n && n <= 47)) {
          state[2] = n;
        } else if (n === 4) {
          effects.push(colors['4']);
        } else if (n === 5) {
          effects.push(colors['5']);
        } else {
          return;
        }
      }
      style = colors[state.join(';')];
      if (style) {
        if (effects) {
          return style + ';' + effects.join(';');
        } else {
          return style;
        }
      }
    };
    open_tag = function(tag) {
      var color, span;
      color = css(tag);
      if (color) {
        span = "<span style=\"" + color + "\">";
        html.push(span);
        return tags.push(tag);
      } else {
        return console.log('ignoring ascii tag', tag);
      }
    };
    close_tags = function() {
      html.push(Array(tags.length + 1).join('</span>'));
      tags = [];
      state = ['0', '30', '40'];
      return effects = [];
    };
    re = /\r[\[\d;]+[a-z]/gi;
    while (match = re.exec(ascii)) {
      html.push(ascii.substr(i, match.index - i));
      tag = match[0];
      i = match.index + tag.length;
      m = tag[tag.length - 1];
      if (m === 'm') {
        tag = tag.substr(2, tag.length - 3);
        if (tag) {
          open_tag(tag);
        } else {
          close_tags();
        }
      } else {
        console.log('ignoring ascii tag', tag);
      }
    }
    html.push(ascii.substr(i));
    close_tags();
    return html.join('');
  };

  raw_to_html = function(s) {
    var urlmatch;
    s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = ascii_to_html(s);
    s = s.replace(/\x20\x20/g, " &nbsp;").replace(/\n /g, "\n&nbsp;");
    s = s.replace(/\n(: [^\n]*)/g, "<br/><span class=\"f006\">$1</span>");
    s = s.replace(/\n/g, "<br/>");
    urlmatch = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@#:;\+\-])+)", "ig");
    s = s.replace(urlmatch, "<a target=\"_blank\" href=\"$1\">$1</a>");
    return s;
  };

  if (is_reading()) {
    raw = unsafeWindow.strPrint;
    article = document.getElementsByClassName('article')[0];
    if (article) {
      article.innerHTML = raw_to_html(raw);
    } else {
      unsafeWindow.strArticle = raw_to_html(raw);
    }
  }

}).call(this);
