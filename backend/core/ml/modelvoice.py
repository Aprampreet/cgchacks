import tensorflow as tf
import numpy as np
import librosa
import argparse
import os
loaded_model = tf.keras.models.load_model(os.path.join(os.path.dirname(__file__), 'voicemodel2.h5'))

def _pad_or_truncate(array, target_shape):
    # Pads with zeros or truncates to match target_shape.
    result = np.zeros(target_shape, dtype=array.dtype)
    slices = tuple(slice(0, min(s, t)) for s, t in zip(array.shape, target_shape))
    result[slices] = array[slices]
    return result

def preprocess_audio_file(path, sr=22050, duration=None, n_mfcc=40):
    """
    Load audio and convert to MFCC feature array adapted to the model input shape.
    Returns a numpy array shaped (1, ...) suitable for model.predict.
    """
    y, sr = librosa.load(path, sr=sr, duration=duration)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)  # shape: (n_mfcc, frames)
    mfcc = mfcc.T  # shape: (frames, n_mfcc)

    # Determine expected input shape from loaded_model (drop batch dim)
    expected = loaded_model.input_shape[1:]
    if expected is None:
        # fallback: use averaged MFCCs
        vec = mfcc.mean(axis=0)
        return vec.reshape(1, -1).astype(np.float32)

    if len(expected) == 2:
        # expected: (timesteps, features)
        timesteps, features = expected
        target = (timesteps, features)
        # If model expects features != n_mfcc, adjust by truncating/padding feature axis
        if mfcc.shape[1] != features:
            if mfcc.shape[1] < features:
                mfcc = np.pad(mfcc, ((0, 0), (0, features - mfcc.shape[1])), mode='constant')
            else:
                mfcc = mfcc[:, :features]
        mfcc = _pad_or_truncate(mfcc, target)
        return mfcc.reshape(1, timesteps, features).astype(np.float32)

    if len(expected) == 1:
        # expected: (features,) flat vector
        vec = mfcc.flatten()
        size = expected[0]
        vec = _pad_or_truncate(vec, (size,))
        return vec.reshape(1, size).astype(np.float32)

    # fallback for other ranks: take mean over time and return (1, features)
    vec = mfcc.mean(axis=0)
    return vec.reshape(1, -1).astype(np.float32)

def predict_voice_file(file_path, threshold=0.5, sr=22050, duration=None, n_mfcc=40):
    """
    Predict whether the voice in file_path is 'fake' or 'real'.
    Returns a dict: {'label': 'fake'|'real', 'probability': float, 'raw': model_output}
    """
    x = preprocess_audio_file(file_path, sr=sr, duration=duration, n_mfcc=n_mfcc)
    preds = loaded_model.predict(x)
    # Normalize different output shapes to a single probability for "fake"
    p = None
    preds = np.asarray(preds)
    if preds.ndim == 0:
        p = float(preds)
    elif preds.shape[-1] == 1:
        p = float(preds.ravel()[0])
    elif preds.size == 2:
        # assume binary softmax [prob_real, prob_fake] or [prob_fake, prob_real]
        # Heuristic: pick the max class as 'fake' if index 1 else adjust as needed.
        p = float(preds.ravel()[1])
    else:
        # fallback: take probability of the last class
        p = float(preds.ravel()[-1])

    label = 'fake' if p >= threshold else 'real'
    return {'label': label, 'probability': p, 'raw': preds}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict if an input voice WAV is fake or real.")
    parser.add_argument("file", help="Path to audio file (wav, mp3, ... supported by librosa).")
    parser.add_argument("--threshold", type=float, default=0.5, help="Probability threshold to classify as fake.")
    parser.add_argument("--sr", type=int, default=22050, help="Resampling rate for audio loading.")
    parser.add_argument("--duration", type=float, default=None, help="Duration (seconds) to load from start of file.")
    parser.add_argument("--n_mfcc", type=int, default=40, help="Number of MFCCs to extract.")
    args = parser.parse_args()

    result = predict_voice_file(args.file, threshold=args.threshold, sr=args.sr, duration=args.duration, n_mfcc=args.n_mfcc)
    print(f"Label: {result['label']}, Probability(fake)={result['probability']:.4f}")
    

