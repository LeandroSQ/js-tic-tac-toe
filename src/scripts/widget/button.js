import { BORDER_RADIUS, FONT_FAMILY } from "../constants";
import { SoundEffect } from "../enum/sound-effect";
import { AudioLoader } from "../util/audio-loader";

/**
 * @typedef {import("./../controller/mouse.js").MouseController} MouseController
 * @typedef {import("./../controller/theme.js").ThemeController} ThemeController
 */

export class Button {

	/**
	 *
	 * @param {string} text
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Function} onClick
	 */
	constructor({ text, x, y, width, height, channel, onClick }) {
		this.text = text;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.onClick = onClick;

		this.audioHover = null;

		this.isHovered = false;
	}

	async load() {
		this.audioHover = await AudioLoader.load(SoundEffect.BUTTON_HOVER, { volume: 0.05 });
	}

	/**
	 * @param {number} deltaTime
	 * @param {MouseController} mouse
	 */
	update(deltaTime, mouse) {
		const wasHoveredPreviously = this.isHovered;
		const isWithinBounds = mouse.position.x >= this.x && mouse.position.x <= this.x + this.width && mouse.position.y >= this.y && mouse.position.y <= this.y + this.height;
		this.isHovered = isWithinBounds;

		if (this.isHovered) {
			document.body.style.cursor = "pointer";

			// If now hovered, play a sound effect
			if (!wasHoveredPreviously || mouse.isClicking) this.audioHover.play();

			// If clicked
			if (mouse.isClicking) this.onClick();
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		/** @type {ThemeController */
		const theme = window.instance.theme;

		ctx.beginPath();
		ctx.fillStyle = this.isHovered ? theme.boardBorder : theme.boardBackground;
		ctx.strokeStyle = this.isHovered ? theme.boardBackground : theme.boardBorder;
		ctx.lineWidth = 1;
		ctx.roundRect(this.x, this.y, this.width, this.height, BORDER_RADIUS);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();

		ctx.fillStyle = theme.foreground;
		ctx.font = `12pt ${FONT_FAMILY}`;
		ctx.fillTextCentered(this.text, this.x + this.width / 2, this.y + this.height / 2);
	}

}