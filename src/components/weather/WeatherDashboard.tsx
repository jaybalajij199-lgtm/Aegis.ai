import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  AlertTriangle,
  CloudRain,
  Wind,
  Gauge,
  Thermometer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  MapPin,
  Activity,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";


// ============================================================
// TYPES
// ============================================================

interface District {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}


interface DistrictForecast {
  district: District;

  temperature: number;
  humidity: number;

  rainfall6h: number;
  rainfall24h: number;

  rainProbability: number;

  windSpeed: number;
  windGust: number;

  pressure: number;

  weatherCode: number;

  riskScore: number;

  hazardLevel:
    | "NORMAL"
    | "WATCH"
    | "WARNING"
    | "CRITICAL";

  reasons: string[];
}


interface NationalSummary {
  total: number;

  critical: number;

  warning: number;

  watch: number;

  normal: number;

  highestRisk: DistrictForecast | null;

  criticalRegions: DistrictForecast[];
}


// ============================================================
// API
// ============================================================

const DISTRICTS_API =
  "/api/districts";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";


// ============================================================
// CONSTANTS
// ============================================================

const CRITICAL_THRESHOLD = 80;

const WARNING_THRESHOLD = 60;

const WATCH_THRESHOLD = 35;


// ============================================================
// HELPERS
// ============================================================

function clamp(
  value: number,
  min: number,
  max: number
) {

  return Math.max(
    min,
    Math.min(max, value)
  );

}


function round(
  value: number,
  decimals = 1
) {

  const factor =
    Math.pow(10, decimals);

  return (
    Math.round(
      value * factor
    ) / factor
  );

}


function weatherDescription(
  code: number
) {

  switch (code) {

    case 0:
      return "Clear";

    case 1:
    case 2:
      return "Partly cloudy";

    case 3:
      return "Overcast";

    case 45:
    case 48:
      return "Fog";

    case 51:
    case 53:
    case 55:
      return "Drizzle";

    case 61:
    case 63:
    case 65:
      return "Rain";

    case 66:
    case 67:
      return "Freezing rain";

    case 71:
    case 73:
    case 75:
      return "Snow";

    case 80:
    case 81:
    case 82:
      return "Rain showers";

    case 95:
      return "Thunderstorm";

    case 96:
    case 99:
      return "Severe thunderstorm";

    default:
      return "Unknown";

  }

}


// ============================================================
// FETCH ALL DISTRICTS
// ============================================================

async function fetchDistricts(): Promise<District[]> {

  const response =
    await fetch(
      DISTRICTS_API
    );


  if (!response.ok) {

    throw new Error(
      `District service returned HTTP ${response.status}`
    );

  }


  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`District API returned invalid JSON: ${text.substring(0, 50)}`);
  }


  if (!Array.isArray(data)) {

    throw new Error(
      "District API did not return an array."
    );

  }


  return data.filter(
    district =>

      district &&
      typeof district.name === "string" &&
      typeof district.state === "string" &&
      Number.isFinite(
        Number(district.latitude)
      ) &&
      Number.isFinite(
        Number(district.longitude)
      )

  );

}


// ============================================================
// FORECAST ONE BATCH
// ============================================================

async function fetchForecastBatch(
  districts: District[]
): Promise<DistrictForecast[]> {

  if (
    districts.length === 0
  ) {

    return [];

  }


  const latitude =
    districts
      .map(
        d => d.latitude
      )
      .join(",");


  const longitude =
    districts
      .map(
        d => d.longitude
      )
      .join(",");


  const params =
    new URLSearchParams({

      latitude,

      longitude,

      timezone:
        "auto",

      forecast_days:
        "2",

      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation_probability",
        "precipitation",
        "rain",
        "showers",
        "wind_speed_10m",
        "wind_gusts_10m",
        "surface_pressure",
        "weather_code",
      ].join(","),

    });


  const response =
    await fetch(
      `${WEATHER_API}?${params.toString()}`
    );


  if (!response.ok) {

    throw new Error(
      `Weather API returned HTTP ${response.status}`
    );

  }


  const textRaw = await response.text();
  let raw;
  try {
    raw = JSON.parse(textRaw);
  } catch (e) {
    throw new Error(`Weather API returned invalid JSON: ${textRaw.substring(0, 50)}`);
  }


  /*
   * Open-Meteo returns:
   *
   * Object
   * when one location is requested.
   *
   * Array
   * when multiple locations are requested.
   */

  const results =
    Array.isArray(raw)
      ? raw
      : [raw];


  return districts.map(
    (
      district,
      index
    ) => {

      const weather =
        results[index];


      if (
        !weather ||
        !weather.hourly
      ) {

        return {

          district,

          temperature: 0,

          humidity: 0,

          rainfall6h: 0,

          rainfall24h: 0,

          rainProbability: 0,

          windSpeed: 0,

          windGust: 0,

          pressure: 0,

          weatherCode: 0,

          riskScore: 0,

          hazardLevel:
            "NORMAL",

          reasons: [
            "Forecast unavailable for this district.",
          ],

        };

      }


      const hourly =
        weather.hourly;


      // ------------------------------------------------------
      // NEXT 6 HOURS
      // ------------------------------------------------------

      const next6 =
        hourly
          .precipitation
          .slice(0, 6);


      const rainfall6h =
        next6.reduce(
          (
            total: number,
            value: number
          ) =>
            total +
            (value || 0),
          0
        );


      // ------------------------------------------------------
      // NEXT 24 HOURS
      // ------------------------------------------------------

      const next24 =
        hourly
          .precipitation
          .slice(0, 24);


      const rainfall24h =
        next24.reduce(
          (
            total: number,
            value: number
          ) =>
            total +
            (value || 0),
          0
        );


      // ------------------------------------------------------
      // RAIN PROBABILITY
      // ------------------------------------------------------

      const rainProbability =
        Math.max(
          ...hourly
            .precipitation_probability
            .slice(0, 6)
            .map(
              (
                value: number
              ) =>
                value || 0
            )
        );


      // ------------------------------------------------------
      // WIND
      // ------------------------------------------------------

      const windSpeed =
        Math.max(
          ...hourly
            .wind_speed_10m
            .slice(0, 6)
            .map(
              (
                value: number
              ) =>
                value || 0
            )
        );


      const windGust =
        Math.max(
          ...hourly
            .wind_gusts_10m
            .slice(0, 6)
            .map(
              (
                value: number
              ) =>
                value || 0
            )
        );


      // ------------------------------------------------------
      // PRESSURE
      // ------------------------------------------------------

      const pressure =
        hourly
          .surface_pressure[0]
          ?? 0;


      // ------------------------------------------------------
      // WEATHER CODE
      // ------------------------------------------------------

      const weatherCode =
        hourly
          .weather_code[0]
          ?? 0;


      // ======================================================
      // RISK MODEL
      // ======================================================

      /*
       * IMPORTANT:
       *
       * This is a forecast-based hazard scoring model.
       * It is NOT claiming to be an official IMD warning.
       *
       * For the hackathon, explain this to judges as:
       *
       * "AEGIS converts meteorological forecast variables
       * into an operational risk score."
       */


      // ------------------------------------------------------
      // RAIN RISK
      // ------------------------------------------------------

      const rainIntensityScore =
        clamp(
          rainfall6h / 50,
          0,
          1
        );


      const probabilityScore =
        rainProbability / 100;


      const rainRisk =
        (
          rainIntensityScore *
          0.65
        )
        +
        (
          probabilityScore *
          0.35
        );


      // ------------------------------------------------------
      // WIND RISK
      // ------------------------------------------------------

      const windRisk =
        clamp(
          (
            windSpeed / 100
          ) *
          0.55
          +
          (
            windGust / 140
          ) *
          0.45,
          0,
          1
        );


      // ------------------------------------------------------
      // FLOOD INDICATOR
      // ------------------------------------------------------

      const floodRisk =
        clamp(

          (
            rainfall24h / 100
          ) *
          0.55

          +

          (
            rainfall6h / 50
          ) *
          0.30

          +

          (
            rainProbability / 100
          ) *
          0.15,

          0,
          1

        );


      // ------------------------------------------------------
      // STORM RISK
      // ------------------------------------------------------

      const stormCode =
        hourly
          .weather_code
          .slice(0, 6)
          .some(
            (
              code: number
            ) =>
              code === 95 ||
              code === 96 ||
              code === 99
          );


      const stormRisk =
        clamp(

          (
            windGust / 140
          ) *
          0.40

          +

          (
            rainProbability / 100
          ) *
          0.25

          +

          (
            stormCode
              ? 0.35
              : 0
          ),

          0,
          1

        );


      // ------------------------------------------------------
      // FINAL SCORE
      // ------------------------------------------------------

      const riskScore =
        Math.round(
          Math.max(
            rainRisk,
            windRisk,
            floodRisk,
            stormRisk
          ) *
          100
        );


      // ------------------------------------------------------
      // LEVEL
      // ------------------------------------------------------

      let hazardLevel:
        | "NORMAL"
        | "WATCH"
        | "WARNING"
        | "CRITICAL";


      if (
        riskScore >=
        CRITICAL_THRESHOLD
      ) {

        hazardLevel =
          "CRITICAL";

      } else if (
        riskScore >=
        WARNING_THRESHOLD
      ) {

        hazardLevel =
          "WARNING";

      } else if (
        riskScore >=
        WATCH_THRESHOLD
      ) {

        hazardLevel =
          "WATCH";

      } else {

        hazardLevel =
          "NORMAL";

      }


      // ------------------------------------------------------
      // EXPLANATION
      // ------------------------------------------------------

      const reasons:
        string[] = [];


      if (
        rainfall6h >= 30
      ) {

        reasons.push(
          `Heavy rainfall forecast: ${round(
            rainfall6h
          )} mm in the next 6 hours.`
        );

      } else if (
        rainfall6h >= 10
      ) {

        reasons.push(
          `Rainfall forecast: ${round(
            rainfall6h
          )} mm in the next 6 hours.`
        );

      }


      if (
        rainProbability >= 70
      ) {

        reasons.push(
          `High precipitation probability: ${rainProbability}%.`
        );

      }


      if (
        windSpeed >= 60
      ) {

        reasons.push(
          `High wind speed forecast: ${round(
            windSpeed
          )} km/h.`
        );

      }


      if (
        windGust >= 90
      ) {

        reasons.push(
          `Strong wind gusts forecast: ${round(
            windGust
          )} km/h.`
        );

      }


      if (
        stormCode
      ) {

        reasons.push(
          "Thunderstorm conditions appear in the short-term forecast."
        );

      }


      if (
        rainfall24h >= 75
      ) {

        reasons.push(
          `High 24-hour rainfall accumulation: ${round(
            rainfall24h
          )} mm.`
        );

      }


      if (
        reasons.length === 0
      ) {

        reasons.push(
          "No major short-term weather hazard indicators detected."
        );

      }


      return {

        district,

        temperature:
          weather.hourly
            .temperature_2m[0] ??
          0,

        humidity:
          weather.hourly
            .relative_humidity_2m[0] ??
          0,

        rainfall6h,

        rainfall24h,

        rainProbability,

        windSpeed,

        windGust,

        pressure,

        weatherCode,

        riskScore,

        hazardLevel,

        reasons,

      };

    }

  );

}


// ============================================================
// BATCH ALL DISTRICTS
// ============================================================

async function scanAllDistricts(
  districts: District[]
): Promise<DistrictForecast[]> {

  const batchSize =
    50;

  const results:
    DistrictForecast[] = [];


  for (
    let i = 0;
    i < districts.length;
    i += batchSize
  ) {

    const batch =
      districts.slice(
        i,
        i + batchSize
      );


    const batchResults =
      await fetchForecastBatch(
        batch
      );


    results.push(
      ...batchResults
    );

  }


  return results;

}


// ============================================================
// MAP AUTO FIT
// ============================================================

const MapController:
  React.FC<{
    regions: DistrictForecast[];
  }> = ({
    regions,
  }) => {

    const map =
      useMap();


    useEffect(() => {

      if (
        regions.length === 0
      ) {

        return;

      }


      const bounds =
        L.latLngBounds(
          regions.map(
            region => [
              region.district.latitude,
              region.district.longitude,
            ]
          )
        );


      map.fitBounds(
        bounds,
        {
          padding: [
            30,
            30,
          ],
          maxZoom: 6,
        }
      );

    }, [
      regions,
      map,
    ]);


    return null;

  };


// ============================================================
// MARKER
// ============================================================

function createMarker(
  level:
    | "NORMAL"
    | "WATCH"
    | "WARNING"
    | "CRITICAL"
) {

  const colors = {

    NORMAL:
      "#22c55e",

    WATCH:
      "#eab308",

    WARNING:
      "#f97316",

    CRITICAL:
      "#ef4444",

  };


  return L.divIcon({

    className:
      "aegis-risk-marker",

    html:
      `
      <div
        style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:${colors[level]};
          border:3px solid white;
          box-shadow:0 0 15px ${colors[level]};
        "
      ></div>
      `,

    iconSize: [
      18,
      18,
    ],

    iconAnchor: [
      9,
      9,
    ],

  });

}


// ============================================================
// MAIN COMPONENT
// ============================================================

export const WeatherDashboard:
  React.FC = () => {


  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [
    districts,
    setDistricts,
  ] =
    useState<District[]>([]);


  const [
    forecasts,
    setForecasts,
  ] =
    useState<DistrictForecast[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState<Date | null>(
      null
    );


  const [
    search,
    setSearch,
  ] =
    useState("");


  // ----------------------------------------------------------
  // SCAN
  // ----------------------------------------------------------

  const scanIndia =
    async () => {

      try {

        setLoading(
          true
        );

        setError(
          null
        );


        // ----------------------------------------------------
        // GET REAL DISTRICTS
        // ----------------------------------------------------

        const districtList =
          await fetchDistricts();


        if (
          districtList.length === 0
        ) {

          throw new Error(
            "No districts were returned by /api/districts."
          );

        }


        setDistricts(
          districtList
        );


        // ----------------------------------------------------
        // FORECAST ALL DISTRICTS
        // ----------------------------------------------------

        const result =
          await scanAllDistricts(
            districtList
          );


        // ----------------------------------------------------
        // HIGHEST RISK FIRST
        // ----------------------------------------------------

        result.sort(
          (
            a,
            b
          ) =>
            b.riskScore -
            a.riskScore
        );


        setForecasts(
          result
        );


        setLastUpdated(
          new Date()
        );


      } catch (
        scanError
      ) {

        console.error(
          scanError
        );


        setError(

          scanError instanceof Error

            ? scanError.message

            : "National weather scan failed."

        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ----------------------------------------------------------
  // INITIAL SCAN
  // ----------------------------------------------------------

  useEffect(() => {

    scanIndia();

  }, []);


  // ----------------------------------------------------------
  // AUTOMATIC REFRESH
  // ----------------------------------------------------------

  useEffect(() => {

    const interval =
      setInterval(
        scanIndia,
        15 *
        60 *
        1000
      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  // ----------------------------------------------------------
  // NATIONAL SUMMARY
  // ----------------------------------------------------------

  const summary:
    NationalSummary =
    useMemo(() => {

      const criticalRegions =
        forecasts
          .filter(
            region =>
              region.hazardLevel ===
              "CRITICAL"
          )
          .sort(
            (
              a,
              b
            ) =>
              b.riskScore -
              a.riskScore
          );


      return {

        total:
          forecasts.length,

        critical:
          forecasts.filter(
            region =>
              region.hazardLevel ===
              "CRITICAL"
          ).length,

        warning:
          forecasts.filter(
            region =>
              region.hazardLevel ===
              "WARNING"
          ).length,

        watch:
          forecasts.filter(
            region =>
              region.hazardLevel ===
              "WATCH"
          ).length,

        normal:
          forecasts.filter(
            region =>
              region.hazardLevel ===
              "NORMAL"
          ).length,

        highestRisk:
          forecasts[0] ??
          null,

        criticalRegions,

      };

    }, [
      forecasts,
    ]);


  // ----------------------------------------------------------
  // FILTER
  // ----------------------------------------------------------

  const visibleRegions =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (
        !query
      ) {

        return forecasts;

      }


      return forecasts.filter(
        region =>

          region.district.name
            .toLowerCase()
            .includes(query)

          ||

          region.district.state
            .toLowerCase()
            .includes(query)

      );

    }, [
      forecasts,
      search,
    ]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    forecasts.length === 0
  ) {

    return (

      <div
        className="
          bg-slate-50
          border
          border-slate-200
          rounded-2xl
          p-10
          text-center
        "
      >

        <RefreshCw
          className="
            h-8
            w-8
            text-blue-600
            animate-spin
            mx-auto
            mb-4
          "
        />


        <h2
          className="
            text-white
            font-black
          "
        >

          AEGIS NATIONAL WEATHER SCAN

        </h2>


        <p
          className="
            text-slate-500
            text-xs
            mt-2
          "
        >

          Loading district database and
          retrieving live meteorological forecasts...

        </p>

      </div>

    );

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div
      className="
        space-y-6
        font-sans
        text-xs
      "
    >


      {/* ======================================================
          NATIONAL ALERT HEADER
      ====================================================== */}

      <div
        className={`
          border
          p-4
          rounded-2xl
          shadow-xl
          ${
            summary.critical > 0

              ? "bg-red-50/90 border-red-500/60"

              : summary.warning > 0

              ? "bg-orange-950/80 border-orange-500/50"

              : summary.watch > 0

              ? "bg-yellow-950/60 border-yellow-500/40"

              : "bg-green-50/80 border-green-500/40"
          }
        `}
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className={`
              p-3
              rounded-xl
              ${
                summary.critical > 0

                  ? "bg-red-500"

                  : summary.warning > 0

                  ? "bg-orange-500"

                  : summary.watch > 0

                  ? "bg-yellow-500"

                  : "bg-emerald-500"
              }
            `}
          >

            <AlertTriangle
              className="
                h-5
                w-5
                text-white
              "
            />

          </div>


          <div
            className="
              flex-1
              min-w-0
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                flex-wrap
              "
            >

              <span
                className="
                  px-2
                  py-1
                  rounded
                  bg-slate-50/60
                  text-[9px]
                  font-black
                  uppercase
                "
              >

                AEGIS NATIONAL SCAN

              </span>


              <span
                className="
                  text-[9px]
                  text-slate-600
                "
              >

                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}`
                  : "Scanning..."}

              </span>

            </div>


            <div
              className="
                mt-2
                overflow-hidden
              "
            >

              {summary.critical > 0 ? (

                <div
                  className="
                    flex
                    gap-8
                    overflow-x-auto
                    whitespace-nowrap
                  "
                >

                  {summary.criticalRegions
                    .slice(
                      0,
                      15
                    )
                    .map(
                      (
                        region
                      ) => (

                        <div
                          key={
                            region.district.id
                          }
                          className="
                            font-bold
                            text-white
                          "
                        >

                          🚨{" "}

                          {region.district.name}

                          ,

                          {" "}

                          {region.district.state}

                          {" "}

                          <span
                            className="
                              text-red-300
                            "
                          >

                            Risk{" "}

                            {region.riskScore}

                          </span>

                        </div>

                      )
                    )}

                </div>

              ) : summary.warning > 0 ? (

                <p
                  className="
                    font-bold
                    text-orange-100
                  "
                >

                  ⚠️ {summary.warning} district(s)
                  require elevated monitoring.

                </p>

              ) : (

                <p
                  className="
                    font-bold
                    text-emerald-100
                  "
                >

                  ✓ No critical weather-risk
                  regions detected in the current scan.

                </p>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          NATIONAL STATS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-5
          gap-3
        "
      >

        <NationalCard
          label="Districts Scanned"
          value={summary.total}
          icon={
            <MapPin
              className="
                h-4
                w-4
              "
            />
          }
        />


        <NationalCard
          label="Critical"
          value={summary.critical}
          danger
          icon={
            <AlertTriangle
              className="
                h-4
                w-4
              "
            />
          }
        />


        <NationalCard
          label="Warning"
          value={summary.warning}
          icon={
            <TrendingUp
              className="
                h-4
                w-4
              "
            />
          }
        />


        <NationalCard
          label="Watch"
          value={summary.watch}
          icon={
            <Activity
              className="
                h-4
                w-4
              "
            />
          }
        />


        <NationalCard
          label="Normal"
          value={summary.normal}
          icon={
            <ShieldCheck
              className="
                h-4
                w-4
              "
            />
          }
        />

      </div>


      {/* ======================================================
          SEARCH + REFRESH
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-3
        "
      >

        <div
          className="
            relative
            flex-1
          "
        >

          <Search
            className="
              absolute
              left-3
              top-2.5
              h-4
              w-4
              text-slate-500
            "
          />


          <input
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
            placeholder="
              Search district or state...
            "
            className="
              w-full
              bg-white
              border
              border-slate-200
              rounded-lg
              pl-10
              pr-3
              py-2
              text-white
              outline-none
              focus:border-blue-500
            "
          />

        </div>


        <Button
          onClick={
            scanIndia
          }
          disabled={
            loading
          }
          className="
            bg-blue-600
            hover:bg-blue-600
            text-slate-950
            font-black
          "
        >

          <RefreshCw
            className={`
              h-4
              w-4
              mr-2
              ${
                loading
                  ? "animate-spin"
                  : ""
              }
            `}
          />

          Scan All Districts

        </Button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="
            bg-red-50/50
            border
            border-red-800
            rounded-xl
            p-4
            text-red-300
          "
        >

          <AlertTriangle
            className="
              inline
              h-4
              w-4
              mr-2
            "
          />

          {error}

        </div>

      )}


      {/* ======================================================
          CRITICAL REGIONS
      ====================================================== */}

      <Card
        variant="glass"
        className="
          p-5
          border-red-200
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-black
                text-white
                flex
                items-center
                gap-2
              "
            >

              <AlertTriangle
                className="
                  h-5
                  w-5
                  text-red-600
                "
              />

              Critical Regions

            </h2>


            <p
              className="
                text-[10px]
                text-slate-500
                mt-1
              "
            >

              Highest forecast-based weather
              risk detected during this scan.

            </p>

          </div>


          <span
            className="
              bg-red-50
              border
              border-red-800
              text-red-300
              px-3
              py-1
              rounded
              text-[9px]
              font-black
            "
          >

            {summary.critical} CRITICAL

          </span>

        </div>


        {summary.criticalRegions.length ===
        0 ? (

          <div
            className="
              p-8
              text-center
              text-green-600
            "
          >

            <ShieldCheck
              className="
                h-7
                w-7
                mx-auto
                mb-2
              "
            />

            No critical regions detected.

          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-3
            "
          >

            {summary.criticalRegions
              .slice(
                0,
                12
              )
              .map(
                region => (

                  <RiskCard
                    key={
                      region.district.id
                    }
                    region={
                      region
                    }
                  />

                )
              )}

          </div>

        )}

      </Card>


      {/* ======================================================
          MAP
      ====================================================== */}

      <Card
        variant="glass"
        className="
          p-4
          border-slate-200
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            mb-3
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-black
                flex
                items-center
                gap-2
              "
            >

              <MapPin
                className="
                  h-4
                  w-4
                  text-blue-600
                "
              />

              National Risk Map

            </h2>


            <p
              className="
                text-[9px]
                text-slate-500
              "
            >

              Every marker represents a
              scanned district.

            </p>

          </div>


          <div
            className="
              flex
              gap-3
              text-[9px]
            "
          >

            <Legend
              color="bg-red-500"
              label="Critical"
            />

            <Legend
              color="bg-orange-500"
              label="Warning"
            />

            <Legend
              color="bg-yellow-500"
              label="Watch"
            />

            <Legend
              color="bg-emerald-500"
              label="Normal"
            />

          </div>

        </div>


        <div
          className="
            h-[500px]
            rounded-xl
            overflow-hidden
          "
        >

          <MapContainer
            center={[
              22.5,
              80,
            ]}
            zoom={5}
            style={{
              height:
                "100%",
              width:
                "100%",
            }}
          >

            <TileLayer
              url="
                https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
              "
              attribution="
                © OpenStreetMap contributors
              "
            />


            <MapController
              regions={
                forecasts
              }
            />


            {forecasts.map(
              region => (

                <Marker
                  key={
                    region.district.id
                  }
                  position={[
                    region.district.latitude,
                    region.district.longitude,
                  ]}
                  icon={
                    createMarker(
                      region.hazardLevel
                    )
                  }
                >

                  <Popup>

                    <div
                      style={{
                        minWidth:
                          "220px",
                      }}
                    >

                      <strong>

                        {region.district.name}

                      </strong>


                      <br />

                      {region.district.state}


                      <hr />


                      <strong>

                        Risk:
                        {" "}
                        {region.riskScore}
                        /100

                      </strong>


                      <br />

                      Level:
                      {" "}
                      {region.hazardLevel}


                      <br />

                      Rain:
                      {" "}
                      {round(
                        region.rainfall6h
                      )}
                      mm / 6h


                      <br />

                      Probability:
                      {" "}
                      {region.rainProbability}%


                      <br />

                      Wind:
                      {" "}
                      {round(
                        region.windSpeed
                      )}
                      km/h


                      <br />

                      Gust:
                      {" "}
                      {round(
                        region.windGust
                      )}
                      km/h

                    </div>

                  </Popup>

                </Marker>

              )
            )}

          </MapContainer>

        </div>

      </Card>


      {/* ======================================================
          DISTRICT TABLE
      ====================================================== */}

      <Card
        variant="glass"
        className="
          p-5
          border-slate-200
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-black
              "
            >

              District Intelligence

            </h2>


            <p
              className="
                text-[10px]
                text-slate-500
              "
            >

              Ranked by forecast-based hazard score.

            </p>

          </div>

        </div>


        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              text-left
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  border-slate-200
                  text-[9px]
                  uppercase
                  text-slate-500
                "
              >

                <th className="p-3">
                  Rank
                </th>

                <th className="p-3">
                  District
                </th>

                <th className="p-3">
                  State
                </th>

                <th className="p-3">
                  Risk
                </th>

                <th className="p-3">
                  Level
                </th>

                <th className="p-3">
                  Rain / 6h
                </th>

                <th className="p-3">
                  Probability
                </th>

                <th className="p-3">
                  Wind
                </th>

              </tr>

            </thead>


            <tbody>

              {visibleRegions
                .slice(
                  0,
                  100
                )
                .map(
                  (
                    region,
                    index
                  ) => (

                    <tr
                      key={
                        region.district.id
                      }
                      className="
                        border-b
                        border-slate-900
                        hover:bg-white/70
                      "
                    >

                      <td className="p-3">

                        #{index + 1}

                      </td>


                      <td
                        className="
                          p-3
                          font-bold
                        "
                      >

                        {region.district.name}

                      </td>


                      <td className="p-3">

                        {region.district.state}

                      </td>


                      <td
                        className="
                          p-3
                          font-black
                        "
                      >

                        {region.riskScore}

                      </td>


                      <td className="p-3">

                        <RiskBadge
                          level={
                            region.hazardLevel
                          }
                        />

                      </td>


                      <td className="p-3">

                        {round(
                          region.rainfall6h
                        )}

                        {" mm"}

                      </td>


                      <td className="p-3">

                        {region.rainProbability}%

                      </td>


                      <td className="p-3">

                        {round(
                          region.windSpeed
                        )}

                        {" km/h"}

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </Card>


      {/* ======================================================
          DISCLAIMER
      ====================================================== */}

      <div
        className="
          bg-slate-50
          border
          border-slate-200
          rounded-xl
          p-4
          text-[9px]
          text-slate-500
        "
      >

        <strong
          className="
            text-slate-600
          "
        >

          AEGIS Forecast Intelligence:

        </strong>

        {" "}

        Risk levels are calculated from forecast
        meteorological variables such as precipitation,
        precipitation probability, wind, gusts and
        weather codes. They are operational risk
        indicators and should not be represented as
        official government warnings. Critical
        decisions should be cross-checked against
        authoritative disaster-management and
        meteorological alerts.

      </div>

    </div>

  );

};


// ============================================================
// NATIONAL CARD
// ============================================================

const NationalCard:
  React.FC<{
    label: string;
    value: number;
    icon: React.ReactNode;
    danger?: boolean;
  }> = ({
    label,
    value,
    icon,
    danger,
  }) => (

    <Card
      variant="glass"
      className={`
        p-4
        ${
          danger
            ? "border-red-200"
            : "border-slate-200"
        }
      `}
    >

      <div
        className="
          flex
          justify-between
          items-center
        "
      >

        <span
          className="
            text-[9px]
            text-slate-500
            uppercase
            font-bold
          "
        >

          {label}

        </span>


        {icon}

      </div>


      <p
        className="
          text-2xl
          font-black
          mt-2
        "
      >

        {value}

      </p>

    </Card>

  );


// ============================================================
// RISK CARD
// ============================================================

const RiskCard:
  React.FC<{
    region: DistrictForecast;
  }> = ({
    region,
  }) => (

    <div
      className="
        bg-red-50/30
        border
        border-red-200
        rounded-xl
        p-4
      "
    >

      <div
        className="
          flex
          justify-between
          items-start
        "
      >

        <div>

          <h3
            className="
              font-black
              text-white
            "
          >

            {region.district.name}

          </h3>


          <p
            className="
              text-[10px]
              text-slate-500
            "
          >

            {region.district.state}

          </p>

        </div>


        <div
          className="
            text-right
          "
        >

          <p
            className="
              text-xl
              font-black
              text-red-600
            "
          >

            {region.riskScore}

          </p>


          <p
            className="
              text-[8px]
              text-red-600
              uppercase
              font-bold
            "
          >

            Critical

          </p>

        </div>

      </div>


      <div
        className="
          grid
          grid-cols-3
          gap-2
          mt-4
        "
      >

        <SmallMetric
          label="Rain"
          value={`${round(
            region.rainfall6h
          )} mm`}
        />

        <SmallMetric
          label="Probability"
          value={`${region.rainProbability}%`}
        />

        <SmallMetric
          label="Wind"
          value={`${round(
            region.windSpeed
          )}`}
        />

      </div>


      <div
        className="
          mt-3
          space-y-1
        "
      >

        {region.reasons
          .slice(
            0,
            3
          )
          .map(
            (
              reason,
              index
            ) => (

              <p
                key={
                  index
                }
                className="
                  text-[10px]
                  text-slate-600
                "
              >

                • {reason}

              </p>

            )
          )}

      </div>

    </div>

  );


// ============================================================
// SMALL METRIC
// ============================================================

const SmallMetric:
  React.FC<{
    label: string;
    value: string;
  }> = ({
    label,
    value,
  }) => (

    <div
      className="
        bg-slate-50
        rounded-lg
        p-2
      "
    >

      <p
        className="
          text-[8px]
          text-slate-500
        "
      >

        {label}

      </p>


      <p
        className="
          text-xs
          font-black
          mt-1
        "
      >

        {value}

      </p>

    </div>

  );


// ============================================================
// RISK BADGE
// ============================================================

const RiskBadge:
  React.FC<{
    level:
      | "NORMAL"
      | "WATCH"
      | "WARNING"
      | "CRITICAL";
  }> = ({
    level,
  }) => {

    const styles = {

      NORMAL:
        "bg-green-50 text-green-600 border-emerald-800",

      WATCH:
        "bg-yellow-950 text-yellow-400 border-yellow-800",

      WARNING:
        "bg-orange-950 text-orange-400 border-orange-800",

      CRITICAL:
        "bg-red-50 text-red-600 border-red-800",

    };


    return (

      <span
        className={`
          px-2
          py-1
          rounded
          border
          text-[8px]
          font-black
          ${styles[level]}
        `}
      >

        {level}

      </span>

    );

  };


// ============================================================
// LEGEND
// ============================================================

const Legend:
  React.FC<{
    color: string;
    label: string;
  }> = ({
    color,
    label,
  }) => (

    <span
      className="
        flex
        items-center
        gap-1
      "
    >

      <span
        className={`
          w-2
          h-2
          rounded-full
          ${color}
        `}
      />

      {label}

    </span>

  );


export default WeatherDashboard;