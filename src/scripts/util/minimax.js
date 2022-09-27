import { CELL_EMPTY, CELL_X, CELL_O, TIE } from "../constants";

/**
 * @typedef {import("../model/board.js").Board} Board
 */

class Node {

	constructor(value, x, y) {
		this.value = value;
		this.x = x;
		this.y = y;
	}

}

export class Minimax {


	static #isTerminalNode(node) {

	}

	static #calculateNodeHeuristic(node) {

	}

	static #getEmptyCells(board) {
		const list = [];

		for (let y = 0; y < board.rows; y++) {
			for (let x = 0; x < board.columns; x++) {
				const cell = board.cells[y][x];

				if (cell === CELL_EMPTY) list.push(new Node(cell, x, y));
			}
		}

		return list;
	}


	static #minimax(board, isPlayerO) {
		const result = board.checkRules();
		if (result?.winner === CELL_O) {
			return { score: isPlayerO ? 10 : -10 };
		} else if (result?.winner === CELL_X) {
			return { score: isPlayerO ? -10 : 10 };
		} else if (result === TIE) {
			return { score: 0 };
		}

		const availableEmptyCells = this.#getEmptyCells(board);

		if (isPlayerO) {
			let value = Number.NEGATIVE_INFINITY;

			for (const child of availableEmptyCells) {
				value = Math.max(value, this.evaluate(board, child, depth - 1, false));
			}

			return value;
		} else {
			let value = Number.POSITIVE_INFINITY;

			for (const child of availableEmptyCells) {
				value = Math.min(value, this.evaluate(board, child, depth - 1, true));
			}

			return value;
		}
	}

	/**
	 * @param {Board} board
	 * @param {CELL_EMPTY|CELL_O|CELL_X} node
	 * @param {number} depth
	 * @param {boolean} isPlayerO
	 *
	 * @return {number}
	 */
	static evaluate(board, isPlayerO) {

	}

}