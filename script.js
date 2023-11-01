const liveView = document.getElementById("liveView");
const webcamButton = document.getElementById("webcamButton");
const webcam = document.getElementById('webcam');

let model;

cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
});

const getUserMedia = () => {
    return !!(navigator.getUserMedia && navigator.mediaDevices.getUserMedia);
};

const enableWebcam = (event) => {
    if (!model) {
        return;
    };

    event.target.classList.add('hidden');

    const userMediaProperties = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(userMediaProperties).then(function (stream) {
        webcam.srcObject = stream;
        webcam.addEventListener("loadeddata", webcamOutput);
    });
};

if (getUserMedia()) {
    webcamButton.addEventListener("click", enableWebcam);
} else {
    console.warn('Webcam not found');
    alert('Webcam not found');
};

let boundingBoxes = [];

const webcamOutput = () => {
    model.detect(webcam).then(function (modelOutput){
        for (let i = 0; i < boundingBoxes.length; i++) {
            liveView.removeChild(boundingBoxes[i]);
        }
        boundingBoxes.splice(0);

       for (let x = 0; x < modelOutput.length; x++) {
        if (modelOutput[x].score > 0.7) {
            const p = document.createElement("p");
            p.innerText = `${modelOutput[x].class} - with ${Math.round(parseFloat(modelOutput[x].score) * 100)}% confidence.`;
            p.style = `margin-left: ${modelOutput[x].bbox[0]}px; margin-top: ${modelOutput[x].bbox[1] - 10}px; width: ${modelOutput[x].bbox[2] - 10}px; top: 0; left: 0;`;

            const div = document.createElement("div");
            div.setAttribute("class", "highlighter");
            div.style = `left: ${modelOutput[x].bbox[0]}px; top: ${modelOutput[x].bbox[1]}px; width: ${modelOutput[x].bbox[2]}px; height: ${modelOutput[x].bbox[3]}px;`;

            liveView.appendChild(p);
            liveView.appendChild(div);
            boundingBoxes.push(p);
            boundingBoxes.push(div);
        }
       } 
       window.requestAnimationFrame(webcamOutput);
    });
};