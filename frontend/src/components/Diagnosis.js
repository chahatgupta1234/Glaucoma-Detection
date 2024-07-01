import React, { useState } from 'react';
import './Diagnosis.css';

function Diagnosis() {
  const [formData, setFormData] = useState({
    RL: '',
    age: '',
    ocular_pressure: '',
    MD: '',
    PSD: '',
    GHT: '',
    cornea_thickness: '',
    RNFL4mean: '',
  });

  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    setPrediction(null);
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tokenResponse = await fetch('http://localhost:5000/api/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch token');
      }else{
        console.log("tokenResponse",tokenResponse);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // console.log("accessToken",accessToken);

      const payload = {
        input_data: [
          {
            fields: ["RL", "age", "ocular_pressure", "MD", "PSD", "GHT", "cornea_thickness", "RNFL4mean"],
            values: [[
              formData.RL,
              formData.age,
              formData.ocular_pressure,
              formData.MD,
              formData.PSD,
              formData.GHT,
              formData.cornea_thickness,
              formData.RNFL4mean,
            ]],
          },
        ],
      };

      // console.log("payload",payload);

      const scoringResponse = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: accessToken,
          payload: payload,
        }),
      });

      const scoringData = await scoringResponse.json();

      if (!scoringResponse.ok) {
        throw new Error('Failed to fetch prediction'+ scoringData.error);
      }

      let isGlaucoma = scoringData.predictions[0].values[0][0];
      if (isGlaucoma === 0) {
        setPrediction(`You do not have Glaucoma. Probability:  ${scoringData.predictions[0].values[0][1][1]*100}`);
      } else {
        setPrediction(`You may have Glaucoma. Probability:  ${scoringData.predictions[0].values[0][1][1]*100}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setPrediction({ error: error.message });
    }
  };

  return (
    <div className="diagnosis">
      <h1>Glaucoma Diagnosis</h1>
      <form onSubmit={handleSubmit}>
        <label>
          RL:
          <select name="RL" value={formData.RL} onChange={handleChange}>
            <option value="">Select Eye</option>
            <option value="OD">Right Eye (OD)</option>
            <option value="OS">Left Eye (OS)</option>
          </select>
        </label>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </label>
        <label>
          Ocular Pressure:
          <input
            type="number"
            name="ocular_pressure"
            value={formData.ocular_pressure}
            onChange={handleChange}
          />
        </label>
        <label>
          MD:
          <input
            type="number"
            name="MD"
            value={formData.MD}
            onChange={handleChange}
          />
        </label>
        <label>
          PSD:
          <input
            type="number"
            name="PSD"
            value={formData.PSD}
            onChange={handleChange}
          />
        </label>
        <label>
          GHT:
          <input
            type="text"
            name="GHT"
            value={formData.GHT}
            onChange={handleChange}
          />
        </label>
        <label>
          Cornea Thickness:
          <input
            type="number"
            name="cornea_thickness"
            value={formData.cornea_thickness}
            onChange={handleChange}
          />
        </label>
        <label>
          RNFL4.mean:
          <input
            type="number"
            name="RNFL4mean"
            value={formData.RNFL4mean}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Predict</button>
      </form>
      {prediction && (
        <div className="prediction-result">
          <h2>Prediction Result</h2>
          {prediction.error ? (
            <p>Error: {prediction.error}</p>
          ) : (
            <pre>{prediction}</pre>
          )}
        </div>
      )}
    </div>
  );
}

export default Diagnosis;
