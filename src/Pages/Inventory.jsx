import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import supabase from "../createClient";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");

  // Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    inventory_name: "",
    qty: "",
    units: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) console.error(error);
      else setInventory(data);
    };
    fetchInventory();
  }, []);

  // Filter Inventory by Search
  const filteredInventory = inventory.filter((item) =>
    item.inventory_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Form Change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ inventory_name: "", qty: "", units: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Add/Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update
      try {
        const { data, error } = await supabase
          .from("inventory")
          .update({
            inventory_name: formData.inventory_name,
            qty: Number(formData.qty),
            units: formData.units,
          })
          .eq("id", editId);

        if (error) throw error;

        setInventory((prev) =>
          prev.map((item) => (item.id === editId ? data[0] : item))
        );

        setShowModal(false);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `${formData.inventory_name} has been updated.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update inventory!",
        });
      }
    } else {
      // Add
      try {
        const { data, error } = await supabase
          .from("inventory")
          .insert([
            {
              inventory_name: formData.inventory_name,
              qty: Number(formData.qty),
              units: formData.units,
            },
          ]);
        if (error) throw error;

        setInventory((prev) => [...prev, data[0]]);
        setShowModal(false);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: `${formData.inventory_name} has been added.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add inventory!",
        });
      }
    }
  };

  // Delete
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("inventory").delete().eq("id", id);
        if (error) throw error;

        setInventory((prev) => prev.filter((item) => item.id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${name} has been deleted.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete inventory!",
        });
      }
    }
  };

  return (
    <div className="px-10 py-6">
      <h2 className="font-bold font-serif text-xl mb-4">Inventory</h2>

      {/* Top Actions */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search Inventory..."
          className="p-2 border border-gray-400 rounded-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <button
          onClick={openAddModal}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-sm px-4"
        >
          Add Inventory
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-left">Units</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedInventory.length > 0 ? (
              paginatedInventory.map((item, index) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.inventory_name}
                  </td>
                  <td className="px-4 py-3 text-center">{item.qty}</td>
                  <td className="px-4 py-3">{item.units}</td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition"
                      onClick={() => openEditModal(item)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 transition"
                      onClick={() => handleDelete(item.id, item.inventory_name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-400 font-medium"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Inventory" : "Add Inventory"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="inventory_name"
                placeholder="Item Name"
                value={formData.inventory_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                name="qty"
                placeholder="Quantity"
                value={formData.qty}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                name="units"
                placeholder="Units"
                value={formData.units}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
