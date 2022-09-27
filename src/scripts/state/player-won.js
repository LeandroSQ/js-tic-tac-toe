import { CELL_O } from "../constants.js";
import { GameState } from "../enum/game-state.js";
import { SoundEffect } from "../enum/sound-effect.js";
import { AudioLoader } from "../util/audio-loader.js";
import { GameStateBase } from "./base.js";

/**
 * @typedef {import("../main.js").Main} Main
 */

export class GameStatePlayerWon extends GameStateBase {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		super(main);
	}

	async load() {
		this.audioGameWon = await AudioLoader.load(SoundEffect.GAME_START, { volume: 0.1 });
		this.audioPenStroke = await AudioLoader.load(SoundEffect.PEN_STROKE, { volume: 0.5 });
	}

	setup() {
		// Resets timers
		this.animationTimer = 0;
		this.animationDuration = 0.318662 / 2;
		this.animationDone = false;

		// Play sound effects
		this.audioGameWon.play();
		this.audioPenStroke.play();

		// Set the cursor
		document.body.style.cursor = "pointer";
	}

	/**
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		// Update the pen stroke animation
		if (!this.animationDone) {
			this.animationTimer += deltaTime;
			if (this.animationTimer >= this.animationDuration) {
				this.animationTimer = this.animationDuration;
				this.animationDone = true;
			}

			this.main.invalidate();
		}

		// Check if the user has clicked, and if so resets the game state
		if (this.main.mouse.isClicking) {
			this.main.state = GameState.MENU;
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	// eslint-disable-next-line max-statements
	render(ctx) {
		// Draw board
		this.board.render(ctx);

		// Store in constants for better readability
		const progress = this.animationProgress;
		const cellSize = this.board.cellSize;
		const start = this.result.start;
		const end = this.result.end;

		// Define padding, 1/4 when diagonals and 1/2 when straight vertical or horizontal lines
		const verticalPadding = start.y === end.y ? cellSize / 2 : cellSize / 4;
		let horizontalPadding = start.x === end.x ? cellSize / 2 : cellSize / 4;
		if (start.x > end.x) horizontalPadding = cellSize - horizontalPadding;

		// Calculate the starting and ending positions
		const sX = start.x * cellSize + horizontalPadding;
		const sY = start.y * cellSize + verticalPadding;
		const eX = end.x * cellSize + cellSize - horizontalPadding;
		const eY = end.y * cellSize + cellSize - verticalPadding;

		// Interpolate between start and end positions based on the animation progress
		const x = sX * (1.0 - progress) + eX * (progress);
		const y = sY * (1.0 - progress) + eY * (progress);

		// Configure line thickness and shape
		ctx.lineWidth = 15;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "white";

		// Configure line shadow
		ctx.shadowBlur = 15;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowColor = this.result.winner === CELL_O ? this.main.theme.playerO : this.main.theme.playerX;

		// Render it
		ctx.beginPath();
		ctx.moveTo(sX, sY);
		ctx.lineTo(x, y);
		ctx.stroke();

		// Reset shadow
		ctx.resetShadow();
	}

	/**
	 * @return { { winner: number, start: { x: number, y: number }, end: { x: number, y: number } } }
	 */
	get result() {
		return this.main.result;
	}

	get animationProgress() {
		return Math.pow(this.animationTimer / this.animationDuration, 2);
	}

}
