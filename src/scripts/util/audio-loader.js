import { SoundEffect } from "../enum/sound-effect";

export class AudioLoader {

	static #cache = { };

	/**
	 * Resolves and expands an sound effect to absolute path
	 *
	 * @param {SoundEffect} soundFX
	 * @return {string} The resolved path of the audio file
	 */
	static #resolveAudioPath(soundFX) {
		const locationRoot = window.location.href.indexOf("http://localhost:")
			? window.location.href
			: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
		const relativePath = "/assets/audio/";

		return locationRoot + relativePath + soundFX;
	}

	static load(soundFX, { volume = 1 }) {
		return new Promise((resolve, reject) => {
			// Resolves the path
			const path = this.#resolveAudioPath(soundFX);

			// Requests audio
			const audio = new Audio(path);

			// Configure it
			audio.preload = "auto";
			audio.volume = volume;

			// Wait for it to be loaded
			audio.addEventListener("canplaythrough", (e) => {
				resolve(audio);
			}, { once: true });

			audio.onerror = (e) => {
				reject(e);
			};

			audio.load();
		});
	}

}