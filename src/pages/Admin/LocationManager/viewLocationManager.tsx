import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import TableComponent, {
  type Column,
} from "../../../app/components/shared/TableComponent";
import { Loader } from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetLocationManagerParams,
  useUpdateLocationManager,
  useDeleteLocationManager,
  useGetDistrictParams,
  useGetBlockPanchayat,
  useGetGramPanchayat,
} from "../../../app/core/api/Admin";
import type {
  BlockPanchayatRes,
  District,
  GramPanchayatRes,
  LocationType,
} from "../../../app/lib/types";

export const ViewLocationManagerPage = () => {
  const { mutateAsync: getLocations } = useGetLocationManagerParams();
  const { mutateAsync: updateLocation } = useUpdateLocationManager();
  const { mutateAsync: deleteLocation } = useDeleteLocationManager();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [districtList, setDistrictList] = useState<District[]>([]);
  const { mutateAsync: getBlockPanchayat } = useGetBlockPanchayat();
  const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
    [],
  );
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  const [loadingdist, setLoadingdist] = useState(false);
  const [loadingbp, setLoadingbp] = useState(false);
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await getDistricts();
        setDistrictList(res?.list ?? []);
      } catch {
        Swal.fire("Error", "Failed to load districts", "error");
      }
    };

    loadDistricts();
  }, []);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );

  const getOffsetForPage = (page: number) => page * itemsPerPage;

  const fetchLocations = async (page = currentPage) => {
    try {
      setLoading(true);

      const res = await getLocations({
        getBy: "limit",
        offset: getOffsetForPage(page),
      });

      setLocations(res?.list ?? []);
      setTotalCount(res?.total ?? 0);
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to fetch locations",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [currentPage]);

  // ---------- Edit ----------
  const handleEdit = async (row: LocationType) => {
    setSelectedLocation(row);
    setIsEditOpen(true);

    // preload block panchayats
    if (row.district) {
      setLoadingbp(true);
      const bpRes = await getBlockPanchayat({ district: row.district });
      setBlockPanchayats(bpRes?.list ?? []);
      setLoadingbp(false);
    }

    // preload gram panchayats
    if (row.block_panchayat) {
      setLoadingdist(true);
      const gpRes = await getGramPanchayat({
        block_panchayat_name: row.block_panchayat,
      });
      setGramPanchayats(gpRes?.list ?? []);
      setLoadingdist(false);
    }
  };
  const handleEditDistrictChange = async (district: string) => {
    if (!selectedLocation) return;

    setSelectedLocation({
      ...selectedLocation,
      district,
      block_panchayat: "",
      gram_panchayat: "",
    });

    if (!district) {
      setBlockPanchayats([]);
      setGramPanchayats([]);
      return;
    }

    setLoadingbp(true);
    const res = await getBlockPanchayat({ district });
    setBlockPanchayats(res?.list ?? []);
    setLoadingbp(false);
  };
  const handleEditBlockChange = async (block: string) => {
    if (!selectedLocation) return;

    setSelectedLocation({
      ...selectedLocation,
      block_panchayat: block,
      gram_panchayat: "",
    });

    if (!block) {
      setGramPanchayats([]);
      return;
    }

    setLoadingdist(true);
    const res = await getGramPanchayat({
      block_panchayat_name: block,
    });
    setGramPanchayats(res?.list ?? []);
    setLoadingdist(false);
  };

  // ---------- Delete ----------
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This location will be deleted permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteLocation({
        location_manager_id: Number(id),
      });
      Swal.fire("Deleted", "Location deleted successfully", "success");
      fetchLocations();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  // ---------- Table Columns ----------
  const columns: Column[] = [
    { key: "center_name", label: "Center Name", align: "left" },
    { key: "center_address", label: "Address", align: "left" },
    { key: "district", label: "District", align: "center" },
    {
      key: "gram_panchayat_",
      label: "Gram Panchayat",
      align: "center",
      render: (_value, row) =>
        `${row.gram_panchayat_code} - ${row.gram_panchayat}`,
    },
    { key: "block_panchayat", label: "Block Panchayat", align: "center" },
    {
      key: "created_at",
      label: "Created At",
      align: "center",
      render: (_: any, row: LocationType) =>
        new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_: any, row: LocationType) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleEdit(row)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout headerTitle="View Locations">
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-semibold text-gray-700">
              No locations found
            </h1>
          </div>
        ) : (
          <TableComponent
            columns={columns}
            data={locations}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && selectedLocation && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Edit Location</h2>

            <div>
              <label className="text-sm font-medium">Center Name</label>
              <input
                value={selectedLocation.center_name}
                onChange={(e) =>
                  setSelectedLocation({
                    ...selectedLocation,
                    center_name: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address</label>
              <textarea
                value={selectedLocation.center_address}
                onChange={(e) =>
                  setSelectedLocation({
                    ...selectedLocation,
                    center_address: e.target.value,
                  })
                }
                rows={3}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">District</label>
              <select
                value={selectedLocation.district}
                onChange={(e) => handleEditDistrictChange(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Select District</option>
                {districtList.map((d) => (
                  <option key={d.id} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Block Panchayat</label>
              <select
                value={selectedLocation.block_panchayat}
                onChange={(e) => handleEditBlockChange(e.target.value)}
                className="w-full border p-2 rounded"
                disabled={!blockPanchayats.length || loadingbp}
              >
                <option value="">
                  {loadingbp ? "Loading..." : "Select Block Panchayat"}
                </option>
                {blockPanchayats.map((bp) => (
                  <option
                    key={bp.block_panchayat_name}
                    value={bp.block_panchayat_name}
                  >
                    {bp.block_panchayat_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Gram Panchayat</label>
              <select
                value={selectedLocation.gram_panchayat}
                onChange={(e) => {
                  const selectedGP = gramPanchayats.find(
                    (gp) => gp.gram_panchayat_name === e.target.value,
                  );

                  setSelectedLocation((prev) => {
                    if (!prev) return prev;

                    return {
                      ...prev,
                      gram_panchayat: selectedGP?.gram_panchayat_name ?? "",
                      gram_panchayat_code:
                        selectedGP?.gram_panchayat_code ?? "",
                    };
                  });
                }}
                className="w-full border p-2 rounded"
                disabled={!gramPanchayats.length || loadingdist}
              >
                <option value="">
                  {loadingdist ? "Loading..." : "Select Gram Panchayat"}
                </option>
                {gramPanchayats.map((gp) => (
                  <option
                    key={gp.gram_panchayat_name}
                    value={gp.gram_panchayat_name}
                  >
                    {gp.gram_panchayat_code} - {gp.gram_panchayat_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const Res = await updateLocation({
                      location_manager_id: Number(selectedLocation.id),
                      center_name: selectedLocation.center_name,
                      district: selectedLocation.district,
                      block_panchayat: selectedLocation.block_panchayat,
                      gram_panchayat: selectedLocation.gram_panchayat,
                      gram_panchayat_code: selectedLocation.gram_panchayat_code,
                      center_address: selectedLocation.center_address,
                    });

                    Swal.fire("Success", Res.message, "success");
                    setIsEditOpen(false);
                    fetchLocations();
                  } catch (error: any) {
                    Swal.fire(
                      "Error",
                      error?.response?.data?.message || "Update failed",
                      "error",
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ViewLocationManagerPage;
