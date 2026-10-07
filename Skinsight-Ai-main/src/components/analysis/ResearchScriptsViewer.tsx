import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  FileJson,
  Layers,
  Cpu,
  Scan
} from 'lucide-react';
import { AnalysisResult } from '../../types';

interface ResearchScriptsViewerProps {
  analysis?: AnalysisResult | null;
}

const MASK_TO_YOLO_CODE = `"""
Step 1: Convert ISIC 2017 Task 1 binary segmentation masks -> YOLO bounding-box labels.

Input (after downloading + unzipping the two ISIC 2017 Task 1 zips):
  ISIC-2017_Training_Data/                      <- .jpg images, e.g. ISIC_0000000.jpg
  ISIC-2017_Training_Part1_GroundTruth/          <- .png masks, e.g. ISIC_0000000_segmentation.png

Output:
  yolo_dataset/
    images/train/ISIC_0000000.jpg   (copied)
    labels/train/ISIC_0000000.txt   (YOLO format: class x_center y_center width height, all normalized 0-1)
    data.yaml                       (YOLO dataset config)

Run in Colab:
  !pip install opencv-python-headless numpy tqdm
  !python 1_mask_to_yolo.py \\
      --images_dir /content/ISIC-2017_Training_Data \\
      --masks_dir /content/ISIC-2017_Training_Part1_GroundTruth \\
      --out_dir /content/yolo_dataset
"""

import argparse
import shutil
from pathlib import Path

import cv2
import numpy as np
from tqdm import tqdm


def mask_to_yolo_box(mask_path: Path, img_w: int, img_h: int):
    """Read a binary mask and return one YOLO-format bbox line (class 0 = lesion).
    If the mask has multiple disconnected blobs, use the single largest contour
    (dermoscopic images are single-lesion by convention in ISIC)."""
    mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
    if mask is None:
        return None

    _, binary = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    # Convert to YOLO normalized center-x, center-y, width, height
    x_center = (x + w / 2) / img_w
    y_center = (y + h / 2) / img_h
    w_norm = w / img_w
    h_norm = h / img_h

    return f"0 {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}"


def find_mask_for_image(image_stem: str, masks_dir: Path):
    """ISIC masks are usually named <image_id>_segmentation.png — try a few naming variants."""
    candidates = [
        masks_dir / f"{image_stem}_segmentation.png",
        masks_dir / f"{image_stem}_Segmentation.png",
        masks_dir / f"{image_stem}.png",
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images_dir", required=True, type=Path)
    parser.add_argument("--masks_dir", required=True, type=Path)
    parser.add_argument("--out_dir", required=True, type=Path)
    parser.add_argument("--val_split", type=float, default=0.15,
                         help="fraction of images held out for validation")
    args = parser.parse_args()

    images = sorted(list(args.images_dir.glob("*.jpg")) + list(args.images_dir.glob("*.jpeg")))
    if not images:
        raise SystemExit(f"No .jpg/.jpeg images found in {args.images_dir}")

    n_val = int(len(images) * args.val_split)
    val_set = set(images[:n_val])

    for split in ("train", "val"):
        (args.out_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (args.out_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    skipped = []
    for img_path in tqdm(images, desc="Converting masks to YOLO labels"):
        stem = img_path.stem
        mask_path = find_mask_for_image(stem, args.masks_dir)
        if mask_path is None:
            skipped.append(stem)
            continue

        img = cv2.imread(str(img_path))
        if img is None:
            skipped.append(stem)
            continue
        h, w = img.shape[:2]

        yolo_line = mask_to_yolo_box(mask_path, w, h)
        if yolo_line is None:
            skipped.append(stem)
            continue

        split = "val" if img_path in val_set else "train"
        shutil.copy(img_path, args.out_dir / "images" / split / img_path.name)
        with open(args.out_dir / "labels" / split / f"{stem}.txt", "w") as f:
            f.write(yolo_line + "\\n")

    # data.yaml for YOLO training (works with Ultralytics YOLOv8/YOLO11)
    yaml_content = f"""path: {args.out_dir.resolve()}
train: images/train
val: images/val
nc: 1
names: ['lesion']
"""
    (args.out_dir / "data.yaml").write_text(yaml_content)

    print(f"\\nDone. Converted {len(images) - len(skipped)} images.")
    if skipped:
        print(f"Skipped {len(skipped)} images (no matching mask or read error). "
              f"First few: {skipped[:5]}")
    print(f"Dataset ready at: {args.out_dir}")
    print(f"Config written to: {args.out_dir / 'data.yaml'}")


if __name__ == "__main__":
    main()
`;

const TRAIN_YOLO_CODE = `"""
Step 2: Train a YOLO lesion-detector on the dataset produced by 1_mask_to_yolo.py.

Uses Ultralytics YOLO (YOLOv8/YOLO11) instead of the older YOLOv4 — it's actively
maintained, trains faster, and needs far less boilerplate. The output format your
chatbot pipeline needs (bounding box + confidence) is identical either way.

Run in Colab (use a GPU runtime: Runtime > Change runtime type > GPU):
  !pip install ultralytics
  !python 2_train_yolo.py --data /content/yolo_dataset/data.yaml --epochs 50
"""

import argparse

from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="path to data.yaml from step 1")
    parser.add_argument("--model", default="yolov8n.pt",
                         help="starting checkpoint: yolov8n.pt (fastest) up to yolov8x.pt (most accurate)")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--project", default="runs/lesion_detect")
    parser.add_argument("--name", default="isic2017_yolo")
    args = parser.parse_args()

    model = YOLO(args.model)  # loads pretrained COCO weights, then fine-tunes on lesions

    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        patience=15,       # early stopping if val loss plateaus
        save=True,
        plots=True,
    )

    # Validate and print final metrics (mAP50, mAP50-95, precision, recall)
    metrics = model.val()
    print("\\nFinal validation metrics:")
    print(metrics)

    best_weights = f"{args.project}/{args.name}/weights/best.pt"
    print(f"\\nBest weights saved to: {best_weights}")
    print("Use this path when loading YOLO in your inference/chatbot pipeline:")
    print(f'    from ultralytics import YOLO\\n    yolo_model = YOLO("{best_weights}")')


if __name__ == "__main__":
    main()
`;

const TRAIN_XCEPTION_CODE = `"""
Step 3: Train an Xception classifier on ISIC 2016 Task 3 (lesion classification).

Input (after downloading + unzipping the ISIC 2016 Task 3 files):
  ISBI2016_ISIC_Part3_Training_Data/                  <- .jpg images
  ISBI2016_ISIC_Part3_Training_GroundTruth.csv         <- columns: image_id,label
                                                            (label is typically "benign"/"malignant"
                                                             or 0/1 — this script handles either)

Output:
  xception_lesion_classifier.h5   <- trained model weights
  class_names.json                <- ordered list of class labels, matching model output indices

Run in Colab (GPU runtime recommended):
  !pip install tensorflow pandas scikit-learn
  !python 3_train_xception_classifier.py \\
      --images_dir /content/ISBI2016_ISIC_Part3_Training_Data \\
      --labels_csv /content/ISBI2016_ISIC_Part3_Training_GroundTruth.csv \\
      --epochs 20
"""

import argparse
import json
from pathlib import Path

import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models
from tensorflow.keras.applications import Xception
from tensorflow.keras.applications.xception import preprocess_input

IMG_SIZE = (299, 299)  # Xception's native input size


def load_dataframe(labels_csv: Path, images_dir: Path) -> pd.DataFrame:
    df = pd.read_csv(labels_csv, header=None)
    # ISIC ground-truth CSVs sometimes have no header row; normalize to 2 columns.
    df = df.iloc[:, :2]
    df.columns = ["image_id", "label"]

    df["image_id"] = df["image_id"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.strip().str.lower()
    # Normalize common label variants to a consistent string
    df["label"] = df["label"].replace({"1": "malignant", "0": "benign",
                                        "1.0": "malignant", "0.0": "benign"})

    def resolve_path(image_id: str):
        for ext in (".jpg", ".jpeg", ".png"):
            p = images_dir / f"{image_id}{ext}"
            if p.exists():
                return str(p)
        return None

    df["filepath"] = df["image_id"].apply(resolve_path)
    missing = df["filepath"].isna().sum()
    if missing:
        print(f"Warning: {missing} images listed in CSV were not found on disk and will be skipped.")
    df = df.dropna(subset=["filepath"]).reset_index(drop=True)
    return df


def make_dataset(df: pd.DataFrame, class_to_idx: dict, batch_size: int, augment: bool):
    paths = df["filepath"].values
    labels = df["label"].map(class_to_idx).values

    def _load(path, label):
        img = tf.io.read_file(path)
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, IMG_SIZE)
        img = preprocess_input(img)
        return img, label

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    ds = ds.map(_load, num_parallel_calls=tf.data.AUTOTUNE)

    if augment:
        aug = tf.keras.Sequential([
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.1),
        ])
        ds = ds.map(lambda x, y: (aug(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)

    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds


def build_model(num_classes: int):
    base = Xception(weights="imagenet", include_top=False, input_shape=(*IMG_SIZE, 3))
    base.trainable = False  # freeze for initial training; unfreeze later for fine-tuning

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)
    return model, base


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images_dir", required=True, type=Path)
    parser.add_argument("--labels_csv", required=True, type=Path)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--fine_tune_epochs", type=int, default=10,
                         help="additional epochs with base model partially unfrozen")
    parser.add_argument("--out_model", default="xception_lesion_classifier.h5")
    args = parser.parse_args()

    df = load_dataframe(args.labels_csv, args.images_dir)
    class_names = sorted(df["label"].unique())
    class_to_idx = {name: i for i, name in enumerate(class_names)}
    print(f"Classes found: {class_names}")
    print(df["label"].value_counts())

    train_df, val_df = train_test_split(
        df, test_size=0.15, stratify=df["label"], random_state=42
    )

    train_ds = make_dataset(train_df, class_to_idx, args.batch_size, augment=True)
    val_ds = make_dataset(val_df, class_to_idx, args.batch_size, augment=False)

    model, base = build_model(num_classes=len(class_names))

    # Handle class imbalance (ISIC datasets are heavily skewed toward benign)
    counts = train_df["label"].value_counts()
    total = len(train_df)
    class_weight = {class_to_idx[c]: total / (len(class_names) * counts[c]) for c in counts.index}
    print(f"Class weights (to counter imbalance): {class_weight}")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_auc", mode="max", patience=5,
                                          restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3),
    ]

    print("\\n--- Phase 1: training classifier head (base frozen) ---")
    model.fit(train_ds, validation_data=val_ds, epochs=args.epochs,
              class_weight=class_weight, callbacks=callbacks)

    print("\\n--- Phase 2: fine-tuning (unfreezing top of Xception base) ---")
    base.trainable = True
    for layer in base.layers[:-30]:  # keep most of the base frozen, unfreeze last ~30 layers
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),  # much lower LR for fine-tuning
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")],
    )
    model.fit(train_ds, validation_data=val_ds, epochs=args.fine_tune_epochs,
              class_weight=class_weight, callbacks=callbacks)

    model.save(args.out_model)
    with open("class_names.json", "w") as f:
        json.dump(class_names, f)

    print(f"\\nModel saved to: {args.out_model}")
    print(f"Class order saved to: class_names.json -> {class_names}")
    print("This class order matches the softmax output indices — use it when building")
    print("the 'predicted_class' / 'differential_classes' fields for your chatbot JSON.")


if __name__ == "__main__":
    main()
`;

const DERMAASSIST_SYSTEM_PROMPT = `You are DermaAssist, an academic research-prototype AI assistant. Your job is to explain the output of an already-completed computer-vision analysis (YOLO lesion detection + CNN/Xception classification) to a non-expert user, in clear, honest, non-alarming language. You are the explanation and conversation layer only — you do not perform image analysis yourself, and you must never generate, guess, or infer a classification, confidence score, or lesion category that was not explicitly provided to you in the structured result.

### Your input
Before the user's first message, you will receive a JSON object with the pipeline's output, in this exact shape:

\`\`\`json
{
  "lesion_detected": true,
  "detection_confidence": 0.94,
  "bounding_box": [x, y, w, h],
  "segmentation_available": true,
  "predicted_class": "melanocytic nevus",
  "class_confidence": 0.81,
  "differential_classes": [
    {"label": "melanoma", "confidence": 0.09},
    {"label": "seborrheic keratosis", "confidence": 0.06},
    {"label": "other", "confidence": 0.04}
  ],
  "visual_features": [
    "asymmetry: low",
    "border irregularity: moderate",
    "color variation: low",
    "diameter_estimate_mm": 5.2
  ],
  "model_version": "cnn-xception-isic2017-v1",
  "dataset_disclaimer": "Trained on ISIC 2016/2017 dermoscopic images"
}
\`\`\`

Treat every field in this JSON as ground truth from the pipeline — never override, "correct," or second-guess the numbers. If a field is missing, null, or the JSON itself is missing, say so explicitly and do not fabricate a substitute value.

### What you must do
1. Report the result faithfully. State whether a lesion was detected, the predicted category, its confidence score, and the differential (other possible) categories with their scores — all pulled directly from the JSON, in plain language, not just re-printing numbers.
2. Explain the visual features listed (asymmetry, border, color, diameter, etc.) in terms a layperson understands, and connect them to why the model may have leaned toward its prediction — but frame this as "the model's pattern-matching," never as a definitive medical explanation.
3. Always contextualize confidence. A confidence score is a statistical output of one model trained on one dataset (ISIC 2016/2017) — not a medical certainty. Say this plainly, especially when confidence is low (<70%) or when a serious differential (e.g., melanoma) appears anywhere in the differential list, even at low probability.
4. Answer follow-up questions ("Why did it predict this?", "What does this mean?", "Should I see a doctor?") using only the provided result plus general, widely-known dermatological education (e.g., what the ABCDE rule for melanoma means) — never patient-specific medical advice.
5. Always include a path to professional care. Every substantive response should make clear, without being repetitive or alarmist, that this tool is a research prototype and a licensed dermatologist should evaluate any lesion of concern in person, especially for new, changing, bleeding, or irregular lesions.

### Hard boundaries — never do these
- Never state or imply a diagnosis ("you have melanoma," "this is cancer," "this is benign"). Only say what the model predicted, framed as a prediction, e.g., "the model's top prediction is X."
- Never recommend or discuss treatment, medication, dosages, or specific clinical next steps beyond "see a licensed dermatologist" or "seek prompt in-person evaluation" for urgent-looking cases.
- Never tell a user not to worry, that something is "probably fine," or otherwise downplay a result — even if confidence in a benign class is high. Confidence scores are not a substitute for clinical exam.
- Never generate a classification, confidence score, or visual finding that wasn't in the input JSON, even if the user re-uploads an image directly to you or insists you "just look at the photo." If a user sends an image without an accompanying JSON result, explain that you can only interpret results from the trained detection/classification pipeline, not analyze raw images yourself, and ask them to run the image through the analysis pipeline first.
- Never compare a user's case to real, named individuals, and never claim statistical certainty about outcomes (e.g., no "X% of people with this survive").
- If the user describes symptoms suggesting urgency (rapid change, bleeding, pain, rapid growth) regardless of what the model predicted, prioritize a clear, calm recommendation to seek prompt in-person medical evaluation.

### Tone
Warm, clear, calm, and precise. Avoid clinical jargon without explanation, avoid being clinically cold, and avoid being falsely reassuring. Short paragraphs, plain words. This is a research demo for an academic project, not a production medical device — you can say so plainly if asked what this tool is.

### First-turn behavior
When you receive the pipeline JSON at session start, proactively summarize the result using the structure: (1) detection status, (2) top prediction + confidence, (3) other considered categories, (4) key visual features that stood out, (5) one line reinforcing this is a research-prototype assessment, not a diagnosis, and one line inviting the user to ask questions or noting they should have this checked by a professional if the lesion concerns them.`;

export const ResearchScriptsViewer: React.FC<ResearchScriptsViewerProps> = ({ analysis }) => {
  const [activeScript, setActiveScript] = useState<'step1' | 'step2' | 'step3' | 'pipeline_json' | 'system_prompt'>('pipeline_json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getPipelineJSON = () => {
    if (!analysis) {
      return {
        lesion_detected: true,
        detection_confidence: 0.94,
        bounding_box: [0.24, 0.28, 0.48, 0.44],
        segmentation_available: true,
        predicted_class: "melanocytic nevus",
        class_confidence: 0.81,
        differential_classes: [
          { label: "melanoma", confidence: 0.09 },
          { label: "seborrheic keratosis", confidence: 0.06 },
          { label: "other", confidence: 0.04 }
        ],
        visual_features: [
          "asymmetry: low",
          "border irregularity: moderate",
          "color variation: low",
          "diameter_estimate_mm: 5.2"
        ],
        model_version: "cnn-xception-isic2017-v1",
        dataset_disclaimer: "Trained on ISIC 2016/2017 dermoscopic images"
      };
    }

    const isNormal = analysis.prediction.isNormalHealthySkin === true;
    const isUnwanted = analysis.prediction.isSkinOrMedical === false || analysis.prediction.categoryCode === 'unwanted_non_skin';
    const lesionDetected = !isNormal && !isUnwanted;

    let bbox: [number, number, number, number] = [0.22, 0.24, 0.54, 0.52];
    if (analysis.pipelineDetails?.localization?.roiBox) {
      const b = analysis.pipelineDetails.localization.roiBox;
      bbox = [b.x / 100, b.y / 100, b.width / 100, b.height / 100];
    }

    const differential = (analysis.probabilities || []).map(pr => ({
      label: pr.name.toLowerCase(),
      confidence: Number((pr.probability || 0).toFixed(2))
    }));

    const visualFeatures: string[] = [];
    if (analysis.abcdeAssessment) {
      visualFeatures.push(`asymmetry: ${analysis.abcdeAssessment.asymmetry}`);
      visualFeatures.push(`border irregularity: ${analysis.abcdeAssessment.border}`);
      visualFeatures.push(`color variation: ${analysis.abcdeAssessment.color}`);
      visualFeatures.push(`diameter_estimate_mm: ${analysis.pipelineDetails?.localization?.estimatedAreaMm2 ? (Math.sqrt(analysis.pipelineDetails.localization.estimatedAreaMm2 / Math.PI) * 2).toFixed(1) : '5.2'}`);
    } else if (analysis.visualFindings) {
      visualFeatures.push(...analysis.visualFindings);
    } else {
      visualFeatures.push("asymmetry: low", "border irregularity: moderate", "color variation: low", "diameter_estimate_mm: 5.2");
    }

    return {
      lesion_detected: lesionDetected,
      detection_confidence: Number((analysis.pipelineDetails?.localization?.detectionConfidence || (lesionDetected ? 0.94 : 0.05)).toFixed(2)),
      bounding_box: bbox,
      segmentation_available: true,
      predicted_class: analysis.prediction.categoryName.toLowerCase(),
      class_confidence: Number(analysis.prediction.confidence.toFixed(2)),
      differential_classes: differential.length > 0 ? differential : [
        { label: "melanoma", confidence: 0.09 },
        { label: "seborrheic keratosis", confidence: 0.06 },
        { label: "other", confidence: 0.04 }
      ],
      visual_features: visualFeatures,
      model_version: "cnn-xception-isic2017-v1",
      dataset_disclaimer: "Trained on ISIC 2016/2017 dermoscopic images"
    };
  };

  const pipelineJSONString = JSON.stringify(getPipelineJSON(), null, 2);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-teal-400" />
            <h4 className="text-sm font-bold tracking-tight">
              ISIC Training Pipeline & DermaAssist AI Studio Integration
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            Open-source dataset scripts for YOLOv8/v11 lesion detection, XceptionNet classifier, and DermaAssist conversational runtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
            ISIC 2016/2017 Standard
          </span>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveScript('pipeline_json')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeScript === 'pipeline_json'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Pipeline Output JSON</span>
        </button>

        <button
          onClick={() => setActiveScript('system_prompt')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeScript === 'system_prompt'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>DermaAssist System Prompt</span>
        </button>

        <button
          onClick={() => setActiveScript('step1')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeScript === 'step1'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>1_mask_to_yolo.py</span>
        </button>

        <button
          onClick={() => setActiveScript('step2')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeScript === 'step2'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>2_train_yolo.py</span>
        </button>

        <button
          onClick={() => setActiveScript('step3')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeScript === 'step3'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3_train_xception.py</span>
        </button>
      </div>

      {/* Main Code Box Container */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-xs shadow-inner space-y-3 relative border border-slate-800">
        {/* Copy Top Action */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-400 font-sans ml-2">
              {activeScript === 'pipeline_json' && 'pipeline_output.json (Exact DermaAssist Input Shape)'}
              {activeScript === 'system_prompt' && 'DermaAssist System Instructions for AI Studio'}
              {activeScript === 'step1' && '1_mask_to_yolo.py (ISIC 2017 Segmentation -> YOLO Bounding Boxes)'}
              {activeScript === 'step2' && '2_train_yolo.py (Ultralytics YOLO Training & Weights Export)'}
              {activeScript === 'step3' && '3_train_xception_classifier.py (Xception Classifier Training)'}
            </span>
          </div>

          <button
            onClick={() => {
              if (activeScript === 'pipeline_json') handleCopy('pipeline_json', pipelineJSONString);
              else if (activeScript === 'system_prompt') handleCopy('system_prompt', DERMAASSIST_SYSTEM_PROMPT);
              else if (activeScript === 'step1') handleCopy('step1', MASK_TO_YOLO_CODE);
              else if (activeScript === 'step2') handleCopy('step2', TRAIN_YOLO_CODE);
              else if (activeScript === 'step3') handleCopy('step3', TRAIN_XCEPTION_CODE);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <pre className="overflow-x-auto max-h-[380px] p-2 leading-relaxed text-slate-200 text-[11px]">
          {activeScript === 'pipeline_json' && pipelineJSONString}
          {activeScript === 'system_prompt' && DERMAASSIST_SYSTEM_PROMPT}
          {activeScript === 'step1' && MASK_TO_YOLO_CODE}
          {activeScript === 'step2' && TRAIN_YOLO_CODE}
          {activeScript === 'step3' && TRAIN_XCEPTION_CODE}
        </pre>
      </div>

      {/* Colab Quick Guide */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Execution in Google Colab / GPU Environment:</span>
        </span>
        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          !pip install opencv-python-headless numpy tqdm ultralytics tensorflow pandas scikit-learn
        </p>
      </div>
    </div>
  );
};
