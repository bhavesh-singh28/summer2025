from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import cv2
import numpy as np
from PIL import Image
import face_recognition
import time
import logging
from werkzeug.utils import secure_filename
import fitz  
import uuid


try:
    import clip
    import torch
    CLIP_AVAILABLE = True
except ImportError:
    CLIP_AVAILABLE = False
    print("CLIP not available. Using face_recognition only.")

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

clip_model = None
clip_preprocess = None
device = "cpu"
if CLIP_AVAILABLE:
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        clip_model, clip_preprocess = clip.load("ViT-B/32", device=device)
        logger.info(f"CLIP model loaded on {device}")
    except Exception as e:
        logger.error(f"Failed to load CLIP model: {e}")
        CLIP_AVAILABLE = False


def convert_pdf_to_image(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=200)
        img_path = pdf_path.replace('.pdf', '_converted.jpg')
        pix.save(img_path)
        return img_path
    except Exception as e:
        logger.error(f"Failed to convert PDF: {e}")
        return None


class IdentityVerifier:
    def __init__(self):
        self.confidence_threshold = 0.5  

    def preprocess_image(self, image_path):
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            return rgb_image
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            return None

    def extract_faces(self, image_path):
        try:
            rgb_image = self.preprocess_image(image_path)
            if rgb_image is None:
                return []
            locations = face_recognition.face_locations(rgb_image)
            encodings = face_recognition.face_encodings(rgb_image, locations)
            logger.info(f"Extracted {len(encodings)} face(s) from {image_path}")
            return encodings
        except Exception as e:
            logger.error(f"Face extraction failed: {e}")
            return []

    def compare_faces(self, enc1, enc2):
        try:
            if not enc1 or not enc2:
                return 0.0, False
            face1 = enc1[0]
            face2 = enc2[0]
            distance = face_recognition.face_distance([face1], face2)[0]
            similarity = 1 - distance
            match = face_recognition.compare_faces([face1], face2, tolerance=0.85)[0]
            logger.info(f"Face distance: {distance:.4f} | Similarity: {similarity:.4f} | Match: {match}")
            return similarity, match
        except Exception as e:
            logger.error(f"Face comparison failed: {e}")
            return 0.0, False

    def clip_image_similarity(self, path1, path2):
        if not CLIP_AVAILABLE or clip_model is None:
            return 0.0
        try:
            image1 = Image.open(path1).convert('RGB')
            image2 = Image.open(path2).convert('RGB')
            tensor1 = clip_preprocess(image1).unsqueeze(0).to(device)
            tensor2 = clip_preprocess(image2).unsqueeze(0).to(device)
            with torch.no_grad():
                f1 = clip_model.encode_image(tensor1)
                f2 = clip_model.encode_image(tensor2)
            similarity = torch.cosine_similarity(f1, f2).item()
            logger.info(f"CLIP similarity: {similarity:.4f}")
            return similarity
        except Exception as e:
            logger.error(f"CLIP comparison failed: {e}")
            return 0.0

    def verify_identity(self, doc_path, live_path):
        start = time.time()
        results = {
            'success': False, 'confidence': 0.0, 'face_match': False,
            'processing_time': 0.0, 'details': {}, 'message': ''
        }
        try:
            if doc_path.lower().endswith('.pdf'):
                converted = convert_pdf_to_image(doc_path)
                if converted:
                    doc_path = converted
                else:
                    results['message'] = "PDF conversion failed"
                    return results

            doc_faces = self.extract_faces(doc_path)
            live_faces = self.extract_faces(live_path)

            face_similarity, face_match = self.compare_faces(doc_faces, live_faces)
            clip_similarity = self.clip_image_similarity(doc_path, live_path) if CLIP_AVAILABLE else 0.0

            # Prioritize face similarity
            conf = []
            if face_similarity > 0: conf.append(face_similarity * 0.9)
            if clip_similarity > 0: conf.append(clip_similarity * 0.1)

            final_conf = (face_similarity * 0.95 + clip_similarity * 0.05)

            results.update({
                'confidence': final_conf,
                'face_match': face_match,
                'success': face_match and final_conf >= self.confidence_threshold and doc_faces and live_faces,
                'details': {
                    'face_similarity': face_similarity,
                    'clip_similarity': clip_similarity,
                    'document_faces_found': len(doc_faces),
                    'live_faces_found': len(live_faces),
                    'has_clip': CLIP_AVAILABLE
                },
                'processing_time': f"{time.time() - start:.2f}s"
            })

            # Final message
            if results['success']:
                results['message'] = f"✅ Identity verified with {final_conf*100:.1f}% confidence"
            else:
                if not doc_faces:
                    results['message'] = "❌ No face in document image"
                elif not live_faces:
                    results['message'] = "❌ No face in live photo"
                elif not face_match:
                    results['message'] = "❌ Face mismatch"
                else:
                    results['message'] = f"⚠️ Low confidence ({final_conf*100:.1f}%)"

        except Exception as e:
            logger.error(f"Verification error: {e}")
            results['message'] = f"Verification error: {e}"

        return results


verifier = IdentityVerifier()

@app.route('/')
def home():
    return render_template_string("""
    <h2>AI Face Verification Backend</h2>
    <p>Status: Running ✅</p>
    """)

@app.route('/verify', methods=['POST'])
def verify_route():
    try:
        if 'document_image' not in request.files or 'live_image' not in request.files:
            return jsonify({'success': False, 'message': 'Missing required images'}), 400

        doc_file = request.files['document_image']
        live_file = request.files['live_image']
        if not doc_file.filename or not live_file.filename:
            return jsonify({'success': False, 'message': 'No file selected'}), 400

        doc_filename = secure_filename(f"doc_{int(time.time())}_{uuid.uuid4().hex}_{doc_file.filename}")
        live_filename = secure_filename(f"live_{int(time.time())}_{uuid.uuid4().hex}_{live_file.filename}")
        doc_path = os.path.join(UPLOAD_FOLDER, doc_filename)
        live_path = os.path.join(UPLOAD_FOLDER, live_filename)
        doc_file.save(doc_path)
        live_file.save(live_path)

        results = verifier.verify_identity(doc_path, live_path)

        results['success'] = bool(results['success'])
        results['confidence'] = float(results['confidence'])
        results['face_match'] = bool(results['face_match'])
        results['details']['face_similarity'] = float(results['details']['face_similarity'])
        results['details']['clip_similarity'] = float(results['details']['clip_similarity'])
        results['details']['document_faces_found'] = int(results['details']['document_faces_found'])
        results['details']['live_faces_found'] = int(results['details']['live_faces_found'])
        results['details']['has_clip'] = bool(results['details']['has_clip'])

        # Cleanup
        try:
            os.remove(doc_path)
            os.remove(live_path)
        except Exception as e:
            logger.warning(f"File cleanup failed: {e}")

        return jsonify(results)

    except Exception as e:
        logger.error(f"/verify endpoint error: {e}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'clip_available': CLIP_AVAILABLE
    })


if __name__ == '__main__':
    print("=" * 60)
    print("AI Face Verification System")
    print("=" * 60)
    print(f"CLIP Available: {CLIP_AVAILABLE}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Max file size: {MAX_CONTENT_LENGTH / 1024 / 1024} MB")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
