/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

export function simplifyOutput(data: IDataObject, fields?: string[]): IDataObject {
  if (!fields || fields.length === 0) {
    return data;
  }

  const simplified: IDataObject = {};
  for (const field of fields) {
    if (field in data) {
      simplified[field] = data[field];
    }
  }
  return simplified;
}

export function formatGeofence(geofence: IDataObject): IDataObject {
  if (!geofence) return {};

  const geofenceType = geofence.type || 'circle';
  
  return {
    type: geofenceType,
    ...(geofenceType === 'circle'
      ? {
          circle: {
            latitude: geofence.latitude,
            longitude: geofence.longitude,
            radiusMeters: geofence.radiusMeters || 100,
          },
        }
      : {
          polygon: {
            vertices: geofence.vertices || [],
          },
        }),
  };
}

export function formatStopObject(stop: IDataObject): IDataObject {
  const formatted: IDataObject = {
    name: stop.name,
  };

  if (stop.addressId) {
    formatted.addressId = stop.addressId;
  } else if (stop.latitude && stop.longitude) {
    formatted.latitude = stop.latitude;
    formatted.longitude = stop.longitude;
  }

  if (stop.scheduledArrivalTime) {
    formatted.scheduledArrivalTime = new Date(stop.scheduledArrivalTime as string).toISOString();
  }

  if (stop.scheduledDepartureTime) {
    formatted.scheduledDepartureTime = new Date(
      stop.scheduledDepartureTime as string,
    ).toISOString();
  }

  if (stop.notes) {
    formatted.notes = stop.notes;
  }

  return formatted;
}

export const statsTypeOptions: INodePropertyOptions[] = [
  { name: 'GPS', value: 'gps' },
  { name: 'Engine States', value: 'engineStates' },
  { name: 'Fuel Percent', value: 'fuelPercent' },
  { name: 'OBD Odometer (Meters)', value: 'obdOdometerMeters' },
  { name: 'OBD Engine Seconds', value: 'obdEngineSeconds' },
  { name: 'GPS Odometer (Meters)', value: 'gpsOdometerMeters' },
  { name: 'GPS Distance (Meters)', value: 'gpsDistanceMeters' },
  { name: 'Battery Voltage', value: 'batteryMilliVolts' },
  { name: 'Barometric Pressure', value: 'barometricPressurePa' },
  { name: 'Ambient Air Temp', value: 'ambientAirTemperatureMilliC' },
  { name: 'Engine Coolant Temp', value: 'engineCoolantTemperatureMilliC' },
  { name: 'Engine Oil Pressure', value: 'engineOilPressureKPa' },
  { name: 'Engine RPM', value: 'engineRpm' },
  { name: 'Engine Load', value: 'engineLoadPercent' },
  { name: 'Intake Manifold Temp', value: 'intakeManifoldTemperatureMilliC' },
  { name: 'DEF Level', value: 'defLevelMilliPercent' },
  { name: 'EV State of Charge', value: 'evStateOfChargeMilliPercent' },
  { name: 'EV Charging Status', value: 'evChargingStatus' },
];

export const safetyEventTypeOptions: INodePropertyOptions[] = [
  { name: 'Harsh Acceleration', value: 'harshAcceleration' },
  { name: 'Harsh Braking', value: 'harshBrake' },
  { name: 'Harsh Turn', value: 'harshTurn' },
  { name: 'Speeding', value: 'speeding' },
  { name: 'Crash', value: 'crash' },
  { name: 'Lane Departure', value: 'laneDeparture' },
  { name: 'Following Distance', value: 'followingDistance' },
  { name: 'Forward Collision', value: 'forwardCollision' },
  { name: 'Drowsiness', value: 'drowsiness' },
  { name: 'Distraction', value: 'distraction' },
  { name: 'Phone Usage', value: 'phoneUsage' },
  { name: 'Seatbelt', value: 'seatbelt' },
  { name: 'Camera Obstruction', value: 'cameraObstruction' },
  { name: 'Smoking', value: 'smoking' },
];

export const sensorDataSeriesOptions: INodePropertyOptions[] = [
  { name: 'Temperature', value: 'temperature' },
  { name: 'Humidity', value: 'humidity' },
  { name: 'Door Open', value: 'doorOpen' },
  { name: 'Cargo Empty', value: 'cargoEmpty' },
  { name: 'Light Level', value: 'lightLevel' },
  { name: 'PM 2.5', value: 'pm25' },
  { name: 'PM 10', value: 'pm10' },
  { name: 'Noise', value: 'noise' },
];

export const webhookEventTypeOptions: INodePropertyOptions[] = [
  { name: 'Vehicle Location Updated', value: 'VehicleLocationUpdated' },
  { name: 'Driver Created', value: 'DriverCreated' },
  { name: 'Driver Updated', value: 'DriverUpdated' },
  { name: 'Route Stop Arrival', value: 'RouteStopArrival' },
  { name: 'Route Stop Departure', value: 'RouteStopDeparture' },
  { name: 'Route Completed', value: 'RouteCompleted' },
  { name: 'Safety Event', value: 'SafetyEvent' },
  { name: 'HOS Violation', value: 'HosViolation' },
  { name: 'DVIR Submitted', value: 'DvirSubmitted' },
  { name: 'Geofence Entry', value: 'GeofenceEntry' },
  { name: 'Geofence Exit', value: 'GeofenceExit' },
  { name: 'Document Submitted', value: 'DocumentSubmitted' },
  { name: 'Alert Triggered', value: 'AlertTriggered' },
];

export function logLicenseNotice(): void {
  const hasLogged = (global as unknown as { __samsaraLicenseLogged?: boolean })
    .__samsaraLicenseLogged;

  if (!hasLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    (global as unknown as { __samsaraLicenseLogged?: boolean }).__samsaraLicenseLogged = true;
  }
}
