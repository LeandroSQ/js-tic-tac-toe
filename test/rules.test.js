/* eslint-disable max-nested-callbacks */
import { CELL_O, CELL_EMPTY, CELL_X, TIE } from "../src/scripts/constants";
import { Board } from "../src/scripts/model/board";

// Mocks
/** @type {() => Board} */
const boardMock = jest.fn().mockReturnValue(new Board(null));

// Test suite
describe("Tic Tac Toe Rules", () => {
	beforeEach(() => {
		boardMock.mockClear();
	});

	describe("Horizontal lines", () => {
		describe("Win", () => {
			test("Top", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_O, CELL_O, CELL_O],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).not.toBeNull();
				expect(result).not.toBeUndefined();
				expect(result.winner).toBe(CELL_O);
			});

			test("Middle", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_O, CELL_O, CELL_O],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).not.toBeNull();
				expect(result).not.toBeUndefined();
				expect(result.winner).toBe(CELL_O);
			});

			test("Bottom", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_O, CELL_O, CELL_O],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).not.toBeNull();
				expect(result).not.toBeUndefined();
				expect(result.winner).toBe(CELL_O);
			});
		});

		describe("No winner", () => {
			test("Top", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_O, CELL_X, CELL_O],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});

			test("Middle", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_O, CELL_X, CELL_O],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});

			test("Bottom", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
					[CELL_O, CELL_X, CELL_O],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});
		});
	});

	describe("Vertical lines", () => {
		describe("Win", () => {
			describe("Left", () => {
				test("1", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_O, CELL_EMPTY, CELL_EMPTY],
						[CELL_O, CELL_EMPTY, CELL_EMPTY],
						[CELL_O, CELL_EMPTY, CELL_EMPTY],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_O);
				});

				test("2", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_O, CELL_X, CELL_O],
						[CELL_O, CELL_X, CELL_X],
						[CELL_O, CELL_O, CELL_X],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_O);
				});
			});

			test("Middle", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).not.toBeNull();
				expect(result).not.toBeUndefined();
				expect(result.winner).toBe(CELL_O);
			});

			describe("Right", () => {
				test("1", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_EMPTY, CELL_EMPTY, CELL_O],
						[CELL_EMPTY, CELL_EMPTY, CELL_O],
						[CELL_EMPTY, CELL_EMPTY, CELL_O],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_O);
				});

				test("2", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_EMPTY, CELL_O, CELL_X],
						[CELL_EMPTY, CELL_O, CELL_X],
						[CELL_EMPTY, CELL_EMPTY, CELL_X],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_X);
				});
			});
		});

		describe("No winner", () => {
			test("Left", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_O, CELL_EMPTY, CELL_EMPTY],
					[CELL_X, CELL_EMPTY, CELL_EMPTY],
					[CELL_O, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});

			test("Middle", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_EMPTY, CELL_X, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});

			test("Right", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_X],
					[CELL_EMPTY, CELL_EMPTY, CELL_O],
					[CELL_EMPTY, CELL_EMPTY, CELL_O],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});
		});
	});

	describe("Diagonal lines", () => {
		describe("Win", () => {
			test("Top left", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_O, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_O],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).not.toBeNull();
				expect(result).not.toBeUndefined();
				expect(result.winner).toBe(CELL_O);
			});

			describe("Top right", () => {
				test("1", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_EMPTY, CELL_EMPTY, CELL_O],
						[CELL_EMPTY, CELL_O, CELL_EMPTY],
						[CELL_O, CELL_EMPTY, CELL_EMPTY],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_O);
				});

				test("2", () => {
					// Arrange
					const board = boardMock();
					board.cells = [
						[CELL_X, CELL_O, CELL_X],
						[CELL_O, CELL_X, CELL_O],
						[CELL_X, CELL_X, CELL_O],
					];

					// Act
					const result = board.checkRules();

					// Assert
					expect(result).not.toBeNull();
					expect(result).not.toBeUndefined();
					expect(result.winner).toBe(CELL_X);
				});
			});
		});

		describe("No winner", () => {
			test("Top left", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_O, CELL_EMPTY, CELL_EMPTY],
					[CELL_EMPTY, CELL_X, CELL_EMPTY],
					[CELL_EMPTY, CELL_EMPTY, CELL_O],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});

			test("Top right", () => {
				// Arrange
				const board = boardMock();
				board.cells = [
					[CELL_EMPTY, CELL_EMPTY, CELL_X],
					[CELL_EMPTY, CELL_O, CELL_EMPTY],
					[CELL_O, CELL_EMPTY, CELL_EMPTY],
				];

				// Act
				const result = board.checkRules();

				// Assert
				expect(result).toBe(null);
			});
		});
	});

	describe("Tie", () => {
		test("1", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_O, CELL_X, CELL_O],
				[CELL_X, CELL_O, CELL_X],
				[CELL_X, CELL_O, CELL_X],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(TIE);
		});

		test("2", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_O, CELL_O, CELL_X],
				[CELL_X, CELL_X, CELL_O],
				[CELL_O, CELL_O, CELL_X],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(TIE);
		});

		test("3", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_X, CELL_X, CELL_O],
				[CELL_O, CELL_O, CELL_X],
				[CELL_X, CELL_X, CELL_O],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(TIE);
		});
	});

	describe("Incomplete", () => {
		test("1", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_O, CELL_EMPTY, CELL_O],
				[CELL_X, CELL_O, CELL_X],
				[CELL_X, CELL_O, CELL_X],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(null);
		});

		test("2", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_O, CELL_X, CELL_O],
				[CELL_X, CELL_O, CELL_X],
				[CELL_X, CELL_EMPTY, CELL_X],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(null);
		});

		test("3", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_O, CELL_X, CELL_O],
				[CELL_EMPTY, CELL_O, CELL_X],
				[CELL_X, CELL_EMPTY, CELL_X],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(null);
		});

		test("4", () => {
			// Arrange
			const board = boardMock();
			board.cells = [
				[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
				[CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
			];

			// Act
			const result = board.checkRules();

			// Assert
			expect(result).toBe(null);
		});
	});
});
