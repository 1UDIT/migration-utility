// export async function fetchData(url, method, body, signal?: AbortSignal) {
//   console.log("FETCHING", url, method, body);
//   const res = await fetch(url, {
//     method,
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//     signal, // 👈 attach abort signal
//   });

//   console.log("RESPONSE", res);

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || res.statusText);
//   }

//   return res.json();
// }

export async function fetchData(url, method, body, signal?: AbortSignal) { 
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    signal, // 👈 attach abort signal
  };

  // Include body only if the method is not GET
  if (method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options); 

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}

