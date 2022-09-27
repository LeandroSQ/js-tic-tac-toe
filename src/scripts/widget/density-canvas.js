export class DensityCanvas {

	constructor() {
		/** @type {HTMLCanvasElement} */
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.virtualWidth = null;
		this.virtualHeight = null;
		this.enableHighDPI = true;
	}

	fullscreen() {
		this.canvas.onfullscreenerror = (e) => {
			console.error(e);
		};

		if (this.canvas.requestFullscreen) {
			this.canvas.requestFullscreen();
		} else if (this.canvas.webkitRequestFullscreen) {
			this.canvas.webkitRequestFullscreen();
		} else if (this.canvas.msRequestFullscreen) {
			this.canvas.msRequestFullscreen();
		}
	}

	get backingStoreRatio() {
		if (!this.enableHighDPI) return 0.05;

		return (
			this.context.webkitBackingStorePixelRatio ||
			this.context.mozBackingStorePixelRatio ||
			this.context.msBackingStorePixelRatio ||
			this.context.oBackingStorePixelRatio ||
			this.context.backingStorePixelRatio ||
			1
		);
	}

	get devicePixelRatio() {
		if (!this.enableHighDPI) return 0.05;

		return window.devicePixelRatio || 1;
	}

	get drawRatio() {
		// Calculate the display density pixel ratio
		return this.devicePixelRatio / this.backingStoreRatio;
	}

	// eslint-disable-next-line max-statements
	setSize({ width, height }) {
		// Set the canvas size
		if (this.backingStoreRatio !== this.devicePixelRatio) {
			// Set the virtual canvas size to the real resolution
			this.canvas.width = width * this.drawRatio;
			this.canvas.height = height * this.drawRatio;

			// Set the presented canvas size to the visible resolution
			this.canvas.style.width = `${width}px`;
			this.canvas.style.minWidth = `${width}px`;
			this.canvas.style.height = `${height}px`;
			this.canvas.style.minHeight = `${height}px`;
		} else {
			// 1:1 ratio, just scale it
			this.canvas.width = width;
			this.canvas.height = height;

			this.canvas.style.width = "";
			this.canvas.style.height = "";
		}

		// Scale the canvas according to the ratio
		this.context.scale(this.drawRatio, this.drawRatio);

		// Save the virtual size of the canvas
		this.virtualWidth = width;
		this.virtualHeight = height;
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawBufferTo(x, y, ctx) {
		ctx.save();
		ctx.scale(1 / this.drawRatio, 1 / this.drawRatio);
		ctx.drawImage(this.canvas, x * this.drawRatio, y * this.drawRatio);
		ctx.restore();
	}

	/**
	 * Attaches the canvas element as child to a given HTMLElement
	 *
	 * @param {HTMLElement} element The parent element to attach the canvas
	 */
	attachToElement(element) {
		element.appendChild(this.canvas);
	}

	get width() {
		return this.virtualWidth || this.canvas.width;
	}

	get height() {
		return this.virtualHeight || this.canvas.height;
	}

}
