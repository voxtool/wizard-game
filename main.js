(function game() {
    const gameStartEl = document.getElementById('game-start');
    const gameAreaEl = document.getElementById('game-area');
    const gameBarEl = document.getElementById('game-score');
    const gameScoreEl = document.getElementById('points');
    const gameOvertEl = document.getElementById('game-over');
    const wizardEl = document.getElementById('wizard');

    const keys = {};
    const player = {
        x: 150,
        y: 100,
        width: 0,
        height: 0,
        lastFireballTime: 0,
        lives: 3 // How many lives you have
    };

    const game = {
        speed: 2,
        movingMultiplier: 4,
        fireballMultiplier: 5,
        fireInterval: 1000,
        cloudSpanInterval: 3000,
        bugSpawnInterval: 1000,
        bugKillBonus: 2000,
        hardMOde: 30000  // Every X ms the game gets harder. Fine tune in the game action function
    };

    const scene = {
        score: 0,
        lastCloudSpan: 0,
        lastBugSpawn: 0,
        isActiveGame: true,
        lastEnrage: 0
    }
    gameStartEl.addEventListener('click', onGameStart);

    function onGameStart() {
        gameStartEl.classList.add('hide');
        wizardEl.classList.remove('hide');
        player.width = wizardEl.offsetWidth;
        player.height = wizardEl.offsetHeight;
        wizardEl.style.top = player.y + 'px';
        wizardEl.style.left = player.x + 'px';
        window.requestAnimationFrame(gameAction);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    function onKeyDown(e) {
        keys[e.code] = true;
    }
    function onKeyUp(e) {
        keys[e.code] = false;
    }

    function gameAction(timestamp) {
        if (timestamp - scene.lastEnrage > game.hardMOde) {  // Progressive difficulty
            game.speed += 0.2;
            if (game.bugSpawnInterval > 0) {
                game.bugSpawnInterval -= 100;  // lowers the bug spawn interval by X ms
            }
            if (game.cloudSpanInterval > 0) {
                game.cloudSpanInterval -= 50; // lowers the cloud spawn interval by X ms
            }
            if (game.fireInterval > 500) {
                game.fireInterval -= 25; // lowers the fire interval
            }
            scene.lastEnrage = timestamp;
        }
        let isInAir = (player.y + player.height) - 30 < gameAreaEl.offsetHeight;
        if (isInAir) {
            player.y += game.speed;
        }
        if (keys.ArrowUp && player.y - gameBarEl.offsetHeight > 0) {
            player.y -= game.speed * game.movingMultiplier;
        };
        if (keys.ArrowDown && isInAir) {
            player.y += game.speed * game.movingMultiplier;
        };
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= game.speed * game.movingMultiplier;
        };
        if (keys.ArrowRight && player.x + player.width + 5 < gameAreaEl.offsetWidth) {
            player.x += game.speed * game.movingMultiplier;
        };
        if (keys.Space && timestamp - player.lastFireballTime > game.fireInterval) {
            wizardEl.classList.add('wizard-fire');
            addFireball(player);
            player.lastFireballTime = timestamp;
        } else {
            wizardEl.classList.remove('wizard-fire');
        }
        let fireballs = document.querySelectorAll('.fire-ball');
        fireballs.forEach(fireBall => {
            fireBall.x += game.speed * game.fireballMultiplier;
            fireBall.style.left = fireBall.x + 'px';
            if (fireBall.x + fireBall.offsetWidth > gameAreaEl.offsetWidth) {
                fireBall.parentElement.removeChild(fireBall);
            }
        })
        wizardEl.style.top = player.y + 'px';
        wizardEl.style.left = player.x + 'px';
        scene.score++;
        if (timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
            let bug = document.createElement('div');
            bug.classList.add('bug');
            bug.x = gameAreaEl.offsetWidth - 60;
            bug.style.left = bug.x + 'px';
            bug.style.top = (gameAreaEl.offsetHeight - 60) * Math.random() + 'px'
            gameAreaEl.appendChild(bug);
            scene.lastBugSpawn = timestamp;
        }
        let bugs = document.querySelectorAll('.bug');
        bugs.forEach(bugEl => {
            if (isCollision(wizardEl, bugEl)) {
                bugEl.parentElement.removeChild(bugEl);
                player.lives--;
                let heart = document.querySelector('.heart');
                heart.parentElement.removeChild(heart);
            }
            if (player.lives === 0) {
                gameOverAction()
            }
            fireballs.forEach(fireBall => {
                if (isCollision(fireBall, bugEl)) {
                    scene.score += game.bugKillBonus;
                    bugEl.parentElement.removeChild(bugEl);
                    fireBall.parentElement.removeChild(fireBall);
                }
            })
            bugEl.x -= game.speed;
            bugEl.style.left = bugEl.x + 'px';

            if (bugEl.x + bugEl.offsetWidth <= 0) {
                bugEl.parentElement.removeChild(bugEl);
            };
        })
        if (timestamp - scene.lastCloudSpan > game.cloudSpanInterval + 2000 * Math.random()) {
            let cloud = document.createElement('div');
            cloud.classList.add('cloud');
            cloud.x = gameAreaEl.offsetWidth - 200;
            cloud.style.left = cloud.x + 'px';
            cloud.style.top = (gameAreaEl.offsetHeight - 200) * Math.random() + 'px'
            gameAreaEl.appendChild(cloud);
            scene.lastCloudSpan = timestamp;
        }
        let clouds = document.querySelectorAll('.cloud');
        clouds.forEach(cloudEl => {
            cloudEl.x -= game.speed;
            cloudEl.style.left = cloudEl.x + 'px';

            if (cloudEl.x + cloudEl.offsetWidth <= 0) {
                cloudEl.parentElement.removeChild(cloudEl);
            };
        })
        gameScoreEl.textContent = scene.score;
        if (scene.isActiveGame) {
            window.requestAnimationFrame(gameAction);
        }
    }

    function addFireball(player) {
        let fireBall = document.createElement('div');
        fireBall.style.top = (player.y + player.height / 3 - 50) + 'px'
        fireBall.x = player.x + player.width;
        fireBall.style.left = fireBall.x + 'px'
        fireBall.classList.add('fire-ball');
        gameAreaEl.appendChild(fireBall);
    }

    function isCollision(firstEl, secondEl) {
        let firstRec = firstEl.getBoundingClientRect();
        let secondRec = secondEl.getBoundingClientRect();

        return !(firstRec.top > secondRec.bottom ||
            firstRec.bottom < secondRec.top ||
            firstRec.right < secondRec.left ||
            firstRec.left > secondRec.right);
    }

    function gameOverAction() {
        scene.isActiveGame = false;
        gameOvertEl.classList.remove('hide');
    }
}());