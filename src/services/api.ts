// API 服务层 — 使用原生 fetch，匹配 Express 后端

// 统一响应类型（与后端 server/types.ts 中 ApiResponse 一致）
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 核心请求函数：三层错误处理
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('网络连接失败，请检查网络设置');
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error('服务器响应格式异常');
  }

  if (!json.success) {
    throw new Error(json.error || '请求失败');
  }

  return json.data as T;
}

// --------------- 产品 API 方法（9 个） ---------------

export async function getProducts(params?: { category?: string; system?: string }): Promise<any[]> {
  let url = '/api/products';
  if (params) {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.system) qs.set('system', params.system);
    const str = qs.toString();
    if (str) url += `?${str}`;
  }
  return request<any[]>(url);
}

export async function getProduct(id: string): Promise<any> {
  return request<any>(`/api/products/${id}`);
}

export async function createProduct(data: any): Promise<any> {
  return request<any>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: any): Promise<any> {
  return request<any>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function publishProduct(id: string, data: any): Promise<any> {
  return request<any>(`/api/products/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function offlineProduct(id: string, data: any): Promise<any> {
  return request<any>(`/api/products/${id}/offline`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function syncProductConfig(id: string, data: any): Promise<any> {
  return request<any>(`/api/products/${id}/sync`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function subPublishProduct(id: string, system: string): Promise<any> {
  return request<any>(`/api/products/${id}/sub-publish`, {
    method: 'POST',
    body: JSON.stringify({ system }),
  });
}

export async function subOfflineProduct(id: string, system: string): Promise<any> {
  return request<any>(`/api/products/${id}/sub-offline`, {
    method: 'POST',
    body: JSON.stringify({ system }),
  });
}

// --------------- 试剂 API 方法（9 个） ---------------

export async function getReagents(params?: { system?: string }): Promise<any[]> {
  let url = '/api/reagents';
  if (params) {
    const qs = new URLSearchParams();
    if (params.system) qs.set('system', params.system);
    const str = qs.toString();
    if (str) url += `?${str}`;
  }
  return request<any[]>(url);
}

export async function getReagent(id: string): Promise<any> {
  return request<any>(`/api/reagents/${id}`);
}

export async function createReagent(data: any): Promise<any> {
  return request<any>('/api/reagents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReagent(id: string, data: any): Promise<any> {
  return request<any>(`/api/reagents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function publishReagent(id: string): Promise<any> {
  return request<any>(`/api/reagents/${id}/publish`, {
    method: 'POST',
  });
}

export async function offlineReagent(id: string): Promise<any> {
  return request<any>(`/api/reagents/${id}/offline`, {
    method: 'POST',
  });
}

export async function syncReagentConfig(id: string, data: any): Promise<any> {
  return request<any>(`/api/reagents/${id}/sync`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function subPublishReagent(id: string, system: string): Promise<any> {
  return request<any>(`/api/reagents/${id}/sub-publish`, {
    method: 'POST',
    body: JSON.stringify({ system }),
  });
}

export async function subOfflineReagent(id: string, system: string): Promise<any> {
  return request<any>(`/api/reagents/${id}/sub-offline`, {
    method: 'POST',
    body: JSON.stringify({ system }),
  });
}
