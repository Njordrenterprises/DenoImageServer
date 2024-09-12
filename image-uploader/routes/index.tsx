import { Head } from "$fresh/runtime.ts";
import ImageUploadForm from "../islands/ImageUploadForm.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Image Uploader</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold mb-4">Image Uploader</h1>
        <ImageUploadForm />
      </div>
    </>
  );
}
