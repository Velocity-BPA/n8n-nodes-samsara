/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  IPollFunctions,
  IRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://api.samsara.com';

export interface ISamsaraResponse {
  data?: IDataObject | IDataObject[];
  pagination?: {
    endCursor?: string;
    hasNextPage?: boolean;
  };
}

export async function samsaraApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
): Promise<ISamsaraResponse> {
  const options: IRequestOptions = {
    method,
    uri: `${BASE_URL}${endpoint}`,
    qs: query,
    body,
    json: true,
  };

  if (Object.keys(body).length === 0) {
    delete options.body;
  }

  if (Object.keys(query).length === 0) {
    delete options.qs;
  }

  try {
    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'samsaraApi',
      options,
    );
    return response as ISamsaraResponse;
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject, {
      message: `Samsara API request failed: ${(error as Error).message}`,
    });
  }
}

export async function samsaraApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {},
  limit?: number,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let responseData: ISamsaraResponse;
  let cursor: string | undefined;

  query.limit = query.limit || 512;

  do {
    if (cursor) {
      query.after = cursor;
    }

    responseData = await samsaraApiRequest.call(this, method, endpoint, body, query);

    if (responseData.data) {
      const items = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      returnData.push(...items);
    }

    cursor = responseData.pagination?.endCursor;

    if (limit && returnData.length >= limit) {
      return returnData.slice(0, limit);
    }
  } while (responseData.pagination?.hasNextPage && cursor);

  return returnData;
}

export function buildQueryString(params: IDataObject): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          query[key] = value.join(',');
        }
      } else if (typeof value === 'object') {
        // Handle nested objects by flattening
        for (const [nestedKey, nestedValue] of Object.entries(value as IDataObject)) {
          if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
            query[`${key}[${nestedKey}]`] = nestedValue;
          }
        }
      } else {
        query[key] = value;
      }
    }
  }

  return query;
}

export function formatTimeRange(startTime?: string, endTime?: string): IDataObject {
  const timeRange: IDataObject = {};

  if (startTime) {
    timeRange.startTime = new Date(startTime).toISOString();
  }

  if (endTime) {
    timeRange.endTime = new Date(endTime).toISOString();
  }

  return timeRange;
}

export function parseIdList(ids: string | string[]): string[] {
  if (Array.isArray(ids)) {
    return ids;
  }
  return ids.split(',').map((id) => id.trim());
}

export function handleSamsaraError(error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`Samsara API Error: ${error.message}`);
  }
  throw new Error('Samsara API Error: An unknown error occurred');
}
