/* eslint-disable-next-line no-unused-vars */
async function onPlay() {
	const videoEl = document.querySelector('#inputVideo');
	if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
		return requestAnimationFrame(() => onPlay());
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

		// draw customized landmarks
		const landmarkDrawBox = new faceapi.draw.DrawFaceLandmarks(
			resizedResults.landmarks,
			{
				drawLines: true,
				drawPoints: true,
				pointSize: 2,
				lineWidth: 2,
				pointColor: 'rgba(255, 255, 255, 0.7)',
				lineColor: 'rgba(255, 255, 255, 0.7)'
			}
		);
		landmarkDrawBox.draw(canvas);
	}

	requestAnimationFrame(() => onPlay());
}

async function run() {
	// load face detection models
	await faceapi.nets.tinyFaceDetector.load('./models');
	await faceapi.loadFaceLandmarkModel('./models');

	// access device's camera
	const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
	const videoEl = document.querySelector('#inputVideo');
	videoEl.srcObject = stream;
}

// helpers
function isFaceDetectionModelLoaded() {
	return !!faceapi.nets.tinyFaceDetector.params;
}

function getFaceDetectorOptions() {
	return new faceapi.TinyFaceDetectorOptions({
		inputSize: 512, // must be divisable by 32
		scoreThreshold: 0.5
	});
}

document.addEventListener('DOMContentLoaded', () => {
	run();
});
