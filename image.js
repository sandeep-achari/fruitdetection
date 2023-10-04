const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ripenessLabel = document.getElementById('ripeness');
let capturing = false;

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}

function startCapture() {
    if (capturing) return;
    capturing = true;

    const context = canvas.getContext('2d');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    const ripenessThresholds = {
        'Unripe': [[30, 50, 50], [60, 255, 255]],
        'Semi-Ripe': [[15, 50, 50], [25, 255, 255]],
        'Perfectly Ripe': [[0, 50, 50], [5, 255, 255]],
        'Overripe': [[0, 0, 50], [30, 50, 255]],
        'Rotten': [[0, 0, 0], [0, 0, 50]]
    };

    function calculateAverageColor(imageData) {
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        const pixelCount = imageData.data.length / 4; // Each pixel consists of 4 values: R, G, B, and Alpha

        for (let i = 0; i < imageData.data.length; i += 4) {
            totalR += imageData.data[i];
            totalG += imageData.data[i + 1];
            totalB += imageData.data[i + 2];
        }

        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);

        return [avgR, avgG, avgB];
    }

    function isColorWithinThreshold(color, threshold) {
        const [lowerThreshold, upperThreshold] = threshold;

        for (let i = 0; i < 3; i++) { // Check R, G, and B components
            if (color[i] < lowerThreshold[i] || color[i] > upperThreshold[i]) {
                return false; // At least one component is outside the threshold
            }
        }

        return true; // All components are within the threshold
    }

    function classifyRipeness() {
        if (!capturing) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const avgColor = calculateAverageColor(imageData);

        let ripeness = null;
        for (const stage in ripenessThresholds) {
            if (isColorWithinThreshold(avgColor, ripenessThresholds[stage])) {
                ripeness = stage;
                break;
            }
        }

        ripenessLabel.textContent = ripeness || 'Unknown';
        requestAnimationFrame(classifyRipeness);
    }

    classifyRipeness();
}

function stopCapture() {
    capturing = false;
}

initCamera();

video.addEventListener('play', () => startCapture());
video.addEventListener('pause', () => stopCapture());
