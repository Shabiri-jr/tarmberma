import { ArrowUpRight, Check, MapPin } from "lucide-react";
import "./location-choice.css";

export default function LocationChoice({ locations, selectedId, onSelect }) {
  return (
    <div className="location-choice">
      <span className="eyebrow">TWO CITIES. ONE WARM WELCOME.</span>
      <h2>
        Where shall
        <br />
        we <em>meet?</em>
      </h2>
      <p>
        Choose your Tamberma for menus, directions and a table waiting to be
        shared.
      </p>
      <div className="location-options">
        {locations.map((location, index) => (
          <button
            key={location.id}
            className={`location-option ${selectedId === location.id ? "is-selected" : ""}`}
            onClick={() => onSelect(location.id)}
            aria-label={`Choose ${location.name}`}
            aria-pressed={selectedId === location.id}
          >
            <span className="location-option-number">0{index + 1}</span>
            <span className="location-option-copy">
              <small>
                {location.city === location.name
                  ? location.neighborhood
                  : location.city}
              </small>
              <strong>{location.name}</strong>
              <span>
                <MapPin size={13} />
                {location.address}
              </span>
              <em>{location.tagline}</em>
            </span>
            <span className="location-option-arrow">
              {selectedId === location.id ? (
                <Check size={19} />
              ) : (
                <ArrowUpRight size={21} />
              )}
            </span>
          </button>
        ))}
      </div>
      <span className="location-choice-note">
        You can change your location at any time.
      </span>
    </div>
  );
}
