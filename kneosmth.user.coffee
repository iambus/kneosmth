###
// ==UserScript==
// @author         kneo
// @version        0.2.3
// @name           kneosmth
// @namespace      https://github.com/iambus
// @description    It's my style
// @include        http://www.newsmth.net/bbspst.php?*
// @include        http://www.newsmth.net/bbsguestleft.html
// @include        http://www.newsmth.net/bbsleft.php
// @include        http://www.newsmth.net/bbsqry.php?userid=*
// @include        http://www.newsmth.net/bbscon.php?*
// ==/UserScript==
###

##################################################
# remove verify code
##################################################

is_posting = -> /^http:\/\/(www\.)newsmth\.net\/bbspst\.php\?/.test window.location

encode_form = (form) ->
	(encodeURIComponent(k) + '=' + encodeURIComponent(v) for k, v of form).join('&')

ajax = (url, form, callback) ->
	xhr = new XMLHttpRequest
	xhr.onreadystatechange = ->
		callback xhr
	xhr.open "Post", url, true
	xhr.setRequestHeader "Content-type", "application/x-www-form-urlencoded"
	xhr.setRequestHeader "X-Requested-With", "XMLHttpRequest"
	xhr.send encode_form form

gm_ajax = (url, form, callback) ->
	GM_xmlhttpRequest
		method: if form then 'POST' else 'GET'
		url: url
		data: encode_form form
		headers:
			"Content-type": "application/x-www-form-urlencoded"
			"X-Requested-With":	"XMLHttpRequest"
		onload: callback

redirect_ok = (board, board_cn, id, is_reply) ->
	op = if is_reply then '回复文章' else '发表文章'
	document.getElementsByTagName('BODY')[0].innerHTML = """
	<div class="nav smaller"><a href="mainpage.html">水木社区</a><span id="idExp"></span> → <a href="bbsdoc.php?board=#{board}">#{board_cn}</a> → #{op}</div>
操作成功: 发文成功！<br/>本页面将在3秒后自动返回版面文章列表<div class="medium"><ul><b>您可以选择以下操作：</b>
<li><a href='mainpage.html'>返回首页</a></li><li><a href='bbsdoc.php?board=#{board}'>返回 #{board_cn}</a></li></ul>
<br /><br />"""
	setTimeout (-> window.location.href = "bbsdoc.php?board=#{board}"), 3000

post = ->
	board = window.location.toString().match(/board=([\w.]+)/)[1]
	reid = window.location.toString().match(/reid=(\d+)/)?[1] ? '0'
	title = document.getElementsByName('title')[0].value
	text = document.getElementsByName('text')[0].value
	signature = document.getElementsByName('signature')[0].value
	gm_ajax "/nForum/article/#{board}/ajax_post.json", id: reid, subject: title, content: text, signature: signature, (xhr) ->
		if xhr.readyState != 4
			return
		if xhr.status != 200
			alert 'error: ' + xhr.status
			return
		result = JSON.parse xhr.responseText
		if result.ajax_st == 1
			board_cn = result.list[0].text.substring 3
			board = result.list[0].url.replace /.*\//, ''
			id = result.list[1].url.replace /.*\//, ''
			redirect_ok board, board_cn, id, reid isnt '0'
		else
			alert xhr.responseText
	return

overwrite_hotkey = ->
	textarea = document.getElementsByName('text')[0]
	textarea.onkeydown = null
	textarea.addEventListener 'keydown', (event) ->
		key = event.keyCode ? event.charCode
		if (key == 87 && event.ctrlKey) || (key == 13 && event.ctrlKey)
			event.preventDefault()
			event.stopPropagation()
			post()
			return false
		return true

insert_post_button = ->
	opers = document.getElementsByClassName('oper')
	if opers.length != 2
		return
	[verify_oper, post_oper] = opers
	#verify_oper.parentNode.removeChild(verify_oper) # delete verify code
	verify_oper.hidden = true
	old_button = post_oper.children[0]
	old_button.value = '发表'
	old_button.title = '使用原来的方式发表文章（请手动输入验证码）'

	button = document.createElement 'input'
	button.type = 'button'
	button.value = '直接发表'
	button.title = '不必输入验证码'
	post_oper.insertBefore button, old_button
	button.addEventListener 'click', post

	check = document.createElement 'input'
	check.type = 'checkbox'
	post_oper.insertBefore check, old_button
	check.addEventListener 'click', (event) ->
		verify_oper.hidden = not event.target.checked
		return

	check_label = document.createTextNode('显示验证码')
	post_oper.insertBefore check_label, old_button


if is_posting()
	insert_post_button()
	overwrite_hotkey()


##################################################
# remove 51smth
##################################################

is_nav = -> window.location.toString() in ['http://www.newsmth.net/bbsguestleft.html', 'http://www.newsmth.net/bbsleft.php']

if is_nav()
	herfs = document.getElementsByTagName('a')
	for a in herfs
		if a.getAttribute('href') == 'http://www.51smth.com'
			parent = a.parentNode
			img = a.previousSibling
			br = a.nextElementSibling
			parent.removeChild(img)
			parent.removeChild(a)
			parent.removeChild(br)
			break

##################################################
# nforum user query
##################################################

is_user = -> window.location.toString().match /^http:\/\/www\.newsmth\.net\/bbsqry\.php\?userid=(\w+)$/

if is_user()
	user = is_user()[1]
	gm_ajax "/nForum/user/query/#{user}.json", null, (xhr) ->
		if xhr.readyState != 4
			return
		if xhr.status != 200
			alert 'error: ' + xhr.status
			return
		result = JSON.parse xhr.responseText
		if result.ajax_st == 1
			nform_info = "用户积分：#{result.score_user} 论坛等级：#{result.life}(#{result.lifelevel})"
			text = document.createTextNode(nform_info)
			location = document.getElementsByClassName('c36')[0]
			location.parentNode.insertBefore(text, location)
			location.parentNode.insertBefore(document.createElement('br'), location)
		else
			alert xhr.responseText

##################################################
# ASCII coloring
##################################################

is_reading = -> /^http:\/\/(www\.)newsmth\.net\/bbscon\.php\?/.test window.location

ascii_to_html = (ascii) ->
	#	return ascii.replace(/\r[\[\d;]+[a-z]/gi, "")

	i = 0
	html = []
	tags = []
	state = {}

	foregrounds =
		'1;30': 'color: #747874'
		'1;31': 'color: #e80000'
		'1;32': 'color: #009600'
		'1;33': 'color: #919600'
		'1;34': 'color: #0000e8'
		'1;35': 'color: #e800e8'
		'1;36': 'color: #009691'
		'1;37': 'color: #000000'
		'0;30': 'color: #e8f0e8'
		'0;31': 'color: #e87874'
		'0;32': 'color: #00b400'
		'0;33': 'color: #aeb400'
		'0;34': 'color: #7478e8'
		'0;35': 'color: #e878e8'
		'0;36': 'color: #00b4ae'
		'0;37': 'color: #303230'

	backgrounds =
		'40': 'background-color: #f7f7f7'
		'41': 'background-color: #e8c8c1'
		'42': 'background-color: #c1f0c1'
		'43': 'background-color: #e8f0b8'
		'44': 'background-color: #c1c8e8'
		'45': 'background-color: #e8c8e8'
		'46': 'background-color: #b8f0e8'
		'47': 'background-color: #c1c8c1'

	colors =
		'4': 'text-decoration: underline'
		'5': 'text-decoration: blink'

	css_of_state = (state) ->
		styles = []
		if state.background
			styles.push backgrounds[state.background.toString()]
		if state.foreground or state.bold or state.background
			styles.push foregrounds["#{state.bold ? '0'};#{state.foreground ? '30'}"]
		if state.underline
			styles.push colors['4']
		if state.blink
			styles.push colors['5']
		return styles.join '; '

	css = (code) ->
		for x in code.split /;/
			unless /^\d+$/.test x
				return
			n = parseInt(x)
			if n == 0
				state.bold = null
				state.underline = null
				state.blink = null
			else if n == 1
				state.bold = 1
			else if n == 30
				state.foreground = null
			else if 31 <= n <= 37
				state.foreground = n
			else if n == 40
				state.background = null
			else if 41 <= n <= 47
				state.background = n
			else if n == 4
				state.underline = true
			else if n == 5
				state.blink = true
			else
				return
		style = css_of_state state
		fix_tags()
		return style

	fix_tags = () ->
		while html[html.length - 1]?.match /^<span/
			html.pop()
			tags.pop()
		html.push Array(tags.length+1).join '</span>'
		tags = []

	open_tag = (tag) ->
		style = css tag
		if style
			span = """<span style="#{style}">"""
			html.push span
			tags.push tag
		else if not style?
			console.log 'ignoring ascii tag', tag

	close_tags = ->
		html.push Array(tags.length+1).join '</span>'
		tags = []
		state = {}

	re = /\r[\[\d;]+[a-z]/gi
	while match = re.exec ascii
		html.push ascii.substr(i, match.index - i)

		tag = match[0]
		i = match.index + tag.length

		m = tag[tag.length - 1]
		if m == 'm'
			tag = tag.substr 2, tag.length - 3

			if tag
				open_tag(tag)
			else
				close_tags()
		else
			console.log 'ignoring ascii tag', tag

	html.push ascii.substr(i)
	close_tags()

	return html.join ''

raw_to_html = (s) ->
	s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
	s = s.replace(/\x20/g, "&#160;")
	s = ascii_to_html s
#	s = s.replace(/\x20\x20/g, " &nbsp;").replace(/\n /g, "\n&nbsp;")
	s = s.replace(/\n(:&#160;[^\n]*)/g, "<br/><span class=\"f006\">$1</span>")
	s = s.replace(/\n/g, "<br/>")
	urlmatch = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@#:;\+\-])+)", "ig")
	s = s.replace(urlmatch, "<a target=\"_blank\" href=\"$1\">$1</a>")
	return s


if is_reading()
	raw = unsafeWindow.strPrint
	article = document.getElementsByClassName('article')[0]
	if article
		article.innerHTML = raw_to_html(raw)
	else
		unsafeWindow.strArticle = raw_to_html(raw)

