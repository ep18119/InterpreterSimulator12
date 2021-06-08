// グローバルに展開
phina.globalize();

var gotMes = "";
/*
var app = Elm.Elm_to_JS.init({
  node: document.getElementById('myapp')
});
  app.ports.sendMes.subscribe(function(str) {
    alert(str);
	gotMes = str;
    app.ports.receiveMes.send(str);
  });
  */

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
	gotMes = event.data;
}

//アセット
var ASSETS = {
	image: {
		'buttai': './buttai.png',
	},
};

//外部からの命令を格納する配列
var inFunc = [];
//その配列に命令を格納する関数
function useF(f,n,m){
	//配列の末尾に要素を追加
	inFunc.push(Array(f,n,m));
};
//スプライトの情報
var s = {x:0,y:0,r:0,d:1};


//自動用　trueにすると動作終了まで処理を続ける
var auto = false;
//手動用　trueにする度に処理を1回行う
var goNext = false;


/*
 * メインシーン
 */
phina.define("MainScene", {
	// 継承
	superClass: 'DisplayScene',
	// 初期化
	init: function() {
		// 親クラス初期化
		this.superInit();
		// 背景色
		this.backgroundColor = 'skyblue';
		// 以下にコードを書いていく

		//スプライト
		this.sprite = Sprite('buttai').addChildTo(this);
		this.sprite.x = 320;
		this.sprite.y = 480;
		this.sprite.draggable;
		//スプライトのベクトル
		this.v = Vector2(1,0);
		//スプライトの方向
		this.direction = 1;
	
		//ペン使用中のフラグ
		this.pen = false;
		//スプライトが動いた時のフラグ
		this.move = false;

		//if制御で用いる数字
		this.ifNum = 0;

		//実行中の処理を文字列で表示
		label = Label({fontSize: 32}).addChildTo(this).setPosition(640,0);
		label.origin.set(1,0);
		//スプライトのx,y座標
		this.labelXY = Label({fontSize: 32}).addChildTo(this).setPosition(640,108);
		this.labelXY.origin.set(1,0);
		//スプライトの向き
		this.labelR = Label({fontSize: 32}).addChildTo(this).setPosition(640,144);
		this.labelR.origin.set(1,0);

		//プログラムを格納する配列、処理中のインデックス値、キー
		prog = new Array();
		progObj = {};

		//ボタン
		button1 = Button({
			x: 1,             // x座標
			y: 1,             // y座標
			width: 120,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "動作終了",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button1.origin.set(0,0);
		var button2 = Button({
			x: 1,             // x座標
			y: 112,             // y座標
			width: 150,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "1つすすむ",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button2.origin.set(0,0);
		var button3 = Button({
			x: 1,             // x座標
			y: 56,             // y座標
			width: 150,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "オート",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button3.origin.set(0,0);

		//button1.width = 150;
		button1.onpointend = function(){
			label.text = "動作終了";
			progObj = {};
			prog = [];
		};
		button2.onpointend = function(){
			goNext = true;
		};
		button3.onpointend = function(){
			if(auto){
				auto = false;
				this.text = "オート";
			}else{
				auto = true;
				this.text = "オート解除";
			}
		};

	},

	// 毎フレーム更新処理
	update: function () {
		// 以下にコードを書いていく

		if(gotMes){
			//this.label.text = gotMes;
			try {
				prog = JSON.parse(gotMes);
				progObj = {};
			} catch (error) {
				console.log("デコードに失敗しました : " + gotMes);
			}
			gotMes = "";
			goNext = true;
		}
		
		if(auto) goNext = true;

		if(prog.length && goNext){
			goNext = false;
			//console.log("A " + this.progObj);
			if(!Object.keys(progObj).length){
				//console.log("B");
				progObj = this.sarchAST("CommandNOP");
			}
			//else console.log("H");
			if(progObj == "Nil"){
				progObj = {};
				prog = [];
			}else{
				//console.log("C "+this.progObj.node.getBrickCommand);
				this.doCommand(progObj.node.getBrickCommand);
			}
		}
		if(goNext) goNext = false;
		
		//命令が存在する場合は処理
		if(inFunc.length){
			//動作
			this.useFunc(inFunc[0][0], inFunc[0][1], inFunc[0][2]);
			//配列の先頭の要素を取り出す
			inFunc.shift();
		}


		this.labelXY.text = '( ' + parseInt(this.sprite.x-320,10) + ', ' + parseInt(this.sprite.y-480,10) +')';
		this.labelR.text = (this.sprite.rotation %= 360) + '度';
		
		s.x = this.sprite.x;
		s.y = this.sprite.y;
		s.r = this.sprite.rotation;
		s.d = this.direction +1;
	},

	//スプライトの動作を行う関数
	useFunc: function (f,n,m) {
		if(f>100){
			if(n>0){
				this.nextBlock(f);
				label.text = '関数' + (f-100) + 'へ移動';
			}else{
				this.nextBlock(0);
				label.text = '関数' + (f-100) + 'を開始';
			}
		}else{
		switch(f){
		//前進
	  	case 0:
  			this.sprite.moveBy(n * this.v.x, n * this.v.y);
			label.text = n + '歩前進'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//右回転
	  	case 1:
			this.turnV(this.sprite.rotation+=n);
			label.text = n + '度右回転'
			this.nextBlock(0);
			break;
		//左回転
	  	case 2:
  			this.turnV(this.sprite.rotation-=n);
			label.text = n + '度左回転'
			this.nextBlock(0);
			break;
		//向き指定
	  	case 3:
  			this.turnV(this.sprite.rotation = n);
			label.text = n + '度の向き'
			this.nextBlock(0);
			break;
		//反転
	  	case 4:
  			this.sprite.setScale(this.direction*=-1.0, 1.0);
			this.v.x *= -1;
			this.v.y *= -1;
			label.text = '左右反転'
			this.nextBlock(0);
			break;
		//x座標指定
	  	case 5:
  			this.sprite.x = 320 + n;
			label.text = 'x座標を' + n + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//x座標更新
	  	case 6:
  			this.sprite.x += n;
			label.text = 'x座標を' + n + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//y座標指定
	  	case 7:
  			this.sprite.y = 480 + n;
			label.text = 'y座標を' + n + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//y座標更新
	  	case 8:
  			this.sprite.y += n;
			label.text = 'y座標を' + n + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//xy座標指定
	  	case 9:
  			this.sprite.x = 320 + n;
  			this.sprite.y = 480 + m;
			label.text = 'x座標を' + n + 'にする\ny座標を' + m + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//xy座標更新
	  	case 10:
  			this.sprite.x += n;
			this.sprite.y += m;
			label.text = 'x座標を' + n + 'ずつ移動\ny座標を' + m + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//ペンを下げる
	  	case 11:
			this.pen = true;
			this.drawLine();
			label.text = 'ペンを下げる'
			this.nextBlock(0);
			break;
		//ペンを上げる
	  	case 12:
			this.pen = false;
			label.text = 'ペンを上げる'
			this.nextBlock(0);
			break;
		//if制御
		case 90:
			if(isNaN(n)){
				if(this.checkSomething( n.split(' ') )){
					console.log(true);
					label.text = 'if制御\n' + n + '\n判定：true'
					this.nextBlock(1);
				}else{
					console.log(false);
					label.text = 'if制御\n' + n + '\n判定：false'
					this.nextBlock(2);
				}
			}else{
				if(n&&true){
					console.log(true);
					label.text = 'if制御\n' + n + '\n判定：true'
					this.nextBlock(1);
				}else{
					console.log(false);
					label.text = 'if制御\n' + n + '\n判定：false'
					this.nextBlock(2);
				}
			}
			break;
		case 100:
			label.text = '動作開始';
			this.nextBlock(0);
			break;
		default:
			start01 = false;
			start02 = false;
			break;
		}
		}
	},
	//スプライトの向きを更新
	turnV: function (n) {
  		this.v.x = Math.cos(3.1415*n/180)*this.direction;
  		this.v.y = Math.sin(3.1415*n/180)*this.direction;
	},
	//if制御関係
	checkSomething: function (str) {
		console.log(str);
		const n = str.shift();
		if(isNaN(n)){
			switch( n ){
			case '!': console.log('check !'); return !this.checkSomething(str);
			case '&':
				console.log('check &');
				const m1 = this.checkSomething(str);
				return this.checkSomething(str)&&m1;
			case '|':
				console.log('check |');
				const m2 = this.checkSomething(str);
				return this.checkSomething(str)||m2;
			case '=': console.log('check ='); return this.checkSomething(str)==this.checkSomething(str);
			case '>': console.log('check >'); return this.checkSomething(str)>this.checkSomething(str);
			case '<': console.log('check <'); return this.checkSomething(str)<this.checkSomething(str);
			case '*': console.log('check *'); return this.checkSomething(str)*this.checkSomething(str);
			case '/': console.log('check /'); return this.checkSomething(str)/this.checkSomething(str);
			case '+': console.log('check +'); return this.checkSomething(str)+this.checkSomething(str);
			case '-': console.log('check -'); return this.checkSomething(str)-this.checkSomething(str);
			case 'x': console.log('check x'); return this.sprite.x-320;
			case 'y': console.log('check y'); return this.sprite.y-480;
			case 'r': console.log('check r'); return this.sprite.rotation;
			case 'd': console.log('check d'); return this.direction;
			case 'true': console.log('check true'); return true;
			case 'false': console.log('check false'); return false;
			default: console.log('check ' + n + ' ?'); return n;
			}
		}else console.log('check ' + n); return n;
	},
	//次のブロックを判別
	nextBlock: function (n) {
		//console.log("E "+n)
		if(n > 100){
			progObj = this.sarchAST("CommandFuncStart");
		}else{
			switch(n){
				case 0:
					if((progObj.bottom == "Nil") ^ (progObj.right == "Nil")){
						//console.log("F "+this.progObj);
						if(progObj.bottom != "Nil") progObj = progObj.bottom;
						else progObj = progObj.right;
					}else progObj = "Nil";
					//console.log("G "+this.progObj.node.getBrickCommand);
					break;
				case 1:
					progObj = progObj.right;
					break;
				case 2:
					progObj = progObj.bottom;
					break;
				default :
					progObj = "Nil";
					break;
			}
		}
	},

	//線を引く関数
	drawLine: function () {
		//描画中となる線
  		var line = PathShape({
			paths:[
				Vector2(this.sprite.x, this.sprite.y)
			],
			stroke: "red",
			strokeWidth: 4
		}).addChildTo(this).setPosition(0,0);
		//描画中の線の更新
		line.update = () => {
			//スプライト動作後
			if(this.move){
				//フラグ削除
				this.move = false;
				//パス追加
				line.addPath(this.sprite.x, this.sprite.y);
			}
			//ペンを上げた
			if(!this.pen){
				//描画した線を別の線として保存
				this.saveLine(line);
				//描画中の線を削除
				line.remove();
			}
		}
	},
	//線を残す関数
	saveLine: function (line) {
		//線を定義
		var line0 = PathShape().addChildTo(this).setPosition(0,0);
		//パスを受け継ぐ
		line0.paths = line.paths;
		//青色
		line0.stroke = "blue";
	},

	sarchAST: function (command) {
		for (var i=0 ; i <= prog.length; i++){
			if(prog[i].node.getBrickCommand == command){
				console.log(prog[i]);
				return prog[i];
			}
		}
		return "Nil";
	},

	//抽象構文木のプログラムの処理
	doCommand: function (command) {
		console.log(command);
		switch(command){
			case "CommandNOP" : this.useFunc(100); break;
			case "CommandMove" : this.useFunc(0,30); break;
			case "CommandTurnRight" : this.useFunc(1,30); break;
			case "CommandTurnLeft" : this.useFunc(2,30); break;
			case "CommandTurnBack" : this.useFunc(4); break;
			case "CommandResetXY" : this.useFunc(9,0,0); break;
			case "CommandDownPen" : this.useFunc(11); break;
			case "CommandUpPen" : this.useFunc(12); break;
			case "CommandFuncStart" : this.useFunc(101,0); break;
			case "CommandFuncStop" : this.useFunc(101,1); break;
			case "CommandIfX" : this.useFunc(90,"> x 0"); break;
			case "CommandIfY" : this.useFunc(90,"> y 0"); break;
			case "CommandIfR" : this.useFunc(90,"= r 0"); break;
			default : this.progObj = "Nil"; break;
		}
	}


});



/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainScene から開始
    startLabel: 'main',
	assets: ASSETS,
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});



