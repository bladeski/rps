import { BehaviorSubject, timer } from "rxjs";

import { DomHelper } from "./helpers/DomHelper";
import GameState from "./enums/GameState.enum";
import Result from "./enums/Result.enum";
import Selection from "./enums/Selection.enum";

class App {
  private currentGameState: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.STANDBY);
  private opponentChoice: Selection | null = null;
  private playerChoice: Selection | null = null;
  private resultLookup: Result[][] = [
    [Result.DRAW, Result.LOSE, Result.WIN], // Rock
    [Result.WIN, Result.DRAW, Result.LOSE], // Paper
    [Result.LOSE, Result.WIN, Result.DRAW] // Scissors
  ];

  private score: number[] = [0, 0];

  constructor() {
    DomHelper.addEventListener('.play', 'click', this.onPlayClick.bind(this));
    DomHelper.addEventListener('.rock', 'click', this.onOptionClick.bind(this));
    DomHelper.addEventListener('.paper', 'click', this.onOptionClick.bind(this));
    DomHelper.addEventListener('.scissors', 'click', this.onOptionClick.bind(this));

    this.currentGameState.subscribe((state) => {
      switch (state) {
        case GameState.STANDBY:
          this.reset();
          break;
        case GameState.READY:
          this.startGame();
          break;
        case GameState.PLAYING:
          break;
        case GameState.FINISHED:
          this.showOpponentsChoice();
          break;
        case GameState.RESULTS:
          this.showResults();
          break;
        default:
          break;
      }
    });

    this.disableOptions();
  }

  private disableOptions(selectedOption?: Selection) {
    const buttons = document.querySelectorAll('button.game-option');
    buttons.forEach((button) => {
      if (!selectedOption || !button.classList.contains(`${Selection[selectedOption].toLowerCase()}`)) {
        (button as HTMLButtonElement).disabled = true;
      }
    });
  }

  private enableOptions() {
    const buttons = document.querySelectorAll('button.game-option');
    buttons.forEach((button) => {
      (button as HTMLButtonElement).disabled = false;
    });
  }

  private generateChoice(): Selection {
    return Math.floor(Math.random() * 3);
  }

  private getRoundResult(playerChoice: Selection, opponentChoice: Selection): Result {
    return this.resultLookup[playerChoice][opponentChoice];
  }

  private onOptionClick(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const playerChoice = typeof target.dataset.choice === 'string'
      ? parseInt(target.dataset.choice, 10)
      : this.generateChoice();
    this.playerChoice = playerChoice;
    DomHelper.addClasses('.game', [`selection-${Selection[playerChoice].toLowerCase()}`]);
  }

  private onPlayClick() {
    this.currentGameState.next(GameState.READY);
  }

  private reset() {
    this.opponentChoice = null;
    this.playerChoice = null;
    this.disableOptions();
    DomHelper.updateTextContent(
      '.result-label',
      ''
    );
    DomHelper.updateTextContent(
      '.result-message',
      ''
    );
    DomHelper.addClasses('.game-result', ['hidden']);
    DomHelper.removeClasses('.game', ['selection-rock', 'selection-paper', 'selection-scissors']);
    DomHelper.removeClasses('.game-option.opponent', ['rock', 'paper', 'scissors']);
  }
  
  private showOpponentsChoice() {
    if (this.playerChoice === null || this.opponentChoice === null) {
      return;
    } else {
      DomHelper.addClasses('.game-option.opponent', [Selection[this.opponentChoice].toLowerCase()]);
    }
  }

  private showResults() {
    if (this.playerChoice === null) {
      this.disableOptions();
      DomHelper.updateTextContent(
        '.result-label',
        'Too slow... try again!'
      );
    } else if (this.opponentChoice === null) {
      throw new Error('Opponent choice is null');
    } else {
      const result = this.getRoundResult(this.playerChoice, this.opponentChoice);
      DomHelper.updateTextContent(
        '.result-label',
        Result[result]
      );
      DomHelper.updateTextContent(
        '.result-message',
        `You: ${Selection[this.playerChoice]} vs Opponent: ${Selection[this.opponentChoice]}`
      );
      this.updateScore(result);
    }
    DomHelper.removeClasses('.game-result', ['hidden']);
  }

  private startGame() {
    this.reset();
      
    this.opponentChoice = this.generateChoice();

    const status = ['READY?', 'ROCK', 'PAPER', 'SCISSORS', 'SHOOT', 'PLAY AGAIN?'];

    const gameTimer = timer(0, 750).subscribe((iteration) => {
      DomHelper.updateTextContent('.play', status[iteration]);
      if (status[iteration] === 'ROCK') {
        this.enableOptions();
      } else if (status[iteration] === 'SHOOT') {
        this.currentGameState.next(GameState.FINISHED);
      } else if (status[iteration] === 'PLAY AGAIN?') {
        this.currentGameState.next(GameState.RESULTS);
        gameTimer.unsubscribe();
      }
    });
  }

  private updateScore(result: Result) {
    this.score = this.score.map((score, index) => {
      if (index === 0) {
        return result === Result.WIN ? score + 1 : score;
      }
      return result === Result.LOSE ? score + 1 : score;
    });
    DomHelper.updateTextContent(`.player-1 .player-score`, this.score[0].toLocaleString());
    DomHelper.updateTextContent(`.player-2 .player-score`, this.score[1].toLocaleString());
  }
}

export default App;