import * as ImagePicker from 'expo-image-picker';
import type { UploadableImage } from '../services/types/IUploadService';
import { validateImageAsset } from './imageValidation';

export type PickSource = 'library' | 'camera';

export type PickImageResult =
  | { status: 'picked'; image: UploadableImage }
  | { status: 'canceled' }
  | { status: 'error'; code: string };

/** Camera/library can omit the mime type on some platforms — fall back to the file extension. */
function resolveMimeType(asset: ImagePicker.ImagePickerAsset): string | undefined {
  if (asset.mimeType) return asset.mimeType;
  const name = asset.fileName ?? asset.uri;
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return undefined;
}

async function ensurePermission(source: PickSource): Promise<boolean> {
  const response =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return response.granted;
}

/**
 * Opens the camera or photo library, validates the chosen image against the upload limits
 * and returns an `UploadableImage`. Returns a discriminated result so callers can distinguish
 * a cancel from a real error.
 */
export async function pickImage(source: PickSource): Promise<PickImageResult> {
  try {
    const granted = await ensurePermission(source);
    if (!granted) {
      return { status: 'error', code: 'permission-denied' };
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { status: 'canceled' };
    }

    const asset = result.assets[0];
    const image: UploadableImage = {
      uri: asset.uri,
      mimeType: resolveMimeType(asset) ?? '',
      fileSize: asset.fileSize,
    };

    const validationError = validateImageAsset(image);
    if (validationError) {
      return { status: 'error', code: validationError.code };
    }

    return { status: 'picked', image };
  } catch {
    return { status: 'error', code: 'picker-failed' };
  }
}
