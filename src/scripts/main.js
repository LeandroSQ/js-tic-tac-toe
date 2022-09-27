import { CELL_O, CELL_X, TARGET_FRAMETIME } from "./constants.js";
import { MouseController } from "./controller/mouse.js";
import { ThemeController } from "./controller/theme.js";
import { Board } from "./model/board.js";
import "./util/extensions.js";
import { ImageLoader } from "./util/image-loader.js";
import { DensityCanvas } from "./widget/density-canvas.js";

export class Main {

	constructor() {
		// Canvas
		this.canvas = new DensityCanvas();
		this.ctx = this.canvas.context;
		this.isDirty = true;

		// Board
		this.board = new Board(this);
		this.turn = Math.random() <= 0.5 ? CELL_O : CELL_X;

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
	}

	#onLoad() {
		// Attach the canvas element to the document body
		this.canvas.attachToElement(document.body);

		// Force layout
		this.#onResize();

		// Force theme apply
		this.onThemeChange();
	}

	async onThemeChange() {
		// Load images
		const imageSize = this.board.cellSize / 1.5;
		this.imageO = await ImageLoader.loadAndTint("ic_o.svg", this.theme.playerO, imageSize);
		this.imageX = await ImageLoader.loadAndTint("ic_x.svg", this.theme.playerX, imageSize);

		// Schedule first frame
		this.#requestNextFrame();
	}

	#onResize() {
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		this.canvas.setSize(viewport);
		this.board.layout(viewport);
	}

	#onFrame() {
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

		// Render frame
		this.#onRender(deltaTime);

		// Update mouse controller
		this.mouse.update();

		this.#requestNextFrame();
	}

	#onRender(deltaTime) {
		// Ignore render if nothing has changed
		if (!this.isDirty) return;
		this.isDirty = false;

		// Clear canvas
		this.canvas.clear();

		// Render board
		this.board.update();
		this.board.render(this.ctx);

		// Draw the FPS counter
		this.ctx.font = "12pt 500 monospace";
		this.ctx.fillStyle = "white";
		this.ctx.beginPath();
		this.ctx.fillText(`FPS: ${this.fps}`, 13, 20);
		this.ctx.closePath();
	}

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

}

// Instantiate the game class
const instance = new Main();
window.instance = instance;