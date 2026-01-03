import { Link } from 'react-router-dom'

const MaterialCard = ({ material }) => {
  return (
    <div className="material-card">
      <div className="material-card-image">
        {material.image ? (
          <img src={material.image} alt={material.name} />
        ) : (
          <div className="material-placeholder">No Image</div>
        )}
      </div>
      <div className="material-card-content">
        <h3 className="material-card-title">{material.name}</h3>
        <p className="material-card-description">
          {material.description?.substring(0, 100)}
          {material.description?.length > 100 ? '...' : ''}
        </p>
        <div className="material-card-meta">
          <span className="material-category">{material.category}</span>
          <span className="material-condition">{material.condition}</span>
        </div>
        <div className="material-card-details">
          <span>Quantity: {material.quantity}</span>
          <span>Location: {material.location || 'N/A'}</span>
        </div>
        <div className="material-card-actions">
          <Link
            to={`/materials/${material.id}`}
            className="btn-secondary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MaterialCard

