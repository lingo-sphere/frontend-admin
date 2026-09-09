// Tien ich giai nen goi de thi dinh dang RAR qua WebAssembly tren trinh duyet.

import { createExtractorFromData } from 'node-unrar-js'

export interface RarExtractedData {
  excelBuffer: ArrayBuffer
  mediaBuffers: Map<string, ArrayBuffer>
  distinctMediaNames: string[]
}

let wasmBinaryCache: ArrayBuffer | null = null

async function getWasmBinary(isVi: boolean): Promise<ArrayBuffer> {
  if (wasmBinaryCache) return wasmBinaryCache

  try {
    const response = await fetch('/wasm/unrar.wasm')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    wasmBinaryCache = await response.arrayBuffer()
    return wasmBinaryCache
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(
      isVi
        ? `Không thể tải module giải nén RAR (WebAssembly): ${detail}`
        : `Failed to load RAR extraction module (WebAssembly): ${detail}`
    )
  }
}

export async function extractRarExamArchive(
  file: File,
  isVi: boolean,
  onProgress?: (status: string) => void
): Promise<RarExtractedData> {
  onProgress?.(isVi ? 'Đang nạp mô-đun giải nén RAR WebAssembly...' : 'Loading RAR WebAssembly module...')

  const [wasmBinary, fileBuffer] = await Promise.all([
    getWasmBinary(isVi),
    file.arrayBuffer(),
  ])

  onProgress?.(isVi ? 'Đang trích xuất dữ liệu từ file RAR...' : 'Extracting contents from RAR archive...')

  let extractor
  try {
    extractor = await createExtractorFromData({
      data: fileBuffer,
      wasmBinary,
    })
  } catch (err: unknown) {
    const errText = err instanceof Error ? err.message : String(err)
    throw new Error(
      isVi
        ? `Không thể đọc file nén RAR: ${errText}`
        : `Cannot read RAR archive: ${errText}`
    )
  }

  const extracted = extractor.extract()
  const mediaBuffers = new Map<string, ArrayBuffer>()
  const distinctMediaNames: string[] = []
  let excelBuffer: ArrayBuffer | null = null

  for (const item of extracted.files) {
    if (item.fileHeader.flags.directory) continue
    if (item.fileHeader.flags.encrypted) {
      throw new Error(
        isVi
          ? 'File RAR này đã được cài đặt mật khẩu bảo vệ! Vui lòng nén lại không đặt mật khẩu.'
          : 'This RAR archive is password protected. Please re-pack without a password.'
      )
    }

    const rawPath = item.fileHeader.name
    if (rawPath.includes('__MACOSX')) continue

    const cleanPath = rawPath.replace(/\\/g, '/')
    const filename = cleanPath.split('/').pop() || cleanPath
    const lowerName = filename.toLowerCase().trim()
    const content = item.extraction

    if (!content) continue

    const cleanBytes = new Uint8Array(content.length)
    cleanBytes.set(content)
    const buffer = cleanBytes.buffer

    if (/\.(xlsx|xls|csv)$/i.test(lowerName) && !excelBuffer) {
      excelBuffer = buffer
    }

    if (/\.(mp3|wav|m4a|ogg|aac|flac|jpg|jpeg|png|webp|gif|svg)$/i.test(lowerName)) {
      mediaBuffers.set(cleanPath.toLowerCase(), buffer)
      mediaBuffers.set(lowerName, buffer)
      if (!distinctMediaNames.includes(lowerName)) {
        distinctMediaNames.push(lowerName)
      }
    }
  }

  if (!excelBuffer) {
    throw new Error(
      isVi
        ? 'Không tìm thấy file Excel (.xlsx / .csv) bên trong file RAR! Vui lòng đảm bảo trong RAR có chứa file questions.xlsx.'
        : 'No Excel (.xlsx / .csv) question file found in this RAR archive.'
    )
  }

  return {
    excelBuffer,
    mediaBuffers,
    distinctMediaNames,
  }
}
