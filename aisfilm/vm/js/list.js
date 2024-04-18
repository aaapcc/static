/**
* 列表页交叉筛选滚动
*/
$(function(){
var scrollObj = new Array();
var scrollTags = {
	opt:{
		hScroll: true, //水平滚动
		vScroll: false, //垂直滚动
		bounce : true,
		momentum: true
	},
	init:function(_id){
		
		if(!$('#'+_id)[0]){
			return;
		}
		if($('.selectShowList').css('display') != 'none'){
			// 设置宽度
			var width = $('#'+_id+' p').width()+5;
			$('#'+_id+' .con').css({'width':width});
		}
		scrollObj[_id] = this.makeScroll(_id, this.opt);
		$(window).on('resize',function(){
			if($('.selectShowList').css('display') != 'none'){
				$('#'+_id+' .con').css({'width':$('#'+_id+' p').width()+5});
			}
			scrollObj[_id].refresh();
			resizeImg();
		});

		$('.selectShowList a.cur').each(function(k, e){
			if(!$('#'+_id+' a.cur')[0]){
				return;
			}

			var screenWidth = $('.header').width();
			var aLeft = $('#'+_id+' a.cur').offset().left;
			var aWidth = $('#'+_id+' a.cur').width();
			var scrollLeft = parseInt(screenWidth - aLeft);
			// if(scrollLeft < 30){
			// 	scrollObj[_id].scrollTo(-aLeft + aWidth);
			// }
		});
		return scrollObj[_id];
	},
	makeScroll:function(_id, _opt){
		return new iScroll(_id, _opt);
	}
};
scrollTags.init('first_list');
scrollTags.init('second_list');
scrollTags.init('third_list');
scrollTags.init('fourth_list');
scrollTags.init('wu_list');
scrollTags.init('liu_list');
})