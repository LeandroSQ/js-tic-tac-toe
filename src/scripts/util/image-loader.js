import { DensityCanvas } from "../widget/density-canvas";

export class ImageLoader {

	static load(identifier) {
		return new Promise((resolve, reject) => {
			// Requests the image element
			const img = document.createElement("img");
			img.src = `/assets/images/${identifier}`;

			img.onload = (e) => {
				// Return it
				resolve(img);
			};

			img.onerror = (e) => {
				reject(e);
			};
		});
	}

	static async loadAndTint(identifier, color, size) {
		// Creates a canvas element
		const canvas = new DensityCanvas();
		const ctx = canvas.context;
		canvas.setSize({ width: size, height: size });

		// Clears canvas
		ctx.clearRect(0, 0, size, size);

		// Loads the image
		const image = await this.load(identifier);

		// Resizes the image proportionally to its original aspect ratio
		const aspectRatio = image.width / image.height;
		image.width = size * aspectRatio;
		image.height = size;

		// Draws the image
		ctx.drawImage(image, (size - image.width) / 2, (size - image.height) / 2, image.width, image.height);

		// Apply tinting
		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, size, size);

		return canvas;
	}

}