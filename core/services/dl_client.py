import requests
import json
import os

class DLClient:
    """
    Client for the Deep Learning Microservice.
    """
    def __init__(self, base_url=None):
        self.base_url = base_url or os.environ.get('DL_SERVICE_URL', 'http://localhost:5001')
        self.timeout = int(os.environ.get('DL_SERVICE_TIMEOUT', 30))

    def detect_invoice(self, file_path=None, file_bytes=None, filename=None):
        """
        Calls /api/model1/detect to extract invoice data.
        """
        url = f"{self.base_url}/api/model1/detect"
        files = {}
        
        try:
            if file_path:
                files = {'file': open(file_path, 'rb')}
            elif file_bytes:
                files = {'file': (filename or 'invoice.jpg', file_bytes)}
            else:
                raise ValueError("Either file_path or file_bytes must be provided")

            response = requests.post(url, files=files, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"DL Service Error (Detect): {e}")
            return {"error": str(e), "status": "failed"}
        finally:
            if file_path and 'file' in files:
                files['file'].close()

    def forecast_quantity(self, data):
        """
        Calls /api/model2/forecast to predict quantities.
        """
        url = f"{self.base_url}/api/model2/forecast"
        try:
            response = requests.post(url, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"DL Service Error (Forecast): {e}")
            return {"error": str(e), "status": "failed"}

    def run_ocr(self, file_path=None, file_bytes=None, filename=None):
        """
        Calls /api/ocr/ for raw text extraction.
        """
        url = f"{self.base_url}/api/ocr/"
        files = {}
        try:
            if file_path:
                files = {'image': open(file_path, 'rb')} # Note: API might expect 'image' or 'file'
            elif file_bytes:
                files = {'image': (filename or 'doc.jpg', file_bytes)}
            
            response = requests.post(url, files=files, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"DL Service Error (OCR): {e}")
            return {"error": str(e), "status": "failed"}
        finally:
            if file_path and 'image' in files:
                files['image'].close()
