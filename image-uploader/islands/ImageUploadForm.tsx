import { useState, useEffect } from "preact/hooks";

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/list");
      if (response.ok) {
        const imageList = await response.json();
        setImages(imageList);
      } else {
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Image uploaded successfully");
        setFile(null);
        fetchImages(); // Refresh the image list after upload
      } else {
        setMessage("Failed to upload image");
      }
    } catch (error) {
      setMessage("Error uploading image");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} class="space-y-4 mb-8">
        <div>
          <label htmlFor="image" class="block text-sm font-medium text-gray-700">
            Select Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] || null)}
            class="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
        </div>
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Upload
        </button>
        {message && <p class="mt-2 text-sm text-gray-600">{message}</p>}
      </form>

      <h2 class="text-2xl font-bold mb-4">Uploaded Images</h2>
      <div class="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image} class="border rounded-lg overflow-hidden">
            <img src={`/api/images/${image}`} alt={image} class="w-full h-48 object-cover" />
            <p class="p-2 text-sm text-center">{image}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
