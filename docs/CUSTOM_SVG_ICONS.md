# Custom SVG Icon Support

BloodHound now supports custom SVG icons in addition to FontAwesome icons for custom node types.

## Icon Types

### FontAwesome Icons (existing)

Use FontAwesome icon names with the `font-awesome` type:

```json
{
  "custom_types": {
    "CustomNodeType": {
      "icon": {
        "type": "font-awesome",
        "name": "coffee",
        "color": "#FFFFFF"
      }
    }
  }
}
```

### SVG Icons (new)

Use a URL to an SVG file with the `svg` type:

```json
{
  "custom_types": {
    "CustomNodeType": {
      "icon": {
        "type": "svg",
        "name": "https://example.com/icons/custom-icon.svg",
        "color": "#FF5733"
      }
    }
  }
}
```

## API Endpoint

POST to `/api/v2/custom-nodes` to create custom node types with icons.

## Field Descriptions

- **type**: Must be either `"font-awesome"` or `"svg"`
- **name**: 
  - For `font-awesome`: The FontAwesome icon name (e.g., "coffee", "user", "lock")
  - For `svg`: A URL pointing to an SVG file
- **color**: A hex color string (e.g., "#FFFFFF") for the icon background. Must start with '#' followed by 3 or 6 hex digits.

## Examples

### Creating a custom node with a FontAwesome icon

```bash
curl -X POST https://bloodhound.example.com/api/v2/custom-nodes \
  -H "Content-Type: application/json" \
  -d '{
    "custom_types": {
      "ServiceAccount": {
        "icon": {
          "type": "font-awesome",
          "name": "robot",
          "color": "#4CAF50"
        }
      }
    }
  }'
```

### Creating a custom node with an SVG icon

```bash
curl -X POST https://bloodhound.example.com/api/v2/custom-nodes \
  -H "Content-Type: application/json" \
  -d '{
    "custom_types": {
      "CloudResource": {
        "icon": {
          "type": "svg",
          "name": "https://example.com/icons/cloud-resource.svg",
          "color": "#2196F3"
        }
      }
    }
  }'
```

## Notes

- SVG icons must be publicly accessible via HTTP/HTTPS
- The SVG file should be square for best results
- If an SVG fails to load, only the background color will be displayed
- Icons are cached by the browser, so changes to SVG files may require a cache clear
