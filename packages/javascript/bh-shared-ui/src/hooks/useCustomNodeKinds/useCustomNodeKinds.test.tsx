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

import { findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '../../test-utils';
import { DEFAULT_ICON_BACKGROUND_COLOR } from '../../utils';
import { getCustomNodeKinds, useCustomNodeKinds } from './useCustomNodeKinds';

const server = setupServer(
    rest.get('/api/v2/custom-nodes', (req, res, ctx) => {
        return res(
            ctx.json({
                data: [
                    {
                        id: 1,
                        kindName: 'FontAwesomeKind',
                        config: {
                            icon: {
                                type: 'font-awesome',
                                name: 'coffee',
                                color: '#FFFFFF',
                            },
                        },
                    },
                    {
                        id: 2,
                        kindName: 'SVGKind',
                        config: {
                            icon: {
                                type: 'svg',
                                name: 'https://example.com/icon.svg',
                                color: '#FF5733',
                            },
                        },
                    },
                ],
            })
        );
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getCustomNodeKinds', () => {
    it('should handle FontAwesome icons correctly', async () => {
        const result = await getCustomNodeKinds({});

        expect(result['FontAwesomeKind']).toBeDefined();
        expect(result['FontAwesomeKind'].color).toBe('#FFFFFF');
        expect(result['FontAwesomeKind'].icon).toEqual(findIconDefinition({ prefix: 'fas', iconName: 'coffee' }));
        expect(result['FontAwesomeKind'].url).toBeUndefined();
    });

    it('should handle SVG icons correctly', async () => {
        const result = await getCustomNodeKinds({});

        expect(result['SVGKind']).toBeDefined();
        expect(result['SVGKind'].color).toBe('#FF5733');
        expect(result['SVGKind'].icon).toEqual(faQuestion); // Placeholder icon
        expect(result['SVGKind'].url).toBe('https://example.com/icon.svg');
    });

    it('should apply default color when color is missing', async () => {
        server.use(
            rest.get('/api/v2/custom-nodes', (req, res, ctx) => {
                return res(
                    ctx.json({
                        data: [
                            {
                                id: 1,
                                kindName: 'NoColorKind',
                                config: {
                                    icon: {
                                        type: 'svg',
                                        name: 'https://example.com/icon.svg',
                                        color: '',
                                    },
                                },
                            },
                        ],
                    })
                );
            })
        );

        const result = await getCustomNodeKinds({});

        expect(result['NoColorKind']).toBeDefined();
        expect(result['NoColorKind'].color).toBe(DEFAULT_ICON_BACKGROUND_COLOR);
    });

    it('should skip FontAwesome icons that are not found', async () => {
        server.use(
            rest.get('/api/v2/custom-nodes', (req, res, ctx) => {
                return res(
                    ctx.json({
                        data: [
                            {
                                id: 1,
                                kindName: 'InvalidFAKind',
                                config: {
                                    icon: {
                                        type: 'font-awesome',
                                        name: 'nonexistent-icon',
                                        color: '#FFFFFF',
                                    },
                                },
                            },
                        ],
                    })
                );
            })
        );

        const result = await getCustomNodeKinds({});

        expect(result['InvalidFAKind']).toBeUndefined();
    });
});

describe('useCustomNodeKinds', () => {
    it('should fetch and return custom node kinds', async () => {
        const { result } = renderHook(() => useCustomNodeKinds());

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBeDefined();
        expect(result.current.data!['FontAwesomeKind']).toBeDefined();
        expect(result.current.data!['SVGKind']).toBeDefined();
    });
});
