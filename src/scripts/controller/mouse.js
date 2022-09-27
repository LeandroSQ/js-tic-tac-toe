import { Main } from "../main";

export class MouseController {

	position = { x: 0, y: 0 };

	isClicking = false;

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		this.main = main;
		this.#attachHooks();
	}

	#attachHooks() {
		const element = this.main.canvas.canvas;

		element.addEventListener("click", this.#onMouseClick.bind(this));
		element.addEventListener("mousemove", this.#onMouseMove.bind(this));
	}

	/** @param {MouseEvent} event */
	#onMouseClick(event) {
		this.position = { x: event.offsetX, y: event.offsetY };

		this.isClicking = true;

		this.main.invalidate();

		// HACK: Sometimes the visibility change event is not called, so we'll reset it by hand whenever the mouse interacts with the page
		// if (this.main.paused) this.main.onVisibilityChange(true);
	}

	/** @param {MouseEvent} event */
	#onMouseMove(event) {
		this.position = { x: event.offsetX, y: event.offsetY };

		this.main.invalidate();

		// HACK: Sometimes the visibility change event is not called, so we'll reset it by hand whenever the mouse interacts with the page
		// if (this.main.paused) this.main.onVisibilityChange(true);
	}

	update() {
		this.isClicking = false;
	}

}