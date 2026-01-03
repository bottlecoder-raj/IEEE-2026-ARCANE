const ImpactStats = ({ analytics }) => {
  if (!analytics) {
    return <div>No analytics data available</div>
  }

  const stats = [
    {
      label: 'Carbon Saved (kg)',
      value: analytics.carbonSaved || 0,
      unit: 'kg CO₂'
    },
    {
      label: 'Materials Recycled',
      value: analytics.materialsRecycled || 0,
      unit: 'items'
    },
    {
      label: 'Projects Completed',
      value: analytics.projectsCompleted || 0,
      unit: 'projects'
    },
    {
      label: 'Impact Score',
      value: analytics.impactScore || 0,
      unit: 'points'
    }
  ]

  return (
    <div className="impact-stats">
      <h2>Your Impact</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <p className="stat-value">
              {stat.value.toLocaleString()} {stat.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImpactStats

