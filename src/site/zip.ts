import JSZip from 'jszip'
import { packageSite } from './render'
import type { SiteContent } from './model'

export async function buildProjectZip(input: { name: string; templateId: string; content: SiteContent }): Promise<{
  blob: Blob
  buffer: Uint8Array
  bytes: number
  fileName: string
}> {
  const packed = packageSite(input.templateId, input.content)
  const zip = new JSZip()
  const folderName = slugify(input.name)
  const folder = zip.folder(folderName) ?? zip
  folder.file('index.html', packed.html)
  folder.file('styles.css', packed.css)
  folder.file('site.js', packed.js)
  folder.file('LEEME.txt', packed.readme)
  for (const asset of packed.assets) folder.file(asset.filename, asset.bytes)
  const buffer = await zip.generateAsync({ type: 'uint8array' })
  const blob = new Blob([buffer as BlobPart])
  return { blob, buffer, bytes: buffer.byteLength, fileName: `${folderName}.zip` }
}

export function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'web'
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
