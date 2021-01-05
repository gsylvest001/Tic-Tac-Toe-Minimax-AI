const cells = document.querySelectorAll('[data-cell]')
let player1 = document.getElementById('player1');
let player2 = document.getElementById('player2');
let currentTurnDisplay = document.getElementById('turnDisplay');
let board = document.getElementById('board');
let playButton = document.getElementById('playButton');
let level = document.getElementById('difficulty');

//used for minimax algorithm
let maxDepth = 2;
let currentMaxDepth = 0;
let currentBestAction = 0;

//setting default player
let currentPlayer = player1.value;
let currentPiece = "circle";

let gameStatus = "inProgress";

setupGame();

//method to setup game
function setupGame() {

    //adding event listener for difficulty level
    level.addEventListener('change', resetGame);

    //adding event listeners for each player selection dropdown
    player1.addEventListener('change', resetGame);
    player2.addEventListener('change', resetGame);

    //adding listeners for each cell
    cells.forEach(cell => {
        cell.addEventListener('click', handleClick, { once: true })
    })

    refreshBoardHover();
   
}

function resetGame() {
    
    //looping through all cells and reseting them 
    cells.forEach(cell => {
        cell.classList.remove('x');
        cell.classList.remove('circle');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });

    currentPiece = "circle"
    currentPlayer = player1.value;
    refreshBoardHover()
    currentTurnDisplay.innerHTML = "Player 1's Turn";
    gameStatus = "inProgress";

    //settting up max depth(used in minimax/alphabeta algorithm) according to difficulty level set by user
    //basically number of steps to look ahead
    maxDepth = level.value == "easy" ? 2 : level.value == "medium" ? 3 : 9;

    //if computer plays first
    if(player1.value == "computerAI"){
        doComputerAction();
    }

}

function handleClick(e) {

    if(gameStatus == "inProgress" && currentPlayer == "human"){ 

        let cell = e.target;

        //adding player piece onto board
        cell.classList.add(currentPiece);

        //checking new game state status
        let status = statusUpdate(cells);

        if(status != "inProgress"){
            gameStatus = "gameOver";

            //displaying who won
            if(status == "draw"){
                currentTurnDisplay.innerHTML = "Game Drawed!";
            }else if(currentPiece == "x"){
                currentTurnDisplay.innerHTML = "Player 2 Won!";
            }else{
                currentTurnDisplay.innerHTML = "Player 1 Won!"
            }
        }else{

            //updating display for whose turn it is
            if (currentTurnDisplay.innerHTML === "Player 1's Turn") {
                currentTurnDisplay.innerHTML = "Player 2's Turn";
            } else {
                currentTurnDisplay.innerHTML = "Player 1's Turn";
            }
            
            //switching player
            currentPlayer = currentPlayer == player1.value ? player2.value : player1.value;

            //switching player piece
            currentPiece = currentPiece == "x" ? "circle" : "x";

            //swaping board hover display piece
            refreshBoardHover() 

            //if new current player turn is computer
            if(currentPlayer == "computerAI"){
                doComputerAction();
            }
        }

        
    }else{
        //removing click and adding new listener
        let cell = e.target;
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });

    }
}

//method to get available cells on tic tac toe board
function getAvailableCells(state){

    //geting available actions
    let availableActions = [];
    for(let i = 0; i < state.length; i++){
        if(state[i].className == "cell"){
            availableActions.push(i);
        }
    }

    return availableActions;

}

function terminal(state){
    if (statusUpdate(state) != "inProgress"){
        return true;
    }
    else {
        return false;
    }
}

function evaluateState(state){
    let gameStatus = statusUpdate(state);

    if(gameStatus == "draw") { 
        return 0;
    }else if( (gameStatus == "cell x" && currentPiece == "x") || (gameStatus == "cell circle" && currentPiece == "circle") ){
        return 10000;
    }else if( (gameStatus == "cell circle" && currentPiece == "x") || (gameStatus == "cell x" && currentPiece == "circle") ){
        return -10000;
    }else{
        return 1;
    }

}

function AlphaBeta(state, alpha, beta, depth, max) {

    if (terminal(state) || depth >= currentMaxDepth){
        return evaluateState(state);
    }

    let availableActions = getAvailableCells(state);

    for (let i = 0; i < availableActions.length; ++i){
        //copying state
        let child = state;

        //doing Action
        let action = availableActions[i];
        if(max){
            child[action].classList.add(currentPiece);
        }else{ // min
            let opponentPiece = currentPiece == "x" ? "circle" : "x";
            child[action].classList.add(opponentPiece);
        }

        let v = AlphaBeta(child, alpha, beta, depth + 1, !max);

        //removing action to prevent move from actually being done on board
        if(max){
            child[action].classList.remove(currentPiece);
        }else{
            let opponentPiece = currentPiece == "x" ? "circle" : "x";
            child[action].classList.remove(opponentPiece);
        }

        if (max && v > alpha){
            alpha = v
            if (depth == 0){
                currentBestAction = availableActions[i];
            }
        }
        if (!max && v < beta){
            beta = v
        }
        if (alpha >= beta){
            break;
        }
    }

    return max ? alpha : beta
}


function doComputerAction(){

    //finding best action
    let bestAction = null;

    for (var d=1; d <= maxDepth; d++){
        currentMaxDepth = d;
        try{
            AlphaBeta(cells, -Infinity, Infinity, 0, true);
            bestAction = currentBestAction;
        }
        catch(err){
            console.log(err);
            break;
        }
    }

    //setting cell
    cells[bestAction].classList.add(currentPiece);

    //checking status
    let status = statusUpdate(cells);

    if(status != "inProgress"){
        gameStatus = "gameOver";

        //displaying who won
        if(status == "draw"){
            currentTurnDisplay.innerHTML = "Game Drawed!";
        }else if(currentPiece == "x"){
            currentTurnDisplay.innerHTML = "Player 2 Won!";
        }else{
            currentTurnDisplay.innerHTML = "Player 1 Won!"
        }

    }else{

        //updating display for whose turn it is
        if (currentTurnDisplay.innerHTML === "Player 1's Turn") {
            currentTurnDisplay.innerHTML = "Player 2's Turn";
        } else {
            currentTurnDisplay.innerHTML = "Player 1's Turn";
        }

        //switching player
        currentPlayer = currentPlayer == player1.value ? player2.value : player1.value;

        //switching player piece
        currentPiece = currentPiece == "x" ? "circle" : "x";

        //swaping board hover display piece
        refreshBoardHover();

        //if new current player turn is computer
        if(currentPlayer == "computerAI"){
            doComputerAction();
        }
    }

}

//checking if someone has won or game drawn
function statusUpdate(state){

    //looping through top row 
    for(let i = 0; i < 3; i++){
        let playerObject = state[i].className;

        if(playerObject != "cell"){   
            
            //checking for vertical wins
            let vcheck1 = state[i + 3].className == playerObject ? true : false;
            let vcheck2 = state[i + 6].className == playerObject ? true : false;

            //checking for diagonal 1 wins
            let dcheck1 = i + 4 < 9 ? state[i + 4].className == playerObject ? true : false : false;
            let dcheck2 = i + 8 < 9 ? state[i + 8].className == playerObject ? true : false : false;

            if( (vcheck1 && vcheck2) || (dcheck1 && dcheck2) ){ 
                //win
                return playerObject;
            }
        }
    }

    //looping through first column
    for(let i = 0; i < 7; i+=3){

        let playerObject = state[i].className;

        if(playerObject != "cell"){  
            //checking for horizontal wins
            let hcheck1 = state[i + 1].className == playerObject ? true : false;
            let hcheck2 = state[i + 2].className == playerObject ? true : false;

            //checking for diagonal wins
            let dcheck1 = i - 2 > 0 ? state[i - 2].className == playerObject ? true : false : false;
            let dcheck2 = i - 4 > 0 ? state[i - 4].className == playerObject ? true : false : false;

            if( (hcheck1 && hcheck2) || (dcheck1 && dcheck2) ){
                //win
                return playerObject;
            }
        }
    }

    let emptyCells = 0;
    //checking for a draw
    state.forEach(cell => {
        if(cell.className == "cell"){
            emptyCells = emptyCells + 1;
        }
    });
    
    if(emptyCells == 0){
        return "draw";
    }else{
        return "inProgress";
    }

}

function refreshBoardHover() {
    board.classList.remove('x');
    board.classList.remove('circle');

    if(currentPiece == "circle"){
        board.classList.add('circle');
    }else{
        board.classList.add('x');
    }
}