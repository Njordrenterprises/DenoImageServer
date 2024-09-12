import { useState, useEffect } from "preact/hooks";
import { BreadcrumbNavigation } from "../islands/BreadcrumbNavigation.tsx";
import { join } from "https://deno.land/std@0.216.0/path/mod.ts";

interface Item {
  name: string;
  isDirectory: boolean;
  path: string;
  isImage: boolean;
}

export default function ImageUploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [moveToFolder, setMoveToFolder] = useState("");
  const [allFolders, setAllFolders] = useState<{ path: string; name: string }[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.path) {
        setCurrentPath(event.state.path);
      }
    };

    globalThis.addEventListener('popstate', handlePopState);

    return () => {
      globalThis.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');
    if (pathParam) {
      setCurrentPath(decodeURIComponent(pathParam));
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentPath]);

  const fetchItems = async () => {
    try {
      // Fetch current path items
      const itemsResponse = await fetch(`/api/list?path=${encodeURIComponent(currentPath)}&includeFolders=true`);
      
      // Fetch all folders
      const allFoldersResponse = await fetch('/api/list?getAllFolders=true');
      
      if (itemsResponse.ok && allFoldersResponse.ok) {
        const data: Item[] = await itemsResponse.json();
        const allFoldersData: { path: string; name: string }[] = await allFoldersResponse.json();
        
        console.log("Fetched items:", data);
        setItems(data || []);
        
        // Generate parent folders for the current path
        const parentFolders: { path: string; name: string }[] = [{ path: "", name: "/" }];
        const pathParts = currentPath.split('/').filter(Boolean);
        for (let i = 1; i <= pathParts.length; i++) {
          const folderPath = pathParts.slice(0, i).join('/');
          parentFolders.push({ 
            path: folderPath, 
            name: pathParts[i - 1] 
          });
        }
        
        // Combine all folders, ensuring no duplicates
        const uniqueFolders = Array.from(new Set([...parentFolders, ...allFoldersData].map(f => f.path)))
          .map(path => allFoldersData.find(f => f.path === path) || parentFolders.find(f => f.path === path))
          .filter((folder): folder is { path: string; name: string } => folder !== undefined)
          .sort((a, b) => a.path.localeCompare(b.path));
        
        console.log("All folders:", uniqueFolders);
        setAllFolders(uniqueFolders);
      } else if (itemsResponse.status === 404) {
        // If the current path is not found, navigate to the parent folder
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        setCurrentPath(parentPath);
        setMessage(`Folder "${currentPath}" not found. Navigating to parent folder.`);
      } else {
        console.error("Failed to fetch items or folders");
        setItems([]);
        setMessage("Failed to fetch items or folders. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
      setMessage("Error fetching items. Please try again.");
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
        await fetchItems(); // Refresh the items list
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
        await fetchItems(); // Refresh the items list
      } else {
        setMessage("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      setMessage("Error creating folder");
    }
  };

  const deleteFolder = async () => {
    if (!selectedFolder) {
      setMessage("No folder selected for deletion");
      return;
    }

    if (selectedFolder === "") {
      setMessage("Cannot delete root folder");
      return;
    }

    try {
      const response = await fetch("/api/folder/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: selectedFolder }),
      });

      if (response.ok) {
        setMessage("Folder deleted successfully");
        setSelectedFolder(null);
        await fetchItems();
      } else {
        setMessage("Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      setMessage("Error deleting folder");
    }
  };

  const renameFolder = async () => {
    if (!selectedFolder) {
      setMessage("No folder selected for renaming");
      return;
    }

    if (!newFolderName) {
      setMessage("Please enter a new folder name");
      return;
    }

    try {
      const response = await fetch("/api/folder/renameFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPath: selectedFolder, newName: newFolderName }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setIsRenaming(false);
        setNewFolderName("");
        setSelectedFolder(null);
        await fetchItems();
      } else {
        setMessage(`Failed to rename folder: ${result.error}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      setMessage("Error renaming folder");
    }
  };

  const navigateFolder = (folderPath: string) => {
    let newPath;
    if (folderPath === "..") {
      const parts = currentPath.split("/").filter(Boolean);
      newPath = parts.length > 0 ? parts.slice(0, -1).join("/") : "";
    } else {
      newPath = currentPath ? join(currentPath, folderPath) : folderPath;
    }
    setCurrentPath(newPath);
    window.history.pushState({ path: newPath }, "", `?path=${encodeURIComponent(newPath)}`);
  };

  const deleteSelectedItems = async () => {
    try {
      const response = await fetch("/api/images/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        setSelectedItems([]);
        await fetchItems();
      } else {
        setMessage("Failed to delete selected items");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      setMessage("Error deleting items");
    }
  };

  const moveSelectedItems = async () => {
    if (moveToFolder === undefined || moveToFolder === "") {
      setMessage("Please select a destination folder");
      return;
    }

    try {
      const response = await fetch("/api/folder/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems,
          destination: moveToFolder === "/" ? "" : moveToFolder,
          currentPath: currentPath,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setSelectedItems([]);
        setMoveToFolder("");
        await fetchItems();
      } else {
        setMessage(`Failed to move selected items: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error moving items:", error);
      setMessage("Error moving items");
    }
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

      <div class="mt-4 space-y-4">
        {/* File Management Tools */}
        <div class="flex flex-wrap gap-2 items-center">
          {/* Back Button */}
          <button
            onClick={() => navigateFolder("..")}
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>

          {/* Create New Folder */}
          <div class="flex items-center">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName((e.target as HTMLInputElement).value)}
              placeholder="New folder name"
              class="mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={createFolder}
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Folder
            </button>
          </div>

          {/* Delete Selected Items */}
          {selectedItems.length > 0 && (
            <button
              onClick={deleteSelectedItems}
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Selected
            </button>
          )}

          {/* Move Selected Items */}
          {selectedItems.length > 0 && (
            <div class="flex items-center">
              <select
                value={moveToFolder}
                onChange={(e) => setMoveToFolder((e.target as HTMLSelectElement).value)}
                class="mr-2 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Move to folder...</option>
                <option value="/">/</option>
                {allFolders.filter(folder => folder.path !== "").map(folder => (
                  <option key={folder.path} value={folder.path}>
                    {folder.path}
                  </option>
                ))}
              </select>
              <button
                onClick={moveSelectedItems}
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Move Selected
              </button>
            </div>
          )}
        </div>

        {/* Folders and Images */}
        <div class="space-y-4">
          <div class="grid grid-cols-5 gap-4">
            {items && items.length > 0 ? (
              items.map((item) => (
                <div key={item.path} class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  {item.isDirectory ? (
                    <div
                      class={`p-4 cursor-pointer ${selectedFolder === item.path ? 'bg-blue-200' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200 h-48 flex flex-col justify-center items-center relative`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFolder === item.path}
                        onChange={() => setSelectedFolder(selectedFolder === item.path ? null : item.path)}
                        class="absolute top-2 left-2"
                      />
                      <div onClick={() => navigateFolder(item.name)} class="w-full h-full flex flex-col justify-center items-center">
                        <svg
                          class="w-24 h-24 text-blue-500 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                        <p class="font-bold text-blue-700 text-center">{item.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div class="relative w-full h-48">
                      <input
                        type="checkbox"
                        class="absolute top-2 left-2 z-10"
                        checked={selectedItems.includes(item.path)}
                        onChange={() => {
                          setSelectedItems(prev =>
                            prev.includes(item.path)
                              ? prev.filter(i => i !== item.path)
                              : [...prev, item.path]
                          )
                        }}
                      />
                      <img 
                        src={`/api/images/${encodeURIComponent(item.path).replace(/%2F/g, '/')}`}
                        alt={item.name} 
                        class="w-full h-full object-cover" 
                      />
                      <p class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center truncate">
                        {item.name}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No items found in this folder.</p>
            )}
          </div>
          
          {/* Folder Action Buttons */}
          {selectedFolder && (
            <div class="flex justify-center mt-4 space-x-4">
              {isRenaming ? (
                <div class="flex items-center">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName((e.target as HTMLInputElement).value)}
                    placeholder="New folder name"
                    class="mr-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={renameFolder}
                    class="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Confirm Rename
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(false);
                      setNewFolderName("");
                    }}
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsRenaming(true)}
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Rename Folder
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Folder
              </button>
            </div>
          )}

          {/* Delete Confirmation Popup */}
          {showDeleteConfirmation && (
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
              <div class="bg-white p-5 rounded-lg shadow-xl">
                <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
                <p class="mb-4">Are you sure you want to delete this folder and all its contents?</p>
                <div class="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteFolder();
                      setShowDeleteConfirmation(false);
                    }}
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
