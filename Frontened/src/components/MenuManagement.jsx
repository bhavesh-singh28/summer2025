import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  getWeeklyMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  getAllMenus,
} from "../api/menuApi";

const MenuManagement = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("view");
  const [editingMenu, setEditingMenu] = useState(null);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "dinner"];

  const [menuForm, setMenuForm] = useState({
    day: "Monday",
    meals: mealTypes.map((type) => ({
      type,
      items: [""],
      description: "",
      calories: "",
      price: "",
    })),
  });

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const fetchWeeklyMenu = async () => {
    try {
      setLoading(true);
      const response = await getWeeklyMenu();
      if (response.success) {
        response.data.forEach((menu) => {
        });
        setWeeklyMenu(response.data);
      } else {
        setError("Failed to fetch menu data");
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError("Failed to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    try {
      const formattedMenu = {
        ...menuForm,
        meals: menuForm.meals.map((meal) => ({
          ...meal,
          items: meal.items.filter((item) => item.trim() !== ""),
          calories: meal.calories ? parseInt(meal.calories) : undefined,
          price: meal.price ? parseFloat(meal.price) : undefined,
        })),
      };

     
      const response = await createMenu(formattedMenu);
      

      if (response.success) {
        setActiveTab("view");
        fetchWeeklyMenu();
        resetForm();
        alert("Menu created successfully!");
      } else {
        console.error("API returned failure:", response);
        alert(
          "Failed to create menu: " + (response.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      console.error("Error details:", err.response?.data || err.message);
      alert(
        "Failed to create menu. Please check console for details and try again."
      );
    }
  };

  const handleUpdateMenu = async () => {
    try {
      const formattedMenu = {
        ...menuForm,
        meals: menuForm.meals.map((meal) => ({
          ...meal,
          items: meal.items.filter((item) => item.trim() !== ""),
          calories: meal.calories ? parseInt(meal.calories) : undefined,
          price: meal.price ? parseFloat(meal.price) : undefined,
        })),
      };

      const response = await updateMenu(editingMenu._id, formattedMenu);
      if (response.success) {
        setActiveTab("view");
        setEditingMenu(null);
        fetchWeeklyMenu();
        resetForm();
        alert("Menu updated successfully!");
      }
    } catch (err) {
      console.error("Error updating menu:", err);
      alert("Failed to update menu. Please try again.");
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      try {
        const response = await deleteMenu(menuId);
        if (response.success) {
          fetchWeeklyMenu();
          alert("Menu deleted successfully!");
        }
      } catch (err) {
        console.error("Error deleting menu:", err);
        alert("Failed to delete menu. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setMenuForm({
      day: "Monday",
      meals: mealTypes.map((type) => ({
        type,
        items: [""],
        description: "",
        calories: "",
        price: "",
      })),
    });
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setMenuForm({
      day: menu.day,
      meals: mealTypes.map((type) => {
        const existingMeal = menu.meals.find((meal) => meal.type === type);
        return existingMeal
          ? {
              ...existingMeal,
              items: existingMeal.items.length > 0 ? existingMeal.items : [""],
              calories: existingMeal.calories || "",
              price: existingMeal.price || "",
            }
          : {
              type,
              items: [""],
              description: "",
              calories: "",
              price: "",
            };
      }),
    });
    setActiveTab("create");
  };

  const addMenuItem = (mealIndex) => {
    const updatedMeals = [...menuForm.meals];
    updatedMeals[mealIndex].items.push("");
    setMenuForm({ ...menuForm, meals: updatedMeals });
  };

  const removeMenuItem = (mealIndex, itemIndex) => {
    const updatedMeals = [...menuForm.meals];
    updatedMeals[mealIndex].items.splice(itemIndex, 1);
    setMenuForm({ ...menuForm, meals: updatedMeals });
  };

  const updateMenuItem = (mealIndex, itemIndex, value) => {
    const updatedMeals = [...menuForm.meals];
    updatedMeals[mealIndex].items[itemIndex] = value;
    setMenuForm({ ...menuForm, meals: updatedMeals });
  };

  const updateMealField = (mealIndex, field, value) => {
    const updatedMeals = [...menuForm.meals];
    updatedMeals[mealIndex][field] = value;
    setMenuForm({ ...menuForm, meals: updatedMeals });
  };

  const getMenuForDay = (day) => {
    return weeklyMenu.find((menu) => menu.day === day);
  };

  // Sort the weekly menu by day order
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const sortedWeeklyMenu = weeklyMenu.sort((a, b) => {
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });

  const getMealColor = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "border-blue-500";
      case "lunch":
        return "border-green-500";
      case "dinner":
        return "border-purple-500";
      default:
        return "border-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🍽️ Menu Management
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🍽️ Menu Management</h1>
        <button
          onClick={() => {
            setActiveTab("create");
            resetForm();
            setEditingMenu(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:to-orange-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add Menu
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { key: "view", label: "View Menu" },
          { key: "create", label: editingMenu ? "Edit Menu" : "Create Menu" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 border-b-2 font-medium transition-all ${
              activeTab === tab.key
                ? "border-orange-600 text-orange-700"
                : "border-transparent text-gray-600 hover:text-orange-600 hover:border-orange-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View Menu Tab */}
      {activeTab === "view" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => {
            const dayMenu = getMenuForDay(day);

            return (
              <div
                key={day}
                className="bg-white rounded-lg shadow p-6 relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{day}</h3>
                  {dayMenu && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMenu(dayMenu)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(dayMenu._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {dayMenu ? (
                  <div className="space-y-3">
                    {dayMenu.meals.map((meal, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${getMealColor(meal.type)} pl-3`}
                      >
                        <p className="font-medium text-sm text-gray-600 capitalize">
                          {meal.type}
                        </p>
                        <p className="text-sm text-gray-800">
                          {meal.items.join(", ")}
                        </p>
                        {meal.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {meal.description}
                          </p>
                        )}
                        <div className="flex gap-3 mt-1">
                          {meal.calories && (
                            <p className="text-xs text-blue-600">
                              {meal.calories} cal
                            </p>
                          )}
                          {meal.price && (
                            <p className="text-xs text-green-600">
                              ₹{meal.price}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No menu available</p>
                    <button
                      onClick={() => {
                        setMenuForm({ ...menuForm, day });
                        setActiveTab("create");
                      }}
                      className="text-orange-600 text-xs mt-1 hover:underline"
                    >
                      Add menu for {day}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Menu Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select
                value={menuForm.day}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, day: e.target.value })
                }
                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {menuForm.meals.map((meal, mealIndex) => (
              <div
                key={meal.type}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="text-lg font-semibold capitalize mb-4 text-gray-800">
                  {meal.type}
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Items
                    </label>
                    {meal.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateMenuItem(mealIndex, itemIndex, e.target.value)
                          }
                          placeholder="Enter food item"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        {meal.items.length > 1 && (
                          <button
                            onClick={() => removeMenuItem(mealIndex, itemIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addMenuItem(mealIndex)}
                      className="text-orange-600 text-sm hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={meal.description}
                        onChange={(e) =>
                          updateMealField(
                            mealIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Brief description"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calories (Optional)
                      </label>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) =>
                          updateMealField(mealIndex, "calories", e.target.value)
                        }
                        placeholder="Calories"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={meal.price}
                        onChange={(e) =>
                          updateMealField(mealIndex, "price", e.target.value)
                        }
                        placeholder="Price in ₹"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={editingMenu ? handleUpdateMenu : handleCreateMenu}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:to-orange-800 transition font-medium"
            >
              <Save className="w-4 h-4" />
              {editingMenu ? "Update Menu" : "Create Menu"}
            </button>
            <button
              onClick={() => {
                setActiveTab("view");
                setEditingMenu(null);
                resetForm();
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
