/* eslint-disable no-param-reassign */
/* eslint-disable max-statements */
import { DensityCanvas } from "../widget/density-canvas";

export class ImageLoader {

	/**
	 * Resolves and expands an image to absolute path
	 *
	 * @param {string} identifier Specifies the image to be loaded
	 * @return {string} The resolved path of the audio file
	 */
	static #resolvePath(identifier) {
		const locationRoot = window.location.href.indexOf("http://localhost:")
			? window.location.href
			: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
		const relativePath = "/assets/images/";

		return locationRoot + relativePath + identifier;
	}

	static #loadImage(identifier) {
		return new Promise((resolve, reject) => {
			// Requests the image element
			const img = document.createElement("img");
			img.src = this.#resolvePath(identifier);

			img.onload = (e) => {
				// Return it
				resolve(img);
			};

			img.onerror = (e) => {
				reject(e);
			};
		});
	}

	/**
	 * Loads an image asset
	 *
	 * @param {string} identifier Define the filename to be loaded
	 * @param {object} options Define options for processing the image, after loading
	 * @param {number} [options.width]
	 * @param {number} [options.height]
	 * @param {string} [options.tint]
	 *
	 * @return {DensityCanvas|HTMLImageElement}
	 */
	static async load(identifier, options) {
		// Actually loads the image
		const image = await this.#loadImage(identifier);

		// If required, process it
		if (options && (options.width || options.height || options.tint)) return this.process(image, options);
		else return image;
	}

	/**
	 * Loads an image asset
	 *
	 * @param {HTMLImageElement} image The image to be processed
	 * @param {object} options Define options for processing the image
	 * @param {number} [options.width]
	 * @param {number} [options.height]
	 * @param {string} [options.tint]
	 *
	 * @return {DensityCanvas|HTMLImageElement}
	 */
	static process(image, options) {
		// Creates a canvas element
		const canvas = new DensityCanvas();
		const ctx = canvas.context;

		// Resizes the image
		if (options.width && options.height) {
			// Set fixed dimensions
			image.width = options.width;
			image.height = options.height;
		} else if (options.width && !options.height) {
			// Resizes the image proportionally to its original aspect ratio
			const aspectRatio = image.height / image.width;
			image.width = options.width * aspectRatio;
			image.height = options.width;

			options.height = image.width;
		} else if (!options.width && options.height) {
			// Resizes the image proportionally to its original aspect ratio
			const aspectRatio = image.width / image.height;
			image.width = options.height * aspectRatio;
			image.height = options.height;

			options.width = image.width;
		} else if (!options.width && !options.height) {
			// Maintain the image dimensions
			options.width = image.width;
			options.height = image.height;
		}
		canvas.setSize(options);

		// Clears canvas
		canvas.clear();

		// Draws the image, centered
		ctx.drawImage(image, (options.width - image.width) / 2, (options.height - image.height) / 2, image.width, image.height);

		// Apply option.tinting
		if (options.tint) {
			ctx.globalCompositeOperation = "source-in";
			ctx.fillStyle = options.tint;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		return canvas;
	}

}