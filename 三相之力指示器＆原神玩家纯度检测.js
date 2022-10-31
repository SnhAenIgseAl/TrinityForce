// ==UserScript==
// @name         三相之力指示器＆原神玩家纯度检测
// @namespace    www.cber.ltd
// @version      0.4.6
// @description  B站评论区自动标注原农舟玩家，依据是动态里是否有相关内容（基于原神指示器和原三相一些小的修改）及原神玩家纯度
// @author       xulaupuz & nightswan & SnhAenIgseAl
// @match        https://www.bilibili.com/video/*
// @match        https://t.bilibili.com/*
// @match        https://space.bilibili.com/*
// @match        https://www.bilibili.com/read/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @connect      bilibili.com
// @grant        GM_xmlhttpRequest
// @license MIT
// @run-at document-end
// @downloadURL none
// ==/UserScript==


(function() {
	'use strict';
	const unknown = new Set()

	//成分，可自定义
	const nor = new Set()
	const cj = new Set()
	const cj_yuan = new Set()
	const yuanyou = new Set()
	const zhouyou = new Set()
	const nongyou = new Set()
	const yuanzhou = new Set()
	const yuannong = new Set()
	const nongzhou = new Set()
	const sanxiang = new Set()
	const yuanpi = new Set()

	//关键词，可自定义
	const keyword_cj = "互动抽奖"
	const keyword_cj_yuan = "互动抽奖 #原神#"
	const keyword_yuan = "原神"
	const keyword_zhou = "明日方舟"
	const keyword_nong = "王者荣耀"
	const keyword_yuanpi = "猴"

	//贴上标签，可自定义
	const tag_nor = "【 普通丨纯良 】"
	const tag_cj = "【 动态抽奖 】"
	const tag_cj_yuan = "【 原神动态抽奖 】"
	const tag_yuan = "【 稀有丨我超，原！】"
	const tag_zhou = "【 稀有丨我超，舟！】"
	const tag_nong = "【 稀有丨我超，农！】"
	const tag_yuanzhou = "【 史诗丨原 & 粥！】"
	const tag_yuannong = "【 史诗丨原 & 农！】"
	const tag_nongzhou = "【 史诗丨农 & 舟！】"
	const tag_sanxiang = "【 传奇丨三相之力 】"
	//原神玩家纯度标签
	const tag_mxz_1 = "【 米学长丨认识Mihoyo 】"
	const tag_mxz_2 = "【 米学长丨腾讯打压 】"
	const tag_mxz_3 = "【 米学长丨黑暗降临 】"
	const tag_mxz_4 = "【 米学长丨国产之光 】"
	const tag_yuanpi = "【 结晶丨原批 】"

	//标签颜色，可自定义，默认为B站会员色
	const tag_nor_Inner = "<b style='color: #778899'>" + tag_nor + "</b>"
	const tag_cj_Inner = "<b style='color: #15c690'>" + tag_cj + "</b>"
	const tag_cj_yuan_Inner = "<b style='background-image: -webkit-linear-gradient(left, #4ce4cd, #2d97ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>" + tag_cj_yuan + "</b>"
	const tag_yuan_Inner = "<b style='color: #1B82E6'>" + tag_yuan + "</b>"
	const tag_zhou_Inner = "<b style='color: #1B82E6'>" + tag_zhou + "</b>"
	const tag_nong_Inner = "<b style='color: #1B82E6'>" + tag_nong + "</b>"
	const tag_yuanzhou_Inner = "<b style='color: #BA55D3'>" + tag_yuanzhou + "</b>"
	const tag_yuannong_Inner = "<b style='color: #BA55D3'>" + tag_yuannong + "</b>"
	const tag_nongzhou_Inner = "<b style='color: #BA55D3'>" + tag_nongzhou + "</b>"
	const tag_sanxiang_Inner = "<b style='background-image: -webkit-linear-gradient(left, #fdcf18, #fea418); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>" + tag_sanxiang + "</b>"

	const tag_mxz_1_Inner = "<b style='color: #15c690'>" + tag_mxz_1 + "</b>"
	const tag_mxz_2_Inner = "<b style='color: #1B82E6'>" + tag_mxz_2 + "</b>"
	const tag_mxz_3_Inner = "<b style='color: #BA55D3'>" + tag_mxz_3 + "</b>"
	const tag_mxz_4_Inner = "<b style='background-image: -webkit-linear-gradient(left, #ffb821, red); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>" + tag_mxz_4 + "</b>"
	const tag_yuanpi_Inner = "<b style='background-image: -webkit-linear-gradient(left, #2d97ff, #FF00FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>" + tag_yuanpi + "</b>"

	const blog = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?&host_mid='
	const is_new = document.getElementsByClassName('item goback')
		.length != 0 // 检测是不是新版

	const get_pid = (c) => {
		if (is_new) {
			return c.dataset['userId']
		} else {
			return c.children[0]['href'].replace(/[^\d]/g, "")
		}
	}

	const get_comment_list = () => {
		if (is_new) {
			let lst = new Set()
			for (let c of document.getElementsByClassName('user-name')) {
				lst.add(c)
			}
			for (let c of document.getElementsByClassName('sub-user-name')) {
				lst.add(c)
			}
			return lst
		} else {
			return document.getElementsByClassName('user')
		}
	}

	console.log(is_new)

	console.log("正常加载")
	let jiance = setInterval(() => {
		let commentlist = get_comment_list()
		if (commentlist.length != 0) {
			// clearInterval(jiance)
			let list = Array.from(commentlist)
			list.forEach(c => {
				let pid = get_pid(c)
				//旧版B站框架
				//原批标签
				if (yuanpi.has(pid)) {
					if (c.textContent.includes(tag_yuanpi) === false) {
						c.innerHTML += tag_yuanpi_Inner
						yuan_weight()
					}
					return
				}
				//三相标签
				else if (sanxiang.has(pid)) {
					if (c.textContent.includes(tag_sanxiang) === false) {
						c.innerHTML += tag_sanxiang_Inner
						yuan_weight()
					}
					return
				}
				//原农标签 
				else if (yuannong.has(pid)) {
					if (c.textContent.includes(tag_yuannong) === false) {
						c.innerHTML += tag_yuannong_Inner
						yuan_weight()
					}
					return
				}
				//农粥标签
				else if (nongzhou.has(pid)) {
					if (c.textContent.includes(tag_nongzhou) === false) {
						c.innerHTML += tag_nongzhou_Inner
					}
					return
				}
				//原粥标签
				else if (yuanzhou.has(pid)) {
					if (c.textContent.includes(tag_yuanzhou) === false) {
						c.innerHTML += tag_yuanzhou_Inner
						yuan_weight()
					}
					return
				}
				//原友标签
				else if (yuanyou.has(pid)) {
					if (c.textContent.includes(tag_yuan) === false) {
						c.innerHTML += tag_yuan_Inner
						yuan_weight()
					}
					return
				}
				//粥友标签
				else if (zhouyou.has(pid)) {
					if (c.textContent.includes(tag_zhou) === false) {
						c.innerHTML += tag_zhou_Inner
					}
					return
				}
				//农友标签
				else if (nongyou.has(pid)) {
					if (c.textContent.includes(tag_nong) === false) {
						c.innerHTML += tag_nong_Inner
					}
					return
				}
				//抽奖
				else if (cj.has(pid)) {
					if (c.textContent.includes(tag_cj) === false) {
						c.innerHTML += tag_cj_Inner
					}
					return
				}
				//纯良标签
				else if (nor.has(pid)) {
					if (c.textContent.includes(tag_nor) === false) {
						c.innerHTML += tag_nor_Inner
					}
					return
				}

				//判断给定字符串出现次数
				function getStrCount(scrstr, armstr) {
					var count = 0
					while (scrstr.indexOf(armstr) != -1) {
						scrstr = scrstr.replace(armstr, "")
						count++
					}
					return count
				}

				//原神玩家纯度检测
				function yuan_weight() {
					if (getStrCount(c, keyword_yuan) >= 0 && getStrCount(c, keyword_yuan) <= 5) {
						c.innerHTML += tag_mxz_1_Inner
					} else if (getStrCount(c, keyword_yuan) > 5 && getStrCount(c, keyword_yuan) <= 10) {
						c.innerHTML += tag_mxz_2_Inner
					} else if (getStrCount(c, keyword_yuan) > 10 && getStrCount(c, keyword_yuan) <= 20) {
						c.innerHTML += tag_mxz_3_Inner
					} else {
						c.innerHTML += tag_mxz_4_Inner
					}
					//原神抽奖标签
					if (cj_yuan.has(pid)) {
						if (c.textContent.includes(keyword_cj_yuan) === false) {
							c.innerHTML += tag_cj_yuan_Inner
						}
						return
					}
				}


				unknown.add(pid)
				//console.log(pid)
				let blogurl = blog + pid
				// let xhr = new XMLHttpRequest()
				GM_xmlhttpRequest({
					method: "get",
					url: blogurl,
					data: '',
					headers: {
						'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
					},
					onload: function(res) {
						if (res.status === 200) {
							//console.log('成功')
							let st = JSON.stringify(JSON.parse(res.response)
								.data)
							unknown.delete(pid)
							//新版B站跨国家
							//原批标签
							if (st.includes(keyword_yuanpi) && st.includes(keyword_yuan)) {
								c.innerHTML += tag_yuanpi_Inner
								yuanpi.add(pid)
								yuan_weight()
								return
							}
							//三相标签
							else if (st.includes(keyword_nong) && st.includes(keyword_yuan) && st.includes(keyword_zhou)) {
								c.innerHTML += tag_sanxiang_Inner
								sanxiang.add(pid)
								yuan_weight()
								return
							}
							//原粥标签
							else if (st.includes(keyword_yuan) && st.includes(keyword_zhou)) {
								c.innerHTML += tag_yuanzhou_Inner
								yuanzhou.add(pid)
								yuan_weight()
								return
							}
							//原农标签
							else if (st.includes(keyword_yuan) && st.includes(keyword_nong)) {
								c.innerHTML += tag_yuannong_Inner
								yuannong.add(pid)
								yuan_weight()
								return
							}
							//农粥标签
							else if (st.includes(keyword_zhou) && st.includes(keyword_nong)) {
								c.innerHTML += tag_nongzhou_Inner
								nongzhou.add(pid)
								return
							}
							//原友标签
							else if (st.includes(keyword_yuan)) {
								c.innerHTML += tag_yuan_Inner
								yuanyou.add(pid)
								yuan_weight()
								return
							}
							//粥友标签
							else if (st.includes(keyword_zhou)) {
								c.innerHTML += tag_zhou_Inner
								zhouyou.add(pid)
								return
							}
							//农友标签
							else if (st.includes(keyword_nong)) {
								c.innerHTML += tag_nong_Inner
								nongyou.add(pid)
								return
							} else if (st.includes(keyword_cj)) {
								c.innerHTML += tag_cj_Inner
								cj.add(pid)
								return
							}
							//纯良标签
							else {
								c.innerHTML += tag_nor_Inner
								nor.add(pid)
							}

							function yuan_weight() {
								if (getStrCount(st, keyword_yuan) >= 0 && getStrCount(st, keyword_yuan) <= 5) {
									c.innerHTML += tag_mxz_1_Inner
								} else if (getStrCount(st, keyword_yuan) > 5 && getStrCount(st, keyword_yuan) <= 10) {
									c.innerHTML += tag_mxz_2_Inner
								} else if (getStrCount(st, keyword_yuan) > 10 && getStrCount(st, keyword_yuan) <= 20) {
									c.innerHTML += tag_mxz_3_Inner
								} else {
									c.innerHTML += tag_mxz_4_Inner
								}
								//原神抽奖标签
								if (st.includes(keyword_cj_yuan)) {
									c.innerHTML += tag_cj_yuan_Inner
									cj_yuan.add(pid)
									return
								}
							}
						} else {
							console.log('失败')
							console.log(res)
						}
					},
				});
			});
		}
	}, 4000)
})();
