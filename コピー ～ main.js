/*

	QuickDraw
	2012/12/09

*/

enchant();

//ＤＢ機能デバッグ
enchant.nineleap.memory.LocalStorage.DEBUG_MODE = true;
enchant.nineleap.memory.LocalStorage.GAME_ID = 2740;

var soundEnable = true;

var rand = function(max){ return ~~(Math.random() * max); }
var sec = function(s){return s*game.fps;}

window.onload = function() {
	game = new Game( 320, 320 );
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
	game.preload('media/icon0.png','media/chara1.png','media/back.png','media/effect.png','media/bang.png');
	if(soundEnable){
			game.preload('media/se_bang.mp3','media/se_empty.mp3','media/se_bang.mp3','media/se_pi.mp3','media/se_bomb.mp3',
						 'media/bgm_clear.mp3','media/bgm_allclear.mp3','media/bgm_gameover.mp3'
			);
	}

	game.onload = function(){
		//環境変数
		/////////////////////////////////////////////////////////////////////////////
		var mode = 0;
		var numStage = 0;
		var numStageMax = 5;
		var bullet = 20;
		var phase = 0;
		var start = false;
		var numTarget = 0;
		var targets = [];
		var numHit = 0;
		var init = true;
		var last = false;
		var lastX = 0;
		var lastY = 0;
		var clear = false;
		
		var floor = new Array(3);
		floor[0] = 96-32;
		floor[1] = 165-32;
		floor[2] = 235-32;

		//ステージ準備
		/////////////////////////////////////////////////////////////////////////////
		stage = new Group();
		game.rootScene.addChild( stage );
		game.rootScene.backgroundColor = 'rgb(0,0,0)';
		
		var back = new Sprite(320,320);
		back.image = game.assets['media/back.png'];
		stage.addChild(back);

		//タイマー
		/////////////////////////////////////////////////////////////////////////////
		var txt = new MutableText(128,10,16*20,"TIME");
		stage.addChild(txt);
		var timer = new MutableText(112,30,16*20,"[0.00]");
		timer.start = 0;		//起動時点時間
		timer.before = timer.start;	//前フレーム時間
		timer.time = 0;			//経過フレーム数
		timer.stop = true;		//タイマー停止フラグ
		timer.over = false;		//時間切れフラグ
		timer.max = 180;		//制限時間(sec)
		timer.now = 0;			//現在時間
		timer.tm = 0;
		timer.phase = 0;
		timer.addEventListener('enterframe', function(){
			if( this.stop )return;
			this.time+=1/30;
			this.text = "["+this.time.toFixed(2)+"]";
			if( this.time >= 10 ){
				this.x = 104;
			}
			
			//タイムアップ
			if( this.time > 30 ){
				this.text = "[30.00]";
				start = false;
				this.tl.delay(sec(0.5)).then(function(){
					var t = new Text(104,140,"TIME UP");
					stage.addChild(t);
					game.assets['media/bgm_gameover.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					game.end(0,"時間切れ");
				});
			}
		});
		//タイマーリセット
		timer.reset = function(){this.time=0;}
		stage.addChild(timer);

		//残弾数
		/////////////////////////////////////////////////////////////////////////////
		var txt = new MutableText(112,270,16*20,"BULLET");
		stage.addChild(txt);
		var blt = new MutableText(128,290,16*20,"[20]");
		blt.onenterframe = function(){
			this.text = "["+bullet+"]";
			if( bullet < 10 ){
				this.x = 146;
			}
			if( bullet < 1 && !clear ){
				this.text = "[0]";
				this.tl.delay(sec(1)).then(function(){
					var t = new Text(74,140,"BULLET EMPTY");
					stage.addChild(t);
					game.assets['media/bgm_gameover.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					game.end(0,"弾切れ");
				});
			}
		}
		stage.addChild(blt);

		//ステージ進行
		/////////////////////////////////////////////////////////////////////////////
		stage.addEventListener('enterframe', function(){
			//ステージ初期化
			if( init ){
				startStage();
				init = false;
			}

			//クリア判定
			if( numHit == numTarget && numStage < numStageMax ||
				numHit == numTarget+1 && numStage == numStageMax ){
				numHit = 0;
				start = false;
				timer.stop = true;
				this.tl.delay(sec(1)).then(function(){clearStage();});
			}
			if( numHit == numTarget && numStage == numStageMax && !last ){
				last = true;
				enterBomb();
			}
		});

		//ステージ開始
		/////////////////////////////////////////////////////////////////////////////
		var startStage = function(){
			numStage++;
			//ステージ準備
			switch(numStage){
				case 1:
					targets = [];
					numTarget = 1;
					enterTarget(160-16,floor[rand(3)],0);
					break;
				case 2:
					targets = [];
					numTarget = 3;
					enterTarget(rand(260)+30,floor[0],0);
					enterTarget(rand(260)+30,floor[1],0);
					enterTarget(rand(260)+30,floor[2],0);
					break;
				case 3:
					targets = [];
					numTarget = 3;
					enterTarget(rand(260)+30,floor[0],1);
					enterTarget(rand(260)+30,floor[1],2);
					enterTarget(rand(260)+30,floor[2],1);
					break;
				case 4:
					targets = [];
					numTarget = 4;
					enterTarget(rand(260)+30,floor[rand(3)],0);
					enterTarget(rand(260)+30,floor[0],2);
					enterTarget(rand(260)+30,floor[1],2);
					enterTarget(rand(260)+30,floor[2],3);
					break;
				case 5:
					targets = [];
					numTarget = 4;
					enterTarget(rand(260)+30,floor[rand(3)],0);
					enterTarget(rand(260)+30,floor[rand(3)],2);
					enterTarget(rand(260)+30,floor[rand(3)],3);
					enterTarget(rand(260)+30,floor[rand(3)],3);
					break;
			}
			numHit = 0;

			var sc = new Scene;
			sc.tl.delay(sec(0.1)).then(function(){
				//ステージ開始メッセージ
				if( numStage < numStageMax ){
					var t = new Text(104,120,"STAGE "+numStage);
					t.tl.delay(sec(3)).removeFromScene();
					this.addChild(t);
					var m = new Text(80,140,"TARGET x "+numTarget);
					m.tl.delay(sec(3)).removeFromScene();
					sc.addChild(m);
				}else{
					var t = new Text(72,120,"FINAL STAGE");
					t.tl.delay(sec(3)).removeFromScene();
					this.addChild(t);
					var m = new Text(46,140,"TARGET x "+numTarget+" + ?");
					m.tl.delay(sec(3)).removeFromScene();
					sc.addChild(m);
				}
				var r = new Text(120,160,"READY");
				r.opacity = 0;
				r.tl.delay(sec(1)).show().delay(sec(2)).removeFromScene();
				r.tl.then(function(){
					start = true;
					timer.stop = false;
					game.assets['media/se_pi.mp3'].clone().play();
					game.popScene();
				});
				sc.addChild(r);
			});
			game.pushScene(sc);
		}

		//ステージクリア
		/////////////////////////////////////////////////////////////////////////////
		var clearStage = function(){
			if(numStage < numStageMax ){
				//ステージクリア
				sc = new Scene;
				sc.tl.delay(sec(1)).then(function(){
					//クリアメッセージ
					var t = new Text(72,140,"STAGE CLEAR");
					t.tl.delay(sec(3)).removeFromScene();
					this.addChild(t);
					game.assets['media/bgm_clear.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					var len = targets.length;
					for( var i = 0; i < len; i++ ){
						stage.removeChild(targets[i]);
					}
					game.popScene();
					init = true;
				});
				game.pushScene(sc);
			}else{
				//ステージクリア
				sc = new Scene;
				sc.tl.delay(sec(2)).then(function(){
					//クリアメッセージ
					var t = new Text(72,140,"ALL CLEAR!!");
					t.tl.delay(sec(3)).removeFromScene();
					this.addChild(t);
					game.assets['media/bgm_allclear.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					var score = timer.time.toFixed(2);
					game.end(30-score,"CLEAR! TIME:"+score);
				});
				game.pushScene(sc);
			}
		}

		//ターゲット投入
		/////////////////////////////////////////////////////////////////////////////
		var enterTarget = function(x,y,type){
			var tg = new Sprite(32,32);
			tg.image = game.assets['media/chara1.png'];
			tg.frame = 0;
			tg.x = x;
			tg.y = y;
			tg.fl = tg.y;
			tg.bx = x;
			tg.opacity = 0;
			tg.type = type;
			tg.time = 0;
			tg.nx = x;
			tg.last = false;
			tg.ok = true;
			tg.count = 0;
			tg.jump = false;
			tg.yPrev = y;
			tg.F = 0;
			if( rand(2) == 0 ){
				tg.dir = 1;	//歩く方向
			}else{
				tg.dir = -1;
			}
			tg.onenterframe = function(){
				if( !start || !this.ok )return;
				this.opacity = 1;
				switch(this.type){
					case 0:	//何もしないクマ
						break;
					case 1:	//等速で歩くクマ（往復）
						if( this.time % 3 == 0 && this.frame != 3 ){
							this.frame++;
							if( this.frame == 3 )this.frame = 0;
						}
						this.x+=3*this.dir;
						if( this.x < 10 || this.x > 290 )this.dir*=-1;
						if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
						break;
					case 2:	//適当に歩くクマ
						if( this.time % 3 == 0 && this.frame != 3 ){
							this.frame++;
							if( this.frame == 3 )this.frame = 0;
						}
						this.x+=3*this.dir;
						if( this.x < 10 || this.x > 280 ){
							this.dir*=-1;
						}else{
							if( this.count < 0 ){
								var dice = rand(100);
								if( dice > 90 ){this.dir*=-1;this.count=rand(sec(3))+sec(1);}
							}
						}
						if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
						break;
					case 3:	//ジャンプするクマ
						if( this.time % 3 == 0 && this.frame != 3 ){
							this.frame++;
							if( this.frame == 3 )this.frame = 0;
						}
						this.x+=3*this.dir;
						if( this.x < 10 || this.x > 280 ){
							this.dir*=-1;
						}
						var dice = rand(100);
						if( this.count < 0 && dice > 90 ){
							this.jump = true;
							this.F = 10;
							this.yPrev = this.y;
							this.count = sec(rand(3))+sec(1);
						}
						if( this.jump ){
							var yTemp = this.y;
							this.y -= ( this.yPrev - this.y ) + this.F;
							this.F = -1;
							this.yPrev = yTemp;
						}
						if( this.y > this.fl )this.y = this.fl;
						if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
						break;
				}
				if( this.x == this.bx )this.frame = 0;
				this.bx = this.x;
				this.time++;
				this.count--;
			}
			stage.addChild(tg);
			for( var i = 0,len = targets.length; len < targets[i]; i++ ){
				if( tg.intersect(targets[i]) ){
					tg.x = rand(280)+10;
				}
			}
			targets[targets.length] = tg;
			return tg;
		}
		
		//最終ターゲット投入
		/////////////////////////////////////////////////////////////////////////////
		var enterBomb = function(){
			var tg = new Sprite(16,16);
			tg.image = game.assets['media/icon0.png'];
			tg.frame = 26;
			tg.x = rand(200)+60;//152;
			tg.y = floor[rand(3)]+16;
			tg.last = true;
			tg.ok = true;
			stage.addChild(tg);
			targets[targets.length] = tg;
			lastX = tg.x;
			lastY = tg.y;
			return tg;
		}

		//当たり判定
		/////////////////////////////////////////////////////////////////////////////
		var collision = function(x,y){
			var len = targets.length;
			for( var i = 0; i < len; i++ ){
				if( !targets[i].ok )continue;
				var tx = targets[i].x;
				var ty = targets[i].y;
				if( tx < x && x < tx+32 && ty < y && y < ty+32 ){
					return targets[i];
				}
			}
			return null;
		}

		//操作系
		/////////////////////////////////////////////////////////////////////////////
		game.rootScene.addEventListener('touchstart', function(e) {
			if( !start ) return;
			if( bullet == 0 ){
				game.assets['media/se_empty.mp3'].play();
				return;
			}
			var x = e.x;
			var y = e.y;
			var bang = new Sprite(64,64);
			bang.image = game.assets['media/bang.png'];
			bang.x = x-32;
			bang.y = y-32;
			bang.scaleX = bang.scaleY = 0.5;
			bang.frame = 0;
			bang.onenterframe = function(){
				if( this.age % 2 == 0 ){
					this.frame++;
					if( this.frame == 8 ){
						stage.removeChild(this);
					}
				}
			}
			stage.addChild(bang);
			game.assets['media/se_bang.mp3'].clone().play();
			bullet--;
			var t = collision(x,y);
			if( t != null ){
				t.ok = false;
				if( !t.last ){
					t.frame = 3;
					t.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN);
				}else{
					t.visible = 0;
					clear = true;
					var bang = new Sprite(32,48);
					bang.image = game.assets['media/effect.png'];
					bang.x = lastX-12;//140;
					bang.y = lastY-65;
					bang.frame = 0;
					bang.scaleX = bang.scaleY = 3;
					bang.onenterframe = function(){
						if( this.age % 3 == 0 ){
							this.frame++;
							if( this.frame == 8 ){
								stage.removeChild(this);
							}
						}
					}
					stage.addChild(bang);
					game.assets['media/se_bomb.mp3'].clone().play();
				}
				numHit++;
			}
		});
		game.rootScene.addEventListener('touchmove', function(e) {
		});
		game.rootScene.addEventListener('touchend', function(e) {
		});
		
		game.assets['media/se_pi.mp3'].play();
		game.assets['media/se_pi.mp3'].stop();
	};
	game.start();
};
