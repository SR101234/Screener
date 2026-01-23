import React, { useEffect, useMemo, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import { a } from "framer-motion/client";

const Heatmap = ({ heatmapData = [], asset = [] }) => {
  const chartRef = useRef(null);

  const [data, setData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const metrics = [
    "PE",
    "ROCE",
    "ROE",
    "PromHold",
    "Salesvar",
    "ProfitVar",
    "OPM",
    "CROIC",
  ];

  /* ---------------- lifecycle ---------------- */

  useEffect(() => {
    setData(Array.isArray(heatmapData) ? heatmapData : []);
  }, [heatmapData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------------- normalization ---------------- */

  const clamp = (n) => Math.min(1, Math.max(0, n));

  const getColorValue = (metric, value) => {
    if (isNaN(value)) return 0.5;
    let r;

    switch (metric) {
      case "PE":
        if (value < 30) r = 1 - (value / 30) * 0.5;
        else if (value <= 100) r = 0.5 - ((value - 30) / 70) * 0.5;
        else r = 0;
        break;

      case "ROCE":
      case "ROE":
      case "OPM":
      case "CROIC":
        if (value <= 12) r = (value / 12) * 0.5;
        else if (value <= 50) r = 0.5 + ((value - 12) / 38) * 0.5;
        else r = 1;
        break;

      case "PromHold":
        if (value <= 50) r = (value / 50) * 0.5;
        else if (value <= 100) r = 0.5 + ((value - 50) / 50) * 0.5;
        else r = 1;
        break;

      case "Salesvar":
      case "ProfitVar":
        if (value <= 8) r = (value / 8) * 0.5;
        else if (value <= 50) r = 0.5 + ((value - 8) / 42) * 0.5;
        else r = 1;
        break;

      default:
        r = 0.5;
    }

    return clamp(r);
  };

  /* -------- portfolio weighted scores -------- */

  const weightedScores = useMemo(() => {
    if (!data.length || !asset.length) return {};

    const holdingByIsin = asset.reduce((acc, a) => {
      acc[a.isin] = (acc[a.isin] || 0) + Number(a.perc || 0);
      return acc;
    }, {});

    const totalHolding = Object.values(holdingByIsin).reduce(
      (s, v) => s + v,
      0
    );

    if (!totalHolding) return {};

    const sums = Object.fromEntries(metrics.map((m) => [m, 0]));

    data.forEach((row) => {
      const holding = holdingByIsin[row.ISIN];
      if (!holding) return;

      metrics.forEach((metric) => {
        const raw = parseFloat(row[metric]);
        if (!isNaN(raw)) {
          sums[metric] += holding * getColorValue(metric, raw);
        }
      });
    });

    return Object.fromEntries(
      metrics.map((m) => [m, sums[m] / totalHolding])
    );
  }, [data, asset]);

  const overallScore = useMemo(() => {
    const vals = Object.values(weightedScores);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [weightedScores]);

  /* ---------------- plot ---------------- */

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const visible = showAll ? data : data.slice(0, 30);
    const rows = [...visible].reverse();

    const stocks = rows.map((r) => r.Symbol || "N/A");

    const rawMatrix = rows.map((r) =>
      metrics.map((m) => parseFloat(r[m]) || 0)
    );

    const zMatrix = rawMatrix.map((row) =>
      row.map((v, i) => getColorValue(metrics[i], v))
    );

    const textMatrix = rawMatrix.map((row) =>
      row.map((v) => v.toFixed(2))
    );

    const hasScore = typeof overallScore === "number";
    const score = hasScore
      ? Math.min(1, Math.max(0, overallScore))
      : null;

    /* ---- colorbar positioning ---- */
    const colorbarX = 1.02;
    const colorbarTop = isMobile ? 0.85 : 0.9;
    const colorbarBottom = isMobile ? 0.15 : 0.1;
    const scoreY =
      hasScore &&
      colorbarBottom + score * (colorbarTop - colorbarBottom);

    const scoreColor =
      score > 0.66 ? "#1a7f37" :
      score > 0.33 ? "#b08900" :
      "#b42318";

    const layout = {
      height:
        Math.max(visible.length * (isMobile ? 30 : 25), 350) +
        (isMobile ? 50 : 0),
      margin: {
        l: isMobile ? 85 : 110,
        r: 90,
        t: 40,
        b: isMobile ? 50 : 20,
      },
      xaxis: {
        side: "top",
        tickfont: { size: isMobile ? 10 : 11 },
        fixedrange: true,
      },
      yaxis: {
        tickfont: { size: isMobile ? 10 : 11 },
        fixedrange: true,
        automargin: true,
      },

      /* ---- SCORE MARKER ---- */
      shapes: hasScore
        ? [
            {
              type: "line",
              xref: "paper",
              yref: "paper",
              x0: colorbarX,
              x1: colorbarX + 0.035,
              y0: scoreY,
              y1: scoreY,
              line: { color: scoreColor, width: 2 },
            },
          ]
        : [],

      annotations: hasScore
        ? [
            {
              xref: "paper",
              yref: "paper",
              x: colorbarX + 0.055,
              y: scoreY,
              text: `<b>${score.toFixed(2)}</b>`,
              showarrow: false,
              bgcolor: "rgba(255,255,255,0.9)",
              bordercolor: scoreColor,
              borderwidth: 1,
              borderpad: 3,
              font: { size: 11, color: scoreColor },
              align: "left",
            },
          ]
        : [],

      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    };

    Plotly.react(
      chartRef.current,
      [
        {
          type: "heatmap",
          z: zMatrix,
          x: metrics,
          y: stocks,
          text: textMatrix,
          texttemplate: isMobile ? "" : "%{text}",
          colorscale: [
            [0, "red"],
            [0.5, "yellow"],
            [1, "green"],
          ],
          showscale: true,
          colorbar: {
            orientation: "v",
            thickness: 20,
            x: colorbarX,
          },
          hovertemplate:
            "Stock: %{y}<br>Metric: %{x}<br>Value: %{text}<extra></extra>",
          xgap: 1,
          ygap: 1,
        },
      ],
      layout,
      { responsive: true, displayModeBar: false }
    );

    return () => {
      if (chartRef.current) Plotly.purge(chartRef.current);
    };
  }, [data, showAll, isMobile, overallScore]);

  /* ---------------- ui ---------------- */

  return (
    <>
      <div
        ref={chartRef}
        style={{
          width: "100%",
          maxWidth: "1000px",
          minHeight: "250px",
          margin: "0 auto",
        }}
      />

      {data.length > 30 && (
        <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #6e27ff",
              background: showAll ? "#fff" : "#6e27ff",
              color: showAll ? "#6e27ff" : "#fff",
              fontWeight: 600,
              cursor: "pointer",
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
