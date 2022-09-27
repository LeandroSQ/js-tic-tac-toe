import { Main } from "./../main.js";

/**
 * @property {string} background Represents a CSS variable
 * @property {string} boardBackground Represents a CSS variable
 * @property {string} boardBorder Represents a CSS variable
 * @property {string} playerX Represents a CSS variable
 * @property {string} playerO Represents a CSS variable
 * @public
 */
export class ThemeController {

	/** @type {string} Represents a CSS variable */
	background

	/** @type {string} Represents a CSS variable */
	boardBackground

	/** @type {string} Represents a CSS variable */
	boardBorder

	/** @type {string} Represents a CSS variable */
	playerX

	/** @type {string} Represents a CSS variable */
	playerO

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		this.main = main;

		this.#loadVariables();
		this.#observeChanges();
	}

	#loadVariables() {
		// Define the CSS variables to keep track of
		const variables = ["--background", "--board-background", "--board-border", "--player-x", "--player-o"];

		console.groupCollapsed("Loading theme variables");

		// Iterate trough variables
		const style = getComputedStyle(document.body);
		for (const variable of variables) {
			// Get the variable value
			const value = style.getPropertyValue(variable);
			const name = variable.toString().toCamelCase();

			// Set the variable on this instance
			this[name] = value;

			// Print out the variable
			console.log(`%c${name}`, `color: ${window.Color.isColorLight(value) ? "#212121" : "#eee"}; background-color: ${value}`);
		}

		console.groupEnd();
	}

	#observeChanges() {
		const darkThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		darkThemeMediaQuery.addEventListener("change", () => {
			this.#loadVariables();
			this.main.onThemeChange();
		});
	}

}