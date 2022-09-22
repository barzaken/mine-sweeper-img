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
    hintsCount: 3,
    interval: null,
    isWin: false,
    isHint: false,
    safeClickCount:3,
    isDark:false,
    score:0
}

var gBoard


function init() {
    showLivesLeft()
    clearInterval(gGame.interval)
    gGame.isOn = false
    gGame.isWin = false
    gGame.isHint = false
    gGame.livesCount = 3
    gGame.hintsCount = 3
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.safeClickCount = 3
    gGame.score = 0
    gBoard = buildBoard()
    gBoard = setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    getBestScore()
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
    for(var i = 0; i < gLevel.MINES; i++){
        var randIdxI = getRandomInt(0,gLevel.SIZE-1)
        var randIdxJ = getRandomInt(0,gLevel.SIZE-1)
        board[randIdxI][randIdxJ].isMine = true
    }
    return board
}




function cellClicked(elCell, i, j) {
    if(gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    if(!gGame.isOn && gGame.livesCount === 3) {
        gGame.isOn = true
        startTimer()
    }
    if(!gGame.isOn) return
    if(gGame.isHint){
        gGame.isHint = false
        cellClicked(elCell,i,j)
        console.log('show negs')
        revealCells(elCell,i,j)
    }

    //model
    gBoard[i][j].isShown = true
    gGame.shownCount++
    //DOM
    elCell.classList.add('shown')
    elCell.innerHTML = (gBoard[i][j].isMine) ? "💣" : gBoard[i][j].minesAroundCount || ' '
    checkGameOver()
    if (gBoard[i][j].isMine) {
        gGame.livesCount--
        changeEmoji("😔")
        showLivesLeft()
        return
    }
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)
    }
}


function hintClicked(idx){
    gGame.isHint = true
    gGame.hintsCount--
    const elHints = document.querySelectorAll('.hints button')
    elHints[idx].classList.add('used-hint')
}

function darkMode(){
    gGame.isDark = !gGame.isDark
    const elBody = document.body;
    const elBtn = document.querySelector('.mode-btn')
    elBtn.innerText = (gGame.isDark) ? '☀️' : '🌙' 
    elBody.classList.toggle("dark-mode");
}

function sevenBoom(){
    init()
    for(var i = 0; i < gLevel.SIZE; i++){
        for(var j=0; j < gLevel.SIZE; j++){
            var currCell = gBoard[i][j]
            if(currCell.id %7 === 0 || Number.isInteger(currCell.id/7)) gBoard[i][j].isMine = true
            else gBoard[i][j].isMine = false 
        }
    }
    renderBoard(gBoard)
}


function safeClick(){
    if(!gGame.safeClickCount) return
    gGame.safeClickCount--
    const safeCells = []
    for(var i = 0; i < gBoard.length; i++){
        for(var j =0; j<gBoard[i].length; j++){
            if(!gBoard[i][j].isMine && !gBoard[i][j].isShown) safeCells.push({i,j})
        }
    }
    const elSpan = document.querySelector('.controls span')
    elSpan.innerText = gGame.safeClickCount + ' Clicks Available'
    const randIdx = getRandomInt(0,safeCells.length-1)
    const randCell = safeCells[randIdx]
    const elRandCell = getElCell(randCell.i,randCell.j)
    elRandCell.classList.add('mark')
    setTimeout(() => elRandCell.classList.remove('mark'),1000)
} 



function checkGameOver() {
    if (gGame.livesCount === 0){
        gameOver()
        return
    }
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[i].length; j++){
            if(gBoard[i][j].isMine){
                if(gBoard[i][j].isShown || gBoard[i][j].isMarked) continue
                else return false
            }
            if(!gBoard[i][j].isShown) return false
        }
    }
    gGame.isWin = true
    gameOver()
}

function showLivesLeft(){
    if(gGame.livesCount <= 0){
        gameOver()
        return
    } 
    var elLives = document.querySelector(".lives")
    elLives.innerText = "❤️".repeat(gGame.livesCount)
}

function gameOver() {
    saveScore()
    gGame.isOn = false
    clearInterval(gGame.interval)
    if(gGame.isWin){
        changeEmoji('😎') 
    } else changeEmoji('😔')
    showModal()
}


function cellMarked(elCell,i,j) {
    if(gBoard[i][j].isShown) return
    if(!gGame.isOn) {
        gGame.isOn = true
        startTimer()
    }
    gGame.markedCount++
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    elCell.classList.toggle('mark')
    checkGameOver()
}


function expandShown(board, elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var elNextCell = getElCell(i, j)
            if (!board[i][j].isShown && !board.isMine) cellClicked(elNextCell, i, j)
        }
    }
}

function revealCells(elCell, rowIdx, colIdx,isShown) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var elNextCell = getElCell(i, j)
            var str = (isShown) ? '' : gBoard[i][j].minesAroundCount
            elNextCell.innerText = str
        }
    }
    setTimeout(revealCells,1000,elCell,rowIdx,colIdx,true)
}





