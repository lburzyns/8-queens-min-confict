import './QueensApp.css';
import {Chessboard} from "react-chessboard";
import {useState} from "react";

function QueensApp() {
    //stores messages about all moves performed by algorithm
    const [logEntries, setLogEntries] = useState([]);
    //position of all pieces for display with react-chessboard
    const [boardPositions, setBoardPositions] = useState({});
    let _logEntries = [];
    let logCount = 0;


    const LogEntry = props => <p>{props.message}</p>

    const appendLog = (message) => {
        _logEntries = [..._logEntries, <LogEntry message={message} key={logCount++}/>];
    }

    const indexToLetterMap = {
        0: "a",
        1: "b",
        2: "c",
        3: "d",
        4: "e",
        5: "f",
        6: "g",
        7: "h"
    }
    const solve = () => {
        let queenPositions = initBoard();
        let unchanged = [];
        let steps = 0;
        //reset move log
        _logEntries = [];

        initBoard(queenPositions)

        while (anyQueenThreatened(queenPositions)) {
            steps++;
            // there can't be more than 8 conflicts as we have that many queens
            let leastThreatsCount = 9;
            const selectedQueen = pickRandomQueen(queenPositions);

            const minConflictPosition = {x: -1, y: -1};

            //we remove the selected queen from the board to avoid counting current position as threatening new
            const otherQueensPositions = queenPositions.filter((pos) => {
                return selectedQueen.x != pos.x
            });

            let i;
            for (i = 0; i < 8; i++) {
                const threatsCount = getThreatCount({x: selectedQueen.x, y: i}, otherQueensPositions);
                console.log("x:" + selectedQueen.x + " y:" + i + " threats: " + threatsCount)
                if (threatsCount < leastThreatsCount) {
                    minConflictPosition.x = selectedQueen.x;
                    minConflictPosition.y = i;
                    leastThreatsCount = threatsCount;
                }
                //random break on tie
                if (threatsCount == leastThreatsCount) {
                    if (Math.random() < 0.5) {
                        minConflictPosition.x = selectedQueen.x;
                        minConflictPosition.y = i;
                    }
                }
            }
            appendLog("Hetman z " + indexToLetterMap[selectedQueen.x] + selectedQueen.y + " na " +
                indexToLetterMap[minConflictPosition.x] + minConflictPosition.y + ", konfliktów: " + leastThreatsCount
            );

            //Store a log of unchanged position in case we end up in a local minimum
            if(selectedQueen.x === minConflictPosition.x && selectedQueen.y === minConflictPosition.y){
                if(!unchanged.some((pos)=>{
                    return pos.x === selectedQueen.x && pos.y === selectedQueen.y;
                })) {
                    unchanged.push({x: selectedQueen.x, y: selectedQueen.y});
                } else {
                    unchanged = [];
                }
            }
            queenPositions = [...otherQueensPositions, minConflictPosition];
            if(unchanged.length === 8){
                appendLog("Algorytm utknął w lokalnym minimum, reinicjacja planszy");
                queenPositions = initBoard();
                unchanged = [];
            }
        }

        appendLog("Wykonano kroków: " + steps);
        //render solution
        setBoardPositions(convertQueenPositions(queenPositions));
        setLogEntries(_logEntries);

    }

    const initBoard = () => {
        let i;

        let queenPositions = [];
        //place queens at random positions
        for (i = 0; i < 8; i++) {
            let randomRow = Math.floor(Math.random() * 8);
            appendLog("Hetman na " + indexToLetterMap[i] + (randomRow + 1));
            queenPositions.push({x: i, y: randomRow})
        }
        return queenPositions;
    }

    const anyQueenThreatened = (queenPositions) => {
        return queenPositions.some((pos) => { return isThreatened(pos, queenPositions) });
    }

    const isThreatened = (queen, queenPositions) => {
        return isThreatenedVertically(queen, queenPositions)
            || isThreatenedHorizontally(queen, queenPositions)
            || isThreatenedDiagonally(queen, queenPositions);
    }

    //should never happen since we place each queen in a different column and only move to a different row
    const isThreatenedVertically = (queen, queenPositions) => {
        return queenPositions.some((pos) => {
            return (pos.x != queen.x || pos.y != queen.y) && queen.y == pos.y
        })
    }

    const isThreatenedHorizontally = (queen, queenPositions) => {
        return queenPositions.some((pos) => {
            return (pos.x != queen.x || pos.y != queen.y) && queen.y == pos.y;
        })
    }

    const isThreatenedDiagonally = (queen, queenPositions) => {
        return queenPositions.some((pos) => {
            return (pos.x != queen.x || pos.y != queen.y) && Math.abs(queen.x - pos.x) == Math.abs(queen.y - pos.y);
        })
    }

    const getThreatCount = (queen, queenPositions) => {
        let count = 0;
        queenPositions.forEach((pos) => {
            if((pos.x != queen.x || pos.y != queen.y) && queen.y == pos.y){
                count++;
            }
            if((pos.x != queen.x || pos.y != queen.y) && queen.y == pos.y){
                count++;
            }
            if((pos.x != queen.x || pos.y != queen.y) && Math.abs(queen.x - pos.x) == Math.abs(queen.y - pos.y)){
                count++;
            }

        })
        return count;
    }

    const pickRandomQueen = (queenPositions) => {
        return queenPositions[Math.floor(Math.random() * queenPositions.length)]
    }


    //translates array into react-chessboard BoardPositions object
    const convertQueenPositions = (queenPositions) => {
        const newPositions = {};

        queenPositions.forEach((pos) => {
            newPositions[indexToLetterMap[pos.x] + (pos.y + 1)] = "wQ";
        })

        return newPositions;
    }

    return (
        <div className="AppWrapper">
            <div className={"header"}>
                <h2>Problem 8 hetmanów - implementacja MinConflict</h2>
            </div>
            <div className={"wrapper"}>
                <div className={"chessboard-container"}>
                    <Chessboard id="BasicBoard"
                                arePiecesDraggable={false}
                                areArrowsAllowed={false}
                                onPieceClick={() => null}
                                position={boardPositions}
                    />
                </div>
                <div className={"move-log"}>
                    {logEntries}
                </div>
            </div>
            <div className={"footer"}>
                <div className={"button"} onClick={() => solve()}>Nowe rozwiązanie</div>
            </div>
        </div>
    );
}

export default QueensApp;
