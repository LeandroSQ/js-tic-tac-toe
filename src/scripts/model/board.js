import { BORDER_RADIUS, CELL_EMPTY, CELL_X, CELL_O, TIE } from "../constants";

/**
 * @typedef {import("./../main.js").Main} Main
 */

export class Board {

	/**
	 *
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
		this.cells = this.#createEmptyMatrix(CELL_EMPTY);
	}

	/**
	 * Calculates the board size
	 *
	 * @param {Object} viewport
	 * @param {number} viewport.width
	 * @param {number} viewport.height
	 */
	layout(viewport) {
		// Calculate the minimum possible size, given the screen width, leaving a padding equivalent to 2 cells
		const amountOfCellsPerAxis = Math.min(this.columns, this.rows);
		this.cellSize = Math.min(viewport.width, viewport.height) / (amountOfCellsPerAxis * 1.5);
		this.width = parseInt(this.cellSize * amountOfCellsPerAxis);
		this.height = parseInt(this.cellSize * amountOfCellsPerAxis);

		// Calculate the sizing, centering the board in the screen
		this.x = viewport.width / 2 - this.width / 2;
		this.y = viewport.height / 2 - this.height / 2;
	}

	update() {
		const mX = this.main.mouse.position.x;
		const mY = this.main.mouse.position.y;
		let isMouseOverEmptyCell = false;

		// Check if the mouse is within the board's bounds
		if (mX >= this.x && mX <= this.x + this.width && mY >= this.y && mY <= this.y + this.height) {
			// Localize coordinates to row and column
			const col = parseInt((mX - this.x) / this.cellSize);
			const row = parseInt((mY - this.y) / this.cellSize);

			// Search for the cell in the localized coordinates
			const cell = this.cells[row][col];
			isMouseOverEmptyCell = cell == CELL_EMPTY;

			// If clicking
			if (isMouseOverEmptyCell && this.main.mouse.isClicking) {
				this.cells[row][col] = this.main.turn;

				// Check if the game has finished
				const winner = this.checkRules();
				console.log(`Winner: ${winner == CELL_O ? "O" : winner == CELL_X ? "X" : "none"}`);

				// Hack: schedules after this frame to make the canvas dirty
				setTimeout(this.main.invalidate.bind(this.main), 0);

				// Calls for next turn
				this.main.nextTurn();
			}
		}

		document.body.style.cursor = isMouseOverEmptyCell ? "pointer" : "unset";
	}

	// #region Rule validation
	#checkHorizontalLines() {
		const traversed = this.#createEmptyMatrix(0);
		let winner = null;

		// Check for horizontal lines
		for (let y = 0; y < this.rows; y++) {
			winner = this.cells[y][0];

			for (let x = 1; x < this.columns; x++) {
				const cell = this.cells[y][x];

				traversed[y][x] = 1;

				// The cell differs from the last one, or is empty, disqualifying this row as filled
				if (cell === CELL_EMPTY || cell !== this.cells[y][x - 1]) {
					winner = null;
					break;
				}
			}

			if (winner) break;
		}

		console.matrix(traversed, "Horizontal lines");

		// Return winner
		return winner;
	}

	#checkVerticalLines() {
		const traversed = this.#createEmptyMatrix(0);
		let winner = null;

		// Check for vertical lines
		for (let x = 0; x < this.columns; x++) {
			winner = this.cells[0][x];

			for (let y = 1; y < this.rows; y++) {
				const cell = this.cells[y][x];

				traversed[y][x] = 1;

				// If the cell differs from the last one, or is empty, disqualifying this row as filled
				if (cell === CELL_EMPTY || cell !== this.cells[y - 1][x]) {
					winner = null;
					break;
				}
			}

			if (winner) break;
		}

		console.matrix(traversed, "Vertical lines");

		// Return winner
		return winner;
	}

	#checkTopLeftDiagonalLine() {
		const traversed = this.#createEmptyMatrix(0);
		let winner = this.cells[1][1];

		// X - -
		// - X -
		// - - X
		// Check for top-left to bottom-right diagonal line
		for (let x = 1; x < this.columns; x++) {
			const cell = this.cells[x][x];

			traversed[x][x] = 1;

			// If the cell differs from the last one, or is empty, disqualifying this row as filled
			if (cell === CELL_EMPTY || cell !== this.cells[x - 1][x - 1]) {
				winner = null;
				break;
			}
		}

		console.matrix(traversed, "Diagonal top-left line");

		// Return winner
		return winner;
	}

	#checkTopRightDiagonalLine() {
		const traversed = this.#createEmptyMatrix(0);
		let winner = this.cells[1][1];

		// - - X
		// - X -
		// X - -
		// Check for top-right to bottom-left diagonal line
		for (let y = 1; y < this.rows; y++) {
			// Flips the x axis, from 0..2 to 2..0
			const x = y % (this.columns - 1);
			const cell = this.cells[y][x];

			traversed[y][x] = 1;

			// If the cell differs from the last one, or is empty, disqualifying this row as filled
			if (cell === CELL_EMPTY || cell !== this.cells[y - 1][x + 1]) {
				winner = null;
				break;
			}
		}

		console.matrix(traversed, "Diagonal top-right line");

		// Return winner
		return winner;
	}

	#checkTie() {
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				const cell = this.cells[y][x];

				// All cells must be filled
				if (cell === CELL_EMPTY) return null;
			}
		}

		// If all cells are filled, and the previous checks didn't find any winner, this is a tie
		return TIE;
	}

	checkRules() {
		return this.#checkHorizontalLines() || this.#checkVerticalLines() || this.#checkTopLeftDiagonalLine() || this.#checkTopRightDiagonalLine() || this.#checkTie();
	}
	// #endregion

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		// Draws the background
		this.#renderBackground(ctx);

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

				// Fetch the correct image for the cell
				const image = {
					[CELL_EMPTY]: null,
					[CELL_X]: this.main.imageX,
					[CELL_O]: this.main.imageO
				}[cell];

				// Draw it, if not empty
				if (image) {
					image.drawBufferTo(
						this.x + x * this.cellSize + this.cellSize / 2 - image.width / 2,
						this.y + y * this.cellSize + this.cellSize / 2 - image.height / 2,
						ctx
					);
				}
			}
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	#renderGrid(ctx) {
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

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	#renderBackground(ctx) {
		ctx.beginPath();
		ctx.shadowBlur = 30 * this.main.canvas.drawRatio;
		ctx.shadowColor = "rgba(15, 6, 30, 0.35)";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 10 * this.main.canvas.drawRatio;
		ctx.fillStyle = this.main.theme.boardBackground;
		ctx.strokeStyle = this.main.theme.boardBorder;
		ctx.roundRect(this.x, this.y, this.width, this.height, BORDER_RADIUS);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();

		// Reset shadow
		ctx.shadowBlur = 0;
		ctx.shadowColor = "transparent";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
	}

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

}