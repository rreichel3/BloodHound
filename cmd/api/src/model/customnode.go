// Copyright 2025 Specter Ops, Inc.
//
// Licensed under the Apache License, Version 2.0
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
)

type CustomNodeKinds []CustomNodeKind

func (s CustomNodeKinds) AuditData() AuditData {
	var data = make(AuditData)

	for i, kind := range s {
		data[fmt.Sprint(i)] = kind.AuditData()
	}

	return data
}

type CustomNodeKind struct {
	ID       int32                `json:"id"`
	KindName string               `json:"kindName"`
	Config   CustomNodeKindConfig `json:"config"`
}

func (s CustomNodeKind) AuditData() AuditData {
	return AuditData{
		"id":     s.ID,
		"kind":   s.KindName,
		"config": s.Config,
	}
}

type CustomNodeKindConfig struct {
	Icon CustomNodeIcon `json:"icon"`
}

// CustomNodeIcon defines the icon configuration for a custom node kind.
// Two icon types are supported:
//   - "font-awesome": Name should be a valid FontAwesome icon name (e.g., "coffee", "user")
//   - "svg": Name should be a URL pointing to an SVG file (e.g., "https://example.com/icon.svg")
//
// Color is a hex color string (e.g., "#FFFFFF") that sets the background color of the icon.
type CustomNodeIcon struct {
	Type  string `json:"type"`  // Icon type: "font-awesome" or "svg"
	Name  string `json:"name"`  // FontAwesome icon name or SVG URL
	Color string `json:"color"` // Hex color string for background
}

func (s *CustomNodeKindConfig) Scan(value interface{}) error {
	if value == nil {
		*s = CustomNodeKindConfig{}
		return nil
	}

	if bytes, ok := value.([]byte); !ok {
		return errors.New("type assertion to []byte failed for CustomNodeKindConfig")
	} else {
		return json.Unmarshal(bytes, &s)
	}
}

func (s CustomNodeKindConfig) Value() (driver.Value, error) {
	return json.Marshal(s)
}
