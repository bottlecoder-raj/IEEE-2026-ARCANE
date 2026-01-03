import { useState } from 'react'

const FilterPanel = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      category: '',
      condition: '',
      location: '',
      search: ''
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={handleReset} className="btn-link">
          Reset
        </button>
      </div>

      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          type="text"
          id="search"
          value={localFilters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search materials..."
        />
      </div>

      <div className="filter-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={localFilters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="fabric">Fabric</option>
          <option value="clothing">Clothing</option>
          <option value="accessories">Accessories</option>
          <option value="leather">Leather</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="condition">Condition</label>
        <select
          id="condition"
          value={localFilters.condition}
          onChange={(e) => handleChange('condition', e.target.value)}
        >
          <option value="">All Conditions</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={localFilters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="City, State"
        />
      </div>
    </div>
  )
}

export default FilterPanel

