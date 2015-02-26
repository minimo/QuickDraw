/*

	QuickDraw
	main.js
	2012/12/09

*/

enchant();

MODE_TIMEATTACK = 0;
MODE_ONESHOT = 1;
MODE_SUDDENDEATH = 2;
MODE_TRICKSHOT = 3;
MODE_RANKING = 4;

//ＤＢ機能デバッグ
enchant.nineleap.memory.LocalStorage.DEBUG_MODE = true;
enchant.nineleap.memory.LocalStorage.GAME_ID = 2740;

var soundEnable = true;

var rand = function(max){ return ~~(Math.random() * max); }
var sec = function(s){return s*game.fps;}

window.onload = function() {
	game = new Core( 320, 320 );
	game.fps = 30;
	var sec = function( time ){ return Math.floor( game.fps * time ); }

	//実行ブラウザ取得
	if( (navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 ){
		userAgent = "iOS";
	}else if( navigator.userAgent.indexOf('Android') > 0){
		userAgent = "Android";
		soundEnable = false;
	}else if( navigator.userAgent.indexOf('Chrome') > 0){
		userAgent = "Chrome";
	}else if( navigator.userAgent.indexOf('Firefox') > 0){
		userAgent = "Firefox";
		soundEnable = false;
	}else if( navigator.userAgent.indexOf('Safari') > 0){
		userAgent = "Safari";
		soundEnable = false;
	}else if( navigator.userAgent.indexOf('IE') > 0){
		userAgent = "IE";
		soundEnable = false;
	}else{
		userAgent = "unknown";
	}
	
	//アセット読み込み
	game.preload('media/icon0.png','media/chara1.png','media/back.png','media/title.png','media/effect.png','media/bang.png','media/logo.png');
	if(soundEnable){
			game.preload('media/se_bang.mp3','media/se_empty.mp3','media/se_bang.mp3','media/se_pi.mp3','media/se_bomb.mp3',
						 'media/bgm_clear.mp3','media/bgm_allclear.mp3','media/bgm_gameover.mp3',
						 'media/se_kin.mp3'
			);
	}

	game.onload = function(){
		game.assets['media/se_pi.mp3'].play();
		game.assets['media/se_pi.mp3'].stop();
		game.pushScene(new Title);
	};
	game.start();
};
