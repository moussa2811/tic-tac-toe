const formSelector = document.querySelector(".form");
const message = document.querySelector(".messages");
const gameDiv = document.querySelector(".gameBoard");
const tiles = Array.from(document.querySelectorAll(".tile"));

const newGameBtn = document.querySelector("#newGame");
const cancelBtn = document.querySelector("#cancel");

const startGameBtn = document.querySelector("#startGame");
const restartGameBtn = document.querySelector("#restartGame");

function clearBoard () {
    tiles.forEach(
        (tile)=>{
            if(tile.classList.contains("played")){
                tile.classList.remove("played");
                tile.style.backgroundColor = "";
                tile.innerText = "";
            }
        }
    )
}

function startGame(params) {
    formSelector.classList.remove("flex");
    clearBoard();
    Game.newGame();
    announce("turn");
}

function restartGame() {
    if (Game.isProfileSet()) {
        clearBoard();
        Game.restartGame();
        announce("turn");
    } else {
        announce("restart");
    }
}

function announce(type) {
    switch (type) {
        case "turn":
            message.innerText = `${Game.getPlayerName()}, it's your turn.`;
            break;
        case "win":
            message.innerText = `Congrats to ${Game.getPlayerName()}, you won the game.`;
            break;
        case "tie":
            message.innerText = "No winner this time, click restart to restart the game.";
            break;
        case "change":
            message.innerText = `${Game.getPlayerName()} please choose another tile.`;
            break;
        case "nogame":
            message.innerText = "Please start a new game.";
            break;
        case "restart":
            message.innerText = "Please click on new game and set playes' settings.";
            break;
    }
}

function markTile(target) {
    if (Game.getGameStatus()) {
        if (!target.classList.contains("played")) {
            target.classList.add("played");
            target.innerText = Game.getPlayerMark();
            target.style.backgroundColor = Game.getPlayerColor();

            let position = target.getAttribute("data-position");
            Game.markTile(position);
            if (Game.getGameStatus()) {
                announce("turn");
            }
        }else{
            announce("change");
        }
    }else{
        announce("nogame");
    }
}

newGameBtn.addEventListener("click",
    ()=>{
        formSelector.classList.add("flex");
    }
)

cancelBtn.addEventListener("click",
    (event)=>{
        event.preventDefault();
        formSelector.classList.remove("flex");
    }
)

startGameBtn.addEventListener("click",
    (event)=>{
        event.preventDefault();
        startGame();
    }
)

restartGameBtn.addEventListener("click", restartGame)

Array.from(tiles).forEach(
    (tile)=>{
        tile.addEventListener("click",
            (event)=>{
                markTile(event.target);
            }
        )
    }
)

/****************************************************************************
 ****************************************************************************
 ****************************************************************************/

const Game = (
    function(){

        /* GameBoard Module */
        const GameBoard = (
            function(){
                const board = [];
                const winBoard = [
                    [0,1,2],
                    [3,4,5],
                    [6,7,8],
                    [0,3,6],
                    [1,4,7],
                    [2,5,8],
                    [0,4,8],
                    [2,4,6],
                ];

                const initBoard = ()=>{
                    for (let i = 0; i < 9; i++) {
                        board[i] = "";
                    }
                }

                const checkWin = (boardTocheck)=>{
                    const boardCheck = boardTocheck;
                    for (winArray of winBoard) {
                        let a = winArray[0];
                        let b = winArray[1];
                        let c = winArray[2];
                        if ( boardCheck[a] == "" || boardCheck[b] == "" || boardCheck[c] == "") {
                            continue;
                        }
                        if ( boardCheck[a] == boardCheck[b] && boardCheck[b] == boardCheck[c] ) {
                            return "win";
                        }
                    }
                    if( !boardCheck.includes("") ){
                        return "tie";
                    }
                    return false;
                };
        
                const markBoard = (player,position)=>{
                    board[position] = player.getMark();
                    return checkWin(board);
                };
        
                return {initBoard,board,winBoard,markBoard,checkWin};
            }
        )();

        /*Player Factory Function*/
        const Player = function(pName,pMark,boolBot,pColor){
            let name = pName;
            let mark = pMark;
            let isBot = boolBot;
            let color = pColor;
            const getName = ()=> name;
            const getMark = ()=> mark;
            const checkBot = ()=> isBot;
            const getColor = ()=> color;
            return {getName,getMark,checkBot,getColor};
        }

        /*Variables Initialisation*/
        let PlayerOne = undefined;
        let PlayerTwo = undefined;
        let settings = false;
        let currentPlayer = false;

        let win = false;
        let gameOn = false;

        const isProfileSet = ()=> settings;
        const getGameStatus = ()=> gameOn;

        const getPlayerName = ()=> currentPlayer.getName();
        const getPlayerMark = ()=> currentPlayer.getMark();
        const getPlayerColor = ()=> currentPlayer.getColor();

        const initGame = ()=>{
            currentPlayer = false;
            win = false;
            gameOn = true;
            GameBoard.initBoard();
            setCurrentPlayer();
        }

        const newGame = ()=>{
            let playerOneName = document.querySelector("#p1name").value.trim();
            let playerOneBot = document.querySelector("#isP1Bot").checked;
            let playerOneColor = document.querySelector("#p1color").value;
            PlayerOne = Player(playerOneName,"X",playerOneBot,playerOneColor);
    
            let playerTwoName = document.querySelector("#p2name").value.trim();
            let playerTwoBot = document.querySelector("#isP2Bot").checked;
            let playerTwoColor = document.querySelector("#p2color").value;
            PlayerTwo = Player(playerTwoName,"O",playerTwoBot,playerTwoColor);
            settings = true;
            initGame();
        }

        const setCurrentPlayer = ()=>{

            if (gameDiv.classList.contains("cumputerPlaying")) {
                gameDiv.classList.remove("cumputerPlaying");
            }

            if (currentPlayer) {
                currentPlayer = currentPlayer == PlayerOne ? PlayerTwo : PlayerOne;
            }else currentPlayer = PlayerOne;

            if (currentPlayer.checkBot()) {
                gameDiv.classList.add("cumputerPlaying");
                setTimeout( 
                    ()=>{
                        computerPlay( currentPlayer.getMark() )
                    }, 500 
                );
            }

        }

        const markTile = (position)=>{
            win = GameBoard.markBoard(currentPlayer,position);
            if (!win) {
                setCurrentPlayer();
            }else{
                announceGameEnd();
            }
        };

        const announceGameEnd = ()=>{
            if (win == "win") {
                announce("win");
            }else{
                announce("tie");
            }
            gameOn = false;
        }

        const restartGame =  ()=>{
            initGame();
        }

        const computerPlay = (mark)=>{

            let position = getComputerPosition(mark);
            let target = document.querySelector(`.tile[data-position="${position}"]`);
            target.classList.add("played");
            target.innerText = mark;
            target.style.backgroundColor = Game.getPlayerColor();

            Game.markTile(position);
            if (Game.getGameStatus()) {
                announce("turn");
            }

        }

        const getComputerPosition = (mark)=>{
            let board = GameBoard.board;
            let playerMark = mark;
            let oppositeMark = playerMark == "X" ? "O" : "X";

            //if board empty return first tile position
            if ( !( board.includes("X") || board.includes("O") ) ) {
                return 0;
            }

            //get empty tiles
            let emptyTiles = [];
            for (let i = 0; i < board.length; i++) {
                if (board[i] == "") {
                    emptyTiles.push(i);
                }
            }

            //if only one tile left return its position
            if (emptyTiles.length == 1) {
                return emptyTiles[0];
            }

            //if only one tile played return position 4 if available else fist empty tile posiyion
            if ( emptyTiles.length == board.length -1 ) {
                return board[4] == "" ? 4 : emptyTiles[0];
            }

            //check win or lost tile position in emptyTiles
            const tempBoard = board;
            for (let position of emptyTiles) {

                //if player win with this position return position
                tempBoard[position] = playerMark;
                if ( GameBoard.checkWin(tempBoard) == "win") {
                    return position;
                }

                //else if opposite win with this position return position to avoid
                else{
                    tempBoard[position] = oppositeMark;
                    if ( GameBoard.checkWin(tempBoard) == "win") {
                        return position;
                    }
                }


                //else reinit tempBoard to default and continue with another empty Tile
                tempBoard[position] = "";
            }

            //if no win or lost this time with empty positions check for good positions
            //get player's positions in the board
            const playerInBoard = [];
            for (let i = 0; i < board.length; i++) {
                if (board[i] == playerMark) {
                    playerInBoard.push(i);
                }

            }
            //get winnigBoard and search for best positions
            let winBoard = GameBoard.winBoard;
            let bestPositions = [];
            for (let position of playerInBoard) {

                //check player position in board inside winning lines
                for (let line of winBoard) {
                    //get position inside line
                    let positionInLine = line.indexOf(position);

                    //check empty positions in line to get for best position
                    for (let i = 0; i < line.length; i++) {
                        if (i == positionInLine) {
                            continue;
                        }

                        //if position not empty so line will be incomplete check another line 
                        if ( !emptyTiles.includes( line[i] ) ) {
                            break;
                        }

                        //insert position in array 
                        bestPositions.push( line[i] );
                    }

                    // check  if the two other positions in line are free and get fisrt free position
                    // else pass to another line
                    if (bestPositions.length == 2) {
                        return bestPositions[0];
                    }

                    // init bestpositions before pass to another line
                    bestPositions = [];
                }

                //init bestpositions before pass to another positon
                bestPositions = [];
            }

            //else return fist empty tile
            return emptyTiles[0];
        };

        return {
            getGameStatus,newGame,restartGame,isProfileSet,markTile,
            getPlayerName,getPlayerMark,getPlayerColor
        };
    }
)();