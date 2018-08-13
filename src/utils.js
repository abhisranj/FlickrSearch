/*
    Common util functions used throughout the app
*/

/* Return height of document */
function getDocumentHeight() {
	const body = document.body;
	const html = document.documentElement;

	return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
}

/* Return height of scrollTop: The pixels value above the visible scrollable area */
function getScrollTop() {
	return window.pageYOffset !== undefined
		? window.pageYOffset
		: (document.documentElement || document.body.parentNode || document.body).scrollTop;
}

/* Check for scroll reaching bottom */
export function availableScrollArea() {
	return getScrollTop() < getDocumentHeight() - window.innerHeight;
}

/* Debounce function for discarding a large number of fastpace api calls */
export function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

/* Throttle function for executing a function after every x secs */
export function throttle(fn, threshhold, scope) {
	threshhold || (threshhold = 250);
	var last, deferTimer;
	return function() {
		var context = scope || this;
		var now = new Date(),
			args = arguments;
		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function() {
				last = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
}

/* Verify HTTP status if its ok */
export function httpStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		throw response;
	}
}

/* Parse response to JSON object */
export function parseJSON(response) {
	return response.json();
}

/* Generate image url */
export function getImageUrl(farm, server, id, secret) {
	return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`;
}
