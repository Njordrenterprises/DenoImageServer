import { useState, useEffect } from "preact/hooks";
import { BreadcrumbNavigation } from "../islands/BreadcrumbNavigation.tsx";
import { join } from "https://deno.land/std@0.216.0/path/mod.ts";

interface Item {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function ImageUploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  useEffect(() => {
    fetchItems();
  }, [currentPath]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/list?path=${encodeURIComponent(currentPath)}`);
      if (response.ok) {
        const itemList = await response.json();
        setItems(itemList);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch items:", errorData.error, errorData.details);
        setMessage(`Failed to fetch items: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setMessage("Error fetching items");
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
    formData.append("folder", currentPath);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Images uploaded successfully");
        setFiles([]);
        fetchItems();
      } else {
        setMessage("Failed to upload images");
      }
    } catch (error) {
      setMessage("Error uploading images");
      console.error(error);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) {
      setMessage("Please enter a folder name");
      return;
    }

    try {
      const response = await fetch("/api/folder/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: newFolderName, currentPath: currentPath }),
      });

      if (response.ok) {
        setMessage("Folder created successfully");
        setNewFolderName("");
        fetchItems();
      } else {
        setMessage("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      setMessage("Error creating folder");
    }
  };

  const deleteFolder = async () => {
    try {
      const response = await fetch("/api/folder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: currentPath }),
      });

      if (response.ok) {
        setMessage("Folder deleted successfully");
        navigateFolder("..");
      } else {
        setMessage("Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      setMessage("Error deleting folder");
    }
  };

  const navigateFolder = (folderPath: string) => {
    if (folderPath === "..") {
      setCurrentPath((prevPath) => {
        const parts = prevPath.split("/").filter(Boolean);
        return parts.slice(0, -1).join("/");
      });
    } else {
      setCurrentPath((prevPath) => {
        return prevPath ? join(prevPath, folderPath) : folderPath;
      });
    }
    fetchItems();
  };

  return (
    <div>
      <div class="mb-4">
        <BreadcrumbNavigation currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

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

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Create New Folder</h2>
        <div class="flex items-center">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName((e.target as HTMLInputElement).value)}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="Enter folder name"
          />
          <button
            onClick={createFolder}
            class="ml-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create Folder
          </button>
        </div>
      </div>

      <h2 class="text-2xl font-bold mb-4">Folders and Images</h2>
      <div class="grid grid-cols-3 gap-4">
        {items
          .filter(item => item.name !== "images" && item.path !== currentPath && !item.path.startsWith(`${currentPath}/`))
          .map((item) => (
            <div key={item.path} class="border rounded-lg overflow-hidden">
              {item.isDirectory ? (
                <div class="p-4 cursor-pointer" onClick={() => navigateFolder(item.path)}>
                  <p class="font-bold">{item.name}</p>
                  <p class="text-sm text-gray-500">Folder</p>
                </div>
              ) : (
                <>
                  <img src={`/api/images/${item.path}`} alt={item.name} class="w-full h-48 object-cover" />
                  <p class="p-2 text-sm text-center">{item.name}</p>
                </>
              )}
            </div>
          ))}
      </div>
      {currentPath && (
        <div class="mt-4 flex justify-end">
          <button
            onClick={() => navigateFolder("..")}
            class="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          <button
            onClick={deleteFolder}
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Current Folder
          </button>
        </div>
      )}
    </div>
  );
}
