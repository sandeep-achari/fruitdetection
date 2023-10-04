from flask import Flask, render_template, Response
import cv2

app = Flask(__name__)

# Your ripeness classification code goes here

def generate_frames():
    cap = cv2.VideoCapture(0)  # Initialize the webcam (change the index if needed)

    while True:
        ret, frame = cap.read()  # Read a frame from the webcam

        if not ret:
            break

        # Classify banana ripeness
        ripeness = classify_ripeness(frame)

        if ripeness:
            cv2.putText(frame, f"Ripeness: {ripeness}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            break

        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
