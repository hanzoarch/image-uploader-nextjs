'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Upload, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000) // 5秒後にメッセージを消す
    }
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('ファイルが選択されていません。')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Get the pre-signed URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/presigned-url?file_name=${selectedFile.name}&content_type=${selectedFile.type}`)
      if (!response.ok) throw new Error('プリサインドURLの取得に失敗しました。')
      const { uploadUrl, fileName } = await response.json()

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      })

      if (!uploadResponse.ok) throw new Error('ファイルのアップロードに失敗しました。')

      setSuccessMessage(`ファイル "${fileName}" のアップロードに成功しました！`)
      // リセット処理
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
          />
          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg" />
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? 'アップロード中...' : 'アップロード'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">成功</AlertTitle>
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}