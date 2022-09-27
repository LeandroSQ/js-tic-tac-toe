import { FONT_FAMILY } from "../constants.js";
import { GameState } from "../enum/game-state.js";
import { GameStateBase } from "./base.js";

/**
 * @typedef {import("../main.js").Main} Main
 */

export class GameStateTie extends GameStateBase {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		super(main);
	}

	async load() {}

	setup() {
		// Resets timers
		this.animationTimer = 0;
		this.animationDuration = 0.318662 / 2;
		this.animationDone = false;

		// Set the cursor
		document.body.style.cursor = "pointer";
	}

	/**
	 * @param {number} deltaTime
	 */
	update(deltaTime) {
		// Handle the animation timer
		if (!this.animationDone) {
			this.animationTimer += deltaTime;

			if (this.animationTimer >= this.animationDuration) {
				this.animationTimer = this.animationDuration;
				this.animationDone = true;
			}

			// Invalidates canvas
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
	render(ctx) {
		this.board.render(ctx);

		// Draw tie text
		ctx.save();
		ctx.globalAlpha = this.animationProgress;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 4;
		ctx.shadowColor = this.main.theme.boardBackground;
		ctx.shadowBlur = 7.5;
		ctx.fillStyle = this.main.theme.foreground;
		ctx.font = `36pt ${FONT_FAMILY}`;
		ctx.fillTextCentered("Tie", this.main.canvas.width / 2, this.main.canvas.height / 3);
		ctx.restore();
	}

	get animationProgress() {
		return Math.pow(this.animationTimer / this.animationDuration, 2);
	}

}
