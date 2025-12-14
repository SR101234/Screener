import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

const Heatmap = ({ heatmapData }) => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const metrics = ["PE", "ROCE", "ROE", "PromHold", "Salesvar", "ProfitVar", "OPM", "CROIC"];

  useEffect(() => {
    setData(Array.isArray(heatmapData) ? heatmapData : []);
  }, [heatmapData]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Metric Coloring Logic (Same as before) ---
  const clamp = (num) => Math.min(1, Math.max(0, num));
  const getColorValue = (metric, value) => {
    if (isNaN(value)) return 0.5;
    let result;
    switch (metric) {
      case "PE":
        if (value < 30) result = 1 - (value / 30) * 0.5;
        else if (value <= 100) result = 0.5 - ((value - 30) / 70) * 0.5;
        else result = 0;
        break;
      case "ROCE":
      case "ROE":
      case "OPM":
      case "CROIC":
        if (value <= 12) result = (value / 12) * 0.5;
        else if (value <= 50) result = 0.5 + ((value - 12) / 38) * 0.5;
        else result = 1;
        break;
      case "PromHold":
        if (value <= 50) result = (value / 50) * 0.5;
        else if (value <= 100) result = 0.5 + ((value - 50) / 50) * 0.5;
        else result = 1;
        break;
      case "Salesvar":
      case "ProfitVar":
        if (value <= 8) result = (value / 8) * 0.5;
        else if (value <= 50) result = 0.5 + ((value - 8) / 42) * 0.5;
        else result = 1;
        break;
      default:
        result = 0.5;
    }
    return clamp(result);
  };

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const displayedData = showAll ? data : data.slice(0, 30);
    const reversedData = [...displayedData].reverse();

    // Shorten names slightly on mobile if needed, but keeping full names is usually preferred if space allows
    const stocks = reversedData.map((d) => d.Symbol || "N/A");

    const rawMatrix = reversedData.map((row) =>
      metrics.map((col) => parseFloat(row[col]) || 0)
    );

    const zMatrix = rawMatrix.map((row) =>
      row.map((val, colIndex) => getColorValue(metrics[colIndex], val))
    );

    const textMatrix = rawMatrix.map((row) =>
      row.map((val) => val.toFixed(2))
    );

    // --- Dynamic Layout Configuration ---
    const layout = {
      // Calculate height: Base height per row + extra space for bottom legend on mobile
      height: Math.max(displayedData.length * (isMobile ? 30 : 25), 350) + (isMobile ? 50 : 0),
      margin: {
        l: isMobile ? 85 : 110, // Left margin for Stock Names
        r: isMobile ? 5 : 50,   // drastically reduce right margin on mobile (colorbar is now at bottom)
        t: 50,                  // Top margin for column headers
        b: isMobile ? 50 : 20,  // Bottom margin (increased on mobile for legend)
      },
      xaxis: {
        side: "top",
        tickfont: { size: isMobile ? 10 : 11 },
        tickangle: isMobile ? -45 : 0, 
        fixedrange: true, // prevent zooming
      },
      yaxis: {
        tickfont: { size: isMobile ? 10 : 11 },
        automargin: true,
        fixedrange: true, // prevent zooming
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
    };

    const plotData = [
      {
        z: zMatrix,
        text: textMatrix,
        texttemplate: isMobile ? "" : "%{text}", // Hide values on mobile to reduce clutter
        type: "heatmap",
        x: metrics,
        y: stocks,
        colorscale: [
          [0, "red"],
          [0.5, "yellow"],
          [1, "green"],
        ],
        showscale: true,
        
        // --- KEY FIX: Move Colorbar to Bottom on Mobile ---
        colorbar: isMobile 
          ? {
              orientation: 'h',     // Horizontal
              x: 0.5,               // Center horizontally
              y: -0.1,              // Move below the chart
              thickness: 10,        // Thin bar
              len: 0.8,             // 80% width
              tickfont: { size: 9 }
            }
          : {
              orientation: 'v',     // Vertical (Desktop default)
              len: 1,
              thickness: 20,
              x: 1.02               // Just outside right edge
            },
            
        hovertemplate:
          "Stock: %{y}<br>Metric: %{x}<br>Value: %{text}<extra></extra>",
        xgap: 1,
        ygap: 1,
      },
    ];

    Plotly.react(chartRef.current, plotData, layout, {
      responsive: true,
      displayModeBar: false,
    });

    return () => {
      if (chartRef.current) Plotly.purge(chartRef.current);
    };
  }, [data, showAll, isMobile]);

  return (
    <>
      <div
        ref={chartRef}
        style={{
          width: "100%",        // Always take full width of container
          maxWidth: "1000px",
          minHeight: "250px",
          margin: "0 auto",
        }}
      />

      {data.length > 30 && (
        <div style={{ textAlign: "center", marginTop: 5, marginBottom: 20 }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #6e27ff",
              backgroundColor: showAll ? "#fff" : "#6e27ff",
              color: showAll ? "#6e27ff" : "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        </div>
      )}
    </>
  );
};

export default Heatmap;