import ImageUploader from '../components/ImageUploader'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Uploader</h1>
      <ImageUploader />
    </div>
  )
}