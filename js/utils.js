'use strict'

console.log("connected")

function getElCell(i, j) {
    var elCell = document.getElementById(`cell-${i}-${j}`)
    return elCell
}


function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j]
            // var className = (i + j) % 2 ? 'black' : 'white'
            var className = 'cell'
            var innerTxt = (cell.isMine) ? "💣" : cell.minesAroundCount
            var tdId = `cell-${i}-${j}`
            strHtml += `\t<td id="${tdId}" oncontextmenu="cellMarked(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}"></td>\n`
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function setLevel(x) {
    if (x === 0) gLevel.SIZE = 4, gLevel.MINES = 2
    if (x === 1) gLevel.SIZE = 8, gLevel.MINES = 14
    if (x === 2) gLevel.SIZE = 12, gLevel.MINES = 32
    init()
}

function startTimer() {
    var timer = document.querySelector('.timer')
    var start = Date.now()
    gGame.interval = setInterval(function () {
      var currTs = Date.now()
      var secs = parseInt((currTs - start) / 1000)
      secs = '00' + secs
      secs = secs.substring(secs.length - 3, secs.length)
      timer.innerText = `${secs}`
    }, 100)
  }

  function isAllMinesMarked(){
    var counter
    for(var i = 0; i < gMines.length; i++){
        var iIdx = gMines[i].i
        var jIdx = gMines[i].j
        if(gBoard[iIdx][jIdx].isMarked) counter++
    }
    return counter === gMines.length
}