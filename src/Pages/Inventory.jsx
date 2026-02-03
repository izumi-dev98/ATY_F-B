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

    /* ===================== FETCH INVENTORY ===================== */
    const fetchInventory = async () => {
        const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
        } else {
            setInventory(data || []);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    /* ===================== SEARCH ===================== */
    const filteredInventory = inventory.filter((item) =>
        item.inventory_name?.toLowerCase().includes(search.toLowerCase())
    );

    /* ===================== PAGINATION ===================== */
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    /* ===================== FORM HANDLING ===================== */
    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const openAddModal = () => {
        setFormData({ inventory_name: "", qty: "", units: "" });
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            inventory_name: item.inventory_name,
            qty: item.qty,
            units: item.units,
        });
        setEditId(item.id);
        setIsEditing(true);
        setShowModal(true);
    };

    /* ===================== ADD / EDIT ===================== */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                await supabase
                    .from("inventory")
                    .update({
                        inventory_name: formData.inventory_name,
                        qty: Number(formData.qty),
                        units: formData.units,
                    })
                    .eq("id", editId);

                Swal.fire("Updated!", "Inventory updated successfully", "success");
            } else {
                await supabase.from("inventory").insert([
                    {
                        inventory_name: formData.inventory_name,
                        qty: Number(formData.qty),
                        units: formData.units,
                    },
                ]);

                Swal.fire("Added!", "Inventory added successfully", "success");
            }

            setShowModal(false);
            setIsEditing(false);
            setEditId(null);

            await fetchInventory(); // 🔑 CRITICAL FIX

        } catch (err) {
            Swal.fire("Error", "Operation failed", err);
        }
    };

    /* ===================== DELETE ===================== */
    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: `Delete "${name}"?`,
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            await supabase.from("inventory").delete().eq("id", id);
            await fetchInventory();

            Swal.fire("Deleted!", "Inventory removed", "success");
        }
    };

    /* ===================== UI ===================== */
    return (
        <div className="px-10   bg-gray-100 ">
            <h2 className="text-xl font-bold mb-4">📦 Inventory</h2>

            {/* Top Controls */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="search"
                    placeholder="Search inventory..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="p-2 border rounded w-64"
                />

                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Add Inventory
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">No</th>
                            <th className="px-4 py-3 text-left">Item</th>
                            <th className="px-4 py-3 text-center">Qty</th>
                            <th className="px-4 py-3 text-left">Units</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {paginatedInventory.length ? (
                            paginatedInventory.map((item, index) => (
                                <tr key={item.id} className="hover:bg-blue-50">
                                    <td className="px-4 py-2">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-2">{item.inventory_name}</td>
                                    <td className="px-4 py-2 text-center">{item.qty}</td>
                                    <td className="px-4 py-2">{item.units}</td>
                                    <td className="px-4 py-2 text-center space-x-3">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="text-blue-600"
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.inventory_name)}
                                            className="text-red-600"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-6 text-gray-400">
                                    No inventory found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    {/* Previous Button */}
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded ${currentPage === 1
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                    >
                        Prev
                    </button>

                    {/* Page Info */}
                    <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>

                    {/* Next Button */}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded ${currentPage === totalPages
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            {isEditing ? "Edit Inventory" : "Add Inventory"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="inventory_name"
                                value={formData.inventory_name}
                                onChange={handleChange}
                                placeholder="Item name"
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                name="qty"
                                type="number"
                                value={formData.qty}
                                onChange={handleChange}
                                placeholder="Quantity"
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                name="units"
                                value={formData.units}
                                onChange={handleChange}
                                placeholder="Units"
                                className="w-full p-2 border rounded"
                                required
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded"
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
