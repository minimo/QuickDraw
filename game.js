/*

	QuickDraw
	game.js
	2012/12/09

*/

GameMain = Class.create(enchant.Scene,{
	//////////////////////////////////////////////////////////////////////////////
	//生成時初期化処理
	//////////////////////////////////////////////////////////////////////////////
	initialize:function(mode){
		enchant.Scene.call(this);
		//環境変数
		/////////////////////////////////////////////////////////////////////////////
		gameMode = mode;
		numStage = 0;
		numStageMax = 5;
		start = false;
		numTarget = 0;
		targets = [];
		numHit = 0;
		init = true;
		last = false;
		lastX = 0;
		lastY = 0;
		clear = false;

		//フロア座標
		floor = new Array(3);
		floor[0] =  96-32;
		floor[1] = 165-32;
		floor[2] = 235-32;

		//残弾数設定
		switch(gameMode){
			case MODE_TIMEATTACK:
				bullet = 20;
				break;
			case MODE_ONESHOT:
				bullet = 1;
				break;
			case MODE_SUDDENDEATH:
				bullet = 99;
				break;
			case MODE_TRICKSHOT:
				bullet = 99;
				break;
		}

		//ステージ準備
		/////////////////////////////////////////////////////////////////////////////
		this.back = new Sprite(320,320);
		this.back.image = game.assets['media/back.png'];
		this.addChild(this.back);

		//タイマー
		/////////////////////////////////////////////////////////////////////////////
		var txt = new MutableText(128,10,16*20,"TIME");
		this.addChild(txt);
		timer = new MutableText(112,30,16*20,"[0.00]");
		timer.start = 0;			//起動時点時間
		timer.before = timer.start;	//前フレーム時間
		timer.time = 0;				//経過フレーム数
		timer.stop = true;			//タイマー停止フラグ
		timer.over = false;			//時間切れフラグ
		timer.max = 180;			//制限時間(sec)
		timer.now = 0;				//現在時間
		timer.tm = 0;
		timer.parent = this;
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
				last = false;
				if( gameMode == MODE_TIMEATTACK || gameMode == MODE_ONESHOT ){
					this.tl.delay(sec(0.5)).then(function(){
						var t = new Text(88,140,"TIME UP!!");
						this.parent.addChild(t);
						game.assets['media/bgm_gameover.mp3'].clone().play();
					}).delay(sec(3)).then(function(){
						game.end(0,"時間切れ");
					});
				}else{
					this.tl.delay(sec(0.5)).then(function(){
						var t = new Text(88,140,"TIME UP!!");
						this.parent.addChild(t);
						game.assets['media/bgm_gameover.mp3'].clone().play();
					}).delay(sec(3)).then(function(){
						if( gameMode == MODE_SUDDENDEATH ){
							game.end(0,"SUDDEN DEATH MODE SCORE:"+numHit);
						}else{
							game.end(0,"TRICK SHOT MODE SCORE:"+numHit);
						}
					});
				}
			}
		});
		this.addChild(timer);

		if( gameMode != MODE_SUDDENDEATH && gameMode != MODE_TRICKSHOT ){
			//残弾数
			/////////////////////////////////////////////////////////////////////////////
			var txt = new MutableText(112,270,16*20,"BULLET");
			this.addChild(txt);
			blt = new MutableText(128,290,16*20,"[20]");
			blt.parent = this;
			blt.onenterframe = function(){
				this.text = "["+bullet+"]";
				if( bullet < 10 )this.x = 136;
				if( bullet < 1 && !clear ){
					this.text = "[0]";
					this.tl.delay(sec(1)).then(function(){
						var t = new Text(74,140,"EMPTY BULLET");
						this.parent.addChild(t);
						game.assets['media/bgm_gameover.mp3'].clone().play();
					}).delay(sec(3)).then(function(){
						game.end(0,"弾切れ");
					});
				}
			}
			this.addChild(blt);
		}else{
			//ヒット数表示
			/////////////////////////////////////////////////////////////////////////////
			var txt = new MutableText(120,270,16*20,"SCORE");
			this.addChild(txt);
			cnt = new MutableText(136,290,16*20,"[0]");
			cnt.parent = this;
			cnt.onenterframe = function(){
				this.text = "["+numHit+"]";
				if( numHit > 9 )this.x = 128;
				else if( numHit > 99 )this.x = 120;
			}
			this.addChild(cnt);
		}

		this.time = 0;
	},
	/////////////////////////////////////////////////////////////////////////////
	//ステージ進行
	/////////////////////////////////////////////////////////////////////////////
	onenterframe:function(){
		//ステージ初期化
		if( init ){
			this.startStage();
			init = false;
		}

		//サドンデス、ターゲットを投入		
		if( gameMode == MODE_SUDDENDEATH ){
			if( this.time % sec(2) == 0 ){
				game.assets['media/se_pi.mp3'].clone().play();
				var n = 2;
				if( timer.time > 5 )n++;
				if( timer.time > 10 )n++;
				if( timer.time > 15 )n++;
				for( var i = 0; i < n; i++ ){
					var x = rand(280);
					var y = floor[rand(3)];
					var type = rand(3);
					this.enterTarget(x,y,type);
					numTarget++;
				}
			}
		}
		//トリックショット、ターゲット投入
		if( gameMode == MODE_TRICKSHOT ){
			if( this.time % sec(5) == 0 && this.time > 0 ){
				game.assets['media/se_pi.mp3'].clone().play();
				var y = floor[rand(3)];
				this.enterTarget(0,y,4);
				numTarget++;
			}
			if( numTarget == 0 && start ){
				start = false;
				this.tl.delay(sec(0.5)).then(function(){
					var t = new Text(112,140,"MISS!!");
					this.addChild(t);
					game.assets['media/bgm_gameover.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					game.end(0,"TRICK SHOT MODE SCORE:"+numHit);
				});
			}
		}

		//タイムアタッククリア判定
		if( gameMode == MODE_TIMEATTACK ){
			if( numHit == numTarget && numStage < numStageMax && bullet > 0 ||
				numHit == numTarget+1 && numStage == numStageMax ){
				numHit = 0;
				last = false;
				timer.stop = true;
				this.tl.delay(sec(1)).then(function(){this.clearStage();});
			}
			if( numHit == numTarget && numStage == numStageMax && !last ){
				last = true;
				this.enterBomb();
			}
		}
		//一発勝負クリア判定
		if( gameMode == MODE_ONESHOT ){
			if( numHit == numTarget ){
				numHit = 0;
				last = false;
				timer.stop = true;
				this.tl.delay(sec(1)).then(function(){this.clearStage();});
			}
		}
		this.time++;
	},
	/////////////////////////////////////////////////////////////////////////////
	//ステージ開始
	/////////////////////////////////////////////////////////////////////////////
	startStage:function(){
		numHit = 0;
		switch(gameMode){
			case MODE_TIMEATTACK:
				this.initTimeAttack();
				break;
			case MODE_ONESHOT:
				this.initOneShot();
				break;
			case MODE_SUDDENDEATH:
				this.initSuddenDeath();
				break;
			case MODE_TRICKSHOT:
				this.initTrickShot();
				break;
		}
	},
	/////////////////////////////////////////////////////////////////////////////
	//タイムアタック初期化
	/////////////////////////////////////////////////////////////////////////////
	initTimeAttack:function(){
		numStage++;
		//ステージ準備
		switch(numStage){
			case 1:
				targets = [];
				numTarget = 1;
				this.enterTarget(160-16,floor[rand(3)],0);
				break;
			case 2:
				targets = [];
				numTarget = 3;
				this.enterTarget(rand(260)+30,floor[0],0);
				this.enterTarget(rand(260)+30,floor[1],0);
				this.enterTarget(rand(260)+30,floor[2],0);
				break;
			case 3:
				targets = [];
				numTarget = 3;
				this.enterTarget(rand(260)+30,floor[0],1);
				this.enterTarget(rand(260)+30,floor[1],2);
				this.enterTarget(rand(260)+30,floor[2],1);
				break;
			case 4:
				targets = [];
				numTarget = 4;
				this.enterTarget(rand(260)+30,floor[rand(3)],0);
				this.enterTarget(rand(260)+30,floor[0],2);
				this.enterTarget(rand(260)+30,floor[1],2);
				this.enterTarget(rand(260)+30,floor[2],3);
				break;
			case 5:
				targets = [];
				numTarget = 4;
				this.enterTarget(rand(260)+30,floor[rand(3)],0);
				this.enterTarget(rand(260)+30,floor[rand(3)],2);
				this.enterTarget(rand(260)+30,floor[rand(3)],3);
				this.enterTarget(rand(260)+30,floor[rand(3)],3);
				break;
		}
		//ステージ開始メッセージ
		var sc = new Scene;
		sc.tl.delay(sec(0.1)).then(function(){
		if( numStage < numStageMax ){
			var t = new Text(104,120,"STAGE "+numStage);
				t.numStage = numStage;
				t.tl.delay(sec(3)).removeFromScene();
				sc.addChild(t);
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
	},
	/////////////////////////////////////////////////////////////////////////////
	//一発勝負初期化
	/////////////////////////////////////////////////////////////////////////////
	initOneShot:function(){
		numStage++;
		numStageMax = 1;
		targets = [];
		numTarget = 1;
		this.enterTarget(rand(280),floor[rand(3)],0);

		//ステージ開始メッセージ
		var sc = new Scene;
		sc.tl.delay(sec(0.1)).then(function(){
			var t = new Text(56,120,"ONE SHOT GAME");
			t.tl.delay(sec(3)).removeFromScene();
			sc.addChild(t);
			var m = new Text(80,140,"TARGET x 1");
			m.tl.delay(sec(3)).removeFromScene();
			sc.addChild(m);

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
	},
	/////////////////////////////////////////////////////////////////////////////
	//サドンデス初期化
	/////////////////////////////////////////////////////////////////////////////
	initSuddenDeath:function(){
		numStage++;
		targets = [];
		numTarget = 3;
		this.enterTarget(rand(280),floor[rand(3)],0);
		this.enterTarget(rand(280),floor[rand(3)],0);
		this.enterTarget(rand(280),floor[rand(3)],0);

		//ステージ開始メッセージ
		var sc = new Scene;
		sc.tl.delay(sec(0.1)).then(function(){
			var t = new Text(64,120,"SUDDEN DEATH");
			t.tl.delay(sec(3)).removeFromScene();
			sc.addChild(t);
			var m = new Text(80,140,"TARGET x ?");
			m.tl.delay(sec(3)).removeFromScene();
			sc.addChild(m);

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
	},
	/////////////////////////////////////////////////////////////////////////////
	//トリックショット初期化
	/////////////////////////////////////////////////////////////////////////////
	initTrickShot:function(){
		numStage++;
		targets = [];
		numTarget = 1;
		this.enterTarget(rand(280),floor[rand(3)],4);

		//ステージ開始メッセージ
		var sc = new Scene;
		sc.tl.delay(sec(0.1)).then(function(){
			var t = new Text(80,120,"TRICK SHOT");
			t.tl.delay(sec(3)).removeFromScene();
			sc.addChild(t);
			var m = new Text(80,140,"TARGET x 1");
			m.tl.delay(sec(3)).removeFromScene();
			sc.addChild(m);

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
	},
	/////////////////////////////////////////////////////////////////////////////
	//ステージクリア
	/////////////////////////////////////////////////////////////////////////////
	clearStage:function(){
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
					this.removeChild(targets[i]);
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
				switch( gameMode ){
					case MODE_TIMEATTACK:
						game.end(30-score,"TIME ATTACK CLEAR! TIME:"+score);
						break;
					case MODE_ONESHOT:
						game.end(0,"ONE SHOT GAME TIME:"+score);
						break;
				}
			});
			game.pushScene(sc);
		}
	},
	/////////////////////////////////////////////////////////////////////////////
	//ターゲット投入
	/////////////////////////////////////////////////////////////////////////////
	enterTarget:function(x,y,type){
		var tg = new Sprite(32,32);
		tg.image = game.assets['media/chara1.png'];
		tg.frame = 0;
		tg.x = x;
		tg.y = y;
		tg.floor = tg.y;		//床面の高さ
		tg.bx = x;			//前フレームＸ座標
		tg.opacity = 0;
		tg.type = type;		//ターゲットタイプ
		tg.last = false;	//最終ターゲットフラグ
		tg.ok = true;		//準備OKフラグ
		tg.count = 0;		//ジャンプ、方向転換インターバル
		tg.jump = false;	//ジャンプ中フラグ
		tg.yPrev = y;		//ジャンプ用前フレームＹ座標
		tg.F = 0;			//ジャンプ用加速度
		tg.fx = 0;			//横方向加速度
		tg.fr = 0;			//回転加速度
		if( rand(2) == 0 ){
			tg.dir = 1;	//歩く方向
		}else{
			tg.dir = -1;
		}
		switch(type){
			case 0:	//何もしないクマー
				tg.onenterframe = function(){
					if( !start || !this.ok )return;
					this.opacity = 1;
				}
				break;
			case 1:	//等速で歩くクマー（往復）
				tg.onenterframe = function(){
					if( !start || !this.ok )return;
					this.opacity = 1;
					if( this.age % 3 == 0 && this.frame != 3 ){
						this.frame++;
						if( this.frame == 3 )this.frame = 0;
					}
					this.x+=3*this.dir;
					if( this.x < 10 || this.x > 290 )this.dir*=-1;
					if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
					if(	this.x == this.bx )this.frame = 0;
					this.bx = this.x;
					this.count--;
				}
				break;
			case 2:	//たまに引き返すクマー
				tg.onenterframe = function(){
					if( !start || !this.ok )return;
					this.opacity = 1;
					if( this.age % 3 == 0 && this.frame != 3 ){
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
					if(	this.x == this.bx )this.frame = 0;
					this.bx = this.x;
					this.count--;
				}
				break;
			case 3:	//たまにジャンプするクマー（往復）
				tg.onenterframe = function(){
					if( !start || !this.ok )return;
					this.opacity = 1;
					if( this.age % 3 == 0 && this.frame != 3 ){
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
					if( this.y > this.floor ){
						this.y = this.floor;
						this.jump = false;
					}
					if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
					if(	this.x == this.bx )this.frame = 0;
					this.bx = this.x;
					this.count--;
				}
				break;
			case 4:	//トリックショット用クマー
				tg.frame = 0;
				tg.F = 15;
				tg.yPrev = tg.y;
				if( rand(2) == 0 ){
					tg.x = -32;
					tg.fx = 5;
				}else{
					tg.x = 320;
					tg.fx = -5;
				}
				tg.onenterframe = function(){
					if( !start || !this.ok )return;
					this.opacity = 1;
					this.x += this.fx;
					this.fx *= 0.95;
					this.rotation += this.rx;
					this.rx *= 0.95;

					var yTemp = this.y;
					this.y -= ( this.yPrev - this.y ) + this.F;
					this.F = -1;
					this.yPrev = yTemp;

					if( this.x < this.bx )this.scaleX = -1; else this.scaleX = 1;
					if(	this.x == this.bx )this.frame = 0;
					this.bx = this.x;
					
					if( this.y > 320 ){
						this.ok = false;
						this.tl.removeFromScene();
						numTarget--;
					}
				}
				break;
		}
		this.addChild(tg);
		for( var i = 0,len = targets.length; len < targets[i]; i++ ){
			if( tg.intersect(targets[i]) ){
				tg.x = rand(280)+10;
			}
		}
		targets[targets.length] = tg;
		return tg;
	},
	/////////////////////////////////////////////////////////////////////////////
	//最終ターゲット投入
	/////////////////////////////////////////////////////////////////////////////
	enterBomb:function(){
		var tg = new Sprite(16,16);
		tg.image = game.assets['media/icon0.png'];
		tg.frame = 26;
		tg.x = rand(200)+60;//152;
		tg.y = floor[rand(3)]+16;
		tg.last = true;
		tg.ok = true;
		this.addChild(tg);
		targets[targets.length] = tg;
		lastX = tg.x;
		lastY = tg.y;
		return tg;
	},
	/////////////////////////////////////////////////////////////////////////////
	//当たり判定
	/////////////////////////////////////////////////////////////////////////////
	collision:function(x,y){
		var len = targets.length;
		for( var i = 0; i < len; i++ ){
			if( !targets[i].ok )continue;
			var tx = targets[i].x+16;
			var ty = targets[i].y+16;
			if( tx-16 < x && x < tx+16 && ty-16 < y && y < ty+16 )return i;

			//トリックショット用は範囲を拡大
			if( targets[i].type == 4 ){
				if( tx-25 < x && x < tx+25 && ty-25 < y && y < ty+25 )return i;
			}
		}
		return -1;
	},
	/////////////////////////////////////////////////////////////////////////////
	//ターゲット削除
	/////////////////////////////////////////////////////////////////////////////
	removeTarget:function(num){
		var t = targets[num];
		t.tl.removeFromScene();
		delete targets[num];
	},
	/////////////////////////////////////////////////////////////////////////////
	//操作系
	/////////////////////////////////////////////////////////////////////////////
	ontouchstart:function(e){
		if( !start ) return;
		if( bullet == 0 ){
			game.assets['media/se_empty.mp3'].clone().play();
			return;
		}
		var x = ~~e.x;
		var y = ~~e.y;
		var bang = new Sprite(64,64);
		bang.image = game.assets['media/bang.png'];
		bang.x = x-32;
		bang.y = y-32;
		bang.scaleX = bang.scaleY = 0.5;
		bang.frame = 0;
		bang.parent = this;
		bang.onenterframe = function(){
			if( this.age % 2 == 0 ){
				this.frame++;
				if( this.frame == 8 ){
					this.parent.removeChild(this);
				}
			}
		}
		this.addChild(bang);
		game.assets['media/se_bang.mp3'].clone().play();
		if( bullet != 99 )bullet--;

		//当たり判定チェック
		var i = this.collision(x,y);
		if( i != -1 ){
			var t = targets[i];
			if( !t.last ){
				numHit++;
				if( t.type != 4 ){
					//的クマー
					t.ok = false;
					t.frame = 3;
					t.tl.moveBy(0,-8,5,enchant.Easing.SIN_EASEIN).moveBy(0,320,20,enchant.Easing.SIN_EASEIN).removeFromScene();
					if( gameMode == MODE_ONESHOT )clear = true;
				}else{
					//トリックショット用クマー
					//当たった場所によって動きを変えるよ
					var tx = ~~(t.x+16);
					if( tx < x ){
						//左側命中
						t.fx = (tx-x)*0.2;
						t.rx += (tx-x)*20;
					}else if( tx > x ){
						//右側命中
						t.fx = (tx-x)*0.2;
						t.rx += (tx-x)*20;
					}else{
						//中心
					}

					var ty = ~~(t.y+16);//中心を取る
					if( ty < y ){
						//上側命中
						t.F = 10;
					}else if( ty > y ){
						//下側命中
						t.F = 15;
						t.fx*=2;
					}else{
						//中心
						t.F = 10;
					}
					t.yPrev = t.y;
					t.frame = 3;
				}
			}else{
				//爆弾爆破
				t.ok = false;
				t.visible = 0;
				clear = true;
				var bang = new Sprite(32,48);
				bang.image = game.assets['media/effect.png'];
				bang.x = lastX-12;//140;
				bang.y = lastY-65;
				bang.frame = 0;
				bang.scaleX = bang.scaleY = 3;
				bang.parent = this;
				bang.onenterframe = function(){
					if( this.age % 3 == 0 ){
						this.frame++;
						if( this.frame == 8 ){
							this.parent.removeChild(this);
						}
					}
				}
				this.addChild(bang);
				game.assets['media/se_bomb.mp3'].clone().play();
				numHit++;
			}
		}else{
			//サドンデスは一発ミスで終了
			if( gameMode == MODE_SUDDENDEATH ){
				start = false;
				this.tl.delay(sec(0.5)).then(function(){
					var t = new Text(106,140,"MISS!!!");
					this.addChild(t);
					game.assets['media/bgm_gameover.mp3'].clone().play();
				}).delay(sec(3)).then(function(){
					game.end(0,"SUDDEN DEATH MODE SCORE:"+numHit);
				});
			}
		}
	},
	ontouchmove:function(e){
	},
	ontouchend:function(e){
	},
});
