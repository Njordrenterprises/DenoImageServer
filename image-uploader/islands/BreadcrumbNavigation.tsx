// No imports needed

interface BreadcrumbNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BreadcrumbNavigation({ currentPath, onNavigate }: BreadcrumbNavigationProps) {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <nav class="text-sm font-medium">
      <ol class="list-none p-0 inline-flex">
        <li class="flex items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("");
            }}
            class="text-blue-500 hover:text-blue-700"
          >
            Root
          </a>
        </li>
        {pathParts.map((folder, index) => (
          <li key={index} class="flex items-center">
            <span class="mx-2">/</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(pathParts.slice(0, index + 1).join("/"));
              }}
              class="text-blue-500 hover:text-blue-700"
            >
              {folder}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
