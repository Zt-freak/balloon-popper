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
            'combo': 0,
            'timer': 0,
            'gameActive': false
        }
        this.konamiIndex = 0
        this.konamiActive = false

        this.toggleGameActive = this.toggleGameActive.bind(this)
        this.popBalloon = this.popBalloon.bind(this)
        this.announce = this.announce.bind(this)

        this.init()
        this.konami()
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
        //this.state.combo = 0
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
        this.state.score = 0
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
        if (Math.random() * 100 < 10 + this.state.score * 0.05 + this.state.highScore * 0.1) {
            const speedRoll = Math.log(Math.random() * this.state.score + this.state.highScore * 0.1) / Math.log(100)
            let speedModifier = 1
            if (speedRoll < 0.1) {
                speedModifier = 1
                console.log('slow')
            }
            else if (speedRoll < 1) {
                speedModifier = 0.5
                console.log('normal')
            }
            else {
                speedModifier = 0.3
                console.log('fast')
            }

            const newBalloon = new Balloon()

            const balloonFromArray = this.balloons[Math.floor(Math.random() * this.balloons.length)]

            newBalloon.setImage(balloonFromArray.dataset.image)
            newBalloon.setPoints(balloonFromArray.dataset.points)

            const speed = newBalloon.dataset.speed * speedModifier - this.state.score

            newBalloon.setSpeed(speed)
            newBalloon.style.left = Math.floor(Math.random() * (70 - 30) + 30)+'%'
            setTimeout(
                function () {
                    if (newBalloon.dataset.points > 0) {
                        this.state.combo = 0
                    }
                    newBalloon.remove()
                }.bind(this),
                speed
            )
            this.gameOverlay.appendChild(newBalloon)
            newBalloon.addEventListener('mousedown',
                function () {
                    this.popBalloon(newBalloon)
                }.bind(this)
            )
            newBalloon.addEventListener('mouseover',
                function () {
                    if (this.konamiActive) {
                        this.popBalloon(newBalloon)
                    }
                }.bind(this)
            )
        }
    }

    popBalloon (balloon) {
        this.state.combo++
        balloon.style.pointerEvents = 'none'
        this.state.score = this.state.score + parseInt(balloon.dataset.points) + this.state.combo
        this.currentScoreSpan.innerText = 'score: ' + this.state.score
        balloon.style.backgroundImage = 'url(https://upload.wikimedia.org/wikipedia/commons/a/a2/Bahai_star.svg)'
        setTimeout(
            function () {
                balloon.remove()
            },
            250
        )
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

    konami () {
        document.addEventListener(
            'keydown',
            function (event) {
                let isCorrect = false
                switch (this.konamiIndex) {
                    case 0:
                        if (event.keyCode === 38) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 1:
                        if (event.keyCode === 38) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 2:
                        if (event.keyCode === 40) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 3:
                        if (event.keyCode === 40) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 4:
                        if (event.keyCode === 37) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 5:
                        if (event.keyCode === 39) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 6:
                        if (event.keyCode === 37) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 7:
                        if (event.keyCode === 39) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 8:
                        if (event.keyCode === 66) {
                            this.konamiIndex++
                            isCorrect = true
                        }
                        break
                    case 9:
                        if (event.keyCode === 65) {
                            this.konamiIndex = 0
                            if (this.konamiActive) {
                                this.konamiActive = false
                                this.announce(['KONAMI CODE DEACTIVATED'])
                            }
                            else {
                                this.konamiActive = true
                                this.announce(['KONAMI CODE ACTIVATED'])
                            }
                            isCorrect = true
                        }
                        break
                }
                if (isCorrect == false) {
                    this.konamiIndex = 0
                }
            }.bind(this)
        )
    }
}

class Balloon extends HTMLElement {
    constructor () {
        super()
        this.dataset.points = 1
        this.style.backgroundImage = 'url(https://upload.wikimedia.org/wikipedia/commons/a/ae/Balloons-aj.svg)'
        this.dataset.image = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Balloons-aj.svg'
        this.style.backgroundSize = 'contain'
        this.style.backgroundPosition = 'center'
        this.style.backgroundRepeat = 'no-repeat'
        this.dataset.speed = 20000
        this.style.width = '10vw'
        this.style.height = '10vw'
        this.style.minWidth = '100px'
        this.style.minHeight = '100px'
        this.style.cursor = 'pointer'
        this.style.position = 'absolute'
        this.style.userSelect = 'none'
        this.draggable = false
        this.style.animationDuration = 20000+'ms'
        this.classList.add('balloon')
    }

    setSpeed (speed) {
        this.dataset.speed = speed
        this.style.animationDuration = speed+'ms'
    }

    setImage (image) {
        this.dataset.image = image
        this.style.backgroundImage = 'url('+image+')'
    }

    setPoints (points) {
        this.dataset.points = points
    }
}

customElements.define('balloon-element', Balloon)