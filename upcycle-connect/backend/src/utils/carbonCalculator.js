// Carbon footprint calculation utilities
// Estimates carbon saved by recycling/upcycling materials

/**
 * Calculate carbon saved based on material type and quantity
 * @param {string} materialType - Type of material (fabric, clothing, etc.)
 * @param {number} quantity - Quantity of material
 * @returns {number} Carbon saved in kg CO2
 */
export const calculateCarbonSaved = (materialType, quantity) => {
  // Carbon footprint factors (kg CO2 per unit)
  // These are approximate values - can be refined with actual data
  const carbonFactors = {
    fabric: 25, // kg CO2 per kg of fabric
    clothing: 20, // kg CO2 per item
    accessories: 5, // kg CO2 per item
    leather: 30, // kg CO2 per kg
    other: 15 // kg CO2 per unit
  }

  const factor = carbonFactors[materialType.toLowerCase()] || carbonFactors.other
  return (factor * quantity).toFixed(2)
}

/**
 * Calculate total impact score based on various factors
 * @param {Object} impactData - Object containing impact metrics
 * @returns {number} Impact score
 */
export const calculateImpactScore = (impactData) => {
  const { carbonSaved = 0, materialsRecycled = 0, projectsCompleted = 0 } = impactData

  // Weighted scoring system
  const carbonWeight = 0.5
  const materialsWeight = 0.3
  const projectsWeight = 0.2

  const score = (
    parseFloat(carbonSaved) * carbonWeight +
    materialsRecycled * materialsWeight +
    projectsCompleted * projectsWeight
  )

  return Math.round(score)
}

/**
 * Calculate carbon saved for a material transaction
 * @param {Object} material - Material object
 * @returns {number} Carbon saved in kg CO2
 */
export const calculateMaterialCarbonSaved = (material) => {
  if (!material || !material.category || !material.quantity) {
    return 0
  }

  return parseFloat(calculateCarbonSaved(material.category, material.quantity))
}

