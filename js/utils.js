'use strict'

function gGameInit() {
    gGame.isOn = false
    gGame.isHint = false
    gGame.isWin = false
    gGame.isHint = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = clearInterval(gGame.secsPassed)
    gGame.livesCount = 3
    gGame.hintsCount = 3
    gGame.safeClickCount = 3
    gGame.megaHintCount = 1
    gGame.mineExtCount = 1
}

function showModal() {
    const elModal = document.querySelector(".modal")
    elModal.classList.remove('hide')
    elModal.innerText = gGame.isWin ? 'You Won !' : 'You Lost'
}

function hideModal() {
    const elModal = document.querySelector(".modal")
    elModal.classList.add('hide')
}

function getElCell(i, j) {
    const elCell = document.getElementById(`cell-${i}-${j}`)
    return elCell
}

function changeEmoji(emoji = '😀') {
    const elEmoji = document.querySelector(".emoji")
    elEmoji.innerText = emoji
}

function startTimer() {
    const timer = document.querySelector('.timer')
    const start = Date.now()
    gGame.secsPassed = setInterval(function () {
        var currTs = Date.now()
        var secs = parseInt((currTs - start) / 1000)
        secs = '00' + secs
        secs = secs.substring(secs.length - 3, secs.length)
        gGame.score = +secs
        timer.innerText = `${secs}`
    }, 100)
}

function getRandomMine() {
    const mines = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) mines.push({ i, j })

        }
    }
    var randIdx = getRandomInt(0, mines.length)
    return mines[randIdx]
}

function getRandomCell() {
    const cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) cells.push({ i, j })
        }
    }
    var randIdx = getRandomInt(0, cells.length - 1)
    return cells[randIdx]
}

function showLivesLeft() {
    if (gGame.livesCount <= 0) return
    var txt = "❤️".repeat(gGame.livesCount)
    txt += '💔'.repeat(3 - gGame.livesCount)
    var elLives = document.querySelector(".lives")
    elLives.innerText = txt
}

function setLevel(x) {
    if (x === 0) gLevel.SIZE = 4, gLevel.MINES = 4
    if (x === 1) gLevel.SIZE = 8, gLevel.MINES = 14
    if (x === 2) gLevel.SIZE = 12, gLevel.MINES = 32
    init()
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

