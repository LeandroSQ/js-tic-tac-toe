/* eslint-disable max-statements */
import { CELL_O, CELL_X, TARGET_FRAMETIME, TIE } from "./constants.js";
import { MouseController } from "./controller/mouse.js";
import { ThemeController } from "./controller/theme.js";
import { GameState } from "./enum/game-state.js";
import { Board } from "./model/board.js";
import { GameStateMenu } from "./state/menu.js";
import { GameStatePlayerVsIA } from "./state/player-vs-ai.js";
import { GameStatePlayerVsPlayer } from "./state/player-vs-player.js";
import { GameStatePlayerWon } from "./state/player-won.js";
import { GameStateTie } from "./state/tie.js";
import "./util/extensions.js";
import { FontLoader } from "./util/font-loader.js";
import { ImageLoader } from "./util/image-loader.js";
import { DensityCanvas } from "./widget/density-canvas.js";

/**
 * @typedef {import("./state/base.js").GameStateBase} GameStateBase
 */

export class Main {

	constructor() {
		// Game
		this._state = GameState.MENU;
		this.stateMenu = new GameStateMenu(this);
		this.statePlayerVsPlayer = new GameStatePlayerVsPlayer(this);
		this.statePlayerVsIA = new GameStatePlayerVsIA(this);
		this.statePlayerWon = new GameStatePlayerWon(this);
		this.stateTie = new GameStateTie(this);
		this.paused = false;

		// Canvas
		this.canvas = new DensityCanvas();
		this.ctx = this.canvas.context;
		this.isDirty = true;

		// Board
		this.board = new Board(this);
		this.turn = Math.random() <= 0.5 ? CELL_O : CELL_X;

		/** @type { winner: number, start: { x: number, y: number }, end: { x: number, y: number } } */
		this.result = null;

		// Theme
		this.theme = new ThemeController(this);

		// Input
		this.mouse = new MouseController(this);

		// FPS tracking variables
		this.startFrameTime = performance.now();
		this.lastFrameTime = performance.now();
		this.frameCounter = 0;
		this.fpsTimer = 0;
		this.fps = 0;

		this.#attachHooks();
	}

	nextTurn() {
		if (this.turn == CELL_O) {
			this.turn = CELL_X;
		} else {
			this.turn = CELL_O;
		}
	}

	#attachHooks() {
		window.addLoadEventListener(this.#onLoad.bind(this));
		window.addEventListener("resize", this.#onResize.bind(this));
		window.addVisibilityChangeEventListener(this.onVisibilityChange.bind(this));
	}

	// #region Event listeners
	async #onLoad() {
		try {
			// Attach the canvas element to the document body
			this.canvas.attachToElement(document.getElementById("container"));

			// Force layout
			this.#onResize();

			// Force theme apply
			await this.onThemeChange();

			// Loads font
			await FontLoader.load(this.ctx);

			// Loads game states
			await Promise.all([
				this.stateMenu.load(),
				this.statePlayerVsIA.load(),
				this.statePlayerVsPlayer.load(),
				this.statePlayerWon.load(),
				this.stateTie.load()
			]);

			// Request first frame
			this.#requestNextFrame();
		} catch (error) {
			console.error(error);
			alert("Some error ocurred!");
		}
	}

	async onThemeChange() {
		// Load images
		const padding = 1.5;
		const imageSize = this.board.cellSize / padding;
		this.imageO = await ImageLoader.load("ic_o.svg", { tint: this.theme.playerO, height: imageSize });
		this.imageX = await ImageLoader.load("ic_x.svg", { tint: this.theme.playerX, height: imageSize });

		// Invalidate canvas
		this.isDirty = true;
	}

	async #onResize() {
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		this.board.layout(viewport);
		this.canvas.setSize(this.board);

		// Force theme apply
		await this.onThemeChange();
	}

	onVisibilityChange(isVisible) {
		console.log(isVisible);

		if (isVisible) {
			// The page is now visible, reset fps variables to prevent over-updating
			this.paused = false;
			this.lastFrameTime = performance.now();
			this.startFrameTime = performance.now();
			this.frameCounter = 0;
			this.fpsTimer = 0;
			this.fps = 0;

			// Request the next frame
			this.#requestNextFrame();
		} else {
			// Ignore all frames until the page is visible again
			this.paused = true;
		}
	}

	#onFrame() {
		// Ignore frames when the page is not visible
		if (this.paused) return;

		// Calculate the delta time
		this.startFrameTime = performance.now();
		const deltaTime = (this.startFrameTime - this.lastFrameTime) / 1000;

		// Handle fps counter
		this.frameCounter++;
		this.fpsTimer += deltaTime;
		if (this.fpsTimer > 1) {
			this.fpsTimer -= 1;
			this.fps = this.frameCounter;
			this.frameCounter = 0;
		}

		// Fetch current game state instance
		const currentState = this.currentGameState;

		// Update and render current game state
		currentState.update(deltaTime);
		if (this.isDirty && currentState === this.currentGameState) {
			// Clear canvas
			this.canvas.clear();

			// Render current state
			currentState.render(this.ctx);
			this.isDirty = false;
		}

		// Update mouse controller
		this.mouse.update();

		// Request the next frame
		this.#requestNextFrame();
	}
	// #endregion

	#requestNextFrame() {
		// Calculate the time since the last frame
		const elapsed = this.lastFrameTime - this.startFrameTime;
		const remaining = Math.clamp(TARGET_FRAMETIME - elapsed, 0, TARGET_FRAMETIME);

		setTimeout(this.#onFrame.bind(this), remaining);
		this.lastFrameTime = performance.now();
	}

	invalidate() {
		this.isDirty = true;
	}

	postInvalidate() {
		// Hack: schedules after this frame to make the canvas dirty
		setTimeout(this.invalidate.bind(this), 0);
	}

	/**
	 * @return {GameStateBase}
	 */
	get currentGameState() {
		return {
			[GameState.MENU]: this.stateMenu,
			[GameState.PLAYER_VS_PLAYER]: this.statePlayerVsPlayer,
			[GameState.PLAYER_VS_AI]: this.statePlayerVsIA,
			[GameState.TIE]: this.stateTie,
			[GameState.PLAYER_WON]: this.statePlayerWon
		}[this.state];
	}

	get state() {
		return this._state;
	}

	set state(value) {
		this._state = value;

		// Calls the setup function from the now new current state
		this.currentGameState.setup();
	}

}

// Instantiate the game class
const instance = new Main();
window.instance = instance;