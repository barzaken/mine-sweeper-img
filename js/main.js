'use strict'


window.addEventListener("contextmenu", e => e.preventDefault());


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    livesCount: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    interval: null
}

var gBoard
var gMines = []

function init() {
    gGame.isOn = false
    gGame.livesCount = 3
    gGame.shownCount = 0
    gGame.markedCount = 0
    clearInterval(gGame.interval)
    gBoard = buildBoard()
    gBoard = setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}



function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    for(var i = 0; i < gLevel.MINES; i++){
        var randIdxI = getRandomInt(0,gLevel.SIZE-1)
        var randIdxJ = getRandomInt(0,gLevel.SIZE-1)
        board[randIdxI][randIdxJ].isMine = true
        gMines.push({i:randIdxI,j:randIdxJ})
    }
    return board
}




function cellClicked(elCell, i, j) {
    if(gBoard[i][j].isShown) return
    if (gBoard[i][j].isMine) {
        gGame.livesCount--
        // return
    }
    gGame.shownCount++
    elCell.innerHTML = (gBoard[i][j].isMine) ? "💣" : gBoard[i][j].minesAroundCount
    gBoard[i][j].isShown = true
    elCell.classList.add('shown')
    checkGameOver()
    if(!gGame.isOn) {
        gGame.isOn = true
        startTimer()
    }
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)
    }
}


function checkGameOver() {
    if (gGame.livesCount === 0){
        gameOver()
        return
    }
    var gameCells = (gLevel.SIZE ** 2) - gLevel.MINES
    if(gGame.shownCount === gameCells && isAllMinesMarked()) console.log("over")
    
}



function gameOver() {
    console.log('its over')
    gGame.isOn = false
    clearInterval(gGame.interval)
}


function cellMarked(elCell,i,j) {
    if(gBoard[i][j].isShown) return
    gGame.markedCount++
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    elCell.classList.toggle('mark')
}


function expandShown(board, elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var elNextCell = getElCell(i, j)
            if (!board[i][j].isShown) cellClicked(elNextCell, i, j)
        }
    }
}



