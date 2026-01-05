# n8n-nodes-samsara

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Samsara, the leading IoT platform for fleet management and operations. This node enables workflow automation for vehicle tracking, driver management, route optimization, sensor data, safety monitoring, and compliance.

![n8n](https://img.shields.io/badge/n8n-community--node-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** covering all major Samsara API endpoints
- **60+ Operations** for comprehensive fleet and IoT management
- **Real-time Triggers** via webhook subscriptions
- **Cursor-based Pagination** for efficient data retrieval
- **Tag-based Filtering** throughout all resources
- **Time Range Queries** for historical data access
- **Geofence Support** for location-based automation

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings > Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-samsara`
5. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-samsara
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-samsara.git
cd n8n-nodes-samsara

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-samsara

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **API Token** | Your Samsara API token from the dashboard |

### Getting Your API Token

1. Log into your Samsara Dashboard at https://cloud.samsara.com
2. Navigate to **Settings > API Tokens**
3. Click **Add API Token**
4. Select required scopes based on resources you'll use
5. Copy the token (it won't be shown again)

## Resources & Operations

### Vehicle

| Operation | Description |
|-----------|-------------|
| Get | Get vehicle details by ID |
| Get All | List all vehicles |
| Get Stats | Get current vehicle statistics |
| Get Stats Feed | Get continuous stats feed with cursor |
| Get Stats History | Get historical statistics |
| Get Locations | Get current vehicle locations |
| Get Harsh Events | Get harsh driving events |
| Get Safety Events | Get safety events |

**Stats Types Available:** gps, engineStates, fuelPercent, obdOdometerMeters, obdEngineSeconds, batteryMilliVolts, auxInput1-10, engineRpm, evStateOfChargeMilliPercent, evChargingStatus, evDistanceToEmptyMeters, spreadPercent, spreaderGranularRate, spreaderPrewetRate, spreadState, nfcCardScan, evBatteryPower

### Driver

| Operation | Description |
|-----------|-------------|
| Create | Create a new driver |
| Get | Get driver details |
| Get All | List all drivers |
| Update | Update driver information |
| Deactivate | Deactivate a driver |
| Get HOS Logs | Get Hours of Service logs |
| Get Safety Score | Get driver safety score |
| Get Performance | Get driver performance metrics |

### Route

| Operation | Description |
|-----------|-------------|
| Create | Create a new route |
| Get | Get route details |
| Get All | List all routes |
| Update | Update route information |
| Delete | Delete a route |
| Get Progress | Get route progress |
| Get Stops | Get route stops |
| Complete Stop | Mark a stop as complete |

### Asset

| Operation | Description |
|-----------|-------------|
| Create | Create a new asset |
| Get | Get asset details |
| Get All | List all assets |
| Update | Update asset information |
| Get Locations | Get asset locations |
| Get Stats | Get asset statistics |

### Tag

| Operation | Description |
|-----------|-------------|
| Create | Create a new tag |
| Get | Get tag details |
| Get All | List all tags |
| Update | Update tag information |
| Delete | Delete a tag |
| Assign | Assign entities to a tag |
| Unassign | Remove entities from a tag |

### Address

| Operation | Description |
|-----------|-------------|
| Create | Create a new address with optional geofence |
| Get | Get address details |
| Get All | List all addresses |
| Update | Update address information |
| Delete | Delete an address |

**Geofence Types:** Circle (radius-based) or Polygon (vertex-based)

### Document

| Operation | Description |
|-----------|-------------|
| Create | Create a new document |
| Get | Get document details |
| Get All | List all documents |
| Get Templates | List document templates |
| Submit | Submit a document |

### Sensor

| Operation | Description |
|-----------|-------------|
| Get All | List all sensors |
| Get Data | Get current sensor readings |
| Get History | Get historical sensor data |
| Get Gateways | List all gateways |

**Data Series:** temperature, humidity, doorOpen, cargoEmpty, lightLevel, pm25, pm10, noise

### Safety

| Operation | Description |
|-----------|-------------|
| Get Events | Get safety events |
| Get Scores | Get safety scores |
| Get Harsh Driving | Get harsh driving events |
| Get Collisions | Get collision events |

**Event Types:** harshAcceleration, harshBrake, harshTurn, speeding, crash, laneDeparture, followingDistance, forwardCollision, drowsiness, distraction, phoneUsage, seatbelt, cameraObstruction, smoking

### Compliance

| Operation | Description |
|-----------|-------------|
| Get HOS Logs | Get Hours of Service logs |
| Get HOS Violations | Get HOS violations |
| Get DVIR Logs | Get DVIR inspection logs |
| Create DVIR | Create a new DVIR |
| Get Unassigned HOS | Get unassigned HOS segments |

**Log Types:** driving, onDuty, offDuty, sleeperBerth, yardMove, personalConveyance

**Violation Types:** elevenHourDriving, fourteenHourShift, thirtyMinuteBreak, sixtyHourLimit, seventyHourLimit, eightHourSleeperBerth

### Webhook

| Operation | Description |
|-----------|-------------|
| Create | Create a webhook subscription |
| Get | Get webhook details |
| Get All | List all webhooks |
| Update | Update webhook configuration |
| Delete | Delete a webhook |

## Trigger Node

The **Samsara Trigger** node allows you to start workflows automatically when events occur in Samsara.

### Available Events

- Address Created/Updated/Deleted
- Document Submitted
- Driver Created/Updated
- DVIR Submitted
- Geofence Entry/Exit
- Route Started/Completed
- Route Stop Arrival/Departure
- Safety Event
- Vehicle Created/Updated

### Trigger Configuration

1. Add the Samsara Trigger node to your workflow
2. Configure your Samsara credentials
3. Select the events you want to trigger on
4. Optionally filter by Tag IDs, Vehicle IDs, or Driver IDs
5. Activate the workflow

## Usage Examples

### Get Vehicle Locations

```javascript
// Get current locations for all vehicles
{
  "resource": "vehicle",
  "operation": "getLocations",
  "returnAll": true
}
```

### Create a Route with Stops

```javascript
// Create a delivery route
{
  "resource": "route",
  "operation": "create",
  "name": "Morning Deliveries",
  "driverId": "driver_123",
  "vehicleId": "vehicle_456",
  "scheduledStartTime": "2024-01-15T08:00:00Z",
  "stops": [
    {
      "name": "Customer A",
      "addressId": "addr_001",
      "scheduledArrival": "2024-01-15T09:00:00Z"
    },
    {
      "name": "Customer B",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "scheduledArrival": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Monitor Driver Safety

```javascript
// Get safety events for the past week
{
  "resource": "safety",
  "operation": "getEvents",
  "startTime": "2024-01-08T00:00:00Z",
  "endTime": "2024-01-15T00:00:00Z",
  "eventTypes": ["harshBrake", "speeding", "distraction"]
}
```

### Check Compliance

```javascript
// Get HOS violations for a driver
{
  "resource": "compliance",
  "operation": "getHosViolations",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-15T00:00:00Z",
  "driverIds": "driver_123"
}
```

## Samsara Concepts

### Tags

Tags are organizational units in Samsara used to group vehicles, drivers, assets, and addresses. Use tags for:
- Filtering data across resources
- Organizing fleet by region, department, or type
- Controlling access and permissions

### Geofences

Geofences are virtual boundaries defined around addresses. Supported types:
- **Circle**: Defined by center point and radius
- **Polygon**: Defined by array of vertices

### Stats Feed Pattern

For real-time data sync, use the Stats Feed operations:
1. Call `getStatsFeed` with desired stat types
2. Store the returned `endCursor`
3. Poll periodically with the cursor to get new data
4. Recommended polling interval: 5 seconds to 24 hours

### ELD Compliance

Electronic Logging Device (ELD) features:
- HOS logs track driving, on-duty, off-duty, and sleeper berth time
- Automatic violation detection for FMCSA regulations
- DVIR (Driver Vehicle Inspection Report) management

## Error Handling

The node handles common Samsara API errors:

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Unauthorized | Check API token validity |
| 403 | Forbidden | Verify token has required scopes |
| 404 | Not Found | Check resource ID exists |
| 429 | Rate Limited | Reduce request frequency |
| 500 | Server Error | Retry after delay |

## Security Best Practices

1. **Rotate API Tokens** regularly
2. **Use Minimal Scopes** - only grant necessary permissions
3. **Secure Webhooks** - use secret tokens for signature verification
4. **Filter by Tags** - limit data exposure to relevant entities
5. **Monitor API Usage** - track token usage in Samsara dashboard

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

Please ensure:
- Code follows existing style conventions
- All tests pass
- New features include tests
- Documentation is updated

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-samsara/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-samsara/discussions)
- **Samsara API Docs**: [developers.samsara.com](https://developers.samsara.com)

## Acknowledgments

- [Samsara](https://www.samsara.com) for their comprehensive fleet management platform
- [n8n](https://n8n.io) for the powerful workflow automation platform
- The n8n community for inspiration and support
