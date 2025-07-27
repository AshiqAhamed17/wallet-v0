import type { SignatureData } from './transaction'

export class ShareUtils {
  static encodeSignatureData(data: SignatureData): string {
    const jsonString = JSON.stringify(data)
    return btoa(jsonString)
  }

  static decodeSignatureData(encodedData: string): SignatureData {
    try {
      const jsonString = atob(encodedData)
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Invalid signature data format')
    }
  }

  static generateShareableLink(data: SignatureData, baseUrl: string): string {
    const encodedData = this.encodeSignatureData(data)
    return `${baseUrl}?data=${encodedData}`
  }

  static extractSignatureDataFromUrl(url: string): SignatureData | null {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1])
      const encodedData = urlParams.get('data')
      if (!encodedData) return null
      return this.decodeSignatureData(encodedData)
    } catch (error) {
      return null
    }
  }

  static downloadSignatureFile(data: SignatureData, filename?: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `safe-signature-${data.safeTxHash.slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static validateSignatureData(data: SignatureData): boolean {
    if (!data.safeTxHash || !data.signatures || !data.txData || !data.safeAddress || !data.chainId) {
      return false
    }
    if (!Array.isArray(data.signatures)) {
      return false
    }
    return true
  }

  static mergeSignatures(existingData: SignatureData, newSignature: string): SignatureData {
    return {
      ...existingData,
      signatures: [...existingData.signatures, newSignature],
    }
  }
}
