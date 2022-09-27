import { CELL_EMPTY, CELL_X, CELL_O, TIE } from "../constants";
import { Board } from "../model/board.js";

/**
 * @typedef {import("../model/Main.js").Main} Main
 * @typedef {import("../model/board.js").Board} Board
 * @typedef {Array<Array<number>>} Matrix
 */

class Node {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

}

export class AIController {

	/**
	 * @param {Main} main
	 */
	constructor(main) {
		this.main = main;
		this.maxDepth = 3;
	}

	/**
	 * @param {Matrix} matrix
	 * @return {Array<Node>}
	 */
	#getEmptyCells(matrix) {
		const list = [];

		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[y].length; x++) {
				const cell = matrix[y][x];

				if (cell === CELL_EMPTY) list.push(new Node(x, y));
			}
		}

		return list;
	}

	/**
	 * @param {Matrix} matrix
	 * @return {Matrix}
	 */
	#cloneMatrix(matrix) {
		const copy = [];

		for (let y = 0; y < matrix.length; y++) {
			const row = [];
			for (let x = 0; x < matrix[y].length; x++) {
				const cell = matrix[y][x];
				row.push(cell);
			}
			copy.push(row);
		}

		return copy;
	}

	/**
	 * @param {Matrix} matrix
	 * @return {null|CELL_O|CELL_X|TIE}
	 */
	#checkRules(matrix) {
		// Dummy board holder
		const b = new Board(null);
		b.cells = matrix;
		const result = b.checkRules();

		// Simplify return
		if (result === TIE) return TIE;
		else if (result) return result.winner;
		else return null;
	}

	/**
	 * @param {Matrix} matrix
	 * @param {Node} node
	 * @param {number} depth
	 * @param {boolean} isMaximizing
	 *
	 * @return {{ score: number, move: [Node] }}
	 */
	// eslint-disable-next-line complexity, max-statements
	#minimax(matrix, depth, isMaximizing) {
		// Check for terminal nodes
		const result = this.#checkRules(matrix);
		if (result === CELL_O) {
			return { score: 10, move: null };
		} else if (result === CELL_X) {
			return { score: -10, move: null };
		} else if (result === TIE) {
			return { score: 0, move: null };
		} else if (depth === 0) {
			return { score: 0, move: null };
		}

		// Check for available moves
		const availableEmptyCells = this.#getEmptyCells(matrix);

		if (isMaximizing) {
			// If aiming to maximize AI Score
			let value = Number.NEGATIVE_INFINITY;
			let bestNode = null;
			for (const node of availableEmptyCells) {
				// Pretend to make move and evaluate score
				matrix[node.y][node.x] = CELL_O;
				const score = this.#minimax(matrix, depth - 1, false).score;
				matrix[node.y][node.x] = CELL_EMPTY;

				// If score is better than previous, store it as new best score
				if (score > value) {
					value = score;
					bestNode = node;
				}
			}

			// Return the best possible move from this iteration
			return { score: value, move: bestNode };
		} else {
			// Otherwise, if aiming to minimize player score
			let value = Number.POSITIVE_INFINITY;
			let bestNode = null;
			for (const node of availableEmptyCells) {
				// Pretend to make move and evaluate score
				matrix[node.y][node.x] = CELL_X;
				const score = this.#minimax(matrix, depth - 1, true).score;
				matrix[node.y][node.x] = CELL_EMPTY;

				// If score is better than previous, store it as new best score
				if (score < value) {
					value = score;
					bestNode = node;
				}
			}

			// Return the best possible move from this iteration
			return { score: value, move: bestNode };
		}
	}

	evaluate() {
		// Clone the board cell matrix
		const matrix = this.#cloneMatrix(this.main.board.cells);
		// Evaluate possible moves
		const move = this.#minimax(matrix, 6, true);

		if (DEBUG) {
			console.group("AI");
			console.log("Initial board: ");
			console.matrix(matrix);
			console.log("Best possible move is:", move);
			console.groupEnd();
		}

		return move;
	}

}
