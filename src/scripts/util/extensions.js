Math.clamp = function (x, min, max) {
	if (x > max) return max;
	else if (x < min) return min;
	else return x;
};

Math.lerp = function (current, target, speed) {
	const difference = target - current;

	if (difference > speed) return current + speed;
	else if (difference < -speed) return current - speed;
	else return current + difference;
};

Math.randomRange = function (min, max) {
	return Math.random() * (max - min) + min;
};

Math.randomIntRange = function (min, max) {
	return Math.floor(Math.randomRange(min, max));
};

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

window.addLoadEventListener = function (handler, timeout = 1000) {
	let fired = false;

	const _func = () => {
		if (fired) return;
		fired = true;

		handler();
	};

	window.addEventListener("DOMContentLoaded", _func);
	window.addEventListener("load", _func);
	document.addEventListener("load", _func);
	window.addEventListener("ready", _func);
	setTimeout(_func, timeout);
};

window.addVisibilityChangeEventListener = function (handler) {
	const events = ["visibilitychange", "webkitvisibilitychange", "mozvisibilitychange", "msvisibilitychange"];

	let fired = false;

	const _func = () => {
		if (fired) return;
		fired = true;

		handler(!document.hidden);
	};

	events.forEach((event) => {
		window.addEventListener(event, _func);
	});
};

if (!CanvasRenderingContext2D.prototype.hasOwnProperty("roundRect")) {
	// eslint-disable-next-line max-params
	CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
		let r = radius;
		if (Array.isArray(r)) {
			if (r.length <= 1) r = { tl: r[0], tr: r[0], br: r[0], bl: r[0] };
			else r = { tl: r[0] || 0, tr: r[1] || 0, br: r[2] || 0, bl: r[3] || 0 };
		} else if (typeof r === "number") {
			r = { tl: r, tr: r, br: r, bl: r };
		} else {
			r = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...r };
		}

		this.beginPath();
		this.moveTo(x + r.tl, y);
		this.lineTo(x + width - r.tr, y);
		this.quadraticCurveTo(x + width, y, x + width, y + r.tr);
		this.lineTo(x + width, y + height - r.br);
		this.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
		this.lineTo(x + r.bl, y + height);
		this.quadraticCurveTo(x, y + height, x, y + height - r.bl);
		this.lineTo(x, y + r.tl);
		this.quadraticCurveTo(x, y, x + r.tl, y);
		this.closePath();
	};
}

String.prototype.toCamelCase = function() {
	return this.replace("--", "")
		.replace(/-./g, (x) => x[1].toUpperCase());
};

if (!window.hasOwnProperty("Color")) window.Color = { };
window.Color.isColorLight = function(hex) {
	const color = +(`0x${hex.trim().slice(1).replace(hex.length < 5 && /./g, "$&$&")}`);

	const r = color >> 16;
	const g = (color >> 8) & 255;
	const b = color & 255;

	// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
	const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

	return hsp > 127.5;
};

console.matrix = function(matrix, hint=null) {
	if (hint) console.log(hint);

	let buffer = "";
	for (const row of matrix) {
		for (let col = 0; col < row.length; col++) {
			buffer += row[col];
			if (col < row.length - 1) {
				buffer += " ";
			}
		}
		buffer += "\n";
	}
	
	console.log(buffer);
};