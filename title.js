/*

	QuickDraw
	title.js
	2012/12/12

*/

enchant();

//////////////////////////////////////////////////////////////////////////////
//タイトル画面
//////////////////////////////////////////////////////////////////////////////
Title = Class.create(enchant.Scene,{
	//////////////////////////////////////////////////////////////////////////////
	//生成時初期化処理
	//////////////////////////////////////////////////////////////////////////////
	initialize:function(){
		enchant.Scene.call(this);

		//背景
		this.back = new Sprite(320,320);
		this.back.image = game.assets['media/title.png'];
		this.addChild(this.back);
		
		//タイトル
		this.t1 = new Text(80,100,"QUICK");
		this.addChild(this.t1);
		this.t2 = new Text(this.t1.x+96,100,"DRAW");
		this.addChild(this.t2);

		this.s1 = new Text(72,160,"TIME ATTACK");
		this.addChild(this.s1);
		this.s2 = new Text(96,190,"ONE SHOT");
		this.addChild(this.s2);
		this.s3 = new Text(64,220,"SUDDEN DEATH");
		this.addChild(this.s3);
		this.s4 = new Text(80,250,"TRICK SHOT");
		this.addChild(this.s4);
		this.s5 = new Text(104,280,"RANKING");
//		this.addChild(this.s5);

		this.titleshot = 0;
	},
	//シーン開始時処理
	onenter:function(){
	},
	//シーン終了時処理
	onexit:function(){
	},
	onenterframe:function(){
	},
	ontouchstart:function(e){
		var x = e.x;
		var y = e.y;
		var bang = new Sprite(64,64);
		bang.image = game.assets['media/bang.png'];
		bang.x = x-32;
		bang.y = y-32;
		bang.scaleX = bang.scaleY = 0.5;
		bang.frame = 0;
		bang.parent = this;
		bang.onenterframe = function(){
			if( this.age % 1 == 0 ){
				this.frame++;
				if( this.frame == 8 ){
					this.parent.removeChild(this);
				}
			}
		}
		this.addChild(bang);
		game.assets['media/se_bang.mp3'].clone().play();
		
		//遊び
		if( 80 < x && x < 240 && 100 < y && y < 116 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.t1.tl.moveBy(0,-4,1,enchant.Easing.SIN_EASEIN).moveBy(0,4,1,enchant.Easing.SIN_EASEIN);
			this.t1.tl.moveBy(0,-2,1,enchant.Easing.SIN_EASEIN).moveBy(0,2,1,enchant.Easing.SIN_EASEIN);
			this.t2.tl.moveBy(0,-4,1,enchant.Easing.SIN_EASEIN).moveBy(0,4,1,enchant.Easing.SIN_EASEIN);
			this.t2.tl.moveBy(0,-2,1,enchant.Easing.SIN_EASEIN).moveBy(0,2,1,enchant.Easing.SIN_EASEIN);
			this.titleshot++;
			if( this.titleshot > 20 ){
				this.t1.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
				this.t2.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
				this.titleshot = 0;
				this.t1.tl.then(function(){this.y = -16;this.rotation=0;}).delay(sec(3)).moveBy(0,100,sec(1),enchant.Easing.BOUNCE_EASEOUT);
				this.t2.tl.then(function(){this.y = -16;this.rotation=0;}).delay(sec(3)).moveBy(0,100,sec(1),enchant.Easing.BOUNCE_EASEOUT);
			}
		}

		//TIME ATTACK
		if( 72 < x && x < 248 && 160 < y && y < 172 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.s1.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
			this.tl.delay(30).then(function(){
				game.pushScene(new GameMain(MODE_TIMEATTACK));
			});
			this.s2.tl.fadeOut(10);
			this.s3.tl.fadeOut(10);
			this.s4.tl.fadeOut(10);
			this.s5.tl.fadeOut(10);
		}
		//ONE SHOT
		if( 96 < x && x < 224 && 190 < y && y < 206 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.s2.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
			this.tl.delay(30).then(function(){
				game.pushScene(new GameMain(MODE_ONESHOT));
			});
			this.s1.tl.fadeOut(10);
			this.s3.tl.fadeOut(10);
			this.s4.tl.fadeOut(10);
			this.s5.tl.fadeOut(10);
		}
		//SUDDEN DEATH
		if( 64 < x && x < 256 && 220 < y && y < 236 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.s3.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
			this.tl.delay(30).then(function(){
				game.pushScene(new GameMain(MODE_SUDDENDEATH));
			});
			this.s1.tl.fadeOut(10);
			this.s2.tl.fadeOut(10);
			this.s4.tl.fadeOut(10);
			this.s5.tl.fadeOut(10);
		}
		//TRICK SHOT
		if( 80 < x && x < 320 && 250 < y && y < 266 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.s4.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).and().rotateTo(rand(720)-360,20);
			this.tl.delay(30).then(function(){
				game.pushScene(new GameMain(MODE_TRICKSHOT));
			});
			this.s1.tl.fadeOut(10);
			this.s2.tl.fadeOut(10);
			this.s3.tl.fadeOut(10);
			this.s5.tl.fadeOut(10);
		}
/*
		//RANKING
		if( 0 < x && x < 320 && 280 < y && y < 296 ){
			game.assets['media/se_kin.mp3'].clone().play();
			this.s5.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN);
			this.tl.delay(30).then(function(){
				game.pushScene(new GameMain(MODE_RANKING));
			});
			this.s1.tl.fadeOut(10);
			this.s2.tl.fadeOut(10);
			this.s3.tl.fadeOut(10);
			this.s4.tl.fadeOut(10);
		}
*/
	},
	ontouchmove:function(e){
	},
	ontouchend:function(e){
	},
});



