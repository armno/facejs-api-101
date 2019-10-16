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
		displayBoxInfo(resizedResults.detection.box);
		displayPupilPosition(resizedResults.landmarks);
	}

	displayVideoInfo(videoEl);

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

	listMediaDevices();
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

function displayVideoInfo(video) {
	const detected = !!document.querySelector('#videoWidth').innerText;
	if (detected) {
		return;
	}

	const width = video.offsetWidth;
	const height = video.offsetHeight;
	document.querySelector('#videoWidth').innerText = `${width}px`;
	document.querySelector('#videoHeight').innerText = `${height}px`;
}

function displayBoxInfo(box) {
	const { x, y, width, height } = box;
	document.querySelector('#boxWidth').innerText = `${width.toFixed(2)}px`;
	document.querySelector('#boxHeight').innerText = `${height.toFixed(2)}px`;
	document.querySelector('#boxY').innerText = `${y.toFixed(2)}px`;
	document.querySelector('#boxX').innerText = `${x.toFixed(2)}px`;
}

function listMediaDevices() {
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		return;
	}

	navigator.mediaDevices.enumerateDevices().then(devices => {
		const cameras = devices
			.filter(device => device.kind === 'videoinput')
			.map(device => {
				return `<li>
					<h4 class="media-device-id">${device.deviceId}</h4>
					<div class="media-device-label">${device.label}</div>
				</li>`;
			});

		document.querySelector('#mediaDevices').innerHTML = cameras;
	});
}

// https://github.com/justadudewhohacks/face-api.js/issues/437
// https://justadudewhohacks.github.io/face-api.js/docs/classes/facelandmarks68.html
function displayPupilPosition(landmarks) {
	const rightEyePoints = landmarks.getRightEye();
	const rightEyeAvg = avgPoints(rightEyePoints);

	const leftEyePoints = landmarks.getLeftEye();
	const leftEyeAvg = avgPoints(leftEyePoints);

	const nosePoints = landmarks.getNose();
	const noseAvg = avgPoints(nosePoints);

	document.querySelector(
		'#rightPupilPosition'
	).innerText = `${rightEyeAvg.x.toFixed(2)}, ${rightEyeAvg.y.toFixed(2)}`;

	document.querySelector(
		'#leftPupilPosition'
	).innerText = `${leftEyeAvg.x.toFixed(2)}, ${leftEyeAvg.y.toFixed(2)}`;

	// nose
	document.querySelector('#nosePosition').innerText = `${noseAvg.x.toFixed(
		2
	)}, ${noseAvg.y.toFixed(2)}`;
}

function avgPoints(points) {
	return points.reduce(
		(prev, curr) => {
			return {
				x: (prev.x + curr.x) / 2,
				y: (prev.y + curr.y) / 2
			};
		},
		{ x: 0, y: 0 }
	);
}

document.addEventListener('DOMContentLoaded', () => {
	run();
});
