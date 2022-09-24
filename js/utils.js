'use strict'


function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            var className = 'cell'
            var innerTxt = (cell.isMine) ? "💣" : cell.minesAroundCount
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

function getElCell(i, j) {
    const elCell = document.getElementById(`cell-${i}-${j}`)
    return elCell
}

function setLevel(x) {
    if (x === 0) gLevel.SIZE = 4, gLevel.MINES = 2
    if (x === 1) gLevel.SIZE = 8, gLevel.MINES = 14
    if (x === 2) gLevel.SIZE = 12, gLevel.MINES = 32
    init()
}
function changeEmoji(emoji){
    const elEmoji = document.querySelector(".emoji")
    elEmoji.innerText = emoji
    setTimeout(changeEmoji,3000,'😀')
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function startTimer() {
    const timer = document.querySelector('.timer')
    const start = Date.now()
    gGame.interval = setInterval(function () {
      var currTs = Date.now()
      var secs = parseInt((currTs - start) / 1000)
      secs = '00' + secs
      secs = secs.substring(secs.length - 3, secs.length)
      gGame.score = +secs
      timer.innerText = `${secs}`
    }, 100)
  
}

function saveScore(){
    var highestScore = localStorage.getItem('score')
    if(!highestScore ||  gGame.score < highestScore){
         localStorage.setItem("score", gGame.score);
    }
}

function showModal(){
    const elModal = document.querySelector(".modal")
    elModal.classList.remove('hide')
    elModal.innerText = (gGame.isWin) ? 'You Won !' : 'You Lost'
}

function hideModal(){
    const elModal = document.querySelector(".modal")
    elModal.classList.add('hide')
}

function getBestScore(){
    const bestScore = localStorage.getItem('score')
    const elBestScore = document.querySelector('.best-score')
    elBestScore.innerText = `Best time: ${bestScore} seconeds`
}

function darkMode(){
    gGame.isDark = !gGame.isDark
    const elBody = document.body;
    const elBtn = document.querySelector('.mode-btn')
    elBtn.innerText = (gGame.isDark) ? '☀️' : '🌙' 
    elBody.classList.toggle("dark-mode");
}