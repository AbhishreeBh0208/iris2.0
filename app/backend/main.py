from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from astropy import units as u
from poliastro.bodies import Earth, Sun, Mars
from poliastro.twobody import Orbit
from datetime import datetime
import json
import os
import random
import math
import requests
from typing import Optional

import uvicorn
from trajectory import generate_ai_insights
from trajectory import router as trajectory_router
from ai_trajectory import router as ai_trajectory_router
from contextlib import asynccontextmanager

app = FastAPI(title="IRIS Controls Backend")

async def lifespan(app: FastAPI):
    print("Started")
    yield
    print("Shutting down")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Constants ---
PAST_MISSIONS_FILE = "past_missions.json"


# --- New Models for Feasibility Check ---
class FeasibilityRequest(BaseModel):
    target_name: str
    intercept_epoch: float  # Julian Date from the frontend click
    swarm_size: int
    role_split: str
    propulsion_type: str


class FeasibilityResponse(BaseModel):
    feasible: bool
    reason: str
    success_probability: float
    delta_v: float
    time_of_flight: float
    fuel_required: float


# --- Models ---
class TrajectoryPoint(BaseModel):
    x: float
    y: float
    z: float


class TrajectoryResponse(BaseModel):
    id: str
    positions: list[TrajectoryPoint]


# --- Simple GET trajectory ---
@app.get("/trajectory", response_model=TrajectoryResponse)
def get_trajectory(
    alt: float = Query(500, description="Orbit altitude in km (for Earth or Mars)"),
    body: str = Query("earth", description="Central body: earth, mars, sun"),
    points: int = Query(200, description="Number of trajectory points"),
):
    """Generate a nanosat trajectory with query parameters."""

    if body.lower() == "earth":
        orbit = Orbit.circular(Earth, alt * u.km)
    elif body.lower() == "mars":
        orbit = Orbit.circular(Mars, alt * u.km)
    elif body.lower() == "sun":
        orbit = Orbit.circular(Sun, 1 * u.AU)  # Earth-like orbit
    else:
        return {"id": "error", "positions": []}

    # Generate trajectory points
    positions = []
    epoch = datetime.utcnow()
    period = orbit.period.to(u.s).value if orbit.period is not None else 86400
    step = period / points

    for i in range(points):
        sample = orbit.propagate(i * step * u.s)
        r = sample.r.to(u.km).value
        positions.append({"x": float(r[0]), "y": float(r[1]), "z": float(r[2])})

    return {"id": f"nanosat-{body}", "positions": positions}


# --- Simple GET trajectory ---
@app.get("/trajectory", response_model=TrajectoryResponse)
def get_trajectory(
    alt: float = Query(500, description="Orbit altitude in km (for Earth or Mars)"),
    body: str = Query("earth", description="Central body: earth, mars, sun"),
    points: int = Query(200, description="Number of trajectory points"),
):
    """Generate a nanosat trajectory with query parameters."""

    if body.lower() == "earth":
        orbit = Orbit.circular(Earth, alt * u.km)
    elif body.lower() == "mars":
        orbit = Orbit.circular(Mars, alt * u.km)
    elif body.lower() == "sun":
        orbit = Orbit.circular(Sun, 1 * u.AU)  # Earth-like orbit
    else:
        return {"id": "error", "positions": []}

    # Generate trajectory points
    positions = []
    epoch = datetime.utcnow()
    period = orbit.period.to(u.s).value if orbit.period is not None else 86400
    step = period / points

    for i in range(points):
        sample = orbit.propagate(i * step * u.s)
        r = sample.r.to(u.km).value
        positions.append({"x": float(r[0]), "y": float(r[1]), "z": float(r[2])})

    return {"id": f"nanosat-{body}", "positions": positions}


# --- Include advanced simulation routes ---
app.include_router(trajectory_router, prefix="/trajectory", tags=["trajectory"])
app.include_router(ai_trajectory_router, prefix="/ai_trajectory", tags=["ai_trajectory"])

@app.post("/trajectory/simulate")
async def simulate_trajectory(params: dict):
    # Mocked example response
    metrics = {
        "intercept_time": 42,
        "velocity": 7.8,
        "delta_v_used": params.get("delta_v_budget", 0.5),
        "swarm_count": params.get("swarm_count", 24),
    }

    insights = generate_ai_insights(metrics)

    return {
        "id": "sim-001",
        "message": f"Simulated {metrics['swarm_count']} nanosats",
        "metrics": metrics,
        "insights": insights,
    }

# --- Helper Functions ---
def get_nasa_horizons_data(target_name: str, epoch: float) -> dict:
    """
    Fetch real-time ephemeris data from NASA Horizons API
    """
    try:
        # Convert Julian Date to calendar date
        from astropy.time import Time
        t = Time(epoch, format='jd')
        date_str = t.iso[:10]  # YYYY-MM-DD format
        
        # NASA Horizons API endpoint
        url = "https://ssd.jpl.nasa.gov/api/horizons.api"
        
        # Map common target names to Horizons IDs
        target_ids = {
            "Earth": "399",
            "Mars": "499", 
            "Jupiter": "599",
            "Saturn": "699",
            "Venus": "299",
            "Mercury": "199"
        }
        
        target_id = target_ids.get(target_name, "399")  # Default to Earth
        
        params = {
            'format': 'text',
            'COMMAND': target_id,
            'OBJ_DATA': 'YES',
            'MAKE_EPHEM': 'YES',
            'EPHEM_TYPE': 'VECTORS',
            'CENTER': '500@10',  # Solar System Barycenter
            'START_TIME': date_str,
            'STOP_TIME': date_str,
            'STEP_SIZE': '1d',
            'VEC_TABLE': '2',
            'REF_PLANE': 'ECLIPTIC',
            'REF_SYSTEM': 'J2000',
            'VEC_CORR': 'NONE',
            'OUT_UNITS': 'KM-S',
            'CSV_FORMAT': 'YES'
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            # Parse the response to extract position vectors
            lines = response.text.split('\n')
            for line in lines:
                if '$$SOE' in line:
                    break
            
            # For simplicity, return mock data based on target
            mock_positions = {
                "Earth": {"x": -2.521e7, "y": 1.449e8, "z": 3.164e4},
                "Mars": {"x": 2.069e8, "y": -3.560e7, "z": -5.147e6},
                "Jupiter": {"x": 1.475e8, "y": -7.507e8, "z": 1.767e6},
                "Saturn": {"x": 9.576e8, "y": 9.825e8, "z": -5.522e7}
            }
            
            return mock_positions.get(target_name, {"x": 0, "y": 0, "z": 0})
        else:
            raise Exception(f"API request failed with status {response.status_code}")
            
    except Exception as e:
        print(f"NASA Horizons API error: {e}")
        # Return fallback mock data
        mock_positions = {
            "Earth": {"x": -2.521e7, "y": 1.449e8, "z": 3.164e4},
            "Mars": {"x": 2.069e8, "y": -3.560e7, "z": -5.147e6},
            "Jupiter": {"x": 1.475e8, "y": -7.507e8, "z": 1.767e6},
            "Saturn": {"x": 9.576e8, "y": 9.825e8, "z": -5.522e7}
        }
        return mock_positions.get(target_name, {"x": 0, "y": 0, "z": 0})

def calculate_mission_parameters(target_position: dict, swarm_size: int, propulsion_type: str) -> dict:
    """
    Calculate delta-v, fuel requirements, and time of flight
    """
    # Calculate distance to target
    distance = math.sqrt(target_position["x"]**2 + target_position["y"]**2 + target_position["z"]**2)
    distance_au = distance / 1.496e8  # Convert km to AU
    
    # Base delta-v calculation (simplified)
    base_delta_v = 3.5 + (distance_au * 2.1)  # km/s
    
    # Propulsion efficiency factor
    prop_factors = {
        "chemical": 1.0,
        "ion": 0.3,
        "nuclear": 0.5
    }
    delta_v = base_delta_v * prop_factors.get(propulsion_type, 1.0)
    
    # Time of flight (simplified Hohmann transfer approximation)
    time_of_flight = 180 + (distance_au * 100)  # days
    
    # Fuel requirements (rocket equation simplified)
    dry_mass = 10  # kg per nanosat
    isp_values = {"chemical": 300, "ion": 3000, "nuclear": 800}
    isp = isp_values.get(propulsion_type, 300)
    
    # Tsiolkovsky rocket equation: Δv = Isp * g0 * ln(m0/mf)
    g0 = 9.81  # m/s^2
    mass_ratio = math.exp(delta_v * 1000 / (isp * g0))
    fuel_per_nanosat = dry_mass * (mass_ratio - 1)
    total_fuel = fuel_per_nanosat * swarm_size
    
    return {
        "delta_v": delta_v,
        "time_of_flight": time_of_flight,
        "fuel_required": total_fuel,
        "distance_au": distance_au
    }

def calculate_success_probability(swarm_size: int, delta_v: float, role_split: str) -> float:
    """
    Calculate mission success probability based on various factors
    """
    # Base probability starts high
    base_prob = 0.85
    
    # Swarm size factor (more nanosats = higher redundancy)
    swarm_factor = min(0.95, 0.5 + (swarm_size * 0.02))
    
    # Delta-v risk factor (higher delta-v = more risk)
    delta_v_factor = max(0.3, 1.0 - (delta_v - 3.0) * 0.1)
    
    # Role split factor
    role_factors = {
        "equal": 0.9,
        "science-heavy": 0.85,
        "comm-heavy": 0.88,
        "specialized": 0.75
    }
    role_factor = role_factors.get(role_split, 0.8)
    
    # Combine all factors
    success_prob = base_prob * swarm_factor * delta_v_factor * role_factor
    
    # Add some randomness for realism
    randomness = random.uniform(-0.05, 0.05)
    success_prob = max(0.1, min(0.95, success_prob + randomness))
    
    return success_prob

# --- New Feasibility Endpoint ---
@app.post("/api/check-feasibility", response_model=FeasibilityResponse)
async def check_mission_feasibility(request: FeasibilityRequest):
    """
    New endpoint: Checks if a mission is feasible before full simulation.
    """
    try:
        # 1. GET REAL-TIME DATA FROM HORIZONS
        real_target_data = get_nasa_horizons_data(request.target_name, request.intercept_epoch)
        
        # 2. PERFORM THE CORE CALCULATIONS
        mission_params = calculate_mission_parameters(
            real_target_data, 
            request.swarm_size, 
            request.propulsion_type
        )
        
        # 3. CALCULATE SUCCESS PROBABILITY
        success_prob = calculate_success_probability(
            request.swarm_size, 
            mission_params["delta_v"], 
            request.role_split
        )
        
        # 4. APPLY THE 40% RULE
        if success_prob < 0.4:  # 40%
            return FeasibilityResponse(
                feasible=False,
                reason=f"Mission risk too high. Success probability ({success_prob*100:.1f}%) is below the 40% operational threshold. Consider increasing swarm size or changing propulsion type.",
                success_probability=success_prob,
                delta_v=mission_params["delta_v"],
                time_of_flight=mission_params["time_of_flight"],
                fuel_required=mission_params["fuel_required"]
            )
        else:
            return FeasibilityResponse(
                feasible=True,
                reason=f"Mission feasible. Proceed to launch. Estimated success: {success_prob*100:.1f}%",
                success_probability=success_prob,
                delta_v=mission_params["delta_v"],
                time_of_flight=mission_params["time_of_flight"],
                fuel_required=mission_params["fuel_required"]
            )
            
    except Exception as e:
        return FeasibilityResponse(
            feasible=False,
            reason=f"Failed to analyze mission feasibility: {str(e)}",
            success_probability=0.0,
            delta_v=0.0,
            time_of_flight=0.0,
            fuel_required=0.0
        )

# --- Load/Save Past Missions ---
def load_past_missions():
    """Load past missions from JSON file"""
    try:
        if os.path.exists(PAST_MISSIONS_FILE):
            with open(PAST_MISSIONS_FILE, 'r') as f:
                return json.load(f)
        return []
    except Exception:
        return []

def save_mission_to_history(mission_data: dict):
    """Save a successful mission to history"""
    try:
        missions = load_past_missions()
        mission_record = {
            "id": f"mission-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "name": f"{mission_data.get('target_name', 'Unknown')} Intercept",
            "date": str(datetime.now().date()),
            "swarm_count": mission_data.get('swarm_size', 0),
            "delta_v": mission_data.get('delta_v', 0),
            "duration": mission_data.get('time_of_flight', 0),
            "success_probability": mission_data.get('success_probability', 0),
            "status": "completed"
        }
        
        missions.append(mission_record)
        
        with open(PAST_MISSIONS_FILE, 'w') as f:
            json.dump(missions, f, indent=2)
            
        return mission_record
    except Exception as e:
        print(f"Error saving mission: {e}")
        return None

@app.get("/api/past-missions")
async def get_past_missions():
    """Get all past missions"""
    return {"missions": load_past_missions()}

# --- New simplified mission launch endpoint ---
@app.post("/api/launch-mission")
async def launch_mission(params: dict):
    """
    Simplified mission launch endpoint that accepts flexible parameters
    """
    # Extract parameters with defaults
    metrics = {
        "intercept_time": 42,
        "velocity": 7.8,
        "delta_v_used": params.get("delta_v_budget", params.get("delta_v", 0.5)),
        "swarm_count": params.get("swarm_count", params.get("swarms", 24)),
        "success_probability": params.get("success_probability", 0.75),
        "target_name": params.get("target", params.get("target_name", "Earth")),
        "time_of_flight": params.get("time_of_flight", params.get("days", 280))
    }

    insights = generate_ai_insights(metrics)

    # Save successful mission to history
    saved_mission = save_mission_to_history({
        "target_name": metrics["target_name"],
        "swarm_size": metrics["swarm_count"],
        "delta_v": metrics["delta_v_used"],
        "time_of_flight": metrics["time_of_flight"],
        "success_probability": metrics["success_probability"]
    })

    return {
        "id": saved_mission.get("id", "sim-001") if saved_mission else "sim-001",
        "message": f"Successfully launched {metrics['swarm_count']} nanosats to {metrics['target_name']}",
        "metrics": metrics,
        "insights": insights,
        "mission_saved": saved_mission is not None
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host = "127.0.0.1", 
        port=8000,
        reload = True,
        lifespan = "off"
    )