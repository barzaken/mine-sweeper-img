'use strict'
window.addEventListener("contextmenu", e => e.preventDefault())


var gIsDark = false
var gBoard = null
var gLastMoves = []

const gLevel = {
    SIZE: 4,
    MINES: 4
}

const gGame = {
    isOn: false,
    isHint: false,
    isWin: false,
    isMega: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    livesCount: 3,
    hintsCount: 3,
    safeClickCount: 3,
    megaHintCount: 1,
    mineExtCount: 1
}

function init() {
    hideModal()
    gGameInit()
    getBestScore()
    gBoard = buildBoard()
    gBoard = setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    showLivesLeft()
}

function buildBoard() {
    var board = []
    var id = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                id: id++
            }
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdxI = getRandomInt(0, gLevel.SIZE - 1)
        var randIdxJ = getRandomInt(0, gLevel.SIZE - 1)
        board[randIdxI][randIdxJ].isMine = true
    }
    return board
}

function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            var className = 'cell'
            var innerTxt = (cell.isMine) ? "💣" : cell.minesAroundCount || ''
            var tdId = `cell-${i}-${j}`
            strHtml += `\t<td id="${tdId}" oncontextmenu="cellMarked(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}">${innerTxt}</td>\n`
        }
        strHtml += '</tr>\n'
    }
    var elBoard = document.querySelector('.game-board')
    elBoard.innerHTML = strHtml
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = minesNegsCount(board, i, j)
        }
    }
    return board
}

function minesNegsCount(board, rowIdx, colIdx) {
    var minesCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = board[i][j]
            if (currCell.isMine) minesCount++
        }
    }
    return minesCount
}

function cellClicked(elCell, i, j) {
    if (gGame.isMega) {
        megaHintCords.push({ i, j })
        megaHint()
        return
    }
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    if (!gGame.isOn) {
        gGame.isOn = true
        startTimer()
    }
    if (gGame.isHint) {
        gGame.isHint = false
        cellClicked(elCell, i, j)
        revealCells(i, j)
        setTimeout(revealCells, 700, i, j)
        return
    }
    //model
    gBoard[i][j].isShown = true
    gGame.shownCount++
    gLastMoves.push({ i, j })
    //DOM
    elCell.classList.add('shown')

    checkGameOver()
    if (gBoard[i][j].isMine) {
        gGame.livesCount--
        changeEmoji("😔")
        setTimeout(changeEmoji, 1000)
        showLivesLeft()
        checkGameOver()
        return
    }

    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, i, j)
    }

}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (!gGame.isOn) {
        gGame.isOn = true
        startTimer()
    }
    gGame.markedCount++
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    elCell.classList.toggle('mark')
    checkGameOver()
}

function gameOver() {
    saveScore()
    gGame.isOn = false
    clearInterval(gGame.secsPassed)
    gGame.isWin ? changeEmoji('😎') : changeEmoji('😔')
    showModal()
}

function checkGameOver() {
    if (gGame.livesCount === 0) {
        gameOver()
        return
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
                else return false
            }
            if (!gBoard[i][j].isShown) return false
        }
    }
    gGame.isWin = true
    gameOver()
}

///////////////////////////////////////BONUS\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//Add support for HINTS
function hintClicked(idx) {
    gGame.isHint = true
    gGame.hintsCount--
    const elHints = document.querySelectorAll('.hints button')
    elHints[idx].classList.add('used-hint')
}

function revealCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isShown) continue
            var elNextCell = getElCell(i, j)
            elNextCell.classList.toggle('shown')
        }
    }
}

//Best Score
function saveScore() {
    const bestScore = localStorage.getItem('score')
    if (!bestScore || gGame.score < bestScore) {
        localStorage.setItem("score", gGame.score);
    }
}

function getBestScore() {
    const bestScore = localStorage.getItem('score')
    const elBestScore = document.querySelector('.best-score')
    elBestScore.innerText = `Best time: ${bestScore} seconeds`
}

//Full Expand
function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var elNegsCell = getElCell(i, j)
            if (!board[i][j].isShown && !board.isMine) cellClicked(elNegsCell, i, j)
        }
    }
}

//Safe Click
function safeClick() {
    if (!gGame.safeClickCount) return
    gGame.safeClickCount--
    var randCell = getRandomCell()
    const elRandCell = getElCell(randCell.i, randCell.j)
    elRandCell.classList.add('safe')
    const elButton = document.querySelector('.safe-click')
    elButton.innerText = `Safe Click \n${gGame.safeClickCount} clicks left`
    setTimeout(() => elRandCell.classList.remove('safe'), 1000)
    if(gGame.safeClickCount === 0) elButton.classList.add("unavailable")
}

//undo
function undo() {
    if (!gLastMoves.length) return
    var lastMove = gLastMoves.pop()
    gBoard[lastMove.i][lastMove.j].isShown = false;
    var elLastMoveCell = getElCell(lastMove.i, lastMove.j)
    elLastMoveCell.classList.remove("shown")
}

//Seven BOOM
function sevenBoom() {
    init()
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (currCell.id % 7 === 0 || Number.isInteger(currCell.id / 7)) gBoard[i][j].isMine = true
            else gBoard[i][j].isMine = false
        }
    }
    renderBoard(gBoard)
}

//Dark Mode
function changeTheme() {
    gIsDark = !gIsDark
    const elBody = document.body;
    const elBtn = document.querySelector('.theme')
    elBtn.innerText = (gIsDark) ? '☀️' : '🌙'
    elBody.classList.toggle("dark-mode");
}

//Mega Hint
var megaHintCords = []
function megaHint() {
    if (!gGame.megaHintCount) return
    gGame.isMega = true
    if (megaHintCords.length === 2) {
        revealMegaHint(megaHintCords)
        setTimeout(revealMegaHint, 1000, megaHintCords)
        gGame.isMega = false
        gGame.megaHintCount--
        const elMineExtBtn = document.querySelector(".mega-hint")
        elMineExtBtn.classList.add("unavailable")
    }
}
function revealMegaHint(cords) {
    for (var i = cords[0].i; i <= cords[1].i; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cords[0].j; j <= cords[1].j; j++) {
            var elNextCell = getElCell(i, j)
            elNextCell.classList.toggle('shown')
        }
    }
}

//Mine Exterminator

var gDeletedMines = []
function mineExterminator() {
    if (!gGame.mineExtCount) return
    while (gDeletedMines.length < 3) {
        var mine = getRandomMine()
        if (gDeletedMines.includes(mine) || !mine) continue
        gDeletedMines.push(mine)
    }
    for (var i = 0; i < gDeletedMines.length - 1; i++) {
        var idxI = gDeletedMines[i].i
        var idxJ = gDeletedMines[i].j
        gBoard[idxI][idxJ].isMine = false
    }
    updateBoard()
    gGame.mineExtCount--
    const elMineExtBtn = document.querySelector(".mine-ext")
    elMineExtBtn.classList.add("unavailable")
}
function updateBoard() {
    for (var k = 0; k < gDeletedMines.length - 1; k++) {
        var mineI = gDeletedMines[k].i
        var mineJ = gDeletedMines[k].j
        for (var i = mineI - 1; i <= mineI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = mineJ - 1; j <= mineJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue
                //model
                gBoard[i][j].minesAroundCount = minesNegsCount(gBoard, i, j)
                //dom
                var elMine = getElCell(i, j)
                elMine.innerText = gBoard[i][j].isMine ? '💣' : gBoard[i][j].minesAroundCount || ' '
            }
        }
    }
}

