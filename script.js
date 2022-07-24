const formSelector = document.querySelector(".form");
const message = document.querySelector(".messages");
const tiles = document.querySelectorAll(".tiles");

const newGameBtn = document.querySelector("#newGame");
const cancelBtn = document.querySelector("#cancel");

const startGameBtn = document.querySelector("#startGame");
const restartGameBtn = document.querySelector("#restartGame");

function clearBoard () {
    Array.from(tiles).forEach(
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

                const checkWin = ()=>{
                    let win = false;
                    for (winArray of winBoard) {
                        let a = winArray[0];
                        let b = winArray[1];
                        let c = winArray[2];
                        if ( board[a] == "" || board[b] == "" || board[c] == "") {
                            continue;
                        }
                        else if ( board[a] == board[b] && board[b] == board[c] ) {
                            win = "win";
                            break;
                        }
                    }
                    if( !board.includes("") ){
                        return "tie";
                    }
                    return win;
                };
        
                const markBoard = (player,position)=>{
                    board[position] = player.getMark();
                    return checkWin();
                };
        
                return {markBoard,initBoard};
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
            if (currentPlayer) {
                currentPlayer = currentPlayer == PlayerOne ? PlayerTwo : PlayerOne;
            }else currentPlayer = PlayerOne;
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
            } else {
                announce("tie");
            }
            gameOn = false;
        }

        const restartGame =  ()=>{
            initGame();
        }

        return {
            getGameStatus,newGame,restartGame,isProfileSet,markTile,
            getPlayerName,getPlayerMark,getPlayerColor
        };
    }
)();