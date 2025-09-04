"use client";

import { ChangeEvent, FormEvent } from "react";
import styles from "../dashboard.module.css";

export type DashboardFilters = {
  map: string;
  action: string;
  searchText: string;
};

type ToolbarProps = {
  filters: DashboardFilters;
  isFetching: boolean;
  onFiltersChange: (next: Partial<DashboardFilters>) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleAddForm: () => void;
  isAddFormVisible: boolean;
};

export default function Toolbar({
  filters,
  isFetching,
  onFiltersChange,
  onSearchSubmit,
  onToggleAddForm,
  isAddFormVisible,
}: ToolbarProps) {
  const handleInputChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    onFiltersChange({ [name]: value } as Partial<DashboardFilters>);
  };

  return (
    <div className={styles.toolbar}>
      <form className={styles.toolbarForm} onSubmit={onSearchSubmit}>
        <select
          name="map"
          value={filters.map}
          onChange={handleInputChange}
          className={styles.select}
        >
          <option value="">All maps</option>
          <option value="mirage">Mirage</option>
          <option value="inferno">Inferno</option>
          <option value="dust2">Dust 2</option>
          <option value="nuke">Nuke</option>
          <option value="overpass">Overpass</option>
          <option value="vertigo">Vertigo</option>
          <option value="ancient">Ancient</option>
        </select>

        <select
          name="action"
          value={filters.action}
          onChange={handleInputChange}
          className={styles.select}
        >
          <option value="">All actions</option>
          <option value="smoke">Smoke</option>
          <option value="flash">Flash</option>
          <option value="molotov">Molotov</option>
          <option value="hegrenade">HE Grenade</option>
        </select>

        <input
          type="text"
          name="searchText"
          value={filters.searchText}
          onChange={handleInputChange}
          placeholder="Search by position, target or tag..."
          className={styles.input}
        />

        <button type="submit" className={styles.buttonPrimary} disabled={isFetching}>
          {isFetching ? "Filtering..." : "Filter"}
        </button>
      </form>

      <button className={styles.buttonSecondary} onClick={onToggleAddForm}>
        {isAddFormVisible ? "Close form" : "➕ Add new video"}
      </button>
    </div>
  );
}


