import { useState, useEffect } from "preact/hooks";

export default function ImageUploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage("Please select at least one file");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Images uploaded successfully");
        setFiles([]);
        fetchImages();
      } else {
        setMessage("Failed to upload images");
      }
    } catch (error) {
      setMessage("Error uploading images");
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} class="space-y-4 mb-8">
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          class={`border-2 border-dashed p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <label htmlFor="image" class="block text-sm font-medium text-gray-700">
            Drag and drop images here or click to select
          </label>
          <input
            type="file"
            id="image"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            class="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("image")?.click()}
            class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Select Files
          </button>
        </div>
        {files.length > 0 && (
          <div>
            <p class="text-sm font-medium text-gray-700">Selected files:</p>
            <ul class="mt-1 text-sm text-gray-500">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
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
