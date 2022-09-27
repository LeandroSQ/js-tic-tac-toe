
/**
 * @typedef {import("../main.js").Main} Main
 */

export class GameStateBase {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		this.main = main;
	}

	async load() {

	}

	setup() {

	}

	/**
	 * @param {number} deltaTime
	 */
	update(deltaTime) {

	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {

	}

	get board() {
		return this.main.board;
	}

}