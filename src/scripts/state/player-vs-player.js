import { CELL_EMPTY, TIE } from "../constants.js";
import { GameState } from "../enum/game-state.js";
import { SoundEffect } from "../enum/sound-effect.js";
import { AudioLoader } from "../util/audio-loader.js";
import { GameStateBase } from "./base.js";

/**
 * @typedef {import("../main.js").Main} Main
 */

export class GameStatePlayerVsPlayer extends GameStateBase {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		super(main);

		// Audio
		this.audioCellPlace = null;
	}

	async load() {
		// Audio
		this.audioCellPlace = await AudioLoader.load(SoundEffect.CELL_PLACE, { volume: 0.15 });
	}

	/**
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		// Fetch mouse position
		const mX = this.main.mouse.position.x;
		const mY = this.main.mouse.position.y;
		let isMouseOverEmptyCell = false;

		// Check if the mouse is within the board's bounds
		if (mX >= this.board.x && mX <= this.board.x + this.board.width && mY >= this.board.y && mY <= this.board.y + this.board.height) {
			// Localize coordinates to row and column
			const col = Math.floor((mX - this.board.x) / this.board.cellSize);
			const row = Math.floor((mY - this.board.y) / this.board.cellSize);

			// Search for the cell in the localized coordinates
			const cell = this.board.cells[row][col];
			isMouseOverEmptyCell = cell == CELL_EMPTY;

			// If clicking
			if (isMouseOverEmptyCell && this.main.mouse.isClicking) {
				this.board.cells[row][col] = this.main.turn;

				this.#onCellPlaced();
			}
		}

		// Set the cursor to pointer, when over an empty cell
		document.body.style.cursor = isMouseOverEmptyCell ? "pointer" : "unset";
	}

	#onCellPlaced() {
		// Play sound effect
		this.audioCellPlace.play();

		// Check if the game has finished
		const result = this.board.checkRules();
		if (result && typeof result === "object") {
			this.main.result = result;
			this.main.state = GameState.PLAYER_WON;
		} else if (result === TIE) {
			this.main.result = result;
			this.main.state = GameState.TIE;
		} else {
			// Calls for next turn
			this.main.nextTurn();
		}

		// Hack: schedules after this frame to make the canvas dirty
		this.main.invalidate();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		this.main.board.render(ctx);
	}

}