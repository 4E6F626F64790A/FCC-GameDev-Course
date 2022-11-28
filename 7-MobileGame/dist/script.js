window.addEventListener('load', function () {
    var canvas = document.getElementById('canvas1');
    var ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    var enemies = [];
    var score = 0;
    var InputHandler = /** @class */ (function () {
        function InputHandler() {
            var _this = this;
            this.keys = [];
            window.addEventListener('keydown', function (e) {
                if ((e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'ArrowLeft')
                    && _this.keys.indexOf(e.key) === -1) {
                    _this.keys.push(e.key);
                }
                console.log(e.key, _this.keys);
            });
            window.addEventListener('keyup', function (e) {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'ArrowLeft') {
                    _this.keys.splice(_this.keys.indexOf(e.key), 1);
                }
                console.log(e.key, _this.keys);
            });
        }
        return InputHandler;
    }());
    var Player = /** @class */ (function () {
        function Player(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }
        Player.prototype.draw = function (context) {
            //context.fillStyle = 'white';
            //context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        };
        Player.prototype.update = function (input, deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame)
                    this.frameX = 0;
                else
                    this.frameX++;
                this.frameTimer = 0;
            }
            else {
                this.frameTimer += deltaTime;
            }
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            }
            else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            }
            else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 25;
            }
            else {
                this.speed = 0;
            }
            this.x += this.speed;
            if (this.x < 0)
                this.x = 0;
            else if (this.x > this.gameWidth - this.width)
                this.x = this.gameWidth - this.width;
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            }
            else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height)
                this.y = this.gameHeight - this.height;
        };
        Player.prototype.onGround = function () {
            return this.y >= this.gameHeight - this.height;
        };
        return Player;
    }());
    var Background = /** @class */ (function () {
        function Background(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }
        Background.prototype.draw = function (context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        };
        Background.prototype.update = function () {
            this.x -= this.speed;
            if (this.x < 0 - this.width)
                this.x = 0;
        };
        return Background;
    }());
    var Enemy = /** @class */ (function () {
        function Enemy(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedForDeletion = false;
        }
        Enemy.prototype.draw = function (context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        };
        Enemy.prototype.update = function (deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame)
                    this.frameX = 0;
                else
                    this.frameX++;
                this.frameTimer = 0;
            }
            else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        };
        return Enemy;
    }());
    // 
    function handleEnemies(deltaTime, enemies) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            console.log(enemies);
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        }
        else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(function (enemy) {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter(function (enemy) { return !enemy.markedForDeletion; });
    }
    function displayStatusText(context) {
        context.fillStyle = 'black';
        context.font = '40px Helvetica';
        context.fillText('Score: ' + score, 20, 50);
    }
    var input = new InputHandler();
    var player = new Player(canvas.width, canvas.height);
    var background = new Background(canvas.width, canvas.height);
    var lastTime = 0;
    var enemyTimer = 0;
    var enemyInterval = 1000;
    var randomEnemyInterval = Math.random() * 1000 + 500;
    function animate(timeStamp) {
        var deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime);
        handleEnemies(deltaTime, enemies);
        displayStatusText(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});
