{
	run();

	async function run() {
		console.log('running');

		// load models
		await faceapi.loadMtcnnModel('./models');
		await faceapi.loadFaceRecognitionModel('./models');

		const videoElement = document.querySelector('#inputVideo');
		navigator.getUserMedia(
			{
				video: {}
			},
			stream => (videoElement.srcObject = stream),
			error => console.error(error)
		);
	}
}
