/* eslint-disable max-depth */
import { CELL_EMPTY, CELL_X, CELL_O, TIE } from "../constants";

/**
 * @typedef {import("./../main.js").Main} Main
 */

export class Board {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		this.main = main;
		this.columns = 3;
		this.rows = 3;
		this.cellSize = 0;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;

		// Initialize cells
		this.reset();
	}

	/**
	 * Calculates the board size
	 *
	 * @param {Object} viewport
	 * @param {number} viewport.width
	 * @param {number} viewport.height
	 */
	layout(viewport) {
		const padding = this.main.canvas.drawRatio;

		// Calculate the minimum possible size, given the screen width, leaving a padding equivalent to 2 cells
		const amountOfCellsPerAxis = Math.min(this.columns, this.rows);
		this.cellSize = Math.min(viewport.width, viewport.height) / (amountOfCellsPerAxis * 1.5);
		this.width = Math.ceil(this.cellSize * amountOfCellsPerAxis + padding);
		this.height = Math.ceil(this.cellSize * amountOfCellsPerAxis + padding);
	}

	// #region Rule validation
	#checkHorizontalLines() {
		const traversed = this.#createEmptyMatrix("#");
		let y = 0;
		let winner = null;

		// Check for horizontal lines
		for (y = 0; y < this.rows; y++) {
			winner = this.cells[y][0];

			for (let x = 1; x < this.columns; x++) {
				const cell = this.cells[y][x];

				if (DEBUG) traversed[y][x] = 1;

				// The cell differs from the last one, or is empty, disqualifying this row as filled
				if (cell === CELL_EMPTY || cell !== this.cells[y][x - 1]) {
					winner = null;
					break;
				}
			}

			if (winner) break;
		}

		if (DEBUG) console.matrix(traversed, "Horizontal lines");

		// Return the winner and the line coordinates, within the grid
		if (winner)
			return {
				winner,
				start: {
					x: 0,
					y: y
				},
				end: {
					x: this.columns - 1,
					y: y
				}
			};

		return null;
	}

	#checkVerticalLines() {
		const traversed = this.#createEmptyMatrix("#");
		let x = 0;
		let winner = null;

		// Check for vertical lines
		for (x = 0; x < this.columns; x++) {
			winner = this.cells[1][x];

			for (let y = 1; y < this.rows; y++) {
				const cell = this.cells[y][x];

				if (DEBUG) traversed[y][x] = 1;

				// If the cell differs from the last one, or is empty, disqualifying this row as filled
				if (cell === CELL_EMPTY || cell !== this.cells[y - 1][x]) {
					winner = null;
					break;
				}
			}

			if (winner) break;
		}

		if (DEBUG) console.matrix(traversed, "Vertical lines");

		// Return the winner and the line coordinates, within the grid
		if (winner)
			return {
				winner,
				start: {
					x: x,
					y: 0
				},
				end: {
					x: x,
					y: this.rows - 1
				}
			};

		return null;
	}

	#checkTopLeftDiagonalLine() {
		const traversed = this.#createEmptyMatrix("#");
		let winner = this.cells[1][1];

		// X - -
		// - X -
		// - - X
		// Check for top-left to bottom-right diagonal line
		for (let x = 1; x < this.columns; x++) {
			const cell = this.cells[x][x];

			if (DEBUG) traversed[x][x] = 1;

			// If the cell differs from the last one, or is empty, disqualifying this row as filled
			if (cell === CELL_EMPTY || cell !== this.cells[x - 1][x - 1]) {
				winner = null;
				break;
			}
		}

		if (DEBUG) console.matrix(traversed, "Diagonal top-left line");

		// Return the winner and the line coordinates, within the grid
		if (winner)
			return {
				winner,
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: this.columns - 1,
					y: this.rows - 1
				}
			};

		return null;
	}

	#checkTopRightDiagonalLine() {
		const traversed = this.#createEmptyMatrix("#");
		let winner = this.cells[1][1];

		// - - X
		// - X -
		// X - -
		// Check for top-right to bottom-left diagonal line
		for (let y = 1; y < this.rows; y++) {
			// Flips the x axis, from 0..2 to 2..0
			const x = y % (this.columns - 1);
			const cell = this.cells[y][x];

			if (DEBUG) traversed[y][x] = 1;

			// If the cell differs from the last one, or is empty, disqualifying this row as filled
			if (cell === CELL_EMPTY || cell !== this.cells[y - 1][x + 1]) {
				winner = null;
				break;
			}
		}

		if (DEBUG) console.matrix(traversed, "Diagonal top-right line");

		// Return the winner and the line coordinates, within the grid
		if (winner)
			return {
				winner,
				start: {
					x: this.columns - 1,
					y: 0
				},
				end: {
					x: 0,
					y: this.rows - 1
				}
			};

		return null;
	}

	#checkTie() {
		// If all cells are filled, and the previous checks didn't find any winner, this is a tie
		return this.isBoardFilled ? TIE : null;
	}

	checkRules() {
		return (
			this.#checkHorizontalLines() ||
			this.#checkVerticalLines() ||
			this.#checkTopLeftDiagonalLine() ||
			this.#checkTopRightDiagonalLine() ||
			this.#checkTie()
		);
	}
	// #endregion

	// #region Rendering
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		// Draws the grid
		this.#renderGrid(ctx);

		// Draws the cells
		this.#renderCells(ctx);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	#renderCells(ctx) {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				const cell = this.cells[y][x];

				// Ignore empty cells
				if (!cell) continue;

				// Configure shadow
				ctx.shadowBlur = 15;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowColor = cell === CELL_X ? this.main.theme.playerX : this.main.theme.playerO;

				// Draw image
				const image = cell === CELL_X ? this.main.imageX : this.main.imageO;
				image.drawBufferTo(
					this.x + x * this.cellSize + this.cellSize / 2 - image.width / 2,
					this.y + y * this.cellSize + this.cellSize / 2 - image.height / 2,
					ctx
				);
			}
		}

		ctx.resetShadow();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	#renderGrid(ctx) {
		ctx.strokeStyle = this.main.theme.boardBorder;
		ctx.lineWidth = 1;

		// Horizontal lines
		for (let y = 1; y < this.rows; y++) {
			ctx.beginPath();
			ctx.moveTo(this.x, this.y + y * this.cellSize);
			ctx.lineTo(this.x + this.width, this.y + y * this.cellSize);
			ctx.stroke();
			ctx.closePath();
		}

		// Vertical lines
		for (let x = 1; x < this.columns; x++) {
			ctx.beginPath();
			ctx.moveTo(this.x + x * this.cellSize, this.y);
			ctx.lineTo(this.x + x * this.cellSize, this.y + this.height);
			ctx.stroke();
			ctx.closePath();
		}
	}
	// #endregion

	// #region Utility
	#createEmptyMatrix(value = CELL_EMPTY) {
		const tmp = [];
		for (let i = 0; i < this.rows; i++) {
			const tmpRow = [];
			for (let j = 0; j < this.columns; j++) {
				tmpRow.push(value);
			}
			tmp.push(tmpRow);
		}

		return tmp;
	}

	get isBoardFilled() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				const cell = this.cells[y][x];

				if (cell === CELL_EMPTY) return false;
			}
		}

		return true;
	}

	reset() {
		this.cells = this.#createEmptyMatrix(CELL_EMPTY);
	}
	// #endregion

}