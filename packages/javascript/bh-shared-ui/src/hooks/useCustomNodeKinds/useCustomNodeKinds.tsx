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

import { findIconDefinition, IconName } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { RequestOptions } from 'js-client-library';
import { useQuery, UseQueryResult } from 'react-query';
import { apiClient, DEFAULT_ICON_BACKGROUND_COLOR, GenericQueryOptions, IconDictionary } from '../../utils';

export const getCustomNodeKinds = async (options: RequestOptions): Promise<IconDictionary> =>
    apiClient.getCustomNodeKinds(options).then((res) => {
        const customIcons: IconDictionary = {};

        if (Array.isArray(res?.data?.data)) {
            res.data.data.forEach((node) => {
                const iconType = node.config.icon.type;
                const iconName = node.config.icon.name as IconName;
                const iconColor = node.config.icon.color ? node.config.icon.color : DEFAULT_ICON_BACKGROUND_COLOR;

                if (iconType === 'svg') {
                    // For SVG icons, use a placeholder icon and set the URL directly
                    customIcons[node.kindName] = {
                        icon: faQuestion, // Placeholder icon, won't be used when url is set
                        color: iconColor,
                        url: iconName, // The 'name' field contains the SVG URL for svg type icons
                    };
                } else if (iconType === 'font-awesome') {
                    // For FontAwesome icons, look up the icon definition
                    const iconDefinition = findIconDefinition({ prefix: 'fas', iconName: iconName });
                    if (iconDefinition == undefined) {
                        return;
                    }

                    customIcons[node.kindName] = {
                        icon: iconDefinition,
                        color: iconColor,
                    };
                }
            });
        }

        return customIcons;
    });

export const useCustomNodeKinds = (
    queryOptions?: GenericQueryOptions<IconDictionary>
): UseQueryResult<IconDictionary> => {
    return useQuery({
        queryKey: ['getCustomNodeKinds'],
        queryFn: ({ signal }) => getCustomNodeKinds({ signal }),
        staleTime: 2 * (60 * 1000),
        cacheTime: 5 * (60 * 1000),
        ...queryOptions,
    });
};
