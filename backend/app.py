
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import uuid
from scipy.ndimage import maximum_filter

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)


@app.route('/')
def home():
    return "Flask server is running!"


@app.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    # Save input file
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run Hough Transform
    output_path = os.path.join(RESULT_FOLDER, f"processed_{filename}")
    success = hough_transform(filepath, output_path)

    if not success:
        return jsonify({'error': 'Processing failed'}), 500

    return jsonify({'processedImageUrl': f'/download/{os.path.basename(output_path)}'})

@app.route('/download/<filename>')
def download_file(filename):
    try:
        filepath = os.path.join(RESULT_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        return send_file(filepath, mimetype='image/png')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def hough_transform(input_path, output_path):
    try:
        COMMON_THRESHOLD = 95
        THETA_RANGE = (-90, 90)

        img = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
        edges = cv2.Canny(img, 40, 120)

        height, width = edges.shape
        diag_len = int(np.ceil(np.sqrt(height**2 + width**2)))
        thetas = np.deg2rad(np.arange(*THETA_RANGE, 1))
        rhos = np.arange(-diag_len, diag_len, 1)

        accumulator = np.zeros((len(rhos), len(thetas)), dtype=np.uint64)
        y_idxs, x_idxs = np.nonzero(edges)

        for i in range(len(x_idxs)):
            x, y = x_idxs[i], y_idxs[i]
            for t_idx, theta in enumerate(thetas):
                rho = int(round(x * np.cos(theta) + y * np.sin(theta)))
                rho_idx = rho + diag_len
                if 0 <= rho_idx < len(rhos):
                    accumulator[rho_idx, t_idx] += 1

        acc_filtered = maximum_filter(accumulator, size=(5, 5))
        peak_coords = np.argwhere((accumulator == acc_filtered) & (accumulator > COMMON_THRESHOLD))

        img_color = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        for r_idx, t_idx in peak_coords:
            rho = rhos[r_idx]
            theta = thetas[t_idx]
            a = np.cos(theta)
            b = np.sin(theta)
            x0, y0 = a * rho, b * rho
            x1 = int(x0 + 1000 * (-b))
            y1 = int(y0 + 1000 * (a))
            x2 = int(x0 - 1000 * (-b))
            y2 = int(y0 - 1000 * (a))
            cv2.line(img_color, (x1, y1), (x2, y2), (0, 0, 255), 2)

        cv2.imwrite(output_path, img_color)
        return True
    except Exception as e:
        print(f"Error during Hough Transform: {e}")
        return False

if __name__ == '__main__':
    app.run(debug=True)
