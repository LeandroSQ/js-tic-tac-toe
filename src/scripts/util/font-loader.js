import { FONT_FAMILY } from "../constants";

export class FontLoader {

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	static async load(ctx) {
		// Define the sizes on which the font will be used, to preload
		const sizes = [36, 10];

		// For each size, check if already loaded, if not wait until it loads
		const promises = sizes.map(async size => {
			const font = `${size}pt ${FONT_FAMILY}`;
			if (!document.fonts.check(font)) {
				await document.fonts.load(font);
			}
		});

		// Waits in parallel
		await Promise.all(promises);
	}

}