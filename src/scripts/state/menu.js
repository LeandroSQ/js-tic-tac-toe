/* eslint-disable max-statements */
import { BORDER_RADIUS, CELL_EMPTY, FONT_FAMILY } from "../constants.js";
import { GameState } from "../enum/game-state.js";
import { SoundEffect } from "../enum/sound-effect.js";
import { AudioLoader } from "../util/audio-loader.js";
import { ImageLoader } from "../util/image-loader.js";
import { Button } from "../widget/button.js";
import { GameStateBase } from "./base.js";

/**
 * @typedef {import("./../main.js").Main} Main
 */

export class GameStateMenu extends GameStateBase {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		super(main);

		// Setup
		this.alreadyTapped = false;
		this.alpha = 0;
		this.alphaTimer = 0;
		this.alphaAnimationDuration = 1.0;

		// Random movement behavior
		this.randomMovementTimer = 0;
		this.intervalBetweenRandomMoves = 1.50;

		// Text shaking behavior
		this.shakeTimer = 0;
		this.intervalBetweenShakes = 2.0;
		this.shakeOffsetX = 0;

		// Audio
		this.audioGameStart = null;
	}

	setup() {
		// Resets internal timers
		this.shakeTimer = 0;
		this.randomMovementTimer = 0;
		this.alpha = 0;
		this.alphaTimer = 0;

		// Reset the board
		this.board.reset();
	}

	async load() {
		// Audio
		this.audioGameStart = await AudioLoader.load(SoundEffect.GAME_START, { volume: 0.25 });

		// UI
		const buttonWidth = this.board.width / 4;
		const buttonHeight = 30;
		let buttonY = this.board.height / 3 + 48 * 1.5;

		this.buttonPlayerVsPlayer = new Button(
			{
				text: "Player vs Player",
				x: this.board.width / 2 - buttonWidth / 2,
				y: buttonY,
				width: buttonWidth,
				height: buttonHeight,
				onClick: () => {
					// Change the game state
					this.main.state = GameState.PLAYER_VS_PLAYER;
					this.#onGameStateChange();
				}
			}
		);
		await this.buttonPlayerVsPlayer.load();

		// Translates the buttons vertical position
		buttonY += buttonHeight + 15;
		this.buttonPlayerVsAI = new Button(
			{
				text: "Player vs AI",
				x: this.board.width / 2 - buttonWidth / 2,
				y: buttonY,
				width: buttonWidth,
				height: buttonHeight,
				onClick: () => {
					// Change the game state
					this.main.state = GameState.PLAYER_VS_AI;
					this.#onGameStateChange();
				}
			}
		);
		await this.buttonPlayerVsAI.load();
	}

	#onGameStateChange() {
		// Play sound effect
		this.audioGameStart.play();

		// Reset the board
		this.board.reset();

		// Request first frame
		this.main.postInvalidate();

		// Resets the cursor
		document.body.style.cursor = "unset";

		// Reset global alpha
		this.main.ctx.globalAlpha = 1.0;
	}

	/**
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		// Update components
		this.#updateTextShake(deltaTime);
		this.#updateRandomMoves(deltaTime);

		if (this.alreadyTapped) {
			// Resets the cursor
			document.body.style.cursor = "unset";

			// Update components
			this.#updateUI(deltaTime);
		} else {
			this.#updateSplash(deltaTime);
		}

		if (this.alphaTimer >= this.alphaAnimationDuration) {
			this.alphaTimer = this.alphaAnimationDuration;
		} else {
			this.alphaTimer += deltaTime;
		}
		this.alpha = Math.pow(this.alphaTimer / this.alphaAnimationDuration, 2);

		// Request re-draw
		this.main.invalidate();
	}

	#updateRandomMoves(deltaTime) {
		this.randomMovementTimer += deltaTime + Math.random() * 0.05;

		if (this.randomMovementTimer >= this.intervalBetweenRandomMoves) {
			this.randomMovementTimer -= this.intervalBetweenRandomMoves;

			const isBoardFilled = this.board.isBoardFilled;

			if (isBoardFilled) {
				this.board.reset();
			} else {
				this.#randomizeMoves();
			}
		}
	}

	#updateTextShake(deltaTime) {
		this.shakeTimer += deltaTime;

		function easeInOutCubic(x) {
			return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		}

		if (this.shakeTimer >= this.intervalBetweenShakes) {
			this.shakeTimer -= this.intervalBetweenShakes;
		}

		const progress = 0.5 - Math.abs(this.shakeTimer / this.intervalBetweenShakes - 0.5);
		this.shakeOffsetX = 1 + easeInOutCubic(progress) * 0.25;
	}

	#updateUI(deltaTime) {
		this.buttonPlayerVsPlayer.update(deltaTime, this.main.mouse);
		this.buttonPlayerVsAI.update(deltaTime, this.main.mouse);
	}

	#updateSplash(deltaTime) {
		document.body.style.cursor = "cursor";

		// If the user has clicked on the canvas, show the UI
		// This is required in order to play audio, some browsers require user interaction prior to audio playing
		if (this.main.mouse.isClicking) {
			this.alreadyTapped = true;
			this.alphaTimer = 0;
		}
	}

	#randomizeMoves() {
		// Check if any of the random moves actually won the game
		const result = this.board.checkRules();
		if (result != null) return this.board.reset();

		// Randomize movements
		let foundPosition = false;
		let position = null;
		while (!foundPosition) {
			position = {
				x: Math.randomIntRange(0, this.board.columns),
				y: Math.randomIntRange(0, this.board.rows)
			};

			if (this.board.cells[position.y][position.x] === CELL_EMPTY) foundPosition = true;
		}

		// Mark the cell as current player turn
		this.board.cells[position.y][position.x] = this.main.turn;

		// Request next turn
		this.main.nextTurn();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		// Draw board, blurred
		ctx.save();
		ctx.filter = "blur(20px)";
		this.board.render(ctx);
		ctx.restore();

		// Fade-in on the splash screen
		ctx.globalAlpha = this.alreadyTapped ? 1.0 : this.alpha;

		// Draw background, dimming the board
		ctx.beginPath();
		ctx.fillStyle = this.main.theme.dimBackground;
		ctx.strokeStyle = this.main.theme.dimBackground;
		ctx.roundRect(0, 0, this.main.canvas.width, this.main.canvas.height, BORDER_RADIUS * this.main.canvas.drawRatio);
		ctx.fill();
		ctx.closePath();

		if (this.alreadyTapped) {
			ctx.globalAlpha = this.alpha;
			this.#renderMenuOptions(ctx);
		} else {
			this.#renderSplash(ctx);
		}
	}

	#renderSplash(ctx) {
		ctx.save();
		// Draw logo subtitle
		ctx.translate(this.main.canvas.width / 2, this.main.canvas.height / 2);
		ctx.scale(this.shakeOffsetX, this.shakeOffsetX);
		ctx.shadowColor = this.main.theme.dimBackground;
		ctx.fillStyle = this.main.theme.foreground;
		ctx.font = `10pt ${FONT_FAMILY}`;
		ctx.fillTextCentered("Tap/click to start", 0, 0);
		ctx.restore();
	}

	#renderMenuOptions(ctx) {
		// Draw logo title
		ctx.save();
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 4;
		ctx.shadowColor = this.main.theme.boardBackground;
		ctx.shadowBlur = 7.5;
		ctx.fillStyle = this.main.theme.foreground;
		ctx.font = `36pt ${FONT_FAMILY}`;
		ctx.fillTextCentered("Tic-Tac-Toe", this.main.canvas.width / 2, this.main.canvas.height / 3);

		// Draw UI elements, if the user has tapped already
		this.buttonPlayerVsPlayer.render(ctx);
		this.buttonPlayerVsAI.render(ctx);

		// Draw logo subtitle
		ctx.translate(this.main.canvas.width / 2, this.main.canvas.height / 3 + 48);
		ctx.scale(this.shakeOffsetX, this.shakeOffsetX);
		ctx.shadowColor = this.main.theme.dimBackground;
		ctx.fillStyle = this.main.theme.foreground;
		ctx.font = `10pt ${FONT_FAMILY}`;
		ctx.fillTextCentered("Select an option below", 0, 0);

		ctx.restore();

		// Reset shadow
		ctx.resetShadow();
	}

}
