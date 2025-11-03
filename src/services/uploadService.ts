import api from './api'

class UploadService {
  /**
   * Upload multiple files to the server
   * @param files - Array of File objects to upload
   * @returns Promise with uploaded files information
   */
  async uploadFiles(files: File[]): Promise<any[]> {
    try {
      const formData = new FormData()
      
      // Ajouter tous les fichiers au FormData
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await api.post('/uploads/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Permettre un timeout plus long pour les gros fichiers
        timeout: 300000 // 5 minutes
      })

      if (response.data.success) {
        return response.data.files
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'upload')
      }
    } catch (error: any) {
      console.error('Erreur upload:', error)
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'upload des fichiers'
      )
    }
  }

  /**
   * Upload a single file
   * @param file - File object to upload
   * @returns Promise with uploaded file information
   */
  async uploadFile(file: File): Promise<any> {
    const files = await this.uploadFiles([file])
    return files[0]
  }

  /**
   * Delete a file from the server
   * @param filename - Name of the file to delete
   * @returns Promise
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await api.delete(`/uploads/file/${publicId}`)
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la suppression du fichier'
      )
    }
  }

  /**
   * Get the full URL of an uploaded file
   * @param fileUrl - Relative URL from upload response
   * @returns Full URL
   */
  getFileUrl(fileUrl: string): string {
    // Avec Cloudinary, l'URL retournée est absolue
    return fileUrl
  }

  /**
   * Check if a value contains uploaded files
   * @param value - Value to check
   * @returns boolean
   */
  isUploadedFile(value: any): boolean {
    return (
      value && 
      typeof value === 'object' && 
      'url' in value && 
      'public_id' in value
    )
  }

  /**
   * Check if a value is a File object (not yet uploaded)
   * @param value - Value to check
   * @returns boolean
   */
  isFileObject(value: any): boolean {
    return value instanceof File
  }
}

export default new UploadService()



