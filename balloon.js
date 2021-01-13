class BalloonGame {
    constructor (parent = document.body, menuAlignment = 'bottomRight', zIndex = 420, balloons = []) {
        this.parent = parent
        this.menuAlignment = menuAlignment
        this.zIndex = zIndex
        this.balloons = balloons
        this.activeBalloons = []
        this.state = {
            'score': 0,
            'highScore': 0,
            'timer': 0,
            'gameActive': false
        }

        this.toggleGameActive = this.toggleGameActive.bind(this);
        this.announce = this.announce.bind(this);

        this.init()
    }

    init () {
        this.parent.style.position = 'relative'

        this.gameOverlay = document.createElement('div')
        this.gameOverlay.id = 'balloongame-overlay'
        this.gameOverlay.style.width = '100%'
        this.gameOverlay.style.maxWidth = '100vw'
        this.gameOverlay.style.maxHeight = '100vh'
        this.gameOverlay.style.height = '100%'
        if (this.parent.offsetHeight > window.innerHeight) {
            this.gameOverlay.style.position = 'fixed'
            this.gameOverlay.style.width = '100vw'
            this.gameOverlay.style.height = '100vh'
        }
        else {
            this.gameOverlay.style.position = 'absolute'
        }
        this.gameOverlay.style.top = 0
        this.gameOverlay.style.left = 0
        this.gameOverlay.style.overflow = 'hidden'
        this.gameOverlay.style.display = 'none'
        this.parent.appendChild(this.gameOverlay)

        this.menu = document.createElement('div')
        this.menu.id = 'balloongame-menu'
        this.menu.style.width = '50px'
        this.menu.style.height = '50px'
        this.menu.style.backgroundColor = 'white'
        if (this.parent.offsetHeight > window.innerHeight) {
            this.menu.style.position = 'fixed'
        }
        else {
            this.menu.style.position = 'absolute'
        }
        this.menu.style.bottom = 0
        this.menu.style.right = 0
        this.menu.style.cursor = 'pointer'
        this.menu.innerText = 'Start'
        this.menu.addEventListener('click', this.toggleGameActive)
        this.parent.appendChild(this.menu)

        this.scoreBoard = document.createElement('div')
        this.scoreBoard.style.width = '100%'
        if (this.parent.offsetHeight > window.innerHeight) {
            this.scoreBoard.style.position = 'fixed'
        }
        else {
            this.scoreBoard.style.position = 'absolute'
        }
        this.scoreBoard.style.top = 0
        this.scoreBoard.style.left = 0
        this.scoreBoard.style.display = 'none'
        this.scoreBoard.style.flexDirection = 'column'
        this.scoreBoard.style.justifyContent = 'center'
        this.scoreBoard.style.alignItems = 'center'
        this.scoreBoard.style.pointerEvents = 'none'
        this.currentScoreSpan = document.createElement('span')
        this.currentScoreSpan.innerText = 'score: 0'
        this.highScoreSpan = document.createElement('span')
        this.highScoreSpan.innerText = 'high score: 0'
        this.timerSpan = document.createElement('span')
        this.timerSpan.innerText = ''
        this.scoreBoard.appendChild(this.currentScoreSpan)
        this.scoreBoard.appendChild(this.highScoreSpan)
        this.scoreBoard.appendChild(this.timerSpan)
        this.parent.appendChild(this.scoreBoard)
    }

    toggleGameActive () {
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score
            this.highScoreSpan.innerText = 'high score: ' + this.state.highScore
        }
        this.currentScoreSpan.innerText = 'score: 0'
        if (this.state.gameActive) {
            this.state.gameActive = false
            this.menu.innerText = 'Start'
            this.stopGame()
        }
        else {
            this.state.gameActive = true
            this.menu.innerText = 'Stop'
            this.startGame(60)
        }
    }

    startGame (time) {
        this.state.timer = time
        this.gameOverlay.style.removeProperty('display')
        this.scoreBoard.style.display = 'flex'
        this.countDownInterval = setInterval(
            this.countDown.bind(this),
            1000
        )
        this.gameProcess = setInterval(
            this.gameTick.bind(this),
            100
        )
    }

    stopGame () {
        if (this.state.timer <= 0) {
            this.announce(['TIME\'S UP', 'FINAL SCORE: '+ this.state.score])
        }
        else {
            this.announce(['GAME ENDED', 'FINAL SCORE: '+ this.state.score])
        }
        this.state.score = 0;
        this.gameOverlay.style.display = 'none'
        this.gameOverlay.innerHTML = ''
        this.scoreBoard.style.display = 'none'
        clearInterval(this.countDownInterval)
        clearInterval(this.gameProcess)
    }

    countDown () {
        this.state.timer--
        this.timerSpan.innerText = 'time left: ' + this.state.timer
        if(this.state.timer < 0) {
            this.toggleGameActive()
        }
        else if (this.state.timer <= 10) {
            this.announce([this.state.timer])
        }
    }

    gameTick () {
        if (Math.random() * 100 < 10 + this.state.score * 0.25 + this.state.highScore * 0.1) {
            const speed = 20000 - this.state.score * 100 - this.state.highScore * 10
            const newBalloon = this.balloons[Math.floor(Math.random() * this.balloons.length)].cloneNode(true)
            newBalloon.setSpeed(speed);
            newBalloon.style.left = Math.floor(Math.random() * (80 - 20) + 20)+'%'
            setTimeout(
                function () {
                    newBalloon.remove()
                },
                speed
            )
            this.gameOverlay.appendChild(newBalloon)
            newBalloon.addEventListener('mousedown',
                function () {
                    newBalloon.style.pointerEvents = 'none'
                    this.state.score = this.state.score + parseInt(newBalloon.dataset.points)
                    this.currentScoreSpan.innerText = 'score: ' + this.state.score
                    newBalloon.style.backgroundImage = 'url(https://upload.wikimedia.org/wikipedia/commons/a/a2/Bahai_star.svg)'
                    setTimeout(
                        function () {
                            newBalloon.remove()
                        },
                        250
                    )
                }.bind(this)
            )
        }
    }

    announce (announcements) {
        announcements.forEach(
            function (announcement, index) {
                let timeout =  1000 * (index + 1)
                setTimeout(
                    function () {
                        console.log(announcement)
                        const message = document.createElement('span')
                        message.innerText = announcement
                        if (this.parent.offsetHeight > window.innerHeight) {
                            message.style.position = 'fixed'
                        }
                        else {
                            message.style.position = 'absolute'
                        }
                        message.style.fontSize = '5rem'
                        message.style.top = '50%'
                        message.style.width = '100%'
                        message.style.pointerEvents = 'none'
                        message.style.textAlign = 'center'
                        message.classList.add('balloonmessage')
                        this.parent.appendChild(message)
                        setTimeout(
                            function () {
                                message.remove()
                            }.bind(this),
                            timeout
                        )
                    }.bind(this),
                    timeout
                )
            }.bind(this)
        )
    }

    addBalloon (balloon) {
        if (balloon instanceof Balloon) {
            this.balloons.push(balloon)
        }
    }
}

class Balloon extends HTMLElement {
    constructor (points = 1, image = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Balloons-aj.svg', speed = 20000) {
        super()
        this.dataset.points = points
        this.style.backgroundImage = 'url('+image+')'
        this.style.backgroundSize = 'cover'
        this.dataset.speed = speed
        this.style.width = '6vw'
        this.style.height = '6vw'
        this.style.minWidth = '100px'
        this.style.minHeight = '100px'
        this.style.cursor = 'pointer'
        this.style.position = 'absolute'
        this.style.userSelect = 'none'
        this.draggable = false
        this.style.animationDuration = speed+'ms'
        this.classList.add('balloon')
    }

    setSpeed (speed) {
        this.dataset.speed = speed
        this.style.animationDuration = speed+'ms'
    }
}

customElements.define('balloon-element', Balloon);