/*!
 * 版本：MYUI Copyright © 2019
 * 作者：QQ726662013版权所有
 * 官网：https://www.mytheme.cn
 */

var MyTheme = {
	'Browser': {
		// url: document.URL,
		// domain: document.domain,
		// title: document.title,
		// language: (navigator.browserLanguage || navigator.language).toLowerCase(),
		// canvas: function() {
		// 	return !!document.createElement("canvas").getContext
		// }(),
		useragent: function() {
			var a = navigator.userAgent;
			return {
				mobile: !! a.match(/AppleWebKit.*Mobile.*/),
				ios: !! a.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
				android: -1 < a.indexOf("Android") || -1 < a.indexOf("Linux"),
				iPhone: -1 < a.indexOf("iPhone") || -1 < a.indexOf("Mac"),
				iPad: -1 < a.indexOf("iPad"),
				trident: -1 < a.indexOf("Trident"),
				presto: -1 < a.indexOf("Presto"),
				webKit: -1 < a.indexOf("AppleWebKit"),
				gecko: -1 < a.indexOf("Gecko") && -1 == a.indexOf("KHTML"),
				weixin: -1 < a.indexOf("MicroMessenger")
			}
		}()
	},

	'Link': {
		'Copy': {
			'Init': function() {
				$(".myui-copy-link").each(function(){
					var links = $(this).attr("data-url");
					MyTheme.Link.Copy.Set(this,links);
				});
				$(".copyurl").each(function(){
					var html = $(this).parent().find(".content").html();
					MyTheme.Link.Copy.Set(this,html);
				});
			},
			'Set': function(id,content) {
				var clipboard = new Clipboard(id, {
					text: function() {									
						return content;
					}
				});
				clipboard.on('success', function(e) {
					layer.msg('复制成功，去分享给好友吧~');
				});
				clipboard.on("error",function(e){
				    layer.msg('复制失败，请手动复制');
				});
			}
			
		},
		'Short': function(){
			$(".myui-short").each(function(){
				var codyId = this;
				var shortId = $(this);
				var shortUrl = shortId.val() || shortId.attr("data-url");
				var linkText = shortId.attr("data-text");
				if(myui.short==1){
					$.ajax({
						type : 'GET',
						url : myui.shortapi+encodeURIComponent(shortUrl),
						dataType : 'jsonp',
						success : function(r) {
							url_short = r.data.urls[0].url_short;
							if(shortId.val()){
								shortId.val(linkText+url_short);
							}else if(shortId.attr("data-url")){
								shortId.attr("data-url",url_short);
								MyTheme.Link.Copy.Set(codyId,linkText+url_short);
							}
						}
					});
				}else{
					if(shortId.val()){
						shortId.val(linkText+shortUrl);
					}else if(shortId.attr("data-url")){
						shortId.attr("data-url",shortUrl);
						MyTheme.Link.Copy.Set(codyId,linkText+shortUrl);
					}	
				}
			});
		},
	},

	'Other': {		
		'Sort': function() {
			$(".sort-button").each(function(){
				$(this).on("click",function(e){
					e.preventDefault();
					$(this).parent().parent().parent().find(".sort-list").each(function(){
					    var playlist=$(this).find("li");
					    for(let i=0,j=playlist.length-1;i<j;){
					        var l=playlist.eq(i).clone(true);
					        var r=playlist.eq(j).replaceWith(l);
					        playlist.eq(i).replaceWith(r);
					        ++i;
					        --j;
					    }
					});
				});
			});
		},
		'Collapse': function() {
			$(".text-collapse").each(function(){
				$(this).find(".details").on("click",function(){
					$(this).parent().find(".sketch").addClass("hide");
					$(this).parent().find(".data").css("display","");
					$(this).remove();
				});
			});
			$(".dropdown-hover").click(function(){
				$(this).find(".dropdown-box").toggle();
			});
		},
		'Player': function() {
			if($("#player-left").length){
				var PlayerLeft = $("#player-left");
		    	var PlayerSide = $("#player-sidebar");
				var LeftHeight = PlayerLeft.outerHeight();
				var Position = $("#playlist li.active").position().top;
				$("#player-sidebar-is").click(function() {
					PlayerSide.toggle();
					if(PlayerSide.css("display")==='none') {
						PlayerLeft.css("width","100%");
						$(this).html("<i class='fa fa-angle-left'></i>");
					}	
					if(PlayerSide.css("display")==='block') {
						PlayerLeft.css("width","");
						$(this).html("<i class='fa fa-angle-right'></i>");
					}
				});
				if(!MyTheme.Browser.useragent.mobile){
					PlayerSide.css({"height":LeftHeight,"overflow":"auto"});
					PlayerSide.scrollTop(Position);
				}
				PlayerSide.scroll(function(){
					$(".lazyload").lazyload();
				});
			}		
			if($(".player-fixed").length){
				if(!MyTheme.Browser.useragent.mobile){
					$(window).scroll(function(){
						if($(window).scrollTop()>window.outerHeight){
							$(".player-fixed").addClass("fixed fadeInDown");
							$(".player-fixed-off").show();
							$(".close-box").hide();
						}else if($(window).scrollTop()<window.outerHeight){
							$(".player-fixed").removeClass("fixed fadeInDown");
							$(".player-fixed-off").hide();
							$(".close-box").show();
						}
					});
				}
				$(".player-fixed-off").click(function() {
					$(".player-fixed").removeClass("fixed fadeInDown");
				});
			}
			
		}
	}	
};

$(function(){
	// if(MyTheme.Browser.useragent.mobile){
	// 	MyTheme.Mobile.Nav.Init();
	// 	MyTheme.Mobile.Mshare();
	// }
	MyTheme.Link.Copy.Init();
	MyTheme.Link.Short();
	MyTheme.Other.Sort();
	MyTheme.Other.Collapse();
	MyTheme.Other.Player();
});