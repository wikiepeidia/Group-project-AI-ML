Models

- Model 1 — Layout-aware OCR
 	- Purpose: Detect invoice tables/fields and extract text.
 	- Algorithm: YOLOv8 (layout) + PaddleOCR with fallback to EasyOCR/Tesseract.
 	- Key files: `models/OCR.py`, `dl_service/train_cnn_models.py`.
 	- Output: Structured invoice JSON (fields, tables, confidences).

- Model 2 — LSTM Quantity Forecaster
 	- Purpose: Predict future import quantities.
 	- Architecture: LSTM layers (128→64→32) → Dense(16) → Dense(1).
 	- Key files: `models/lstm_model.py`, `dl_service/train_lstm_model.py`, `services/forecast_service.py`.
 	- Output: Forecast values (+ optional uncertainty/OOD score).

Datasets & training artifacts

- Training data: historical invoices and derived product-level timeseries (~14,367 products in dataset).
- Saved artifacts: `saved_models/lstm_text_recognizer.weights.h5`, scalers `*_scaler.pkl`, YOLO checkpoints from `train_cnn_models.py`.

Evaluation

- LSTM (latest run, 16 epochs): Train Loss 0.0044, Val Loss 0.0021, Train MAE 0.0403, Val MAE 0.0226.
- Layout detector: improved OCR precision by cropping table regions; quantitative mAP tracking is recommended.

Robustness & OOD

- Known issues: new/unknown products may produce unreliable forecasts.
- Implemented/available strategies: MC Dropout, Mahalanobis distance, ensemble models, synthetic OOD augmentation (see `DOCUMENTS/model/OOD_README.md`).

Limitations & risks

- OCR fails on very low-quality scans; fallback OCR helps but is not foolproof.
- Forecasts are only as reliable as historical data; sparse product histories reduce accuracy.

Deployment & monitoring

- `/api/model1/detect` returns a `metrics` payload with layout confidence, OCR precision, and running averages; the UI surfaces these metrics.
- Monitor model drift and trigger retraining when metrics degrade.

Quick reproduction steps

1. Train layout detector: `python dl_service/train_cnn_models.py`.
2. Train LSTM: `python dl_service/train_lstm_model.py` (produces `saved_models/*.h5`).

Example (forecast)

- Input: last 30 days of product import quantities + product/location features.
- Output: `forecast_period: 14 days`, `predictions: [12, 15, 14, ...]`, `confidence: 0.85`.
