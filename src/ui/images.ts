export function readResizedImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) return Promise.reject(new Error('El archivo no es una imagen.'))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.onload = () => {
      const source = String(reader.result ?? '')
      if (file.type === 'image/svg+xml') {
        resolve(source)
        return
      }
      const image = new Image()
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('No se pudo preparar la imagen.'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      image.onerror = () => reject(new Error('No se pudo abrir la imagen.'))
      image.src = source
    }
    reader.readAsDataURL(file)
  })
}
