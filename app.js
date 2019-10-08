/* eslint-disable-next-line no-unused-vars */
async function onPlay() {
	const videoEl = document.querySelector('#inputVideo');
	if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
		return setTimeout(() => onPlay());
	}

	const options = getFaceDetectorOptions();
	const result = await faceapi
		.detectSingleFace(videoEl, options)
		.withFaceLandmarks();

	if (result) {
		const canvas = document.querySelector('#overlay');
		const dims = faceapi.matchDimensions(canvas, videoEl, true);
		const resizedResults = faceapi.resizeResults(result, dims);

		// faceapi.draw.drawDetections(canvas, resizedResults);
		faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
	}

	setTimeout(() => onPlay());
}

async function run() {
	// load face detection models
	await faceapi.loadMtcnnModel('./models');
	await faceapi.loadFaceLandmarkModel('./models');

	// access user's webcam
	const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
	const videoEl = document.querySelector('#inputVideo');
	videoEl.srcObject = stream;
}

// helpers
function isFaceDetectionModelLoaded() {
	return !!faceapi.nets.mtcnn.params;
}

function getFaceDetectorOptions() {
	return new faceapi.MtcnnOptions({ minFaceSize: 50 });
}

document.addEventListener('DOMContentLoaded', () => {
	run();
});
