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
		window.addEventListener("click", this.#onMouseClick.bind(this));
		window.addEventListener("mousemove", this.#onMouseMove.bind(this));
	}

	/** @param {MouseEvent} event */
	#onMouseClick(event) {
		this.position = { x: event.clientX, y: event.clientY };

		this.isClicking = true;

		this.main.invalidate();
	}

	/** @param {MouseEvent} event */
	#onMouseMove(event) {
		this.position = { x: event.clientX, y: event.clientY };

		this.main.invalidate();
	}

	update() {
		this.isClicking = false;
	}

}