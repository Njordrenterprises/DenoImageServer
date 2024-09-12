// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_create from "./routes/api/create.ts";
import * as $api_folder_create from "./routes/api/folder/create.ts";
import * as $api_folder_delete from "./routes/api/folder/delete.ts";
import * as $api_folder_move from "./routes/api/folder/move.ts";
import * as $api_folder_renameFolder from "./routes/api/folder/renameFolder.ts";
import * as $api_images_path_ from "./routes/api/images/[...path].ts";
import * as $api_images_name_ from "./routes/api/images/[name].ts";
import * as $api_images_delete from "./routes/api/images/delete.ts";
import * as $api_list from "./routes/api/list.ts";
import * as $api_upload from "./routes/api/upload.ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $BreadcrumbNavigation from "./islands/BreadcrumbNavigation.tsx";
import * as $ImageUploadForm from "./islands/ImageUploadForm.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/create.ts": $api_create,
    "./routes/api/folder/create.ts": $api_folder_create,
    "./routes/api/folder/delete.ts": $api_folder_delete,
    "./routes/api/folder/move.ts": $api_folder_move,
    "./routes/api/folder/renameFolder.ts": $api_folder_renameFolder,
    "./routes/api/images/[...path].ts": $api_images_path_,
    "./routes/api/images/[name].ts": $api_images_name_,
    "./routes/api/images/delete.ts": $api_images_delete,
    "./routes/api/list.ts": $api_list,
    "./routes/api/upload.ts": $api_upload,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/BreadcrumbNavigation.tsx": $BreadcrumbNavigation,
    "./islands/ImageUploadForm.tsx": $ImageUploadForm,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
