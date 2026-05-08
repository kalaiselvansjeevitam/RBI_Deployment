import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { useGetDuplicateImage } from "../../../app/core/api/Admin";
import type { DuplicateImage } from "../../../app/lib/types";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";

// 🔹 Helper to extract & truncate file name
const getFileName = (url: string, maxLength = 25) => {
  if (!url) return "";

  const name = url.includes("/") ? url.split("/").pop() || "" : url;

  if (name.length > maxLength) {
    return name.substring(0, maxLength) + "...";
  }

  return name;
};

export const DuplicateImages = () => {
  const { mutateAsync: duplicateImage, isPending } = useGetDuplicateImage();
  const [images, setImages] = useState<DuplicateImage[]>([]);
  const [loadedImages, setLoadedImages] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await duplicateImage();
        setImages(res.list || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchImages();
  }, []);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => [...prev, index]);
  };

  // 🔄 Full page loader
  if (isPending) {
    return (
      <Layout headerTitle="Duplicate Images">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="Duplicate Images">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img, index) => {
            const isLoaded = loadedImages.includes(index);

            return (
              <div
                key={index}
                onClick={() =>
                  navigate(
                    `${ROUTE_URL.duplicateImageDetails}?hash_value=${img.hash_value}`,
                  )
                }
                className="p-4 rounded-xl shadow-md hover:shadow-xl transition duration-300 bg-white cursor-pointer"
              >
                <p className="text-lg font-bold text-black mb-1">{index + 1}</p>
                {/* Skeleton */}
                {!isLoaded && (
                  <div className="w-full h-52 bg-gray-200 animate-pulse rounded-lg" />
                )}

                {/* Image */}
                <img
                  src={img.file_url}
                  alt="duplicate"
                  onLoad={() => handleImageLoad(index)}
                  className={`w-full h-52 object-cover rounded-lg transition-transform duration-300 hover:scale-105 ${
                    isLoaded ? "block" : "hidden"
                  }`}
                />

                {/* File Name */}
                <p
                  className="mt-2 text-center text-sm text-gray-600 truncate"
                  title={img.file_url}
                >
                  {getFileName(img.file_url)}
                </p>

                {/* Count */}
                <p className="mt-1 text-center font-semibold text-gray-700">
                  Count: {img.total}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {images.length === 0 && !isPending && (
          <div className="text-center mt-10 text-gray-500">
            No duplicate images found
          </div>
        )}
      </div>
    </Layout>
  );
};
