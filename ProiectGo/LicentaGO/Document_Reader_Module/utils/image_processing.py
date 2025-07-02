import cv2
import pytesseract
import numpy as np
from PIL import Image

def detect_checkboxes(img_pil):
    """
    Detects checkboxes or tick marks in an image using OpenCV and Tesseract OCR.

    Args:
        img_pil (PIL.Image): The image from the PDF page, containing checkboxes.

    Returns:
        list: A list of tuples containing the coordinates of detected ticked boxes.
    """
    # Convert the PIL image to OpenCV format
    img_cv = np.array(img_pil)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)
    
    # Convert the image to grayscale and apply thresholding
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

    # Detect contours in the thresholded image
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    ticked_boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Filter by checkbox size (you may need to adjust this size range)
        if 10 < w < 50 and 10 < h < 50:
            checkbox_region = thresh[y:y+h, x:x+w]
            
            # Use Tesseract OCR to detect if the checkbox is ticked
            ocr_result = pytesseract.image_to_string(checkbox_region, config='--psm 10')
            if ocr_result.strip() in ['x', 'X', '✓']:
                ticked_boxes.append((x, y, w, h))
    
    return ticked_boxes

def preprocess_image_for_ocr(img_pil):
    """
    Preprocesses the image to improve OCR accuracy.

    Args:
        img_pil (PIL.Image): The image from the PDF page.

    Returns:
        PIL.Image: The preprocessed image.
    """
    img_cv = np.array(img_pil)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)
    
    # Apply preprocessing steps (e.g., denoising, sharpening, etc.)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    preprocessed_img = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Convert back to PIL format for OCR
    img_pil_processed = Image.fromarray(preprocessed_img)
    
    return img_pil_processed
