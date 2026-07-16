import { create } from "zustand";

// Store des filtres catalogue - separe du panier pour eviter les re-render croises
export const useCatalogFilters = create((set) => ({
  type: null, // "MOTO" | "TRICYCLE" | "PIECE" | null
  categorySlug: null,
  vehicleModelId: null,
  search: "",
  sort: "recent", // recent | prix_asc | prix_desc

  setType: (type) => set({ type }),
  setCategory: (categorySlug) => set({ categorySlug }),
  setVehicleModel: (vehicleModelId) => set({ vehicleModelId }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  reset: () =>
    set({
      type: null,
      categorySlug: null,
      vehicleModelId: null,
      search: "",
      sort: "recent",
    }),
}));
