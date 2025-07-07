from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import cv2
import numpy as np
import pytesseract
from PIL import Image
import face_recognition
import time
import base64
from io import BytesIO
import logging
from werkzeug.utils import secure_filename
import json

# Optional: CLIP model for advanced image comparison
try:
    import clip
    import torch
    CLIP_AVAILABLE = True
except ImportError:
    CLIP_AVAILABLE = False
    print("CLIP not available. Using face_recognition for comparison.")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize CLIP model if available
clip_model = None
clip_preprocess = None
if CLIP_AVAILABLE:
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        clip_model, clip_preprocess = clip.load("ViT-B/32", device=device)
        logger.info(f"CLIP model loaded on {device}")
    except Exception as e:
        logger.error(f"Failed to load CLIP model: {e}")
        CLIP_AVAILABLE = False

class IdentityVerifier:
    def __init__(self):
        self.confidence_threshold = 0.6
        self.face_match_threshold = 0.6
        
    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def preprocess_image(self, image_path):
        """Preprocess image for better OCR and face recognition"""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")
            
            # Convert to RGB for face_recognition
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Enhance image for OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            # Apply threshold to get binary image
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return rgb_image, thresh
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            return None, None
    
    def extract_text_with_ocr(self, image_path):
        """Extract text from image using Tesseract OCR"""
        try:
            # Preprocess image
            _, processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                return ""
            
            # Configure Tesseract
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            
            # Clean and format text
            cleaned_text = ' '.join(text.split())
            
            logger.info(f"OCR extracted text: {cleaned_text[:100]}...")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""
    
    def extract_faces(self, image_path):
        """Extract face encodings from image"""
        try:
            rgb_image, _ = self.preprocess_image(image_path)
            if rgb_image is None:
                return []
            
            # Find face locations
            face_locations = face_recognition.face_locations(rgb_image)
            
            if not face_locations:
                logger.warning("No faces found in image")
                return []
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            logger.info(f"Found {len(face_encodings)} faces in image")
            return face_encodings
            
        except Exception as e:
            logger.error(f"Face extraction failed: {e}")
            return []
    
    def compare_faces(self, face_encodings_1, face_encodings_2):
        """Compare face encodings and return similarity score"""
        try:
            if not face_encodings_1 or not face_encodings_2:
                return 0.0, False
            
            # Use the first face from each image
            face_1 = face_encodings_1[0]
            face_2 = face_encodings_2[0]
            
            # Calculate face distance (lower is more similar)
            face_distance = face_recognition.face_distance([face_1], face_2)[0]
            
            # Convert distance to similarity score (0-1, higher is more similar)
            similarity = 1 - face_distance
            
            # Check if faces match
            matches = face_recognition.compare_faces([face_1], face_2, tolerance=0.6)
            is_match = matches[0] if matches else False
            
            logger.info(f"Face similarity: {similarity:.3f}, Match: {is_match}")
            return similarity, is_match
            
        except Exception as e:
            logger.error(f"Face comparison failed: {e}")
            return 0.0, False
    
    def clip_image_similarity(self, image_path_1, image_path_2):
        """Compare images using CLIP model"""
        if not CLIP_AVAILABLE or clip_model is None:
            return 0.0
        
        try:
            # Load and preprocess images
            image_1 = Image.open(image_path_1).convert('RGB')
            image_2 = Image.open(image_path_2).convert('RGB')
            
            # Preprocess for CLIP
            image_1_tensor = clip_preprocess(image_1).unsqueeze(0).to(device)
            image_2_tensor = clip_preprocess(image_2).unsqueeze(0).to(device)
            
            # Get image features
            with torch.no_grad():
                features_1 = clip_model.encode_image(image_1_tensor)
                features_2 = clip_model.encode_image(image_2_tensor)
            
            # Calculate cosine similarity
            similarity = torch.cosine_similarity(features_1, features_2).item()
            
            logger.info(f"CLIP similarity: {similarity:.3f}")
            return similarity
            
        except Exception as e:
            logger.error(f"CLIP comparison failed: {e}")
            return 0.0
    
    def verify_identity(self, document_image_path, live_image_path):
        """Main verification function"""
        start_time = time.time()
        
        results = {
            'success': False,
            'confidence': 0.0,
            'face_match': False,
            'ocr_text': '',
            'processing_time': 0.0,
            'details': {},
            'message': ''
        }
        
        try:
            # Extract text from document using OCR
            ocr_text = self.extract_text_with_ocr(document_image_path)
            results['ocr_text'] = ocr_text
            
            # Extract faces from both images
            doc_faces = self.extract_faces(document_image_path)
            live_faces = self.extract_faces(live_image_path)
            
            # Compare faces
            face_similarity, face_match = self.compare_faces(doc_faces, live_faces)
            results['face_match'] = face_match
            
            # CLIP similarity (if available)
            clip_similarity = 0.0
            if CLIP_AVAILABLE:
                clip_similarity = self.clip_image_similarity(document_image_path, live_image_path)
            
            # Calculate overall confidence
            confidence_factors = []
            
            # Face recognition confidence
            if face_similarity > 0:
                confidence_factors.append(face_similarity * 0.7)  # 70% weight
            
            # CLIP similarity confidence
            if clip_similarity > 0:
                confidence_factors.append(clip_similarity * 0.3)  # 30% weight
            
            # OCR text presence
            if ocr_text.strip():
                confidence_factors.append(0.1)  # Small boost for successful OCR
            
            # Calculate final confidence
            final_confidence = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.0
            results['confidence'] = final_confidence
            
            # Determine success
            results['success'] = (
                face_match and 
                final_confidence >= self.confidence_threshold and
                len(doc_faces) > 0 and 
                len(live_faces) > 0
            )
            
            # Set message
            if results['success']:
                results['message'] = f"Identity verified successfully with {final_confidence*100:.1f}% confidence"
            else:
                if not doc_faces:
                    results['message'] = "No face detected in document image"
                elif not live_faces:
                    results['message'] = "No face detected in live photo"
                elif not face_match:
                    results['message'] = "Face verification failed - faces do not match"
                else:
                    results['message'] = f"Verification failed - confidence too low ({final_confidence*100:.1f}%)"
            
            # Additional details
            results['details'] = {
                'face_similarity': face_similarity,
                'clip_similarity': clip_similarity,
                'document_faces_found': len(doc_faces),
                'live_faces_found': len(live_faces),
                'ocr_text_length': len(ocr_text.strip()),
                'has_clip': CLIP_AVAILABLE
            }
            
            # Calculate processing time
            processing_time = time.time() - start_time
            results['processing_time'] = f"{processing_time:.2f}s"
            
            logger.info(f"Verification completed in {processing_time:.2f}s - Success: {results['success']}")
            
        except Exception as e:
            logger.error(f"Verification error: {e}")
            results['message'] = f"Verification failed due to error: {str(e)}"
            results['details']['error'] = str(e)
        
        return results

# Initialize verifier
verifier = IdentityVerifier()

@app.route('/')
def index():
    """Serve the main application"""
    # Here you would return your HTML template
    # For now, return a simple message
    return """
    <html>
    <head>
        <title>AI Identity Verification</title>
    </head>
    <body>
        <h1>AI Identity Verification System</h1>
        <p>Backend is running successfully!</p>
        <p>Use the frontend HTML file to interact with this system.</p>
    </body>
    </html>
    """

@app.route('/verify', methods=['POST'])
def verify_identity():
    """Handle identity verification requests"""
    try:
        # Check if files are present
        if 'document_image' not in request.files or 'live_image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'Missing required images',
                'confidence': 0.0
            }), 400
        
        doc_file = request.files['document_image']
        live_file = request.files['live_image']
        
        # Validate files
        if doc_file.filename == '' or live_file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No files selected',
                'confidence': 0.0
            }), 400
        
        # Save uploaded files
        doc_filename = secure_filename(f"doc_{int(time.time())}_{doc_file.filename}")
        live_filename = secure_filename(f"live_{int(time.time())}_{live_file.filename}")
        
        doc_path = os.path.join(app.config['UPLOAD_FOLDER'], doc_filename)
        live_path = os.path.join(app.config['UPLOAD_FOLDER'], live_filename)
        
        doc_file.save(doc_path)
        live_file.save(live_path)
        
        # Perform verification
        results = verifier.verify_identity(doc_path, live_path)
        
        # Clean up files (optional - comment out for debugging)
        try:
            os.remove(doc_path)
            os.remove(live_path)
        except:
            pass
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Verification endpoint error: {e}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}',
            'confidence': 0.0
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'clip_available': CLIP_AVAILABLE,
        'tesseract_available': True  # We'll assume it's available if the server starts
    })

@app.route('/test-ocr', methods=['POST'])
def test_ocr():
    """Test OCR functionality"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save temporary file
        filename = secure_filename(f"test_{int(time.time())}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text
        extracted_text = verifier.extract_text_with_ocr(filepath)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'text': extracted_text,
            'length': len(extracted_text.strip())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Print system information
    print("="*50)
    print("AI Identity Verification System")
    print("="*50)
    print(f"CLIP Available: {CLIP_AVAILABLE}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Max file size: {MAX_CONTENT_LENGTH / 1024 / 1024}MB")
    print("="*50)
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)