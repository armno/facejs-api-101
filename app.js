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
		displayPupilPosition(resizedResults.landmarks.positions);
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
function displayPupilPosition(positions) {
	const rightEyeX =
		(positions[37].x + positions[38].x + positions[39].x + positions[40].x) / 4;
	const rightEyeY =
		(positions[37].y + positions[38].y + positions[39].y + positions[40].y) / 4;

	const leftEyeX =
		(positions[43].x + positions[44].x + positions[45].x + positions[46].x) / 4;
	const leftEyeY =
		(positions[43].y + positions[44].y + positions[45].y + positions[46].y) / 4;

	document.querySelector(
		'#rightPupilPosition'
	).innerText = `${rightEyeX.toFixed(2)}px, ${rightEyeY.toFixed(2)}px`;

	document.querySelector('#leftPupilPosition').innerText = `${leftEyeX.toFixed(
		2
	)}px, ${leftEyeY.toFixed(2)}px`;
}

document.addEventListener('DOMContentLoaded', () => {
	run();
});
