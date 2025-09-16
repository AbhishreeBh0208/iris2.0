#!/usr/bin/env python3
"""
Test script to directly call the AI trajectory functions and display JSON output
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from ai_trajectory import simulate_mission, MissionParameters
import json
import asyncio

async def test_trajectory():
    # Create test mission parameters
    mission_params = MissionParameters(
        target_name="2I/Borisov",
        intercept_epoch=2458765.5,
        swarm_size=12,
        role_split="balanced",
        propulsion_type="chemical"
    )
    
    print("Testing AI trajectory generation...")
    print("=" * 50)
    
    try:
        # Call the simulation function
        result = await simulate_mission(mission_params)
        
        # Print the JSON result
        print("SIMULATION RESULT (JSON):")
        print(json.dumps(result, indent=2))
        
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = asyncio.run(test_trajectory())
    if result:
        print("\nAI trajectory generation successful!")
        print(f"Mission ID: {result.get('mission_id', 'N/A')}")
        print(f"Trajectory points: {result.get('trajectory_points', 0)}")
    else:
        print("\nAI trajectory generation failed!")