import { useState } from "react";
import "./App.css";

function App() {
  const [pincode, setPincode] = useState("");
  const [postOffices, setPostOffices] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async () => {
    setError("");
    setPostOffices([]);
    setFilter("");
    setHasSearched(false);

    if (!/^\d{6}$/.test(pincode)) {
      setError("Postal code must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data = await response.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const result = data[0];
      if (result.Status === "Error" || !result.PostOffice) {
        setError(
          result.Message || "Couldn’t find the postal data you’re looking for…",
        );
        setLoading(false);
        return;
      }

      setPostOffices(result.PostOffice);
      setHasSearched(true);
    } catch (err) {
      setError(
        "Failed to fetch data. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredOffices = postOffices.filter((office) =>
    office.Name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Pincode Lookup</h1>
        <p className="subtitle">
          Enter a 6-digit Indian Postal Code to find post office details
        </p>

        <div className="search-section">
          <div className="input-group">
            <input
              type="text"
              className="pincode-input"
              placeholder="Enter 6-digit Pincode"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <button
              className="lookup-btn"
              onClick={handleLookup}
              disabled={loading}
            >
              Lookup
            </button>
          </div>
        </div>

        {loading && (
          <div className="loader-wrapper">
            <div className="loader"></div>
            <p>Fetching postal data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {hasSearched && !loading && !error && (
          <>
            <div className="filter-section">
              <input
                type="text"
                className="filter-input"
                placeholder="Filter by Post Office Name"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {filteredOffices.length === 0 ? (
              <div className="no-results">
                <p>Couldn’t find the postal data you’re looking for…</p>
              </div>
            ) : (
              <div className="results">
                <p className="results-count">
                  {filteredOffices.length} post office(s) found
                </p>
                <div className="cards">
                  {filteredOffices.map((office, index) => (
                    <div className="card" key={index}>
                      <h3 className="office-name">{office.Name}</h3>

                      <div className="card-details">
                        <div className="detail-row">
                          <span className="label">Pincode:</span>
                          <span className="value">{office.Pincode}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">District:</span>
                          <span className="value">{office.District}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">State:</span>
                          <span className="value">{office.State}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
