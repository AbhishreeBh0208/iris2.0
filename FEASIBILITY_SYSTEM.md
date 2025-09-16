# IRIS 2.0 - Mission Feasibility System

## Overview
IRIS 2.0 now includes an advanced mission feasibility analysis system that evaluates space missions before launching them. This creates a more realistic mission control experience where not every plan is automatically approved.

## New Features

### 1. Feasibility Analysis Engine
- **NASA Horizons Integration**: Real-time ephemeris data from NASA's JPL Horizons system
- **40% Success Threshold**: Missions below 40% success probability are automatically rejected
- **Comprehensive Calculations**: Delta-V, fuel requirements, time of flight, and success probability

### 2. Two-Step Mission Flow
1. **ANALYZE FEASIBILITY**: Check if the mission is viable
2. **LAUNCH MISSION**: Execute approved missions (only available after feasibility approval)

### 3. Mission History Tracking
- All successful missions are saved to a persistent history
- View past mission details including success rates and parameters
- Comprehensive mission dashboard

## API Endpoints

### New Endpoints
- `POST /api/check-feasibility` - Analyze mission feasibility
- `GET /api/past-missions` - Retrieve mission history

### Updated Endpoints
- `POST /trajectory/simulate` - Now saves successful missions to history

## Mission Parameters

### Basic Parameters
- **Target**: Destination planet (Earth, Mars, Jupiter, Saturn, Venus, Mercury)
- **Duration**: Mission duration in days
- **Swarm Count**: Number of nanosatellites in the mission

### Advanced Parameters
- **Propulsion Type**: Chemical, Ion Drive, or Nuclear
- **Role Distribution**: Equal, Science Heavy, Communication Heavy, or Specialized

## Success Probability Factors

The system calculates success probability based on:
- **Swarm Size**: More nanosats = higher redundancy
- **Delta-V Requirements**: Higher delta-v = increased risk
- **Propulsion Efficiency**: Different propulsion types have different risk profiles
- **Role Distribution**: Mission role specialization affects success rates

## Backend Setup

1. Install dependencies:
```bash
cd app/backend
pip install -r requirements.txt
```

2. Optional: Add Gemini API key to `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

3. Start the backend:
```bash
python3 main.py
```

## Frontend Features

### New Mission Planning Modal
- Enhanced UI with comprehensive mission parameters
- Real-time feasibility analysis
- Visual feedback for mission approval/rejection
- Detailed mission metrics display

### Mission Control Dashboard
- Integrated mission history panel
- Live mission status tracking
- Professional mission control interface

## Technical Implementation

### NASA Horizons Integration
The system integrates with NASA's Horizons API to fetch real-time ephemeris data for target objects. This ensures mission planning uses actual celestial mechanics data.

### Realistic Physics Calculations
- **Lambert Problem**: For trajectory optimization
- **Tsiolkovsky Rocket Equation**: For fuel calculations
- **Hohmann Transfer**: For time of flight estimates

### Risk Assessment Model
The 40% success threshold creates realistic mission planning constraints, forcing users to optimize their mission parameters for success.

## Usage Example

1. Click "New Trajectory" to open mission planning
2. Configure mission parameters (target, swarm size, propulsion, etc.)
3. Click "ANALYZE FEASIBILITY" to check mission viability
4. If approved (≥40% success), click "LAUNCH MISSION"
5. View completed missions in the Mission History panel

This system transforms IRIS from a simple simulation tool into a realistic mission control experience that teaches proper space mission planning principles.
